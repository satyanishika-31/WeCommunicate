const Business = require("../models/Business");


// CREATE BUSINESS
const createBusiness = async (req, res) => {
  try {
    const {
      businessName,
      category,
      description,
      services,
      contact,
      timings
    } = req.body;

    const images = req.files
      ? req.files.map(file => file.path)
      : [];

    const business = await Business.create({
      owner: req.user._id,
      businessName,
      category,
      description,
      services,
      contact,
      timings,
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
    const businesses = await Business.find()
      .populate("owner", "name profileImage block")
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
      .populate("owner", "name profileImage block")
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

    Object.assign(business, req.body);

    if (req.files) {
      business.images = req.files.map(file => file.path);
    }

    await business.save();

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
    );

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
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "PAUSED" },
      { new: true }
    );

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
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "ACTIVE" },
      { new: true }
    );

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
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status: "CLOSED" },
      { new: true }
    );

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
  deleteBusiness
};