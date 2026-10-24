const Community = require("../models/Community");
const CommunityNameLock = require("../models/CommunityNameLock");
const User = require("../models/User");
const Block = require("../models/Block");
const House = require("../models/House");
const bcrypt = require("bcryptjs");

const normalizeCommunityCode = (value) => (
  typeof value === "string" ? value.trim().toUpperCase() : ""
);

const generateCommunityCode = async () => {
  let code;
  do {
    code = `COMM-${Math.floor(100 + Math.random() * 900)}`;
  } while (await Community.exists({ code }));
  return code;
};

const getCommunities = async (req, res) => {
  try {
    const query = req.user?.role === "COMMUNITY_HEAD"
      ? { communityHead: req.user._id }
      : {};
    const communities = await Community.find(query)
      .populate("communityHead", "name email phone houseNumber block")
      .sort({ createdAt: -1 });
    const seenNames = new Set();
    const uniqueCommunities = communities.filter((community) => {
      const key = community.name.trim().toLocaleLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });
    res.json({ success: true, communities: uniqueCommunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCommunity = async (req, res) => {
  let nameLock;
  try {
    const { name, location, totalBlocks, totalFlats, managerName, blocksList, flatsList } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedCode = normalizeCommunityCode(req.body.code) || await generateCommunityCode();

    if (!normalizedName) {
      return res.status(400).json({ success: false, message: "Community name is required." });
    }

    const normalizedNameKey = normalizedName.toLocaleLowerCase();
    const existingName = await Community.findOne({ name: normalizedName })
      .collation({ locale: "en", strength: 2 })
      .select("_id");
    if (existingName) {
      return res.status(409).json({
        success: false,
        message: `A community named "${normalizedName}" already exists.`
      });
    }

    try {
      nameLock = await CommunityNameLock.create({
        normalizedName: normalizedNameKey,
        community: new Community()._id
      });
    } catch (error) {
      if (nameLock && error.code !== 11000) {
        await CommunityNameLock.deleteOne({ _id: nameLock._id }).catch(() => {});
      }
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: `A community named "${normalizedName}" is already being created or exists.`
        });
      }
      throw error;
    }

    const existingCode = await Community.exists({ code: normalizedCode });
    if (existingCode) {
      await CommunityNameLock.deleteOne({ _id: nameLock._id });
      return res.status(409).json({
        success: false,
        message: `Community code ${normalizedCode} already exists. Please choose another code.`
      });
    }
    
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
      name: normalizedName,
      location,
      code: normalizedCode,
      totalBlocks: parsedBlocks.length > 0 ? parsedBlocks.length : (Number(totalBlocks) || 0),
      totalFlats: parsedFlats.length > 0 ? parsedFlats.length : (Number(totalFlats) || 0),
      managerName,
      blocksList: parsedBlocks,
      flatsList: parsedFlats
    });
    nameLock.community = community._id;
    await nameLock.save();

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
    const duplicateField = error.code === 11000
      ? Object.keys(error.keyPattern || {})[0]
      : null;
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: duplicateField === "code"
        ? "Community code already exists. Please choose another code."
        : (error.message || "Community could not be created.")
    });
  }
};

