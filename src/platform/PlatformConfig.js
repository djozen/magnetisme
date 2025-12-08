// Platform game configuration
export const PLATFORM_CONFIG = {
  // World
  WORLD_WIDTH: 3200,
  WORLD_HEIGHT: 720,
  
  // Player
  PLAYER_SPEED: 200,
  PLAYER_JUMP: 400,
  PLAYER_HEALTH: 100,
  PLAYER_SIZE: 40,
  
  // Physics
  GRAVITY: 800,
  
  // Ball (power projectile)
  BALL_SPEED: 300,
  BALL_DAMAGE: 20,
  BALL_SIZE: 12,
  
  // Powers
  POWER_COOLDOWN: 3000, // 3 seconds
  GIFT_POWER_COOLDOWN: 10000, // 10 seconds
  
  // Level
  PLATFORM_HEIGHT: 40,
  PLATFORM_WIDTH_MIN: 100,
  PLATFORM_WIDTH_MAX: 400,
  
  // Collectibles
  BALL_COLLECT_POINTS: 10,
  ENEMY_DEFEAT_POINTS: 50,
  BOSS_DEFEAT_POINTS: 500,
  
  // Debug
  DEBUG_MODE: false,
  DEBUG_SHOW_HITBOXES: false,
  DEBUG_INVINCIBLE: false,
  DEBUG_UNLOCK_ALL: false
};

// Elements - keeping original 17 elements
export const ELEMENTS = {
  EARTH: { key: 'earth', name: 'Earth', color: 0x8b4513, requiredLevel: 1 },
  FIRE: { key: 'fire', name: 'Fire', color: 0xff4500, requiredLevel: 1 },
  WATER: { key: 'water', name: 'Water', color: 0x1e90ff, requiredLevel: 1 },
  WIND: { key: 'wind', name: 'Wind', color: 0x87ceeb, requiredLevel: 2 },
  NATURE: { key: 'nature', name: 'Nature', color: 0x228b22, requiredLevel: 3 },
  LIGHTNING: { key: 'lightning', name: 'Lightning', color: 0xffff00, requiredLevel: 4 },
  ICE: { key: 'ice', name: 'Ice', color: 0x00ffff, requiredLevel: 5 },
  SHADOW: { key: 'shadow', name: 'Shadow', color: 0x4b0082, requiredLevel: 6 },
  LIGHT: { key: 'light', name: 'Light', color: 0xfffacd, requiredLevel: 7 },
  METAL: { key: 'metal', name: 'Metal', color: 0xc0c0c0, requiredLevel: 8 },
  POISON: { key: 'poison', name: 'Poison', color: 0x9932cc, requiredLevel: 9 },
  PSYCHIC: { key: 'psychic', name: 'Psychic', color: 0xff1493, requiredLevel: 10 },
  WOOD: { key: 'wood', name: 'Wood', color: 0xdaa520, requiredLevel: 11 },
  SOUND: { key: 'sound', name: 'Sound', color: 0xff69b4, requiredLevel: 12 },
  GOLD: { key: 'gold', name: 'Gold', color: 0xffd700, requiredLevel: 13 },
  GLASS: { key: 'glass', name: 'Glass', color: 0xe0ffff, requiredLevel: 14 },
  VOID: { key: 'void', name: 'Void', color: 0x000000, requiredLevel: 15 }
};

// Power definitions for platform game
export const POWERS = {
  // Basic element powers
  EARTH: {
    name: 'Rock Throw',
    description: 'Throw a heavy rock that deals damage',
    damage: 25,
    cooldown: 3000,
    type: 'projectile'
  },
  FIRE: {
    name: 'Fireball',
    description: 'Launch a fireball',
    damage: 30,
    cooldown: 2500,
    type: 'projectile'
  },
  WATER: {
    name: 'Water Jet',
    description: 'Blast water forward',
    damage: 20,
    cooldown: 2000,
    type: 'projectile'
  },
  WIND: {
    name: 'Wind Gust',
    description: 'Push enemies back',
    damage: 15,
    cooldown: 2000,
    type: 'push'
  },
  NATURE: {
    name: 'Vine Whip',
    description: 'Whip with thorny vines',
    damage: 22,
    cooldown: 2500,
    type: 'melee'
  },
  LIGHTNING: {
    name: 'Lightning Bolt',
    description: 'Strike with lightning',
    damage: 35,
    cooldown: 3000,
    type: 'instant'
  },
  ICE: {
    name: 'Ice Spike',
    description: 'Freeze and damage enemies',
    damage: 25,
    cooldown: 3000,
    type: 'projectile',
    effect: 'freeze'
  },
  SHADOW: {
    name: 'Shadow Strike',
    description: 'Teleport and strike',
    damage: 28,
    cooldown: 4000,
    type: 'teleport'
  },
  LIGHT: {
    name: 'Light Beam',
    description: 'Continuous beam of light',
    damage: 20,
    cooldown: 2500,
    type: 'beam'
  },
  METAL: {
    name: 'Metal Blade',
    description: 'Throw spinning blades',
    damage: 30,
    cooldown: 3000,
    type: 'projectile'
  },
  POISON: {
    name: 'Poison Cloud',
    description: 'Create toxic cloud',
    damage: 15,
    cooldown: 3500,
    type: 'area',
    effect: 'poison'
  },
  PSYCHIC: {
    name: 'Mind Blast',
    description: 'Psychic explosion',
    damage: 32,
    cooldown: 3500,
    type: 'area'
  },
  WOOD: {
    name: 'Root Spike',
    description: 'Spikes from ground',
    damage: 26,
    cooldown: 3000,
    type: 'ground'
  },
  SOUND: {
    name: 'Sonic Wave',
    description: 'Sound wave attack',
    damage: 24,
    cooldown: 2500,
    type: 'wave'
  },
  GOLD: {
    name: 'Coin Shot',
    description: 'Shoot golden coins',
    damage: 22,
    cooldown: 2000,
    type: 'projectile'
  },
  GLASS: {
    name: 'Glass Shard',
    description: 'Sharp glass shards',
    damage: 28,
    cooldown: 2500,
    type: 'projectile'
  },
  VOID: {
    name: 'Void Sphere',
    description: 'Ball of nothingness',
    damage: 35,
    cooldown: 4000,
    type: 'projectile'
  }
};

// Gift powers (special collectible powers)
export const GIFT_POWERS = {
  SHIELD: {
    name: 'Shield',
    description: 'Temporary invincibility',
    duration: 5000,
    type: 'buff'
  },
  SPEED: {
    name: 'Speed Boost',
    description: 'Move faster',
    duration: 8000,
    multiplier: 1.5,
    type: 'buff'
  },
  DOUBLE_DAMAGE: {
    name: 'Power Up',
    description: 'Double damage',
    duration: 10000,
    multiplier: 2,
    type: 'buff'
  },
  HEAL: {
    name: 'Heal',
    description: 'Restore health',
    amount: 50,
    type: 'instant'
  },
  MULTI_SHOT: {
    name: 'Multi Shot',
    description: 'Shoot 3 projectiles',
    duration: 10000,
    shots: 3,
    type: 'buff'
  }
};
