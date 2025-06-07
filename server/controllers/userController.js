import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res
        .status(500)
        .json({ success: false, message: "Missing details" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(500)
        .json({ success: false, message: "Account already exits" });
    }
    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hasPassword,
      bio,
    });
    const token = generateToken(newUser._id);
    res
      .status(200)
      .json({
        success: true,
        userdata: newUser,
        token,
        message: "Account Created successFully",
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = res.body;
    const userData = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(userData._id);
    res
      .status(200)
      .json({ success: true, userData, token, message: "Login successfull" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updateUser;
    if (profilePic) {
      updateUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updateUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }
    res.status(200).json({ success: true, user: updateUser });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({ success: false, message: error.message });
  }
};
