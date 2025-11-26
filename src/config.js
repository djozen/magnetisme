// Elemental types configuration
export const ELEMENTS = {
  WATER: { name: 'Water', color: 0x0077be, key: 'water' },
  FIRE: { name: 'Fire', color: 0xff4500, key: 'fire' },
  WIND: { name: 'Wind', color: 0xb0e0e6, key: 'wind' },
  EARTH: { name: 'Earth', color: 0x8b4513, key: 'earth' },
  LEAF: { name: 'Leaf', color: 0x32cd32, key: 'leaf' },
  ICE: { name: 'Ice', color: 0x87ceeb, key: 'ice' },
  GLASS: { name: 'Glass', color: 0xe0ffff, key: 'glass' },
  SAND: { name: 'Sand', color: 0xf4a460, key: 'sand' },
  THUNDER: { name: 'Thunder', color: 0xffd700, key: 'thunder' },
  SHADOW: { name: 'Shadow', color: 0x4b0082, key: 'shadow' },
  WOOD: { name: 'Wood', color: 0x8b7355, key: 'wood' },
  LIGHT: { name: 'Light', color: 0xfffacd, key: 'light' },
  PLASMA: { name: 'Plasma', color: 0xff1493, key: 'plasma' },
  TOXIC: { name: 'Toxic', color: 0x00ff00, key: 'toxic' }
};

export const GAME_CONFIG = {
  MAX_PLAYERS: 8,
  MAX_TEAMS: 4,
  PLAYERS_PER_TEAM: 2,
  SPIRIT_COUNT: 100,
  GAME_TIME: 180, // seconds
  PLAYER_SPEED: 200,
  SPIRIT_COLLECT_DISTANCE: 35,
  SPIRIT_FOLLOW_SPEED: 150,
  SPIRIT_SPACING: 25,
  BASE_ZONE_SIZE: 100,
  BASE_DEPOSIT_DISTANCE: 80,
  SPIRIT_RESPAWN_TIME: 5000, // 5 seconds
  WORLD_WIDTH: 2560,  // Larger world
  WORLD_HEIGHT: 1920,
  VISIBILITY_RANGE: 320, // 4 tiles * 80px
  TILE_SIZE: 80
};

export const TEAM_COLORS = [
  0xff0000, // Red
  0x0000ff, // Blue
  0xffff00, // Yellow
  0x00ff00, // Green
  0xff00ff, // Magenta
  0x00ffff, // Cyan
  0xffa500, // Orange
  0x800080  // Purple
];
