const Business = require("../models/Business");

const getOwnerId = (business) => (business?.owner?._id || business?.owner || '').toString();

const canManageBusiness = (business, user) => {
  const ownerId = getOwnerId(business);
  const userId = (user?._id || user?.id || '').toString();
  return (ownerId && userId && ownerId === userId) ||
    ["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(user?.role);
};

const isBusinessOwner = (business, user) => {
  const ownerId = getOwnerId(business);
  const userId = (user?._id || user?.id || '').toString();
  return Boolean(ownerId && userId && ownerId === userId) || user?.role === 'ADMIN';
};


// CREATE BUSINESS
const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      category,
      description,
      services,
      contact,
      timings,
      priceRange
    } = req.body;

    let parsedServices = services;
    if (typeof services === "string") {
      parsedServices = JSON.parse(services);
    }

    const images = req.files
      ? req.files.map(file => file.secure_url || file.url || file.path || `/uploads/${file.filename}`)
      : [];

    const business = await Business.create({
      owner: req.user._id,
      community: req.user.community || req.body.community || undefined,
      businessName,
      category,
      description,
      services: parsedServices,
      contact,
      timings,
      priceRange: priceRange || undefined,
      images
    });

    res.status(201).json({
      success: true,
      message: "Business submitted for approval",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET BUSINESSES
const getBusinesses = async (req, res) => {
  try {
    const userCommunity = (req.user?.community || "").trim();
    let filter = {};
    if (userCommunity) {
      const escapedComm = userCommunity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { community: { $regex: new RegExp(`^${escapedComm}$`, 'i') } },
        { community: "All Communities" },
        { community: null },
        { community: { $exists: false } }
      ];
    } else if (req.user?.role === "ADMIN" && req.query.community) {
      const escapedComm = req.query.community.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.community = { $regex: new RegExp(`^${escapedComm}$`, 'i') };
    }

    const businesses = await Business.find(filter)
      .populate("owner", "name profileImage block phone community")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      businesses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET BUSINESS
const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("owner", "name profileImage block phone")
      .populate("approvedBy", "name");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    res.status(200).json({
      success: true,
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE BUSINESS
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }
    if (!canManageBusiness(business, req.user)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this business" });
    }

    const updateData = {};
    ["businessName", "category", "description", "services", "contact", "timings", "priceRange"].forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    if (typeof updateData.services === "string") {
      updateData.services = JSON.parse(updateData.services);
    }
    Object.assign(business, updateData);

    let existingImages = [];
    if (req.body.existingImages !== undefined) {
      try {
        existingImages = typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch {
        existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
    } else {
      existingImages = business.images || [];
    }

    const newUploadedImages = req.files && req.files.length > 0
      ? req.files.map(file => file.secure_url || file.url || file.path || `/uploads/${file.filename}`)
      : [];

    if (req.body.existingImages !== undefined || newUploadedImages.length > 0) {
      business.images = [...existingImages, ...newUploadedImages].slice(0, 5);
    }

    await business.save();
    await business.populate("owner", "name profileImage block phone");
    await business.populate("approvedBy", "name");

    res.status(200).json({
      success: true,
      message: "Business updated successfully",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// APPROVE BUSINESS
const approveBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      {
        status: "ACTIVE",
        approvedBy: req.user._id
      },
      { new: true }
    ).populate("owner", "name profileImage block phone").populate("approvedBy", "name");

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Business approved successfully",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// PAUSE BUSINESS
const pauseBusiness = async (req, res) => {
  try {
    const existingBusiness = await Business.findById(req.params.id);
    if (!existingBusiness) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    if (!canManageBusiness(existingBusiness, req.user)) {
      return res.status(403).json({ success: false, message: "You are not authorized to manage this business" });
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "PAUSED" },
      { new: true }
    ).populate("owner", "name profileImage block phone").populate("approvedBy", "name");

    res.status(200).json({
      success: true,
      message: "Business paused",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// RESUME BUSINESS
const resumeBusiness = async (req, res) => {
  try {
    const existingBusiness = await Business.findById(req.params.id);
    if (!existingBusiness) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    if (!canManageBusiness(existingBusiness, req.user)) {
      return res.status(403).json({ success: false, message: "You are not authorized to manage this business" });
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "ACTIVE" },
      { new: true }
    ).populate("owner", "name profileImage block phone").populate("approvedBy", "name");

    res.status(200).json({
      success: true,
      message: "Business resumed",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// CLOSE BUSINESS
const closeBusiness = async (req, res) => {
  try {
    const existingBusiness = await Business.findById(req.params.id);
    if (!existingBusiness) return res.status(404).json({ success: false, message: "Business not found" });
    if (!canManageBusiness(existingBusiness, req.user)) {
      return res.status(403).json({ success: false, message: "You are not authorized to close this business" });
    }
    existingBusiness.status = "CLOSED";
    await existingBusiness.save();
    const business = existingBusiness;

    res.status(200).json({
      success: true,
      message: "Business closed",
      business
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    if (business.reviews.some((review) => review.author.toString() === req.user._id.toString())) {
      return res.status(409).json({ success: false, message: "You have already reviewed this business" });
    }

    business.reviews.push({ author: req.user._id, rating: Number(rating), comment });
    await business.save();

    const review = business.reviews[business.reviews.length - 1];
    res.status(201).json({ success: true, business, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE BUSINESS
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found"
      });
    }

    if (!isBusinessOwner(business, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only the business owner can delete this business"
      });
    }

    await business.deleteOne();

    res.status(200).json({
      success: true,
      message: "Business deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  approveBusiness,
  pauseBusiness,
  resumeBusiness,
  closeBusiness,
  deleteBusiness,
  addReview
};