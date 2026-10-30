import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

// Schema- Data Type <Message>-Reference to data structure
const MessageSchema: Schema<Message> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  clerkId: string;
  username: string;
  email: string;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

// Clerk owns passwords and email OTP verification; MongoDB stores the app profile and messages.
const UserSchema: Schema<User> = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;
