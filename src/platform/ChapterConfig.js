// Configuration for 17 chapters + final boss chapter
export const CHAPTERS = {
  EARTH: {
    id: 1,
    name: 'Earth - Underground',
    key: 'earth',
    color: 0x8b4513,
    terrain: 'earth',
    description: 'Deep underground caverns',
    levels: 5,
    unlockLevel: 1
  },
  FIRE: {
    id: 2,
    name: 'Fire - Volcanic',
    key: 'fire',
    color: 0xff4500,
    terrain: 'fire',
    description: 'Scorching volcanic realm',
    levels: 5,
    unlockLevel: 2
  },
  WATER: {
    id: 3,
    name: 'Water - Aquatic',
    key: 'water',
    color: 0x1e90ff,
    terrain: 'water',
    description: 'Underwater depths',
    levels: 5,
    unlockLevel: 3
  },
  WIND: {
    id: 4,
    name: 'Wind - Sky',
    key: 'wind',
    color: 0x87ceeb,
    terrain: 'wind',
    description: 'Floating islands in the sky',
    levels: 5,
    unlockLevel: 4
  },
  NATURE: {
    id: 5,
    name: 'Nature - Forest',
    key: 'nature',
    color: 0x228b22,
    terrain: 'nature',
    description: 'Ancient enchanted forest',
    levels: 5,
    unlockLevel: 5
  },
  LIGHTNING: {
    id: 6,
    name: 'Lightning - Storm',
    key: 'lightning',
    color: 0xffff00,
    terrain: 'lightning',
    description: 'Electric storm realm',
    levels: 5,
    unlockLevel: 6
  },
  ICE: {
    id: 7,
    name: 'Ice - Frozen',
    key: 'ice',
    color: 0x00ffff,
    terrain: 'ice',
    description: 'Frozen tundra',
    levels: 5,
    unlockLevel: 7
  },
  SHADOW: {
    id: 8,
    name: 'Shadow - Darkness',
    key: 'shadow',
    color: 0x4b0082,
    terrain: 'shadow',
    description: 'Realm of shadows',
    levels: 5,
    unlockLevel: 8
  },
  LIGHT: {
    id: 9,
    name: 'Light - Radiance',
    key: 'light',
    color: 0xfffacd,
    terrain: 'light',
    description: 'Celestial sanctuary',
    levels: 5,
    unlockLevel: 9
  },
  METAL: {
    id: 10,
    name: 'Metal - Industrial',
    key: 'metal',
    color: 0xc0c0c0,
    terrain: 'metal',
    description: 'Mechanical fortress',
    levels: 5,
    unlockLevel: 10
  },
  POISON: {
    id: 11,
    name: 'Poison - Toxic',
    key: 'poison',
    color: 0x9932cc,
    terrain: 'poison',
    description: 'Poisonous swamps',
    levels: 5,
    unlockLevel: 11
  },
  PSYCHIC: {
    id: 12,
    name: 'Psychic - Mind',
    key: 'psychic',
    color: 0xff1493,
    terrain: 'psychic',
    description: 'Ethereal mindscape',
    levels: 5,
    unlockLevel: 12
  },
  WOOD: {
    id: 13,
    name: 'Wood - Ancient',
    key: 'wood',
    color: 0xdaa520,
    terrain: 'wood',
    description: 'Ancient wooden temple',
    levels: 5,
    unlockLevel: 13
  },
  SOUND: {
    id: 14,
    name: 'Sound - Resonance',
    key: 'sound',
    color: 0xff69b4,
    terrain: 'sound',
    description: 'Echoing chambers',
    levels: 5,
    unlockLevel: 14
  },
  GOLD: {
    id: 15,
    name: 'Gold - Treasury',
    key: 'gold',
    color: 0xffd700,
    terrain: 'gold',
    description: 'Golden treasure vault',
    levels: 5,
    unlockLevel: 15
  },
  GLASS: {
    id: 16,
    name: 'Glass - Crystal',
    key: 'glass',
    color: 0xe0ffff,
    terrain: 'glass',
    description: 'Crystal palace',
    levels: 5,
    unlockLevel: 16
  },
  VOID: {
    id: 17,
    name: 'Void - Emptiness',
    key: 'void',
    color: 0x000000,
    terrain: 'void',
    description: 'The endless void',
    levels: 5,
    unlockLevel: 17
  },
  FINAL: {
    id: 18,
    name: 'Final - Ultimate Challenge',
    key: 'final',
    color: 0xff00ff,
    terrain: 'mixed',
    description: 'Face the master of all elements',
    levels: 1,
    unlockLevel: 18
  }
};

// Level configuration
export const LEVEL_CONFIG = {
  MIN_LEVELS_PER_CHAPTER: 4,
  MAX_LEVELS_PER_CHAPTER: 6,
  
  // Level types
  TYPES: {
    NORMAL: 'normal',           // Levels 1-3
    MID_BOSS: 'mid_boss',       // Level 4 (boss intermédiaire)
    AI_BOSS: 'ai_boss',         // Avant-dernier niveau (AI player)
    FINAL_BOSS: 'final_boss'    // Dernier niveau (boss original)
  }
};

// Get chapter array
export function getChapterList() {
  return Object.values(CHAPTERS);
}

// Get chapter by key
export function getChapter(key) {
  return Object.values(CHAPTERS).find(c => c.key === key);
}

// Get level type based on chapter and level number
export function getLevelType(chapterKey, levelNumber) {
  const chapter = getChapter(chapterKey);
  if (!chapter) return LEVEL_CONFIG.TYPES.NORMAL;
  
  const totalLevels = chapter.levels;
  
  if (levelNumber === totalLevels) {
    return LEVEL_CONFIG.TYPES.FINAL_BOSS;
  } else if (levelNumber === totalLevels - 1) {
    return LEVEL_CONFIG.TYPES.AI_BOSS;
  } else if (levelNumber === 4 && totalLevels >= 5) {
    return LEVEL_CONFIG.TYPES.MID_BOSS;
  }
  
  return LEVEL_CONFIG.TYPES.NORMAL;
}
