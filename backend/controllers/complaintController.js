const Complaint = require("../models/Complaint");
const Counter = require("../models/Counter");
const User = require("../models/User");
const createNotifications = require("../utils/createNotification");

const nextTicketId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "complaints",
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return `CMP-${counter.sequence}`;
};

const Block = require("../models/Block");

const canAccessComplaint = (complaint, user) => {
  if (user.role === "ADMIN") return true;
  if (complaint.raisedBy?.toString() === user._id.toString()) return true;
  if (user.role === "BLOCK_MANAGER") {
    const compBlockId = (complaint.block?._id || complaint.block)?.toString();
    const userBlockId = (user.block?._id || user.block)?.toString();
    return compBlockId && userBlockId && compBlockId === userBlockId;
  }
  if (user.role === "COMMUNITY_HEAD") return true;
  return false;
};


// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      block,
      house,
      flatNumber,
      intakeRoute,
      assignedHandlerName
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const ticketId = await nextTicketId();

    const resolvedFlat = flatNumber || req.user.flatNumber || req.user.houseNumber || "";
    const complaint = await Complaint.create({
      ticketId,
      raisedBy: req.user._id,
      title,
      description,
      category: category || "MAINTENANCE",
      block: block || req.user.block || null,
      house: house || req.user.house || null,
      flatNumber: resolvedFlat,
      intakeRoute: intakeRoute || "RESIDENT_APP",
      assignedHandlerName: assignedHandlerName || null,
      image
    });
    const blockManager = complaint.block
      ? await User.findOne({ role: "BLOCK_MANAGER", block: complaint.block }, "_id")
      : null;
    await createNotifications({
      recipients: [req.user._id],
      type: "COMPLAINT_UPDATE",
      title: "Complaint received",
      message: `Your complaint ${ticketId} was received.`,
      relatedId: complaint._id
    });
    if (blockManager) {
      await createNotifications({
        recipients: [blockManager._id],
        type: "COMPLAINT_UPDATE",
        title: "New complaint assigned to your block",
        message: `${ticketId} requires review.`,
        relatedId: complaint._id
      });
    }

    res.status(201).json({
      success: true,
      message: `Complaint registered with Ticket #${ticketId}`,
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET COMPLAINTS
const getComplaints = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "USER") {
      filter.raisedBy = req.user._id;
    } else if (req.user.role === "BLOCK_MANAGER") {
      filter.block = req.user.block;
    } else if (req.user.role === "COMMUNITY_HEAD") {
      const communityBlocks = await Block.find({ community: req.user.community }, "_id");
      filter.block = { $in: communityBlocks.map((b) => b._id) };
      if (req.query.block) filter.block = req.query.block;
    } else if (req.user.role === "ADMIN") {
      if (req.query.block) filter.block = req.query.block;
    }

    const complaints = await Complaint.find(filter)
      .populate("raisedBy", "name email phone houseNumber flatNumber")
      .populate("block", "name blockNumber")
      .populate("house", "houseNumber flatNumber")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET SINGLE COMPLAINT
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("raisedBy", "name email")
      .populate("block", "name blockNumber")
      .populate("house", "houseNumber")
      .populate("assignedTo", "name email");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    if (!canAccessComplaint(complaint, req.user)) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this complaint" });
    }

    res.status(200).json({
      success: true,
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE COMPLAINT
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("block", "manager");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (req.user.role === "BLOCK_MANAGER" && complaint.block?._id?.toString() !== req.user.block?.toString()) {
      return res.status(403).json({ success: false, message: "You can only manage complaints in your block" });
    }
    const allowed = ["title", "description", "category", "resolutionNotes", "assignedHandlerName"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) complaint[field] = req.body[field];
    });
    await complaint.save();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE STATUS
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, assignedHandlerName } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate("block", "manager");
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (req.user.role === "BLOCK_MANAGER" && complaint.block?._id?.toString() !== req.user.block?.toString()) {
      return res.status(403).json({ success: false, message: "You can only manage complaints in your block" });
    }
    const validTransitions = { PENDING: "IN_PROGRESS", IN_PROGRESS: "RESOLVED" };
    if (validTransitions[complaint.status] !== status) {
      return res.status(400).json({ success: false, message: "Invalid complaint status transition" });
    }
    complaint.status = status;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (assignedHandlerName !== undefined) complaint.assignedHandlerName = assignedHandlerName;
    if (status === "RESOLVED") complaint.resolvedAt = new Date();
    await complaint.save();
    await createNotifications({
      recipients: [complaint.raisedBy],
      type: "COMPLAINT_UPDATE",
      title: `Complaint ${complaint.ticketId} updated`,
      message: `Your complaint is now ${status}.`,
      relatedId: complaint._id
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ASSIGN COMPLAINT
const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id).populate("block", "manager");

    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (req.user.role === "BLOCK_MANAGER" && complaint.block?._id?.toString() !== req.user.block?.toString()) {
      return res.status(403).json({ success: false, message: "You can only manage complaints in your block" });
    }
    const assignee = await User.findOne({ _id: assignedTo, community: req.user.community });
    if (!assignee) return res.status(400).json({ success: false, message: "Assigned user must belong to your community" });
    complaint.assignedTo = assignee._id;
    await complaint.save();
    await createNotifications({
      recipients: [complaint.raisedBy],
      type: "COMPLAINT_UPDATE",
      title: `Complaint ${complaint.ticketId} assigned`,
      message: `Your complaint was assigned to ${assignee.name}.`,
      relatedId: complaint._id
    });

    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE COMPLAINT
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint
};