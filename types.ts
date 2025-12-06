export enum ViewState {
  HOME = 'HOME',
  COMBAT = 'COMBAT',
  TRAINING = 'TRAINING',
  WILDERNESS = 'WILDERNESS',
}

export interface BeastStats {
  lightning: number; // Offensive ability (0-5)
  love: number;      // Magic ability (0-3)
  defense: number;   // Helmet/Defense
}

export interface Beast {
  id: string;
  name: string;
  description: string;
  spriteId: number; // Pokemon Showdown ID for animated sprites
  isCaptured: boolean;
  stats: BeastStats;
  rarity: 'Common' | 'Rare' | 'Legendary';
  position: { x: number; y: number }; // Absolute world coordinates in pixels
}

export interface Player {
  arrows: number;
  capturedBeastIds: string[];
}

export interface LogEntry {
  id: string;
  text: string;
  sender: 'System' | 'Ghost';
  timestamp: number;
}