import mongoose, { Document, Schema } from 'mongoose';

export interface IGameNotFound extends Document {
  steamAppId: number;
  steamName: string;
  attemptCount: number;
  lastAttempt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameNotFoundSchema = new Schema<IGameNotFound>(
  {
    steamAppId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    steamName: {
      type: String,
      required: true,
    },
    attemptCount: {
      type: Number,
      default: 1,
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const GameNotFound = mongoose.model<IGameNotFound>(
  'GameNotFound',
  GameNotFoundSchema,
  'games_not_found'
);
