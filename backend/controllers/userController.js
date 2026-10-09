const User = require("../models/User");


// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("block")
      .populate("house");

    res.status(200).json({
      success: true,
      count: users.length,
      users
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
      .populate("block")
      .populate("house");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (residentType !== undefined) user.residentType = residentType;
    if (houseNumber !== undefined) user.houseNumber = houseNumber;
    if (community !== undefined) user.community = community;
    if (house !== undefined) user.house = house;
    if (block !== undefined) user.block = block;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

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
  deleteUser
};