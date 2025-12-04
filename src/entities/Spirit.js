import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class Spirit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spiritSpeed) {
    // Create a graphics object for the spirit sprite (cuter design)
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
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
    
    // Generate texture
    const key = `spirit_${x}_${y}_${Date.now()}`;
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.followingPlayer = null;
    this.followIndex = 0;
    this.originalX = x;
    this.originalY = y;
    this.spiritSpeed = spiritSpeed || GAME_CONFIG.SPIRIT_FOLLOW_SPEED;

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
      const speed = this.spiritSpeed;
      
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
}
