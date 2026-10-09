const Record = require("../models/Record");

// GET ALL RECORDS & BYLAWS
const getRecords = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) filter.category = category;

    const records = await Record.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE RECORD / BYLAW / MINUTES
const createRecord = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      documentUrl,
      effectiveDate,
      referenceCode,
      community
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Record title is required"
      });
    }

    const code = referenceCode || `DOC-${category ? category.slice(0, 3) : 'RWA'}-${Math.floor(100 + Math.random() * 900)}`;

    const record = await Record.create({
      title,
      category: category || "BYLAWS",
      description,
      documentUrl: req.file ? `/uploads/${req.file.filename}` : documentUrl,
      referenceCode: code,
      effectiveDate: effectiveDate || new Date(),
      uploadedBy: req.user._id,
      community: community || req.user.community || "Society"
    });

    res.status(201).json({
      success: true,
      message: "Society record archived successfully",
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE RECORD
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    if (record.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this official record"
      });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "Record removed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getRecords,
  createRecord,
  deleteRecord
};
