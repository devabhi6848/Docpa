import { registerUserService, loginUserService } from "../services/userService.js";
import { sendSuccess } from "../utils/responseUtil.js";

/**
 * Controller to handle user registration
 */
export const registerUser = async (req, res, next) => {
  try {
    const userData = await registerUserService(req.body);
    return sendSuccess(res, "User registered successfully", { user: userData }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle user login
 */
export const loginUser = async (req, res, next) => {
  try {
    const authData = await loginUserService(req.body);
    return sendSuccess(res, "Login successful", authData, 200);
  } catch (error) {
    next(error);
  }
};
