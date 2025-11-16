import mongoose, { Document, Schema } from 'mongoose';

export interface ISteamToGiantBomb extends Document {
  steamAppId: number;
  steamName: string;
  gbId: number;
  gbName: string;
  confidence: number; // 0-1 score of match quality
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SteamToGiantBombSchema = new Schema<ISteamToGiantBomb>(
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
    gbId: {
      type: Number,
      required: true,
      index: true,
    },
    gbName: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SteamToGiantBomb = mongoose.model<ISteamToGiantBomb>(
  'SteamToGiantBomb',
  SteamToGiantBombSchema,
  'sToGB'
);
