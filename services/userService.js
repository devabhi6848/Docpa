import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwtUtil.js";
import { AppError } from "../utils/AppError.js";

/**
 * Register a new user
 */
export const registerUserService = async ({ email, phone, password, role }) => {
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }
  }

  if (phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      throw new AppError("User with this phone number already exists", 400);
    }
  }

  const password_hash = await hashPassword(password);

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
 * Authenticate user & issue Access + Refresh token pair
 */
export const loginUserService = async ({ email, phone, password }) => {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query).select("+password_hash +refresh_tokens");

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  // Generate token pair
  const tokens = generateTokenPair({ id: user._id, role: user.role });

  // Store refresh token on user document for revocation control
  user.refresh_tokens.push(tokens.refreshToken);
  await user.save();

  return {
    tokens,
    user: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

/**
 * Refresh access token using a valid refresh token (Token Rotation)
 */
export const refreshTokenService = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decoded.id).select("+refresh_tokens");
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  // Check if refresh token exists in user's active session list
  if (!user.refresh_tokens.includes(incomingRefreshToken)) {
    throw new AppError("Refresh token is invalid or has been revoked", 401);
  }

  // Generate new token pair (Token Rotation)
  const newTokens = generateTokenPair({ id: user._id, role: user.role });

  // Replace old refresh token with new refresh token
  user.refresh_tokens = user.refresh_tokens.filter((token) => token !== incomingRefreshToken);
  user.refresh_tokens.push(newTokens.refreshToken);
  await user.save();

  return newTokens;
};

/**
 * Logout user by revoking refresh token
 */
export const logoutUserService = async (userId, refreshTokenToRevoke) => {
  const user = await User.findById(userId).select("+refresh_tokens");
  if (user) {
    user.refresh_tokens = user.refresh_tokens.filter((token) => token !== refreshTokenToRevoke);
    await user.save();
  }
};
