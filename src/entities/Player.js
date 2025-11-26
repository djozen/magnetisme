import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { getPlayerShape } from './PlayerShapes.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, element, playerId, isAI = false, teamId = 0, teamColor = 0xff0000) {
    // Create a graphics object for the player sprite
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Get unique shape for this player
    const shapeDrawer = getPlayerShape(playerId);
    shapeDrawer(graphics, element.color, teamColor);
    
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
