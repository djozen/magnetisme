import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, element, playerId, isAI = false, teamId = 0, teamColor = 0xff0000) {
    // Create a graphics object for the player sprite (improved design)
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Draw creature body (larger, more detailed)
    // Main body
    graphics.fillStyle(element.color, 1);
    graphics.fillCircle(20, 24, 18);
    
    // Add some darker spots for texture
    const darkerColor = element.color - 0x202020;
    graphics.fillStyle(darkerColor, 0.5);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = 20 + Math.cos(angle) * 12;
      const py = 24 + Math.sin(angle) * 12;
      graphics.fillCircle(px, py, 4);
    }
    
    // Eyes (big and expressive)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 20, 5);  // Left eye white
    graphics.fillCircle(26, 20, 5);  // Right eye white
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 20, 3);  // Left pupil
    graphics.fillCircle(27, 20, 3);  // Right pupil
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(14, 19, 1.5);  // Left highlight
    graphics.fillCircle(26, 19, 1.5);  // Right highlight
    
    // Cute mouth
    graphics.lineStyle(2, 0x000000, 1);
    graphics.arc(20, 26, 4, 0, Math.PI, false);
    graphics.strokePath();
    
    // Team color indicator (horn/crown)
    graphics.fillStyle(teamColor, 1);
    graphics.fillTriangle(20, 8, 16, 14, 24, 14);
    
    // Outline
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeCircle(20, 24, 18);
    
    // Generate texture from graphics
    const key = `player_${playerId}_${Date.now()}`;
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;
    this.playerId = playerId;
    this.isAI = isAI;
    this.teamId = teamId;
    this.teamColor = teamColor;
    this.collectedSpirits = [];
    this.trailParticles = [];

    // Physics properties
    this.setCollideWorldBounds(true);
    this.setDrag(400);
    this.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED);

    // Visual enhancements
    this.setScale(1);

    // Create name tag with team info
    this.nameText = scene.add.text(x, y - 35, `${element.name} (T${teamId + 1})`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Create particle trail
    this.createTrail(scene);
  }

  createTrail(scene) {
    // Particle trail disabled for debugging
    // TODO: Re-enable when particle system is fixed
    /*
    this.trailEmitter = scene.add.particles(this.x, this.y, 'white', {
      speed: 20,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 200,
      frequency: 50,
      tint: this.element.color,
      follow: this
    });
    */
  }

  update(time, delta) {
    // Update name tag position
    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 35);
    }
  }

  collectSpirit(spirit) {
    this.collectedSpirits.push(spirit);
  }

  destroy() {
    if (this.nameText) {
      this.nameText.destroy();
    }
    if (this.trailEmitter) {
      this.trailEmitter.destroy();
    }
    super.destroy();
  }
}
