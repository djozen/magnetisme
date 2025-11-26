// 8 different creature shapes for players

export const PlayerShapes = {
  // Shape 0: Round creature (original)
  ROUND: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillCircle(20, 24, 18);
    
    const darkerColor = color - 0x202020;
    graphics.fillStyle(darkerColor, 0.5);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = 20 + Math.cos(angle) * 12;
      const py = 24 + Math.sin(angle) * 12;
      graphics.fillCircle(px, py, 4);
    }
    
    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 20, 5);
    graphics.fillCircle(26, 20, 5);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 20, 3);
    graphics.fillCircle(27, 20, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 19, 1.5);
    graphics.fillCircle(26, 19, 1.5);
    
    // Mouth
    graphics.lineStyle(2, 0x000000, 1);
    graphics.arc(20, 26, 4, 0, Math.PI, false);
    graphics.strokePath();
    
    // Team indicator
    graphics.fillStyle(teamColor, 1);
    graphics.fillTriangle(20, 8, 16, 14, 24, 14);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(20, 24, 18);
  },

  // Shape 1: Square creature
  SQUARE: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(8, 12, 24, 24, 4);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillRect(12, 8, 16, 6);
    
    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 22, 4);
    graphics.fillCircle(24, 22, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 22, 2);
    graphics.fillCircle(24, 22, 2);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRoundedRect(8, 12, 24, 24, 4);
  },

  // Shape 3: Star creature
  STAR: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = 20 + Math.cos(angle) * 16;
      const y = 24 + Math.sin(angle) * 16;
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
      
      const innerAngle = angle + Math.PI / 5;
      const ix = 20 + Math.cos(innerAngle) * 8;
      const iy = 24 + Math.sin(innerAngle) * 8;
      graphics.lineTo(ix, iy);
    }
    graphics.closePath();
    graphics.fillPath();
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 22, 3);
    graphics.fillCircle(25, 22, 3);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 22, 1.5);
    graphics.fillCircle(25, 22, 1.5);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillCircle(20, 16, 4);
  },

  // Shape 4: Triangle creature
  TRIANGLE: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(20, 10, 6, 38, 34, 38);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 24, 4);
    graphics.fillCircle(24, 24, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 24, 2);
    graphics.fillCircle(24, 24, 2);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillTriangle(20, 8, 16, 12, 24, 12);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeTriangle(20, 10, 6, 38, 34, 38);
  },

  // Shape 5: Diamond creature
  DIAMOND: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(20, 8, 8, 24, 20, 40);
    graphics.fillTriangle(20, 8, 32, 24, 20, 40);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 22, 4);
    graphics.fillCircle(24, 22, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 22, 2);
    graphics.fillCircle(24, 22, 2);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillCircle(20, 14, 3);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeTriangle(20, 8, 8, 24, 20, 40);
    graphics.strokeTriangle(20, 8, 32, 24, 20, 40);
  },

  // Shape 6: Hexagon creature
  HEXAGON: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = 20 + Math.cos(angle) * 14;
      const y = 24 + Math.sin(angle) * 14;
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 22, 4);
    graphics.fillCircle(25, 22, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 22, 2);
    graphics.fillCircle(25, 22, 2);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillRect(16, 12, 8, 4);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = 20 + Math.cos(angle) * 14;
      const y = 24 + Math.sin(angle) * 14;
      if (i === 0) graphics.moveTo(x, y);
      else graphics.lineTo(x, y);
    }
    graphics.closePath();
    graphics.strokePath();
  },

  // Shape 7: Cloud creature
  CLOUD: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillCircle(12, 24, 10);
    graphics.fillCircle(20, 20, 12);
    graphics.fillCircle(28, 24, 10);
    graphics.fillCircle(20, 28, 10);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 22, 4);
    graphics.fillCircle(24, 22, 4);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(16, 22, 2);
    graphics.fillCircle(24, 22, 2);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillCircle(20, 16, 4);
  },

  // Shape 2: Oval creature
  OVAL: (graphics, color, teamColor) => {
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(20, 24, 20, 14);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 22, 5);
    graphics.fillCircle(26, 22, 5);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(14, 22, 3);
    graphics.fillCircle(26, 22, 3);
    
    graphics.fillStyle(teamColor, 1);
    graphics.fillRect(16, 12, 8, 5);
    
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeEllipse(20, 24, 20, 14);
  }
};

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
  
  return shapes[playerId % 8];
}
