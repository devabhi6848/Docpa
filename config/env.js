import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/docpa",
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
};
