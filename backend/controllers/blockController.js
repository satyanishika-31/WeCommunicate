const Block = require("../models/Block");


// CREATE BLOCK
const createBlock = async (req, res) => {
  try {
    const {
      name,
      blockNumber,
      manager,
      totalHouses,
      description
    } = req.body;

    const existingBlock = await Block.findOne({ blockNumber });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "Block already exists"
      });
    }

    const block = await Block.create({
      name,
      blockNumber,
      manager,
      totalHouses,
      description
    });

    res.status(201).json({
      success: true,
      message: "Block created successfully",
      block
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL BLOCKS
const getBlocks = async (req, res) => {
  try {
    const blocks = await Block.find()
      .populate("manager", "name email");

    res.status(200).json({
      success: true,
      count: blocks.length,
      blocks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET BLOCK
const getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id)
      .populate("manager", "name email");

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    res.status(200).json({
      success: true,
      block
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE BLOCK
const updateBlock = async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Block updated successfully",
      block
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE BLOCK
const deleteBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    await block.deleteOne();

    res.status(200).json({
      success: true,
      message: "Block deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ASSIGN MANAGER
const assignManager = async (req, res) => {
  try {
    const { manager } = req.body;

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      { manager },
      { new: true }
    ).populate("manager", "name email");

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Block manager assigned successfully",
      block
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createBlock,
  getBlocks,
  getBlockById,
  updateBlock,
  deleteBlock,
  assignManager
};