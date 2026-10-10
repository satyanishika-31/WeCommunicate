const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
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

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "USER",
      residentType,
      community,
      houseNumber,
      house,
      block
    });

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

    // Seed/sync admin account when logging in with admin credentials
    if (normalizedEmail === "admin@gmail.com" && password === "1234567890") {
      let adminUser = await User.findOne({ email: "admin@gmail.com" });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("1234567890", 10);
        await User.create({
          name: "System Admin",
          email: "admin@gmail.com",
          password: hashedPassword,
          phone: "9876543210",
          role: "ADMIN",
          residentType: "OWNER",
          community: "Emerald Towers Enclave",
          houseNumber: "ADMIN-01"
        });
      } else {
        let changed = false;
        if (adminUser.role !== "ADMIN") {
          adminUser.role = "ADMIN";
          changed = true;
        }
        const isMatch = await bcrypt.compare("1234567890", adminUser.password);
        if (!isMatch) {
          adminUser.password = await bcrypt.hash("1234567890", 10);
          changed = true;
        }
        if (changed) {
          await adminUser.save();
        }
      }
    }

    const user = await User.findOne({ email: normalizedEmail });

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
        houseNumber: user.houseNumber || '',
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


module.exports = {
  register,
  login,
  logout,
  getMe
};