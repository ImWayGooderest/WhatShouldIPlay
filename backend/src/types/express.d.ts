import { ISteamUser } from '../models/SteamUser';

declare global {
  namespace Express {
    interface Request {
      user?: ISteamUser;
    }
  }
}

export {};
