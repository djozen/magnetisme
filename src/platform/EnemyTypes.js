// Enemy definitions by element
export const ENEMY_TYPES = {
  // EARTH enemies (4 types)
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
  EARTH_BOULDER: {
    key: 'earth_boulder',
    name: 'Rolling Boulder',
    element: 'earth',
    health: 40,
    damage: 15,
    speed: 100,
    color: 0x696969,
    behavior: 'roll'
  },
  EARTH_WORM: {
    key: 'earth_worm',
    name: 'Earth Worm',
    element: 'earth',
    health: 25,
    damage: 12,
    speed: 60,
    color: 0x8b7355,
    behavior: 'underground_chase'
  },
  
  // FIRE enemies (4 types)
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
  FIRE_IMP: {
    key: 'fire_imp',
    name: 'Flame Imp',
    element: 'fire',
    health: 18,
    damage: 12,
    speed: 110,
    color: 0xff6347,
    behavior: 'teleport_attack'
  },
  FIRE_ELEMENTAL: {
    key: 'fire_elemental',
    name: 'Fire Elemental',
    element: 'fire',
    health: 35,
    damage: 18,
    speed: 75,
    color: 0xff8c00,
    behavior: 'orbit_burn'
  },
  
  // WATER enemies (4 types)
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
  WATER_JELLYFISH: {
    key: 'water_jellyfish',
    name: 'Electric Jellyfish',
    element: 'water',
    health: 22,
    damage: 14,
    speed: 50,
    color: 0x4169e1,
    behavior: 'pulse_shock'
  },
  WATER_WAVE: {
    key: 'water_wave',
    name: 'Tidal Wave',
    element: 'water',
    health: 28,
    damage: 16,
    speed: 90,
    color: 0x00bfff,
    behavior: 'wave_crash'
  },
  
  // WIND enemies (4 types)
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
  WIND_HARPY: {
    key: 'wind_harpy',
    name: 'Sky Harpy',
    element: 'wind',
    health: 26,
    damage: 14,
    speed: 130,
    color: 0xb0e0e6,
    behavior: 'dive_attack'
  },
  WIND_CLOUD: {
    key: 'wind_cloud',
    name: 'Storm Cloud',
    element: 'wind',
    health: 32,
    damage: 10,
    speed: 60,
    color: 0x778899,
    behavior: 'lightning_drop'
  },
  
  // NATURE enemies (4 types)
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
  NATURE_MUSHROOM: {
    key: 'nature_mushroom',
    name: 'Spore Mushroom',
    element: 'nature',
    health: 20,
    damage: 8,
    speed: 30,
    color: 0x32cd32,
    behavior: 'spore_cloud'
  },
  NATURE_FAIRY: {
    key: 'nature_fairy',
    name: 'Forest Fairy',
    element: 'nature',
    health: 18,
    damage: 12,
    speed: 95,
    color: 0x90ee90,
    behavior: 'heal_enemies'
  },
  
  // LIGHTNING enemies (4 types)
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
    name: 'Thunder Cloud',
    element: 'lightning',
    health: 35,
    damage: 18,
    speed: 60,
    color: 0xffd700,
    behavior: 'hover_shoot'
  },
  LIGHTNING_EEL: {
    key: 'lightning_eel',
    name: 'Electric Eel',
    element: 'lightning',
    health: 28,
    damage: 22,
    speed: 110,
    color: 0xffffe0,
    behavior: 'serpent_strike'
  },
  LIGHTNING_BOLT: {
    key: 'lightning_bolt',
    name: 'Living Bolt',
    element: 'lightning',
    health: 15,
    damage: 25,
    speed: 160,
    color: 0xf0e68c,
    behavior: 'instant_strike'
  },
  
  // ICE enemies (4 types)
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
  ICE_PENGUIN: {
    key: 'ice_penguin',
    name: 'Ice Penguin',
    element: 'ice',
    health: 24,
    damage: 10,
    speed: 85,
    color: 0xafeeee,
    behavior: 'belly_slide'
  },
  ICE_CRYSTAL: {
    key: 'ice_crystal',
    name: 'Frost Crystal',
    element: 'ice',
    health: 30,
    damage: 16,
    speed: 40,
    color: 0xe0ffff,
    behavior: 'freeze_aura'
  },
  
  // SHADOW enemies (4 types)
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
  SHADOW_BAT: {
    key: 'shadow_bat',
    name: 'Nightmare Bat',
    element: 'shadow',
    health: 16,
    damage: 12,
    speed: 125,
    color: 0x483d8b,
    behavior: 'swarm'
  },
  SHADOW_SHADE: {
    key: 'shadow_shade',
    name: 'Living Shadow',
    element: 'shadow',
    health: 25,
    damage: 18,
    speed: 95,
    color: 0x191970,
    behavior: 'mimic_player'
  },
  
  // LIGHT enemies (4 types)
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
  LIGHT_PRISM: {
    key: 'light_prism',
    name: 'Light Prism',
    element: 'light',
    health: 28,
    damage: 14,
    speed: 50,
    color: 0xfafad2,
    behavior: 'multi_beam'
  },
  LIGHT_WISP: {
    key: 'light_wisp',
    name: 'Holy Wisp',
    element: 'light',
    health: 20,
    damage: 10,
    speed: 100,
    color: 0xffffe0,
    behavior: 'blind_flash'
  },
  
  // METAL enemies (4 types)
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
  METAL_GEAR: {
    key: 'metal_gear',
    name: 'Iron Gear',
    element: 'metal',
    health: 35,
    damage: 16,
    speed: 70,
    color: 0xa9a9a9,
    behavior: 'rotate_crush'
  },
  METAL_TURRET: {
    key: 'metal_turret',
    name: 'Auto Turret',
    element: 'metal',
    health: 40,
    damage: 22,
    speed: 0,
    color: 0xdcdcdc,
    behavior: 'stationary_shoot'
  },
  
  // POISON enemies (4 types)
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
  POISON_SNAKE: {
    key: 'poison_snake',
    name: 'Toxic Serpent',
    element: 'poison',
    health: 26,
    damage: 18,
    speed: 105,
    color: 0x9400d3,
    behavior: 'slither_bite'
  },
  POISON_PLANT: {
    key: 'poison_plant',
    name: 'Venus Flytrap',
    element: 'poison',
    health: 32,
    damage: 14,
    speed: 0,
    color: 0x8a2be2,
    behavior: 'snap_trap'
  },
  
  // PSYCHIC enemies (4 types)
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
  PSYCHIC_EYE: {
    key: 'psychic_eye',
    name: 'All-Seeing Eye',
    element: 'psychic',
    health: 24,
    damage: 16,
    speed: 60,
    color: 0xdb7093,
    behavior: 'gaze_confuse'
  },
  PSYCHIC_GHOST: {
    key: 'psychic_ghost',
    name: 'Poltergeist',
    element: 'psychic',
    health: 28,
    damage: 12,
    speed: 85,
    color: 0xc71585,
    behavior: 'throw_objects'
  },
  
  // WOOD enemies (4 types)
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
  WOOD_LOG: {
    key: 'wood_log',
    name: 'Rolling Log',
    element: 'wood',
    health: 35,
    damage: 18,
    speed: 90,
    color: 0xd2691e,
    behavior: 'roll_crush'
  },
  WOOD_ARCHER: {
    key: 'wood_archer',
    name: 'Wood Archer',
    element: 'wood',
    health: 22,
    damage: 16,
    speed: 65,
    color: 0xb8860b,
    behavior: 'snipe_arrow'
  },
  
  // SOUND enemies (4 types)
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
  SOUND_SPEAKER: {
    key: 'sound_speaker',
    name: 'Boom Box',
    element: 'sound',
    health: 30,
    damage: 20,
    speed: 50,
    color: 0xffb6c1,
    behavior: 'bass_drop'
  },
  SOUND_NOTE: {
    key: 'sound_note',
    name: 'Musical Note',
    element: 'sound',
    health: 18,
    damage: 14,
    speed: 110,
    color: 0xffdab9,
    behavior: 'melody_attack'
  },
  
  // GOLD enemies (4 types)
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
  GOLD_STATUE: {
    key: 'gold_statue',
    name: 'Golden Statue',
    element: 'gold',
    health: 45,
    damage: 18,
    speed: 40,
    color: 0xffa500,
    behavior: 'laser_eyes'
  },
  GOLD_CHEST: {
    key: 'gold_chest',
    name: 'Mimic Chest',
    element: 'gold',
    health: 35,
    damage: 20,
    speed: 0,
    color: 0xffdf00,
    behavior: 'ambush_bite'
  },
  
  // GLASS enemies (4 types)
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
  GLASS_MIRROR: {
    key: 'glass_mirror',
    name: 'Mirror Image',
    element: 'glass',
    health: 24,
    damage: 14,
    speed: 90,
    color: 0xf5fffa,
    behavior: 'clone_player'
  },
  GLASS_CHANDELIER: {
    key: 'glass_chandelier',
    name: 'Crystal Chandelier',
    element: 'glass',
    health: 28,
    damage: 18,
    speed: 0,
    color: 0xf0f8ff,
    behavior: 'drop_shards'
  },
  
  // VOID enemies (4 types)
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
  },
  VOID_TENDRIL: {
    key: 'void_tendril',
    name: 'Void Tendril',
    element: 'void',
    health: 32,
    damage: 22,
    speed: 75,
    color: 0x0d0d0d,
    behavior: 'whip_grab'
  },
  VOID_ORB: {
    key: 'void_orb',
    name: 'Entropy Orb',
    element: 'void',
    health: 28,
    damage: 28,
    speed: 65,
    color: 0x141414,
    behavior: 'reality_warp'
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
