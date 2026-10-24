const User = require("../models/User");
const Business = require("../models/Business");
const House = require("../models/House");


// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role;
    const userCommunity = req.user.community;
    const userBlock = req.user.block;

    if (userRole === "USER") {
      // Resident/User -> Access only to own profile and flat details
      query = { _id: req.user._id };
    } else if (userRole === "BLOCK_MANAGER") {
      // Block Manager -> Access only to assigned block
      if (!userBlock) {
        return res.status(200).json({ success: true, count: 0, users: [] });
      }
      query = { block: userBlock };
    } else if (userRole === "COMMUNITY_HEAD") {
      // Community Head -> Access to all blocks in their community
      query = { community: userCommunity };
      if (req.query.block) {
        query.block = req.query.block;
      }
    } else if (userRole === "ADMIN") {
      if (req.query.community) query.community = req.query.community;
      if (req.query.block) query.block = req.query.block;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("block", "name blockNumber community")
      .populate("house", "houseNumber flatNumber status");

    const usersWithFlat = users.map((u) => {
      const obj = u.toObject();
      obj.flatNumber = obj.flatNumber || obj.houseNumber || obj.house?.houseNumber || "";
      obj.houseNumber = obj.flatNumber;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: usersWithFlat.length,
      users: usersWithFlat
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("block", "name blockNumber community")
      .populate("house", "houseNumber flatNumber status");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userBlockId = (req.user.block?._id || req.user.block)?.toString();
    const targetBlockId = (user.block?._id || user.block)?.toString();
    const sameBlock = userBlockId && targetBlockId && userBlockId === targetBlockId;
    const sameCommunity = user.community === req.user.community;

    const allowed = user._id.toString() === req.user._id.toString() ||
      req.user.role === "ADMIN" ||
      (req.user.role === "BLOCK_MANAGER" && sameBlock) ||
      (req.user.role === "COMMUNITY_HEAD" && sameCommunity);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this user"
      });
    }

    const obj = user.toObject();
    obj.flatNumber = obj.flatNumber || obj.houseNumber || obj.house?.houseNumber || "";
    obj.houseNumber = obj.flatNumber;

    res.status(200).json({
      success: true,
      user: obj
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const sameBlock = req.user.block && user.block && user.block.toString() === req.user.block.toString();
  if (req.user.role !== "ADMIN" && !sameBlock && !(req.user.role === "COMMUNITY_HEAD" && user.community === req.user.community)) {
    return res.status(403).json({ success: false, message: "You are not authorized to approve this resident" });
  }
  user.isApproved = true;
  await user.save();
  res.json({ success: true, message: "Resident approved", user });
};


// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Ensure only the user themselves or an ADMIN can update this profile
    if (user._id.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile"
      });
    }

    const {
      name,
      phone,
      residentType,
      houseNumber,
      community,
      house,
      block,
      profileImage
    } = req.body;

    const previousPhone = user.phone;
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (residentType !== undefined) user.residentType = residentType;
    if (houseNumber !== undefined) user.houseNumber = houseNumber;
    // Community membership is managed by registration and administrators.
    if (house !== undefined) user.house = house;
    if (block !== undefined) user.block = block;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    if (houseNumber !== undefined && user.house) {
      await House.findByIdAndUpdate(user.house, {
        $set: { houseNumber }
      });
    }

    if (phone !== undefined && phone !== previousPhone) {
      await Business.updateMany(
        { owner: user._id },
        { $set: { contact: phone } }
      );
    }

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("block")
      .populate("house");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveUser
};