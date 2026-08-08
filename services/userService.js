import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import { generateToken } from "../utils/jwtUtil.js";
import { AppError } from "../utils/AppError.js";

/**
 * Register a new user
 */
export const registerUserService = async ({ email, phone, password, role }) => {
  // Check duplicate email
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }
  }

  // Check duplicate phone
  if (phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError("User with this phone number already exists", 400);
    }
  }

  // Hash password using decoupled password utility
  const password_hash = await hashPassword(password);

  // Save to database
  const user = await User.create({
    email,
    phone,
    password_hash,
    role,
  });

  return {
    id: user._id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
};

/**
 * Authenticate/Login user
 */
export const loginUserService = async ({ email, phone, password }) => {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select("+password_hash");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};
