// 8 different creature shapes for players - Organic and realistic designs

export const PlayerShapes = {
  // Shape 0: Slime creature
  ROUND: (graphics, color, teamColor) => {
    // Body - organic blob shape (multiple overlapping circles for organic look)
    graphics.fillStyle(color, 0.9);
    graphics.fillCircle(20, 24, 16);
    graphics.fillCircle(14, 20, 12);
    graphics.fillCircle(26, 20, 12);
    graphics.fillCircle(20, 28, 14);
    
    // Darker belly
    const darkerColor = Math.max(0, color - 0x202020);
    graphics.fillStyle(darkerColor, 0.7);
    graphics.fillEllipse(20, 28, 14, 10);
    
    // Shine spots (glossy slime effect)
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillEllipse(15, 14, 6, 8);
    graphics.fillEllipse(26, 16, 4, 6);
    
    // Large expressive eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(14, 20, 6, 7);
    graphics.fillEllipse(26, 20, 6, 7);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 21, 3);
    graphics.fillCircle(27, 21, 3);
    // Eye highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 19, 1.5);
    graphics.fillCircle(26, 19, 1.5);
    
    // Happy mouth
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.beginPath();
    graphics.arc(20, 26, 5, 0.2, Math.PI - 0.2, false);
    graphics.strokePath();
    
    // Team indicator - hat/bow
    graphics.fillStyle(teamColor, 1);
    graphics.fillEllipse(20, 10, 8, 4);
    graphics.fillCircle(20, 8, 4);
  },

  // Shape 1: Fluffy creature
  SQUARE: (graphics, color, teamColor) => {
    // Fluffy body - multiple overlapping circles for fur texture
    graphics.fillStyle(color, 1);
    
    // Main body
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 10 + Math.random() * 2;
      const x = 20 + Math.cos(angle) * distance;
      const y = 24 + Math.sin(angle) * distance;
      graphics.fillCircle(x, y, 6);
    }
    graphics.fillCircle(20, 24, 12);
    
    // Fluffy ears
    graphics.fillCircle(12, 14, 5);
    graphics.fillCircle(28, 14, 5);
    
    // Face area (lighter)
    const lighterColor = color + 0x1a1a1a;
    graphics.fillStyle(lighterColor, 1);
    graphics.fillCircle(20, 24, 8);
    
    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 22, 3);
    graphics.fillCircle(24, 22, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 21, 1.5);
    graphics.fillCircle(23, 21, 1.5);
    
    // Nose
    graphics.fillStyle(0xff69b4, 1);
    graphics.fillCircle(20, 26, 2);
    
    // Team bow
    graphics.fillStyle(teamColor, 1);
    graphics.fillEllipse(12, 10, 5, 3);
    graphics.fillEllipse(20, 10, 5, 3);
    graphics.fillEllipse(28, 10, 5, 3);
    graphics.fillCircle(20, 10, 3);
  },

  // Shape 3: Dragon/Lizard creature
  STAR: (graphics, color, teamColor) => {
    // Body
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(20, 26, 16, 12);
    
    // Head
    graphics.fillEllipse(20, 18, 16, 10);
    
    // Snout
    graphics.fillEllipse(20, 20, 12, 6);
    
    // Neck scales
    const darkerColor = Math.max(0, color - 0x181818);
    graphics.fillStyle(darkerColor, 0.6);
    for (let i = 0; i < 3; i++) {
      graphics.fillCircle(20, 20 + i * 3, 3);
    }
    
    // Spikes on back
    graphics.fillStyle(teamColor, 1);
    graphics.fillTriangle(16, 22, 14, 18, 18, 20);
    graphics.fillTriangle(20, 20, 18, 16, 22, 18);
    graphics.fillTriangle(24, 22, 22, 18, 26, 20);
    
    // Eyes (reptilian)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillEllipse(16, 16, 4, 5);
    graphics.fillEllipse(24, 16, 4, 5);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(15, 14, 1, 4);
    graphics.fillRect(23, 14, 1, 4);
    
    // Nostrils
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillCircle(18, 20, 1);
    graphics.fillCircle(22, 20, 1);
    
    // Tail
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(20, 32, 24, 38, 20, 34);
  },

  // Shape 4: Bird creature
  TRIANGLE: (graphics, color, teamColor) => {
    // Body (round)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(20, 26, 12);
    
    // Head
    graphics.fillCircle(20, 16, 8);
    
    // Belly (lighter)
    const lighterColor = color + 0x202020;
    graphics.fillStyle(lighterColor, 1);
    graphics.fillCircle(20, 28, 8);
    
    // Wings
    graphics.fillStyle(color, 1);
    // Left wing
    graphics.fillEllipse(8, 28, 10, 8);
    graphics.fillCircle(6, 26, 4);
    
    // Right wing
    graphics.fillEllipse(32, 28, 10, 8);
    graphics.fillCircle(34, 26, 4);
    
    // Feather details
    graphics.lineStyle(1, 0x000000, 0.3);
    for (let i = 0; i < 3; i++) {
      graphics.lineBetween(6 + i * 2, 28, 4 + i * 2, 32);
      graphics.lineBetween(34 - i * 2, 28, 36 - i * 2, 32);
    }
    
    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 4);
    graphics.fillCircle(24, 16, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 16, 2.5);
    graphics.fillCircle(24, 16, 2.5);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 15, 1);
    graphics.fillCircle(23, 15, 1);
    
    // Beak
    graphics.fillStyle(0xffa500, 1);
    graphics.fillTriangle(20, 18, 18, 20, 22, 20);
    
    // Team crest
    graphics.fillStyle(teamColor, 1);
    graphics.fillCircle(20, 10, 3);
    graphics.fillEllipse(20, 8, 2, 4);
  },

  // Shape 5: Fish creature  
  DIAMOND: (graphics, color, teamColor) => {
    // Body
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(20, 24, 16, 12);
    
    // Head (slightly wider)
    graphics.fillEllipse(26, 24, 8, 10);
    
    // Scales pattern
    const darkerColor = Math.max(0, color - 0x101010);
    graphics.fillStyle(darkerColor, 0.4);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 16 + col * 4;
        const y = 20 + row * 4;
        graphics.fillCircle(x, y, 2);
      }
    }
    
    // Tail fin
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(12, 24, 6, 18, 6, 30);
    
    // Team fin on top
    graphics.fillStyle(teamColor, 1);
    graphics.fillTriangle(20, 16, 18, 12, 22, 12);
    graphics.fillTriangle(20, 14, 18, 10, 22, 10);
    
    // Eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(24, 22, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(24, 22, 2);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(23, 21, 1);
    
    // Mouth
    graphics.lineStyle(1, 0x000000, 0.6);
    graphics.arc(26, 26, 2, 0, Math.PI, false);
    graphics.strokePath();
    
    // Bubbles
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillCircle(8, 20, 2);
    graphics.fillCircle(6, 24, 1.5);
    graphics.fillCircle(8, 28, 2);
  },

  // Shape 6: Octopus/Squid creature
  HEXAGON: (graphics, color, teamColor) => {
    // Head
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(20, 18, 14, 12);
    
    // Tentacles (8 tentacles)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const startX = 20 + Math.cos(angle) * 10;
      const startY = 24 + Math.sin(angle) * 6;
      
      const endX = 20 + Math.cos(angle) * 18;
      const endY = 30 + Math.sin(angle) * 10;
      
      graphics.lineStyle(4, color, 1);
      graphics.lineBetween(startX, startY, endX, endY);
      
      // Suckers on tentacles
      const darkerColor = Math.max(0, color - 0x202020);
      graphics.fillStyle(darkerColor, 0.6);
      graphics.fillCircle(startX + Math.cos(angle) * 6, startY + 3, 1.5);
      graphics.fillCircle(startX + Math.cos(angle) * 10, startY + 5, 1.5);
    }
    
    // Eyes (large anime-style)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillEllipse(15, 18, 5, 6);
    graphics.fillEllipse(25, 18, 5, 6);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 18, 3);
    graphics.fillCircle(25, 18, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 17, 1.5);
    graphics.fillCircle(24, 17, 1.5);
    
    // Team mark on head
    graphics.fillStyle(teamColor, 1);
    graphics.fillCircle(20, 14, 3);
  },

  // Shape 7: Cloud/Ghost creature
  CLOUD: (graphics, color, teamColor) => {
    // Ghostly body with wavy bottom
    graphics.fillStyle(color, 0.85);
    graphics.fillCircle(12, 20, 8);
    graphics.fillCircle(20, 16, 10);
    graphics.fillCircle(28, 20, 8);
    graphics.fillRect(10, 20, 20, 8);
    
    // Wavy bottom (using circles)
    for (let i = 0; i < 5; i++) {
      const x = 10 + i * 5;
      graphics.fillCircle(x, 28 + (i % 2 === 0 ? 0 : 4), 4);
    }
    
    // Ethereal glow
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillCircle(18, 18, 6);
    
    // Eyes (cute ghost eyes)
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 20, 3);
    graphics.fillCircle(24, 20, 3);
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(15, 19, 1.5);
    graphics.fillCircle(23, 19, 1.5);
    
    // Mouth
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(20, 25, 2);
    
    // Team indicator - halo
    graphics.lineStyle(2, teamColor, 1);
    graphics.strokeCircle(20, 10, 6);
    graphics.fillStyle(teamColor, 0.3);
    graphics.fillCircle(20, 10, 6);
  },

  // Shape 2: Bear/Mammal creature
  OVAL: (graphics, color, teamColor) => {
    // Body
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(20, 28, 14, 12);
    
    // Head
    graphics.fillCircle(20, 18, 10);
    
    // Ears (rounded)
    graphics.fillCircle(13, 12, 5);
    graphics.fillCircle(27, 12, 5);
    
    // Inner ears
    const lighterColor = color + 0x252525;
    graphics.fillStyle(lighterColor, 1);
    graphics.fillCircle(13, 12, 3);
    graphics.fillCircle(27, 12, 3);
    
    // Snout
    graphics.fillCircle(20, 22, 6);
    
    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 17, 3);
    graphics.fillCircle(24, 17, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 16, 1.5);
    graphics.fillCircle(23, 16, 1.5);
    
    // Nose
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(20, 22, 3);
    graphics.fillStyle(lighterColor, 0.5);
    graphics.fillCircle(19, 21, 1);
    
    // Mouth
    graphics.lineStyle(1.5, 0x000000, 0.8);
    graphics.beginPath();
    graphics.moveTo(20, 23);
    graphics.lineTo(20, 25);
    graphics.strokePath();
    
    graphics.beginPath();
    graphics.moveTo(20, 25);
    graphics.lineTo(16, 25);
    graphics.strokePath();
    
    graphics.beginPath();
    graphics.moveTo(20, 25);
    graphics.lineTo(24, 25);
    graphics.strokePath();
    
    // Paws
    graphics.fillStyle(color, 1);
    graphics.fillCircle(14, 34, 4);
    graphics.fillCircle(26, 34, 4);
    
    // Team scarf
    graphics.fillStyle(teamColor, 1);
    graphics.fillRect(16, 26, 8, 3);
    graphics.fillRect(16, 29, 2, 4);
    graphics.fillRect(22, 29, 2, 4);
  }
};

