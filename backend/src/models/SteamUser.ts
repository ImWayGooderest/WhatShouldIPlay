import mongoose, { Document, Schema } from 'mongoose';

export interface ISteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  has_community_visible_stats?: boolean;
}

export interface ISteamUser extends Document {
  steamID64: string;
  username?: string;
  realname?: string;
  avatarIcon?: string;
  avatarMedium?: string;
  avatarFull?: string;
  profileUrl?: string;
  games: ISteamGame[];
  gameCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SteamGameSchema = new Schema<ISteamGame>({
  appid: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  playtime_forever: {
    type: Number,
    default: 0,
  },
  playtime_windows_forever: Number,
  playtime_mac_forever: Number,
  playtime_linux_forever: Number,
  img_icon_url: String,
  img_logo_url: String,
  has_community_visible_stats: Boolean,
}, { _id: false });

const SteamUserSchema = new Schema<ISteamUser>(
  {
    steamID64: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: String,
    realname: String,
    avatarIcon: String,
    avatarMedium: String,
    avatarFull: String,
    profileUrl: String,
    games: [SteamGameSchema],
    gameCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching by username
SteamUserSchema.index({ username: 1 });

export const SteamUser = mongoose.model<ISteamUser>('SteamUser', SteamUserSchema, 'steam_users');
