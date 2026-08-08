import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
      maxlength: [254, 'Email is too long'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, 
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    password_hash: {
      type: String,
      required: false,
      select: false, 
    },
    google_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    auth_providers: {
      type: [String],
      enum: ['password', 'google', 'email_otp', 'mobile_otp'],
      default: ['password'],
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: 'patient',
    },
    refresh_tokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true } 
);

// Require at least one contact identifier (email, phone, or google_id)
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone && !this.google_id) {
    return next(new Error('At least one of email, phone, or Google ID is required'));
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;