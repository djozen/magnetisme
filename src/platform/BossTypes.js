// Boss definitions for each chapter
export const BOSS_TYPES = {
  // Mid-bosses (Level 4) - Element themed
  EARTH_MID_BOSS: {
    key: 'earth_mid_boss',
    name: 'Stone Titan',
    element: 'earth',
    health: 150,
    damage: 15,
    speed: 40,
    color: 0x8b4513,
    isBoss: true,
    attacks: ['ground_pound', 'rock_throw', 'earthquake']
  },
  
  FIRE_MID_BOSS: {
    key: 'fire_mid_boss',
    name: 'Flame Lord',
    element: 'fire',
    health: 140,
    damage: 20,
    speed: 60,
    color: 0xff4500,
    isBoss: true,
    attacks: ['fireball', 'flame_wave', 'meteor']
  },
  
  WATER_MID_BOSS: {
    key: 'water_mid_boss',
    name: 'Tide Master',
    element: 'water',
    health: 135,
    damage: 18,
    speed: 70,
    color: 0x1e90ff,
    isBoss: true,
    attacks: ['water_jet', 'tidal_wave', 'whirlpool']
  },
  
  WIND_MID_BOSS: {
    key: 'wind_mid_boss',
    name: 'Storm Hawk',
    element: 'wind',
    health: 130,
    damage: 16,
    speed: 100,
    color: 0x87ceeb,
    isBoss: true,
    attacks: ['wind_slash', 'tornado', 'gust']
  },
  
  NATURE_MID_BOSS: {
    key: 'nature_mid_boss',
    name: 'Forest King',
    element: 'nature',
    health: 145,
    damage: 17,
    speed: 55,
    color: 0x228b22,
    isBoss: true,
    attacks: ['vine_whip', 'root_spike', 'pollen_cloud']
  },
  
  LIGHTNING_MID_BOSS: {
    key: 'lightning_mid_boss',
    name: 'Thunder Beast',
    element: 'lightning',
    health: 125,
    damage: 22,
    speed: 90,
    color: 0xffff00,
    isBoss: true,
    attacks: ['lightning_bolt', 'chain_lightning', 'thunder_strike']
  },
  
  ICE_MID_BOSS: {
    key: 'ice_mid_boss',
    name: 'Frost Giant',
    element: 'ice',
    health: 155,
    damage: 19,
    speed: 50,
    color: 0x00ffff,
    isBoss: true,
    attacks: ['ice_beam', 'blizzard', 'freeze']
  },
  
  SHADOW_MID_BOSS: {
    key: 'shadow_mid_boss',
    name: 'Dark Lord',
    element: 'shadow',
    health: 140,
    damage: 20,
    speed: 75,
    color: 0x4b0082,
    isBoss: true,
    attacks: ['shadow_ball', 'darkness', 'void_slash']
  },
  
  LIGHT_MID_BOSS: {
    key: 'light_mid_boss',
    name: 'Celestial Guardian',
    element: 'light',
    health: 135,
    damage: 18,
    speed: 80,
    color: 0xfffacd,
    isBoss: true,
    attacks: ['light_beam', 'holy_flash', 'radiance']
  },
  
  METAL_MID_BOSS: {
    key: 'metal_mid_boss',
    name: 'Iron Colossus',
    element: 'metal',
    health: 170,
    damage: 21,
    speed: 45,
    color: 0xc0c0c0,
    isBoss: true,
    attacks: ['metal_slam', 'blade_storm', 'armor_charge']
  },
  
  POISON_MID_BOSS: {
    key: 'poison_mid_boss',
    name: 'Venom Hydra',
    element: 'poison',
    health: 145,
    damage: 19,
    speed: 65,
    color: 0x9932cc,
    isBoss: true,
    attacks: ['poison_spit', 'toxic_cloud', 'venom_strike']
  },
  
  PSYCHIC_MID_BOSS: {
    key: 'psychic_mid_boss',
    name: 'Mind Flayer',
    element: 'psychic',
    health: 130,
    damage: 20,
    speed: 60,
    color: 0xff1493,
    isBoss: true,
    attacks: ['psychic_blast', 'confusion', 'telekinesis']
  },
  
  WOOD_MID_BOSS: {
    key: 'wood_mid_boss',
    name: 'Ancient Oak',
    element: 'wood',
    health: 150,
    damage: 18,
    speed: 40,
    color: 0xdaa520,
    isBoss: true,
    attacks: ['branch_slam', 'root_trap', 'leaf_storm']
  },
  
  SOUND_MID_BOSS: {
    key: 'sound_mid_boss',
    name: 'Echo Demon',
    element: 'sound',
    health: 135,
    damage: 20,
    speed: 85,
    color: 0xff69b4,
    isBoss: true,
    attacks: ['sonic_scream', 'resonance', 'sound_barrier']
  },
  
  GOLD_MID_BOSS: {
    key: 'gold_mid_boss',
    name: 'Treasure Dragon',
    element: 'gold',
    health: 160,
    damage: 22,
    speed: 55,
    color: 0xffd700,
    isBoss: true,
    attacks: ['coin_shower', 'golden_breath', 'greed']
  },
  
  GLASS_MID_BOSS: {
    key: 'glass_mid_boss',
    name: 'Crystal Golem',
    element: 'glass',
    health: 125,
    damage: 24,
    speed: 65,
    color: 0xe0ffff,
    isBoss: true,
    attacks: ['glass_shard', 'prism_beam', 'reflect']
  },
  
  VOID_MID_BOSS: {
    key: 'void_mid_boss',
    name: 'Void Walker',
    element: 'void',
    health: 155,
    damage: 23,
    speed: 70,
    color: 0x000000,
    isBoss: true,
    attacks: ['void_sphere', 'reality_tear', 'null']
  },
  
  // Final bosses (Last level) - Original impressive bosses
  EARTH_FINAL_BOSS: {
    key: 'earth_final_boss',
    name: 'Earthquake Leviathan',
    element: 'earth',
    health: 300,
    damage: 25,
    speed: 50,
    color: 0x8b4513,
    isBoss: true,
    isFinal: true,
    attacks: ['mega_quake', 'mountain_fall', 'fissure', 'boulder_rain']
  },
  
  FIRE_FINAL_BOSS: {
    key: 'fire_final_boss',
    name: 'Inferno Phoenix',
    element: 'fire',
    health: 280,
    damage: 30,
    speed: 75,
    color: 0xff4500,
    isBoss: true,
    isFinal: true,
    attacks: ['phoenix_dive', 'rebirth', 'fire_storm', 'solar_flare']
  },
  
  WATER_FINAL_BOSS: {
    key: 'water_final_boss',
    name: 'Tsunami Serpent',
    element: 'water',
    health: 270,
    damage: 27,
    speed: 85,
    color: 0x1e90ff,
    isBoss: true,
    isFinal: true,
    attacks: ['tsunami', 'water_prison', 'pressure_crush', 'maelstrom']
  },
  
  WIND_FINAL_BOSS: {
    key: 'wind_final_boss',
    name: 'Hurricane Dragon',
    element: 'wind',
    health: 260,
    damage: 26,
    speed: 110,
    color: 0x87ceeb,
    isBoss: true,
    isFinal: true,
    attacks: ['hurricane', 'wind_blade_storm', 'vacuum', 'sky_fall']
  },
  
  NATURE_FINAL_BOSS: {
    key: 'nature_final_boss',
    name: 'Gaia Colossus',
    element: 'nature',
    health: 290,
    damage: 28,
    speed: 60,
    color: 0x228b22,
    isBoss: true,
    isFinal: true,
    attacks: ['natures_wrath', 'mega_growth', 'thorn_prison', 'life_drain']
  },
  
  LIGHTNING_FINAL_BOSS: {
    key: 'lightning_final_boss',
    name: 'Thunderlord Zeus',
    element: 'lightning',
    health: 250,
    damage: 35,
    speed: 95,
    color: 0xffff00,
    isBoss: true,
    isFinal: true,
    attacks: ['divine_lightning', 'thunder_god', 'plasma_storm', 'electrocute']
  },
  
  ICE_FINAL_BOSS: {
    key: 'ice_final_boss',
    name: 'Absolute Zero',
    element: 'ice',
    health: 310,
    damage: 29,
    speed: 55,
    color: 0x00ffff,
    isBoss: true,
    isFinal: true,
    attacks: ['ice_age', 'frozen_tomb', 'absolute_blizzard', 'shatter']
  },
  
  SHADOW_FINAL_BOSS: {
    key: 'shadow_final_boss',
    name: 'Nightmare King',
    element: 'shadow',
    health: 280,
    damage: 30,
    speed: 80,
    color: 0x4b0082,
    isBoss: true,
    isFinal: true,
    attacks: ['nightmare', 'shadow_realm', 'dark_matter', 'soul_drain']
  },
  
  LIGHT_FINAL_BOSS: {
    key: 'light_final_boss',
    name: 'Archangel Seraph',
    element: 'light',
    health: 270,
    damage: 28,
    speed: 90,
    color: 0xfffacd,
    isBoss: true,
    isFinal: true,
    attacks: ['divine_judgment', 'holy_nova', 'heaven_beam', 'resurrection']
  },
  
  METAL_FINAL_BOSS: {
    key: 'metal_final_boss',
    name: 'Mecha Overlord',
    element: 'metal',
    health: 340,
    damage: 32,
    speed: 50,
    color: 0xc0c0c0,
    isBoss: true,
    isFinal: true,
    attacks: ['mega_laser', 'missile_barrage', 'steel_fortress', 'overdrive']
  },
  
  POISON_FINAL_BOSS: {
    key: 'poison_final_boss',
    name: 'Plague Apocalypse',
    element: 'poison',
    health: 290,
    damage: 29,
    speed: 70,
    color: 0x9932cc,
    isBoss: true,
    isFinal: true,
    attacks: ['pandemic', 'corruption', 'acid_rain', 'necrosis']
  },
  
  PSYCHIC_FINAL_BOSS: {
    key: 'psychic_final_boss',
    name: 'Omega Mind',
    element: 'psychic',
    health: 260,
    damage: 31,
    speed: 65,
    color: 0xff1493,
    isBoss: true,
    isFinal: true,
    attacks: ['mind_break', 'psychic_storm', 'illusion', 'mind_control']
  },
  
  WOOD_FINAL_BOSS: {
    key: 'wood_final_boss',
    name: 'Elder Dryad',
    element: 'wood',
    health: 300,
    damage: 27,
    speed: 55,
    color: 0xdaa520,
    isBoss: true,
    isFinal: true,
    attacks: ['forest_fury', 'wooden_cage', 'splinter_storm', 'ancient_roots']
  },
  
  SOUND_FINAL_BOSS: {
    key: 'sound_final_boss',
    name: 'Symphony Destroyer',
    element: 'sound',
    health: 270,
    damage: 30,
    speed: 95,
    color: 0xff69b4,
    isBoss: true,
    isFinal: true,
    attacks: ['sonic_apocalypse', 'frequency_death', 'harmonic_blast', 'silence']
  },
  
  GOLD_FINAL_BOSS: {
    key: 'gold_final_boss',
    name: 'King Midas',
    element: 'gold',
    health: 320,
    damage: 33,
    speed: 60,
    color: 0xffd700,
    isBoss: true,
    isFinal: true,
    attacks: ['golden_touch', 'wealth_crush', 'fortune_strike', 'greed_aura']
  },
  
  GLASS_FINAL_BOSS: {
    key: 'glass_final_boss',
    name: 'Prismatic Emperor',
    element: 'glass',
    health: 250,
    damage: 36,
    speed: 75,
    color: 0xe0ffff,
    isBoss: true,
    isFinal: true,
    attacks: ['rainbow_laser', 'crystal_prison', 'shatter_bomb', 'refraction']
  },
  
  VOID_FINAL_BOSS: {
    key: 'void_final_boss',
    name: 'Entropy Incarnate',
    element: 'void',
    health: 310,
    damage: 34,
    speed: 75,
    color: 0x000000,
    isBoss: true,
    isFinal: true,
    attacks: ['oblivion', 'reality_collapse', 'void_storm', 'existence_erase']
  },
  
  // ULTIMATE BOSS - Master of All Elements
  ULTIMATE_BOSS: {
    key: 'ultimate_boss',
    name: 'Elemental Overlord',
    element: 'all',
    health: 500,
    damage: 40,
    speed: 85,
    color: 0xff00ff,
    isBoss: true,
    isFinal: true,
    isUltimate: true,
    attacks: [
      'elemental_chaos',
      'omni_blast',
      'element_swap',
      'ultimate_storm',
      'reality_warp',
      'all_elements_fury'
    ],
    // Can use attacks from all elements
    elements: ['earth', 'fire', 'water', 'wind', 'nature', 'lightning', 'ice', 
               'shadow', 'light', 'metal', 'poison', 'psychic', 'wood', 'sound', 
               'gold', 'glass', 'void']
  }
};

// Get boss for chapter and level type
export function getBoss(element, isMidBoss = false) {
  if (element === 'all' || element === 'final') {
    return BOSS_TYPES.ULTIMATE_BOSS;
  }
  
  const key = isMidBoss ? `${element}_mid_boss` : `${element}_final_boss`;
  return BOSS_TYPES[key.toUpperCase()];
}
