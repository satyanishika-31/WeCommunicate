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
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Resident user not found" });
    }

    let isAuthorized = false;

    if (req.user.role === "ADMIN") {
      isAuthorized = true;
    } else if (req.user.role === "COMMUNITY_HEAD") {
      const userComm = (user.community || "").trim().toLowerCase();
      const headComm = (req.user.community || "").trim().toLowerCase();

      if (headComm && userComm && headComm === userComm) {
        isAuthorized = true;
      } else {
        const Community = require("../models/Community");
        const commRecord = await Community.findOne({ communityHead: req.user._id });
        if (commRecord && commRecord.name.trim().toLowerCase() === userComm) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "New tenant or owner approval must be given by their Community Head."
      });
    }

    user.isApproved = true;
    await user.save();

    // Notify the approved resident
    try {
      const createNotifications = require("../utils/createNotification");
      await createNotifications({
        recipients: [user._id],
        type: "APPROVAL",
        title: "Resident Account Approved",
        message: `Your ${user.residentType === "TENANT" ? "tenant" : "homeowner"} account has been approved by your Community Head. You can now access all society services.`,
        relatedId: user._id
      });
    } catch (notifErr) {
      console.warn("Could not dispatch approval notification:", notifErr.message);
    }

    res.json({
      success: true,
      message: `${user.residentType === "TENANT" ? "Tenant" : "Homeowner"} approved successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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


// REJECT RESIDENT (Admin or Community Head)
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let isAuthorized = false;
    if (req.user.role === "ADMIN") {
      isAuthorized = true;
    } else if (req.user.role === "COMMUNITY_HEAD") {
      const userComm = (user.community || "").trim().toLowerCase();
      const headComm = (req.user.community || "").trim().toLowerCase();
      if (headComm && userComm && headComm === userComm) {
        isAuthorized = true;
      } else {
        const Community = require("../models/Community");
        const commRecord = await Community.findOne({ communityHead: req.user._id });
        if (commRecord && commRecord.name.trim().toLowerCase() === userComm) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Resident rejection must be done by their Community Head or Admin."
      });
    }

    const { reason } = req.body || {};
    user.isApproved = false;
    user.isRejected = true;
    user.rejectionReason = reason || "Application rejected by Community Head";
    await user.save();

    // Remove resident from House document so the flat is freed up
    if (user.house) {
      const house = await House.findById(user.house);
      if (house) {
        house.residents = house.residents.filter((r) => r.toString() !== user._id.toString());
        if (house.owner && house.owner.toString() === user._id.toString()) {
          house.owner = undefined;
        }
        if (house.residents.length === 0 && !house.owner) {
          house.status = "VACANT";
        }
        await house.save();
      }
    }

    // Notify resident
    try {
      const createNotifications = require("../utils/createNotification");
      await createNotifications({
        recipients: [user._id],
        type: "APPROVAL",
        title: "Resident Application Rejected",
        message: `Your registration for Flat ${user.flatNumber || user.houseNumber} was rejected by your Community Head.${user.rejectionReason ? ` Reason: ${user.rejectionReason}` : ''}`,
        relatedId: user._id
      });
    } catch (notifErr) {
      console.warn("Could not dispatch rejection notification:", notifErr.message);
    }

    res.json({
      success: true,
      message: `${user.residentType === "TENANT" ? "Tenant" : "Homeowner"} application rejected successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    if (req.user.role === "COMMUNITY_HEAD") {
      const userComm = (user.community || "").trim().toLowerCase();
      const headComm = (req.user.community || "").trim().toLowerCase();
      let authorized = Boolean(userComm && headComm && userComm === headComm);
      if (!authorized) {
        const Community = require("../models/Community");
        const commRecord = await Community.findOne({ communityHead: req.user._id });
        if (commRecord && commRecord.name.trim().toLowerCase() === userComm) {
          authorized = true;
        }
      }
      if (!authorized) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete residents outside your community." });
      }
    }

    // Clean up House references
    if (user.house) {
      const house = await House.findById(user.house);
      if (house) {
        house.residents = house.residents.filter((r) => r.toString() !== user._id.toString());
        if (house.owner && house.owner.toString() === user._id.toString()) {
          house.owner = undefined;
        }
        if (house.residents.length === 0 && !house.owner) {
          house.status = "VACANT";
        }
        await house.save();
      }
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
  approveUser,
  rejectUser
};