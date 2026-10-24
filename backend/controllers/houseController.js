const House = require("../models/House");
const Block = require("../models/Block");


// CREATE HOUSE
const createHouse = async (req, res) => {
  try {
    const {
      houseNumber,
      block,
      owner,
      residents,
      status
    } = req.body;

    const house = await House.create({
      houseNumber,
      block,
      owner,
      residents,
      status
    });

    res.status(201).json({
      success: true,
      message: "House created successfully",
      house
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL HOUSES
const getHouses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "COMMUNITY_HEAD") {
      const communityBlocks = await Block.find({ community: req.user.community }, "_id");
      filter.block = { $in: communityBlocks.map((block) => block._id) };
      if (req.query.block) filter.block = req.query.block;
    } else if (req.user.role === "BLOCK_MANAGER") {
      filter.block = req.user.block;
    } else if (req.user.role === "USER") {
      filter = {
        $or: [
          { residents: req.user._id },
          { owner: req.user._id },
          { _id: req.user.house }
        ]
      };
    } else if (req.user.role === "ADMIN") {
      if (req.query.block) filter.block = req.query.block;
    }

    const houses = await House.find(filter)
      .populate("block", "name blockNumber community")
      .populate("owner", "name email phone")
      .populate("residents", "name email phone residentType role isApproved");

    res.status(200).json({
      success: true,
      count: houses.length,
      houses
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET HOUSE
const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id)
      .populate("block")
      .populate("owner", "name email")
      .populate("residents", "name email");

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    res.status(200).json({
      success: true,
      house
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE HOUSE
const updateHouse = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "House updated successfully",
      house
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE HOUSE
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    await house.deleteOne();

    res.status(200).json({
      success: true,
      message: "House deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ADD RESIDENT
const addResident = async (req, res) => {
  try {
    const { userId } = req.body;

    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found"
      });
    }

    if (!house.residents.includes(userId)) {
      house.residents.push(userId);
    }

    await house.save();

    res.status(200).json({
      success: true,
      message: "Resident added successfully",
      house
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse,
  addResident
};