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

    // Power system - individual player management
    this.availablePowers = [element.key];
    this.powerCharge = 0;
    this.maxPowerCharge = GAME_CONFIG.MAX_POWER_CHARGE;
    this.powerChargeRate = GAME_CONFIG.POWER_CHARGE_RATE;
    this.lastGiftPowerUse = -20000; // Track last gift power usage (allow immediate first use)
    this.giftPowerCooldown = 20000; // 20 seconds cooldown for gift powers

    // Physics properties
    this.setCollideWorldBounds(true);
    this.setDrag(400);
    this.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED);

    // Visual enhancements
    this.setScale(1);
    this.setDepth(10); // Players above terrain and obstacles

    // Create name tag with team info
    this.nameText = scene.add.text(x, y - 35, `${element.name} (T${teamId + 1})`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(11); // Above player

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

  addPowerCharge(amount) {
    // Only humans charge power
    if (!this.isAI) {
      this.powerCharge = Math.min(this.powerCharge + amount, this.maxPowerCharge);
    }
  }

  canUsePower() {
    // AI can always use powers, humans need full charge
    if (this.isAI) return true;
    return this.powerCharge >= this.maxPowerCharge;
  }

  usePower() {
    if (!this.canUsePower()) return false;
    // Only humans consume power charge
    if (!this.isAI) {
      this.powerCharge = 0;
    }
    return true;
  }

  addPower(elementKey) {
    if (!this.availablePowers.includes(elementKey)) {
      this.availablePowers.push(elementKey);
    }
  }

  removePower(elementKey) {
    const index = this.availablePowers.indexOf(elementKey);
    if (index > 0) { // Don't remove base element (index 0)
      this.availablePowers.splice(index, 1);
    }
  }

  collectSpirit(spirit) {
    this.collectedSpirits.push(spirit);
    this.addPowerCharge(GAME_CONFIG.POWER_BONUS_PER_SPIRIT);
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
