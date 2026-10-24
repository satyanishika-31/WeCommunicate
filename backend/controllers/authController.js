const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const House = require("../models/House");
const Block = require("../models/Block");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};


// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      residentType,
      community,
      houseNumber,
      house,
      block
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and a password of at least 6 characters are required"
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let linkedHouse = null;
    let linkedBlock = block;
    if (block && typeof block === "string" && !block.match(/^[0-9a-fA-F]{24}$/)) {
      const blockRecord = await Block.findOne({
        community,
        $or: [{ name: block }, { blockNumber: block }]
      });
      linkedBlock = blockRecord?._id;
    }
    if (linkedBlock && houseNumber) {
      linkedHouse = await House.findOne({ block: linkedBlock, houseNumber });
      if (!linkedHouse) {
        linkedHouse = await House.create({
          block: linkedBlock,
          houseNumber,
          flatNumber: houseNumber,
          status: residentType === "TENANT" ? "TENANT_OCCUPIED" : "OWNER_OCCUPIED"
        });
      }
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "USER",
      residentType,
      community,
      houseNumber,
      flatNumber: houseNumber,
      house: linkedHouse?._id || house,
      block: linkedHouse?.block || linkedBlock,
      isApproved: false
    });
    if (linkedHouse) {
      linkedHouse.residents.addToSet(user._id);
      linkedHouse.status = residentType === "TENANT" ? "TENANT_OCCUPIED" : "OWNER_OCCUPIED";
      await linkedHouse.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        residentType: user.residentType || 'OWNER',
        community: user.community || '',
        houseNumber: user.houseNumber || '',
        flatNumber: user.flatNumber || user.houseNumber || '',
        profileImage: user.profileImage || null
      }
    });

  } catch (error) {
    console.error("Registration failed:", error);

    if (error?.code === 11000 && error?.message?.includes("username_1")) {
      return res.status(500).json({
        success: false,
        message:
          "Registration could not be completed because the database has an outdated username rule. Please restart the backend and try again."
      });
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Registration could not be completed because an account with this email already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration could not be completed. Please try again."
    });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .populate("block", "name blockNumber")
      .populate("house", "houseNumber");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if (user.role === "USER" && user.isApproved === false) {
      return res.status(403).json({
        success: false,
        message: "Your resident account is pending approval by a community manager."
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        residentType: user.residentType || 'OWNER',
        community: user.community || '',
        houseNumber: user.flatNumber || user.houseNumber || '',
        flatNumber: user.flatNumber || user.houseNumber || '',
        block: user.block || null,
        house: user.house || null,
        profileImage: user.profileImage || null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// LOGOUT
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};


// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("block")
      .populate("house");

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


module.exports = {
  register,
  login,
  logout,
  getMe
};