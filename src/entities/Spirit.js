import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class Spirit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, ballSpeed, spiritType = 'default') {
    // Create a graphics object for the spirit sprite
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Draw spirit based on type
    if (spiritType === 'crab') {
      Spirit.drawCrabSpirit(graphics);
    } else if (spiritType === 'black') {
      Spirit.drawBlackSpirit(graphics);
    } else {
      Spirit.drawDefaultSpirit(graphics);
    }
    
    // Generate texture
    const key = `spirit_${spiritType}_${x}_${y}_${Date.now()}`;
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDepth(9); // Spirits below players but above terrain

    this.followingPlayer = null;
    this.followIndex = 0;
    this.originalX = x;
    this.originalY = y;
    this.ballSpeed = ballSpeed || GAME_CONFIG.SPIRIT_FOLLOW_SPEED;

    // Add floating animation only if not following
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 2;
    this.floatAmount = 5;

    // Glow effect disabled for debugging
    // TODO: Re-enable when particle system is fixed
    /*
    this.glowEmitter = scene.add.particles(this.x, this.y, 'white', {
      speed: 10,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 500,
      frequency: 100,
      tint: 0xffff00,
      follow: this
    });
    */
    this.glowEmitter = null;

    // Random gentle movement only if not following
    this.floatTween = scene.tweens.add({
      targets: this,
      x: x + Phaser.Math.Between(-20, 20),
      y: y + Phaser.Math.Between(-20, 20),
      duration: Phaser.Math.Between(2000, 4000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setFollowPlayer(player, index) {
    this.followingPlayer = player;
    this.followIndex = index;
    
    // Stop floating animation
    if (this.floatTween) {
      this.floatTween.stop();
    }
    
    // Change glow color to player's team color
    if (this.glowEmitter) {
      this.glowEmitter.setTint(player.teamColor);
    }
  }

  followPlayer(allSpirits) {
    if (!this.followingPlayer || !this.followingPlayer.active) {
      this.followingPlayer = null;
      return;
    }

    // Count how many spirits are ahead in the queue for this player
    let positionInQueue = 0;
    for (let spirit of allSpirits) {
      if (spirit.followingPlayer === this.followingPlayer && spirit !== this) {
        if (spirit.followIndex < this.followIndex) {
          positionInQueue++;
        }
      }
    }

    // Follow target: either the player or the spirit ahead
    let targetX, targetY;
    
    if (positionInQueue === 0) {
      // Follow player directly
      targetX = this.followingPlayer.x;
      targetY = this.followingPlayer.y;
    } else {
      // Follow the spirit ahead
      const spiritAhead = allSpirits.find(s => 
        s.followingPlayer === this.followingPlayer && 
        s.followIndex === this.followIndex - 1
      );
      
      if (spiritAhead) {
        targetX = spiritAhead.x;
        targetY = spiritAhead.y;
      } else {
        targetX = this.followingPlayer.x;
        targetY = this.followingPlayer.y;
      }
    }

    // Calculate distance and angle to target
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    
    // Only move if too far from target
    if (distance > GAME_CONFIG.SPIRIT_SPACING) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      const speed = this.ballSpeed;
      
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    } else {
      this.setVelocity(0, 0);
    }
  }

  update(time) {
    if (!this.followingPlayer) {
      // Floating animation only when free
      const floatY = Math.sin(time * 0.001 * this.floatSpeed + this.floatOffset) * this.floatAmount;
      this.originalY = this.originalY || this.y;
      this.y = this.originalY + floatY;
    }
  }

  destroy() {
    if (this.glowEmitter) {
      this.glowEmitter.destroy();
    }
    super.destroy();
  }

  // Static methods for drawing different spirit types
  static drawDefaultSpirit(graphics) {
    // Draw cute spirit with BIGGER eyes
    // Body (white fluffy circle)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 14);
    
    // Add fluffy effect with smaller circles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = 16 + Math.cos(angle) * 10;
      const py = 16 + Math.sin(angle) * 10;
      graphics.fillCircle(px, py, 4);
    }
    
    // VERY big eyes (kawaii style)
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(11, 14, 5);  // Left eye (bigger)
    graphics.fillCircle(21, 14, 5); // Right eye (bigger)
    
    // Eye highlights (make it sparkle more)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 2);   // Left highlight (bigger)
    graphics.fillCircle(20, 12, 2);  // Right highlight (bigger)
    graphics.fillCircle(12, 15, 1);   // Left secondary highlight
    graphics.fillCircle(22, 15, 1);  // Right secondary highlight
    
    // Cute tiny mouth (happy)
    graphics.lineStyle(2, 0xff69b4, 1);
    graphics.arc(16, 18, 4, 0, Math.PI, false);
    graphics.strokePath();
    
    // Add blush
    graphics.fillStyle(0xffb6c1, 0.5);
    graphics.fillCircle(8, 18, 3);  // Left blush
    graphics.fillCircle(24, 18, 3); // Right blush
    
    // Soft glow outline
    graphics.lineStyle(2, 0xffff00, 0.6);
    graphics.strokeCircle(16, 16, 15);
  }

  static drawCrabSpirit(graphics) {
    // Crab body (orange/red)
    graphics.fillStyle(0xff6347, 1);
    graphics.fillEllipse(16, 18, 18, 14);
    
    // Shell segments
    graphics.lineStyle(1, 0xd2691e, 1);
    graphics.strokeEllipse(16, 18, 18, 14);
    graphics.strokeEllipse(16, 18, 14, 10);
    graphics.strokeEllipse(16, 18, 10, 7);
    
    // Claws (left)
    graphics.fillStyle(0xff4500, 1);
    graphics.beginPath();
    graphics.moveTo(6, 16);
    graphics.lineTo(2, 14);
    graphics.lineTo(4, 18);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.beginPath();
    graphics.moveTo(2, 14);
    graphics.lineTo(0, 12);
    graphics.lineTo(1, 15);
    graphics.closePath();
    graphics.fillPath();
    
    // Claws (right)
    graphics.beginPath();
    graphics.moveTo(26, 16);
    graphics.lineTo(30, 14);
    graphics.lineTo(28, 18);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.beginPath();
    graphics.moveTo(30, 14);
    graphics.lineTo(32, 12);
    graphics.lineTo(31, 15);
    graphics.closePath();
    graphics.fillPath();
    
    // Eyes on stalks
    graphics.fillStyle(0xff6347, 1);
    graphics.fillRect(11, 8, 2, 6);
    graphics.fillRect(19, 8, 2, 6);
    
    // Eye balls
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(12, 8, 3);
    graphics.fillCircle(20, 8, 3);
    
    // Pupils
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(12, 8, 2);
    graphics.fillCircle(20, 8, 2);
    
    // Eye highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(11, 7, 1);
    graphics.fillCircle(19, 7, 1);
    
    // Legs (4 on each side)
    graphics.lineStyle(2, 0xff4500, 1);
    for (let i = 0; i < 4; i++) {
      const y = 20 + i * 2;
      // Left legs
      graphics.lineBetween(8, y, 4, y + 3);
      // Right legs
      graphics.lineBetween(24, y, 28, y + 3);
    }
    
    // Cute bubbles
    graphics.fillStyle(0x87ceeb, 0.4);
    graphics.fillCircle(10, 10, 2);
    graphics.fillCircle(22, 12, 3);
  }

  static drawBlackSpirit(graphics) {
    // Black/dark purple body
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillCircle(16, 16, 14);
    
    // Add dark fluffy effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = 16 + Math.cos(angle) * 10;
      const py = 16 + Math.sin(angle) * 10;
      graphics.fillCircle(px, py, 4);
    }
    
    // Glowing purple eyes
    graphics.fillStyle(0x8a2be2, 1);
    graphics.fillCircle(11, 14, 6);
    graphics.fillCircle(21, 14, 6);
    
    // Inner glow
    graphics.fillStyle(0x9370db, 1);
    graphics.fillCircle(11, 14, 4);
    graphics.fillCircle(21, 14, 4);
    
    // Bright center
    graphics.fillStyle(0xda70d6, 1);
    graphics.fillCircle(11, 14, 2);
    graphics.fillCircle(21, 14, 2);
    
    // White highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 1);
    graphics.fillCircle(20, 12, 1);
    
    // Dark wispy trails
    graphics.fillStyle(0x4b0082, 0.6);
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 4;
      const x = 16 + Math.cos(angle) * dist;
      const y = 16 + Math.sin(angle) * dist;
      graphics.fillCircle(x, y, 2);
    }
    
    // Purple aura outline
    graphics.lineStyle(2, 0x8a2be2, 0.8);
    graphics.strokeCircle(16, 16, 15);
    
    // Additional dark purple glow
    graphics.lineStyle(1, 0x9370db, 0.4);
    graphics.strokeCircle(16, 16, 17);
  }
}
