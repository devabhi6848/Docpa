import mongoose from "mongoose";
import { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['email', 'phone'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // Automatically delete document after 300 seconds (5 minutes)
    },
  }
);

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
