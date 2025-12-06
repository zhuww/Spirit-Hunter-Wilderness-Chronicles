import { Beast } from './types';

// World dimensions
export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 3000;

export const INITIAL_BEASTS: Beast[] = [
  {
    id: 'b1',
    name: 'Fiery Spirit Cat',
    description: 'A feline composed of living ember. It leaves scorch marks where it walks.',
    spriteId: 136, 
    isCaptured: false,
    rarity: 'Common',
    stats: { lightning: 2, love: 1, defense: 1 },
    position: { x: 800, y: 1200 }
  },
  {
    id: 'b2',
    name: 'Ice Shard Dog',
    description: 'Its fur is made of permafrost. Cold air surrounds it.',
    spriteId: 471,
    isCaptured: false,
    rarity: 'Common',
    stats: { lightning: 3, love: 0, defense: 2 },
    position: { x: 2200, y: 800 }
  },
  {
    id: 'b3',
    name: 'Golden Squirrel',
    description: 'Small, fast, and crackling with electric energy.',
    spriteId: 417,
    isCaptured: false,
    rarity: 'Rare',
    stats: { lightning: 1, love: 3, defense: 0 },
    position: { x: 400, y: 400 }
  },
  {
    id: 'b4',
    name: 'Golden Deer',
    description: 'A majestic creature glowing with sunlight.',
    spriteId: 585,
    isCaptured: false,
    rarity: 'Legendary',
    stats: { lightning: 4, love: 3, defense: 3 },
    position: { x: 2500, y: 2500 }
  },
  {
    id: 'b5',
    name: 'Shadow Wolf',
    description: 'Blends perfectly into the darkness. A trickster spirit.',
    spriteId: 570,
    isCaptured: false,
    rarity: 'Rare',
    stats: { lightning: 4, love: 0, defense: 2 },
    position: { x: 1500, y: 1800 }
  },
  {
    id: 'b6',
    name: 'Crystal Turtle',
    description: 'Its shell is made of diamond-hard crystal.',
    spriteId: 7,
    isCaptured: false,
    rarity: 'Common',
    stats: { lightning: 1, love: 1, defense: 5 },
    position: { x: 1800, y: 600 }
  },
  {
    id: 'b7',
    name: 'Wind Hawk',
    description: 'Rides the currents of the air with incredible speed.',
    spriteId: 17,
    isCaptured: false,
    rarity: 'Common',
    stats: { lightning: 3, love: 1, defense: 1 },
    position: { x: 600, y: 2400 }
  }
];

export const INITIAL_ARROWS = 10;