import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
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
      required: [true, 'Password hash is required'],
      select: false, 
    },
    role: {
      type: String,
      enum: {
        values: ['patient', 'doctor', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },
    refresh_tokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true } 
);

// Require at least one of email/phone to exist
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;