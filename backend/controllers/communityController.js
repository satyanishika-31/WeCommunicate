const Community = require("../models/Community");
const User = require("../models/User");
const Block = require("../models/Block");
const bcrypt = require("bcryptjs");

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("communityHead", "name email phone houseNumber block")
      .sort({ createdAt: -1 });
    res.json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCommunity = async (req, res) => {
  try {
    const { name, location, code, totalBlocks, totalFlats, managerName, blocksList, flatsList } = req.body;
    
    // Parse blocksList if passed as array or comma separated string
    let parsedBlocks = [];
    if (Array.isArray(blocksList)) {
      parsedBlocks = blocksList.map(b => b.trim()).filter(Boolean);
    } else if (typeof blocksList === 'string') {
      parsedBlocks = blocksList.split(',').map(b => b.trim()).filter(Boolean);
    }

    let parsedFlats = [];
    if (Array.isArray(flatsList)) {
      parsedFlats = flatsList.map(f => f.trim()).filter(Boolean);
    } else if (typeof flatsList === 'string') {
      parsedFlats = flatsList.split(',').map(f => f.trim()).filter(Boolean);
    }

    const community = await Community.create({
      name,
      location,
      code,
      totalBlocks: parsedBlocks.length > 0 ? parsedBlocks.length : (Number(totalBlocks) || 0),
      totalFlats: parsedFlats.length > 0 ? parsedFlats.length : (Number(totalFlats) || 0),
      managerName,
      blocksList: parsedBlocks,
      flatsList: parsedFlats
    });

    // Automatically create Block documents for each block in parsedBlocks if provided
    for (const bName of parsedBlocks) {
      await Block.findOneAndUpdate(
        { name: bName, community: community.name },
        { 
          name: bName, 
          blockNumber: bName, 
          community: community.name,
          totalHouses: parsedFlats.length > 0 ? Math.ceil(parsedFlats.length / parsedBlocks.length) : 20
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({ success: true, community });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000 ? "Community code already exists." : error.message
    });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });
    res.json({ success: true, message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign or create Community Head (Admin action)
const setCommunityHead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, houseNumber, block, userId } = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    let headUser;
    if (userId) {
      // Assign existing user
      headUser = await User.findById(userId);
      if (!headUser) return res.status(404).json({ success: false, message: "User not found" });
      headUser.role = "COMMUNITY_HEAD";
      headUser.community = community.name;
      if (phone) headUser.phone = phone;
      if (houseNumber) headUser.houseNumber = houseNumber;
      await headUser.save();
    } else {
      // Create new Community Head credentials
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password required" });
      }
      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "A user with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      headUser = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        houseNumber: houseNumber || '',
        community: community.name,
        role: "COMMUNITY_HEAD",
        residentType: "OWNER"
      });
    }

    community.communityHead = headUser._id;
    community.managerName = headUser.name;
    await community.save();

    const populated = await Community.findById(id).populate("communityHead", "name email phone houseNumber block");

    res.json({
      success: true,
      message: "Community Head assigned successfully",
      community: populated,
      communityHead: headUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Community details view: Community Head information, Block managers, Residents per block
const getCommunityDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id).populate("communityHead", "name email phone houseNumber block");
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    // Find blocks associated with this community
    const blocks = await Block.find({ community: community.name }).populate("manager", "name email phone houseNumber");

    // Find residents associated with this community
    const residents = await User.find({ community: community.name })
      .select("-password")
      .populate("block", "name blockNumber");

    // Group residents by block/houseNumber
    res.json({
      success: true,
      community,
      communityHead: community.communityHead,
      blocks,
      residents,
      totalResidents: residents.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create credentials for Block Manager (Community Head or Admin action)
const createBlockManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, houseNumber, blockName } = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    // Role check: Admin or the actual Community Head of this community
    if (req.user.role !== "ADMIN") {
      if (req.user.role !== "COMMUNITY_HEAD" || !community.communityHead || community.communityHead.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Only Admin or Community Head can create Block Manager credentials" });
      }
    }

    if (!name || !email || !password || !blockName) {
      return res.status(400).json({ success: false, message: "Name, email, password, and block name are required" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const blockManager = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      houseNumber: houseNumber || '',
      community: community.name,
      role: "BLOCK_MANAGER",
      residentType: "OWNER"
    });

    // Link manager to Block
    let blockDoc = await Block.findOne({ community: community.name, name: blockName });
    if (!blockDoc) {
      blockDoc = await Block.create({
        name: blockName,
        blockNumber: blockName,
        community: community.name,
        manager: blockManager._id
      });
    } else {
      blockDoc.manager = blockManager._id;
      await blockDoc.save();
    }

    blockManager.block = blockDoc._id;
    await blockManager.save();

    res.status(201).json({
      success: true,
      message: `Block Manager credentials created for ${blockName}`,
      blockManager,
      block: blockDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCommunities,
  createCommunity,
  deleteCommunity,
  setCommunityHead,
  getCommunityDetails,
  createBlockManager
};

