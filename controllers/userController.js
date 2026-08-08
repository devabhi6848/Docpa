import { registerUserService, loginUserService } from "../services/userService.js";

/**
 * Controller to handle user registration
 */
export const registerUser = async (req, res, next) => {
  try {
    const userData = await registerUserService(req.body);
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { user: userData },
    });
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
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: authData,
    });
  } catch (error) {
    next(error);
  }
};