const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });
    await CommunityNameLock.deleteOne({ community: community._id });
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
    if (
      req.user.role === "COMMUNITY_HEAD" &&
      (!community.communityHead || community.communityHead._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this community" });
    }

    // Find blocks associated with this community
    const blocks = await Block.find({ community: community.name })
      .populate("manager", "name email phone houseNumber");
    const houses = await House.find({ block: { $in: blocks.map((block) => block._id) } })
      .populate("residents", "name email phone houseNumber residentType role isApproved")
      .populate("owner", "name email phone houseNumber");
    const housesByBlock = new Map();
    houses.forEach((house) => {
      const blockId = house.block.toString();
      if (!housesByBlock.has(blockId)) housesByBlock.set(blockId, []);
      housesByBlock.get(blockId).push(house);
    });
    const blockStatistics = blocks.map((block) => {
      const blockHouses = housesByBlock.get(block._id.toString()) || [];
      const occupiedHouses = blockHouses.filter(
        (house) => house.status !== "VACANT" || house.residents.length > 0 || house.owner
      );
      return {
        ...block.toObject(),
        houses: blockHouses,
        totalHouses: blockHouses.length || block.totalHouses || 0,
        occupiedHouses: occupiedHouses.length,
        availableHouses: Math.max((blockHouses.length || block.totalHouses || 0) - occupiedHouses.length, 0),
        residentCount: blockHouses.reduce(
          (count, house) => count + house.residents.length + (house.owner ? 1 : 0),
          0
        )
      };
    });

    // Find residents associated with this community
    const residents = await User.find({ community: community.name })
      .select("-password")
      .populate("block", "name blockNumber");

    // Group residents by block/houseNumber
    res.json({
      success: true,
      community,
      communityHead: community.communityHead,
      blocks: blockStatistics,
      residents,
      houses,
      totalResidents: residents.length,
      totalBlocks: blockStatistics.length,
      totalHouses: blockStatistics.reduce((total, block) => total + block.totalHouses, 0),
      occupiedHouses: blockStatistics.reduce((total, block) => total + block.occupiedHouses, 0),
      availableHouses: blockStatistics.reduce((total, block) => total + block.availableHouses, 0)
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

// Assign existing resident as Block Manager (Community Head action)
const assignBlockManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockName, residentId } = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found" });
    }

    // Role check: Community Head or Admin
    if (req.user.role !== "COMMUNITY_HEAD" && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Only Community Head can assign Block Managers" });
    }
    if (
      req.user.role === "COMMUNITY_HEAD" &&
      (!community.communityHead || community.communityHead.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "You are not authorized to manage this community" });
    }

    if (!blockName || !residentId) {
      return res.status(400).json({ success: false, message: "Block name and resident are required" });
    }

    const resident = await User.findById(residentId);
    if (!resident) {
      return res.status(404).json({ success: false, message: "Resident not found" });
    }
    if (resident.community !== community.name) {
      return res.status(400).json({
        success: false,
        message: "Only a resident from this community can become a Block Manager"
      });
    }

    // Find or create Block document in this community
    let blockDoc = await Block.findOne({ community: community.name, name: blockName });
    if (!blockDoc && !community.blocksList.includes(blockName)) {
      return res.status(400).json({ success: false, message: "The selected block does not belong to this community" });
    }
    if (!blockDoc) {
      blockDoc = await Block.create({
        name: blockName,
        blockNumber: blockName,
        community: community.name,
        manager: resident._id
      });
    } else {
      if (blockDoc.manager && blockDoc.manager.toString() !== resident._id.toString()) {
        await User.findByIdAndUpdate(blockDoc.manager, {
          role: "USER",
          $unset: { block: 1 }
        });
      }
      blockDoc.manager = resident._id;
      blockDoc.managerAssignedDate = new Date();
      await blockDoc.save();
    }

    await User.updateMany(
      { _id: { $ne: resident._id }, role: "BLOCK_MANAGER", block: blockDoc._id },
      { role: "USER", $unset: { block: 1, assignedDate: 1 } }
    );

    await Block.updateMany(
      { manager: resident._id, _id: { $ne: blockDoc._id } },
      { $unset: { manager: 1, managerAssignedDate: 1 } }
    );

    // Update resident to BLOCK_MANAGER
    resident.role = "BLOCK_MANAGER";
    resident.isApproved = true;
    resident.block = blockDoc._id;
    resident.community = community.name;
    resident.assignedDate = blockDoc.managerAssignedDate;
    resident.flatNumber = resident.flatNumber || resident.houseNumber;
    await resident.save();

    res.json({
      success: true,
      message: `${resident.name} (Flat: ${resident.flatNumber || resident.houseNumber || 'N/A'}) is now the Block Manager for ${blockName}`,
      block: blockDoc,
      resident
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
  createBlockManager,
  assignBlockManager
};
