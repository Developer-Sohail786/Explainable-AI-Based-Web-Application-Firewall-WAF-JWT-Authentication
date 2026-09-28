import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // ✅ Correct file name
// import { registerSchema, loginSchema } from "../Validation/authValidation.js";

// ✅ Helper function to create JWT tokens
export const createToken = (payload, secret, expiry) => {
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

// ✅ REGISTER USER
export const registerUser = async (req, res) => {
  try {

    console.log(
      "Register Body Received:",
      req.body
    );

    // =========================
    // DEMO MODE (WAF OFF)
    // =========================

    if (process.env.WAF_ENABLED === "false") {

      console.log(
        "WAF OFF - Demo register bypass"
      );

      return res.status(201).json({
        message: "Demo Registration Success",
        user: {
          name: req.body.name,
          email: req.body.email
        }
      });

    }

    // =========================
    // NORMAL REGISTER (WAF ON)
    // =========================

    const { name, email, password } =
      req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message:
        "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (err) {

    console.error(
      "Register error:",
      err
    );

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
};

// ✅ LOGIN USER
export const loginUser = async (req, res) => {
  try {

    console.log("Login Body Received:", req.body);

    // =========================
    // DEMO MODE (WAF OFF)
    // =========================

    if (process.env.WAF_ENABLED === "false") {

      console.log("WAF OFF - Demo login bypass");

      return res.status(200).json({
        message: "Demo Login Success",
        user: {
          email: req.body.email
        }
      });

    }

    // =========================
    // NORMAL LOGIN (WAF ON)
    // =========================

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {

      return res.status(400).json({
        message: "Invalid credentials"
      });

    }

    const accessToken = createToken(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      "15m"
    );

    const refreshToken = createToken(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      "7d"
    );

    user.refreshToken = refreshToken;

    await user.save();

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .json({
        message: "Login successful",
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });

  } catch (err) {

    console.error(
      "Error in loginUser:",
      err
    );

    return res.status(500).json({
      message: "Internal Server Error"
    });

  }
};