// Store human player's random shape
let humanPlayerShapeIndex = null;
let assignedShapes = [];

export function initializeShapes(totalPlayers) {
  // Reset
  humanPlayerShapeIndex = null;
  assignedShapes = [];
  
  const shapes = [
    PlayerShapes.ROUND,
    PlayerShapes.SQUARE,
    PlayerShapes.OVAL,
    PlayerShapes.STAR,
    PlayerShapes.TRIANGLE,
    PlayerShapes.DIAMOND,
    PlayerShapes.HEXAGON,
    PlayerShapes.CLOUD
  ];
  
  // Human player gets random shape
  humanPlayerShapeIndex = Phaser.Math.Between(0, 7);
  assignedShapes.push(humanPlayerShapeIndex);
  
  // Assign remaining shapes to AI players
  const remainingIndices = [];
  for (let i = 0; i < 8; i++) {
    if (i !== humanPlayerShapeIndex) {
      remainingIndices.push(i);
    }
  }
  
  // Shuffle remaining shapes
  Phaser.Utils.Array.Shuffle(remainingIndices);
  assignedShapes.push(...remainingIndices.slice(0, totalPlayers - 1));
  
  return shapes;
}

export function getPlayerShape(playerId) {
  const shapes = [
    PlayerShapes.ROUND,
    PlayerShapes.SQUARE,
    PlayerShapes.OVAL,
    PlayerShapes.STAR,
    PlayerShapes.TRIANGLE,
    PlayerShapes.DIAMOND,
    PlayerShapes.HEXAGON,
    PlayerShapes.CLOUD
  ];
  
  // Use assigned shapes if initialized
  if (assignedShapes.length > 0 && playerId < assignedShapes.length) {
    return shapes[assignedShapes[playerId]];
  }
  
  // Fallback to sequential
  return shapes[playerId % 8];
}

