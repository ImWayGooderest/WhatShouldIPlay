import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  gbId: number;
  name: string;
  deck?: string;
  image?: {
    icon_url?: string;
    medium_url?: string;
    screen_url?: string;
    small_url?: string;
    super_url?: string;
    thumb_url?: string;
    tiny_url?: string;
  };
  developers?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  genres?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  themes?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  concepts?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    api_detail_url: string;
    id: number;
    name: string;
    abbreviation?: string;
  }>;
  site_detail_url?: string;
  api_detail_url?: string;
  original_release_date?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    gbId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    deck: String,
    image: {
      icon_url: String,
      medium_url: String,
      screen_url: String,
      small_url: String,
      super_url: String,
      thumb_url: String,
      tiny_url: String,
    },
    developers: [{
      api_detail_url: String,
      id: Number,
      name: String,
    }],
    genres: [{
      api_detail_url: String,
      id: Number,
      name: { type: String, index: true },
    }],
    themes: [{
      api_detail_url: String,
      id: Number,
      name: { type: String, index: true },
    }],
    concepts: [{
      api_detail_url: String,
      id: Number,
      name: { type: String, index: true },
    }],
    platforms: [{
      api_detail_url: String,
      id: Number,
      name: String,
      abbreviation: String,
    }],
    site_detail_url: String,
    api_detail_url: String,
    original_release_date: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
GameSchema.index({ 'genres.name': 1 });
GameSchema.index({ 'themes.name': 1 });
GameSchema.index({ 'concepts.name': 1 });
GameSchema.index({ 'developers.name': 1 });
GameSchema.index({ name: 'text' });

export const Game = mongoose.model<IGame>('Game', GameSchema, 'GBDB');
