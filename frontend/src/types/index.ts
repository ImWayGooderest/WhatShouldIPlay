export interface Game {
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
  original_release_date?: string;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url?: string;
  img_logo_url?: string;
  gbData?: Game | null;
}

export interface SteamUser {
  steamID64: string;
  username?: string;
  realname?: string;
  avatarIcon?: string;
  avatarMedium?: string;
  avatarFull?: string;
  profileUrl?: string;
  gameCount: number;
  lastUpdated: Date;
}

export interface EnrichedGame extends SteamGame {
  gbData: Game | null;
}

export type FilterType = 'genre' | 'theme' | 'concept' | 'developer';
