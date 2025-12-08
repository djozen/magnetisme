// Enemy definitions by element
export const ENEMY_TYPES = {
  // EARTH enemies
  EARTH_ROCK: {
    key: 'earth_rock',
    name: 'Rock Golem',
    element: 'earth',
    health: 30,
    damage: 10,
    speed: 50,
    color: 0x8b4513,
    behavior: 'patrol'
  },
  EARTH_MOLE: {
    key: 'earth_mole',
    name: 'Tunnel Mole',
    element: 'earth',
    health: 20,
    damage: 8,
    speed: 80,
    color: 0x654321,
    behavior: 'burrow'
  },
  
  // FIRE enemies
  FIRE_FLAME: {
    key: 'fire_flame',
    name: 'Living Flame',
    element: 'fire',
    health: 25,
    damage: 15,
    speed: 100,
    color: 0xff4500,
    behavior: 'chase'
  },
  FIRE_DRAGON: {
    key: 'fire_dragon',
    name: 'Fire Dragon',
    element: 'fire',
    health: 50,
    damage: 20,
    speed: 60,
    color: 0xff0000,
    behavior: 'fly_shoot'
  },
  
  // WATER enemies
  WATER_BUBBLE: {
    key: 'water_bubble',
    name: 'Water Bubble',
    element: 'water',
    health: 20,
    damage: 10,
    speed: 70,
    color: 0x1e90ff,
    behavior: 'float'
  },
  WATER_SHARK: {
    key: 'water_shark',
    name: 'Aqua Shark',
    element: 'water',
    health: 35,
    damage: 18,
    speed: 120,
    color: 0x0066cc,
    behavior: 'swim_charge'
  },
  
  // WIND enemies
  WIND_WISP: {
    key: 'wind_wisp',
    name: 'Wind Wisp',
    element: 'wind',
    health: 15,
    damage: 8,
    speed: 150,
    color: 0x87ceeb,
    behavior: 'fly_erratic'
  },
  WIND_TORNADO: {
    key: 'wind_tornado',
    name: 'Mini Tornado',
    element: 'wind',
    health: 30,
    damage: 12,
    speed: 90,
    color: 0xadd8e6,
    behavior: 'spin'
  },
  
  // NATURE enemies
  NATURE_VINE: {
    key: 'nature_vine',
    name: 'Thorny Vine',
    element: 'nature',
    health: 25,
    damage: 10,
    speed: 40,
    color: 0x228b22,
    behavior: 'extend'
  },
  NATURE_TREANT: {
    key: 'nature_treant',
    name: 'Tree Guardian',
    element: 'nature',
    health: 40,
    damage: 15,
    speed: 50,
    color: 0x006400,
    behavior: 'patrol'
  },
  
  // LIGHTNING enemies
  LIGHTNING_SPARK: {
    key: 'lightning_spark',
    name: 'Electric Spark',
    element: 'lightning',
    health: 18,
    damage: 20,
    speed: 140,
    color: 0xffff00,
    behavior: 'zigzag'
  },
  LIGHTNING_CLOUD: {
    key: 'lightning_cloud',
    name: 'Storm Cloud',
    element: 'lightning',
    health: 35,
    damage: 18,
    speed: 60,
    color: 0xffd700,
    behavior: 'hover_shoot'
  },
  
  // ICE enemies
  ICE_SHARD: {
    key: 'ice_shard',
    name: 'Ice Shard',
    element: 'ice',
    health: 20,
    damage: 12,
    speed: 80,
    color: 0x00ffff,
    behavior: 'slide'
  },
  ICE_YETI: {
    key: 'ice_yeti',
    name: 'Frost Yeti',
    element: 'ice',
    health: 45,
    damage: 18,
    speed: 70,
    color: 0xb0e0e6,
    behavior: 'patrol'
  },
  
  // SHADOW enemies
  SHADOW_WRAITH: {
    key: 'shadow_wraith',
    name: 'Shadow Wraith',
    element: 'shadow',
    health: 22,
    damage: 14,
    speed: 110,
    color: 0x4b0082,
    behavior: 'phase'
  },
  SHADOW_DEMON: {
    key: 'shadow_demon',
    name: 'Dark Demon',
    element: 'shadow',
    health: 40,
    damage: 16,
    speed: 85,
    color: 0x2f004f,
    behavior: 'teleport'
  },
  
  // LIGHT enemies
  LIGHT_RAY: {
    key: 'light_ray',
    name: 'Light Ray',
    element: 'light',
    health: 18,
    damage: 12,
    speed: 130,
    color: 0xfffacd,
    behavior: 'beam'
  },
  LIGHT_ANGEL: {
    key: 'light_angel',
    name: 'Radiant Angel',
    element: 'light',
    health: 35,
    damage: 15,
    speed: 90,
    color: 0xffffff,
    behavior: 'fly_heal'
  },
  
  // METAL enemies
  METAL_BLADE: {
    key: 'metal_blade',
    name: 'Spinning Blade',
    element: 'metal',
    health: 30,
    damage: 18,
    speed: 100,
    color: 0xc0c0c0,
    behavior: 'spin_move'
  },
  METAL_ROBOT: {
    key: 'metal_robot',
    name: 'Steel Robot',
    element: 'metal',
    health: 50,
    damage: 20,
    speed: 60,
    color: 0x808080,
    behavior: 'march_shoot'
  },
  
  // POISON enemies
  POISON_SLIME: {
    key: 'poison_slime',
    name: 'Toxic Slime',
    element: 'poison',
    health: 25,
    damage: 12,
    speed: 50,
    color: 0x9932cc,
    behavior: 'ooze'
  },
  POISON_SPIDER: {
    key: 'poison_spider',
    name: 'Venom Spider',
    element: 'poison',
    health: 30,
    damage: 16,
    speed: 95,
    color: 0x8b008b,
    behavior: 'crawl_spit'
  },
  
  // PSYCHIC enemies
  PSYCHIC_ORB: {
    key: 'psychic_orb',
    name: 'Mind Orb',
    element: 'psychic',
    health: 20,
    damage: 14,
    speed: 70,
    color: 0xff1493,
    behavior: 'levitate'
  },
  PSYCHIC_BRAIN: {
    key: 'psychic_brain',
    name: 'Psi Brain',
    element: 'psychic',
    health: 35,
    damage: 18,
    speed: 40,
    color: 0xff69b4,
    behavior: 'mind_blast'
  },
  
  // WOOD enemies
  WOOD_PUPPET: {
    key: 'wood_puppet',
    name: 'Wooden Puppet',
    element: 'wood',
    health: 28,
    damage: 12,
    speed: 75,
    color: 0xdaa520,
    behavior: 'patrol'
  },
  WOOD_SPIRIT: {
    key: 'wood_spirit',
    name: 'Forest Spirit',
    element: 'wood',
    health: 32,
    damage: 14,
    speed: 80,
    color: 0xcd853f,
    behavior: 'float_summon'
  },
  
  // SOUND enemies
  SOUND_WAVE: {
    key: 'sound_wave',
    name: 'Sound Wave',
    element: 'sound',
    health: 22,
    damage: 16,
    speed: 120,
    color: 0xff69b4,
    behavior: 'pulse'
  },
  SOUND_ECHO: {
    key: 'sound_echo',
    name: 'Echo Beast',
    element: 'sound',
    health: 38,
    damage: 18,
    speed: 85,
    color: 0xffc0cb,
    behavior: 'sonic_boom'
  },
  
  // GOLD enemies
  GOLD_COIN: {
    key: 'gold_coin',
    name: 'Living Coin',
    element: 'gold',
    health: 15,
    damage: 10,
    speed: 110,
    color: 0xffd700,
    behavior: 'spin_fly'
  },
  GOLD_GUARDIAN: {
    key: 'gold_guardian',
    name: 'Gold Guardian',
    element: 'gold',
    health: 55,
    damage: 22,
    speed: 50,
    color: 0xdaa520,
    behavior: 'defend'
  },
  
  // GLASS enemies
  GLASS_SHARD: {
    key: 'glass_shard',
    name: 'Glass Shard',
    element: 'glass',
    health: 18,
    damage: 20,
    speed: 100,
    color: 0xe0ffff,
    behavior: 'reflect'
  },
  GLASS_PRISM: {
    key: 'glass_prism',
    name: 'Crystal Prism',
    element: 'glass',
    health: 30,
    damage: 16,
    speed: 70,
    color: 0xf0ffff,
    behavior: 'laser'
  },
  
  // VOID enemies
  VOID_HOLE: {
    key: 'void_hole',
    name: 'Void Hole',
    element: 'void',
    health: 40,
    damage: 25,
    speed: 30,
    color: 0x000000,
    behavior: 'pull'
  },
  VOID_ENTITY: {
    key: 'void_entity',
    name: 'Void Entity',
    element: 'void',
    health: 50,
    damage: 20,
    speed: 90,
    color: 0x1a1a1a,
    behavior: 'phase_attack'
  }
};

// Get enemies for specific element
export function getEnemiesForElement(element) {
  return Object.values(ENEMY_TYPES).filter(enemy => enemy.element === element);
}

// Get random basic enemy for element
export function getRandomBasicEnemy(element) {
  const enemies = getEnemiesForElement(element);
  return enemies[Phaser.Math.Between(0, enemies.length - 1)];
}
