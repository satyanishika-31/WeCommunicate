const Block = require("../models/Block");
const House = require("../models/House");
const User = require("../models/User");
const Community = require("../models/Community");

// CREATE BLOCK
const createBlock = async (req, res) => {
  try {
    const {
      name,
      blockNumber,
      manager,
      totalHouses,
      description,
      community
    } = req.body;

    const blockCommunity = community || req.user.community;

    const existingBlock = await Block.findOne({ 
      blockNumber: blockNumber || name, 
      community: blockCommunity 
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "Block already exists in this community"
      });
    }

    const block = await Block.create({
      name,
      blockNumber: blockNumber || name,
      manager,
      totalHouses: totalHouses || 20,
      description,
      community: blockCommunity
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


// GET ALL BLOCKS (Role-filtered with statistics)
const getBlocks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "COMMUNITY_HEAD") {
      query = { community: req.user.community };
    } else if (req.user.role === "BLOCK_MANAGER") {
      query = { _id: req.user.block };
    } else if (req.user.role === "USER") {
      query = req.user.block ? { _id: req.user.block } : { community: req.user.community };
    } else if (req.user.role === "ADMIN" && req.query.community) {
      query = { community: req.query.community };
    }

    const blocks = await Block.find(query)
      .populate("manager", "name email phone houseNumber flatNumber assignedDate");

    const blockIds = blocks.map(b => b._id);
    const houses = await House.find({ block: { $in: blockIds } })
      .populate("residents", "name email phone residentType role isApproved");
    const users = await User.find({ block: { $in: blockIds } })
      .select("-password");

    const housesByBlock = new Map();
    houses.forEach((h) => {
      const bId = h.block.toString();
      if (!housesByBlock.has(bId)) housesByBlock.set(bId, []);
      housesByBlock.get(bId).push(h);
    });

    const usersByBlock = new Map();
    users.forEach((u) => {
      if (u.block) {
        const bId = u.block.toString();
        if (!usersByBlock.has(bId)) usersByBlock.set(bId, []);
        usersByBlock.get(bId).push(u);
      }
    });

    const blocksWithStats = blocks.map((b) => {
      const bObj = b.toObject();
      const bId = b._id.toString();
      const blockHouses = housesByBlock.get(bId) || [];
      const blockUsers = usersByBlock.get(bId) || [];

      const occupiedCount = blockHouses.filter(
        h => h.status !== "VACANT" || (h.residents && h.residents.length > 0) || h.owner
      ).length;

      const totalFlatsCount = Math.max(blockHouses.length, b.totalHouses || 0, 18);
      const vacantCount = Math.max(totalFlatsCount - occupiedCount, 0);

      // Enhance manager details if populated
      let managerDetails = null;
      if (b.manager) {
        const m = b.manager;
        managerDetails = {
          _id: m._id,
          name: m.name,
          email: m.email,
          phone: m.phone || "N/A",
          houseNumber: m.houseNumber || m.flatNumber || "N/A",
          flatNumber: m.flatNumber || m.houseNumber || "N/A",
          assignedDate: b.managerAssignedDate || m.assignedDate || m.updatedAt || m.createdAt,
          blockAssigned: b.name
        };
      }

      return {
        ...bObj,
        manager: managerDetails,
        managerAssignedDate: b.managerAssignedDate || managerDetails?.assignedDate || null,
        totalFlats: totalFlatsCount,
        occupiedFlats: occupiedCount,
        vacantFlats: vacantCount,
        totalResidents: blockUsers.length
      };
    });

    res.status(200).json({
      success: true,
      count: blocksWithStats.length,
      blocks: blocksWithStats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET BLOCK BY ID (Detailed View for Block Card click)
const getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id)
      .populate("manager", "name email phone houseNumber flatNumber assignedDate createdAt");

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    // Role-based Access Control
    if (req.user.role === "COMMUNITY_HEAD" && block.community !== req.user.community) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access blocks outside your community"
      });
    }

    if (req.user.role === "BLOCK_MANAGER") {
      const userBlockId = (req.user.block?._id || req.user.block)?.toString();
      if (block._id.toString() !== userBlockId && block.manager?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are only authorized to access your assigned block"
        });
      }
    }

    // Fetch residents in this block
    const residents = await User.find({ block: block._id })
      .select("-password")
      .populate("house", "houseNumber flatNumber status");

    const houses = await House.find({ block: block._id })
      .populate("residents", "name email phone residentType role isApproved")
      .populate("owner", "name email phone");

    const occupiedCount = houses.filter(
      h => h.status !== "VACANT" || (h.residents && h.residents.length > 0) || h.owner
    ).length;

    const totalFlatsCount = Math.max(houses.length, block.totalHouses || 0, 18);
    const vacantCount = Math.max(totalFlatsCount - occupiedCount, 0);

    const formattedResidents = residents.map((r) => {
      const obj = r.toObject();
      const flatNum = obj.flatNumber || obj.houseNumber || obj.house?.houseNumber || "N/A";
      return {
        ...obj,
        flatNumber: flatNum,
        houseNumber: flatNum,
        occupancyStatus: obj.residentType === "TENANT" ? "TENANT_OCCUPIED" : "OWNER_OCCUPIED"
      };
    });

    let managerDetails = null;
    if (block.manager) {
      const m = block.manager;
      managerDetails = {
        _id: m._id,
        name: m.name,
        email: m.email,
        phone: m.phone || "N/A",
        houseNumber: m.houseNumber || m.flatNumber || "N/A",
        flatNumber: m.flatNumber || m.houseNumber || "N/A",
        assignedDate: block.managerAssignedDate || m.assignedDate || m.createdAt,
        blockAssigned: block.name
      };
    }

    res.status(200).json({
      success: true,
      block: {
        ...block.toObject(),
        manager: managerDetails,
        managerAssignedDate: block.managerAssignedDate || managerDetails?.assignedDate || null,
        totalFlats: totalFlatsCount,
        occupiedFlats: occupiedCount,
        vacantFlats: vacantCount,
        totalResidents: formattedResidents.length
      },
      residents: formattedResidents,
      houses,
      statistics: {
        totalFlats: totalFlatsCount,
        occupiedFlats: occupiedCount,
        vacantFlats: vacantCount,
        totalResidents: formattedResidents.length
      }
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


// ASSIGN / CHANGE / REMOVE BLOCK MANAGER
const assignManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { residentId, managerId, manager, action } = req.body;
    const targetUserId = residentId || managerId || manager;

    const block = await Block.findById(id);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found"
      });
    }

    // Role verification
    if (req.user.role === "COMMUNITY_HEAD" && block.community !== req.user.community) {
      return res.status(403).json({
        success: false,
        message: "You can only assign managers for blocks in your community"
      });
    }

    // ACTION: REMOVE BLOCK MANAGER
    if (action === "remove" || !targetUserId) {
      if (block.manager) {
        const oldManager = await User.findById(block.manager);
        if (oldManager && oldManager.role === "BLOCK_MANAGER") {
          oldManager.role = "USER";
          oldManager.assignedDate = undefined;
          await oldManager.save();
        }
      }
      block.manager = null;
      block.managerAssignedDate = null;
      await block.save();

      return res.status(200).json({
        success: true,
        message: `Block Manager removed for ${block.name}`,
        block
      });
    }

    // ACTION: ASSIGN OR CHANGE BLOCK MANAGER
    const resident = await User.findById(targetUserId);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: "Selected resident not found"
      });
    }

    if (resident.community !== block.community) {
      return res.status(400).json({
        success: false,
        message: "Resident must belong to the same community as this block"
      });
    }

    // ENFORCE: One Block Manager can only be assigned to the selected block
    // 1. If resident is already manager of another block, remove them from that block
    await Block.updateMany(
      { manager: resident._id, _id: { $ne: block._id } },
      { $unset: { manager: 1, managerAssignedDate: 1 } }
    );

    // 2. If this block previously had a different manager, demote them back to USER if they are BLOCK_MANAGER
    if (block.manager && block.manager.toString() !== resident._id.toString()) {
      const oldManager = await User.findById(block.manager);
      if (oldManager && oldManager.role === "BLOCK_MANAGER") {
        oldManager.role = "USER";
        oldManager.assignedDate = undefined;
        await oldManager.save();
      }
    }

    // 3. Promote resident to BLOCK_MANAGER
    resident.role = "BLOCK_MANAGER";
    resident.block = block._id;
    resident.assignedDate = new Date();
    resident.isApproved = true;
    await resident.save();

    // 4. Link block to manager
    block.manager = resident._id;
    block.managerAssignedDate = resident.assignedDate;
    await block.save();

    const populatedBlock = await Block.findById(block._id)
      .populate("manager", "name email phone houseNumber flatNumber assignedDate");

    res.status(200).json({
      success: true,
      message: `${resident.name} (Flat: ${resident.flatNumber || resident.houseNumber || 'N/A'}) is now assigned as Block Manager for ${block.name}`,
      block: populatedBlock,
      resident
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