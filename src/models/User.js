import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  // Password (optional for Google OAuth users)
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  
  // Google OAuth info
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleEmail: String,
  googleName: String,
  googlePicture: String,
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    required: false,
  },
  twoFactorBackupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Password Reset
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },

  // Account verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(passwordToCompare) {
  return await bcryptjs.compare(passwordToCompare, this.password);
};

// Method to get safe user data (without sensitive info)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.twoFactorBackupCodes;
  delete user.verificationCode;
  delete user.verificationCodeExpires;
  return user;
};

// Method to get public user data
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    googleId: this.googleId,
    googleName: this.googleName,
    googlePicture: this.googlePicture,
    twoFactorEnabled: this.twoFactorEnabled,
    isVerified: this.isVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);
