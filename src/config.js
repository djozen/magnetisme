// Elemental types configuration
export const ELEMENTS = {
  WATER: { name: 'Water', color: 0x0077be, key: 'water', requiredLevel: 1 },
  FIRE: { name: 'Fire', color: 0xff4500, key: 'fire', requiredLevel: 1 },
  WIND: { name: 'Wind', color: 0xb0e0e6, key: 'wind', requiredLevel: 1 },
  EARTH: { name: 'Earth', color: 0x8b4513, key: 'earth', requiredLevel: 1 },
  LEAF: { name: 'Leaf', color: 0x32cd32, key: 'leaf', requiredLevel: 5 },
  ICE: { name: 'Ice', color: 0x87ceeb, key: 'ice', requiredLevel: 7 },
  GLASS: { name: 'Glass', color: 0xe0ffff, key: 'glass', requiredLevel: 10 },
  SAND: { name: 'Sand', color: 0xf4a460, key: 'sand', requiredLevel: 11 },
  WOOD: { name: 'Wood', color: 0x8b7355, key: 'wood', requiredLevel: 12 },
  PLASMA: { name: 'Plasma', color: 0xff1493, key: 'plasma', requiredLevel: 13 },
  TOXIC: { name: 'Toxic', color: 0x00ff00, key: 'toxic', requiredLevel: 13 },
  THUNDER: { name: 'Thunder', color: 0xffd700, key: 'thunder', requiredLevel: 15 },
  SHADOW: { name: 'Shadow', color: 0x4b0082, key: 'shadow', requiredLevel: 17 },
  LIGHT: { name: 'Light', color: 0xfffacd, key: 'light', requiredLevel: 17 },
  IRON: { name: 'Iron', color: 0x808080, key: 'iron', requiredLevel: 19 },
  GOLD: { name: 'Gold', color: 0xdaa520, key: 'gold', requiredLevel: 20 }
};

export const GAME_CONFIG = {
  MAX_PLAYERS: 8,
  MAX_TEAMS: 4,
  PLAYERS_PER_TEAM: 2,
  SPIRIT_COUNT: 100,
  GAME_TIME: 120, // seconds
  PLAYER_SPEED: 300,
  SPIRIT_COLLECT_DISTANCE: 35,
  SPIRIT_FOLLOW_SPEED: 300,  // Augmenté de 150 à 200 pour suivi plus rapide
  SPIRIT_SPACING: 25,
  BASE_ZONE_SIZE: 100,
  BASE_DEPOSIT_DISTANCE: 80,
  SPIRIT_RESPAWN_TIME: 5000, // 5 seconds
  WORLD_WIDTH: 2560,  // Larger world
  WORLD_HEIGHT: 1920,
  VISIBILITY_RANGE: 320, // 4 tiles * 80px
  TILE_SIZE: 80,
  // Power system config
  POWER_CHARGE_RATE: 0.05,  // Charge lente au fil du temps
  POWER_BONUS_PER_SPIRIT: 2,  // Bonus par esprit collecté
  MAX_POWER_CHARGE: 100,
  // Gameplay options
  FRIENDLY_FIRE: true,  // Les pouvoirs affectent les alliés (false = immunité alliée)
  GIFT_POWER_KEY: 'CTRL',  // Key to activate gift powers (default: CTRL)
  MAX_GIFT_POWERS: 3,  // Maximum number of gift powers that can be held simultaneously (1-3)
  DEBUG_MODE: true,  // Debug mode: show all elements, next level info, unlimited powers
  DEBUG_LEVEL: 5  // Niveau en mode debug (1-20, affecte l'agressivité des IA)
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
