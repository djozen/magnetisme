import Phaser from 'phaser';
import { PLATFORM_CONFIG } from '../platform/PlatformConfig.js';

export default class PlatformPlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, element) {
    // Create player texture
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Draw player shape (similar to original game)
    graphics.fillStyle(element.color, 1);
    graphics.fillCircle(20, 20, 18);
    
    // Add team color outline
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(20, 20, 18);
    
    const key = `platform_player_${element.key}_${Date.now()}`;
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.element = element;
    this.maxHealth = PLATFORM_CONFIG.PLAYER_HEALTH;
    this.health = this.maxHealth;
    this.isDead = false;
    this.isInvincible = false;
    this.invincibleTimer = 0;

    // Powers
    this.powerCooldown = 0;
    this.giftPowerActive = null;
    this.giftPowerTimer = 0;
    
    // Buffs
    this.hasShield = false;
    this.hasSpeedBoost = false;
    this.hasDoubleDamage = false;
    this.hasMultiShot = false;
    this.speedMultiplier = 1;
    this.damageMultiplier = 1;

    // Physics
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    this.setDrag(800, 0);
    this.setMaxVelocity(PLATFORM_CONFIG.PLAYER_SPEED, 1000);
    this.setGravityY(PLATFORM_CONFIG.GRAVITY);
    this.setDepth(10);

    // Create health bar
    this.createHealthBar(scene);
  }

  createHealthBar(scene) {
    this.healthBarBg = scene.add.rectangle(this.x, this.y - 30, 40, 6, 0x000000);
    this.healthBarBg.setOrigin(0, 0.5);
    this.healthBarBg.setDepth(11);

    this.healthBar = scene.add.rectangle(this.x, this.y - 30, 40, 6, 0x00ff00);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(12);
  }

  update(time, delta, cursors, controls) {
    if (this.isDead) return;

    // Update timers
    if (this.powerCooldown > 0) {
      this.powerCooldown -= delta;
    }

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.clearTint();
      } else {
        // Blink effect
        this.setAlpha(Math.sin(time * 0.01) * 0.5 + 0.5);
      }
    } else {
      this.setAlpha(1);
    }

    // Update gift power timer
    if (this.giftPowerTimer > 0) {
      this.giftPowerTimer -= delta;
      if (this.giftPowerTimer <= 0) {
        this.clearGiftPower();
      }
    }

    // Movement
    const speed = PLATFORM_CONFIG.PLAYER_SPEED * this.speedMultiplier;
    
    if (cursors.left.isDown || controls.left) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (cursors.right.isDown || controls.right) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    }

    // Jump
    if ((cursors.up.isDown || controls.jump) && this.body.touching.down) {
      this.setVelocityY(-PLATFORM_CONFIG.PLAYER_JUMP);
    }

    // Update health bar position
    this.updateHealthBar();
  }

  updateHealthBar() {
    const healthPercent = this.health / this.maxHealth;
    this.healthBarBg.setPosition(this.x - 20, this.y - 30);
    this.healthBar.setPosition(this.x - 20, this.y - 30);
    this.healthBar.setSize(40 * healthPercent, 6);
    
    // Color based on health
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  takeDamage(damage) {
    if (this.isDead || this.isInvincible || this.hasShield) return;

    this.health -= damage;
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    } else {
      // Temporary invincibility
      this.isInvincible = true;
      this.invincibleTimer = 1000;
      this.setTint(0xff0000);
      
      // Knockback
      const knockbackX = this.flipX ? 200 : -200;
      this.setVelocity(knockbackX, -200);
    }
    
    this.updateHealthBar();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.updateHealthBar();
  }

  die() {
    this.isDead = true;
    this.setTint(0x666666);
    this.setVelocity(0, -300);
    
    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 360,
      duration: 1000,
      onComplete: () => {
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
      }
    });
  }

  usePower() {
    if (this.powerCooldown > 0) return false;
    
    this.powerCooldown = PLATFORM_CONFIG.POWER_COOLDOWN;
    return true;
  }

  activateGiftPower(powerType, duration, multiplier = 1) {
    this.giftPowerActive = powerType;
    this.giftPowerTimer = duration;

    switch (powerType) {
      case 'shield':
        this.hasShield = true;
        this.setTint(0x00ffff);
        break;
      case 'speed':
        this.hasSpeedBoost = true;
        this.speedMultiplier = multiplier;
        this.setTint(0xffff00);
        break;
      case 'doubleDamage':
        this.hasDoubleDamage = true;
        this.damageMultiplier = multiplier;
        this.setTint(0xff0000);
        break;
      case 'multiShot':
        this.hasMultiShot = true;
        this.setTint(0xff00ff);
        break;
    }
  }

  clearGiftPower() {
    this.hasShield = false;
    this.hasSpeedBoost = false;
    this.hasDoubleDamage = false;
    this.hasMultiShot = false;
    this.speedMultiplier = 1;
    this.damageMultiplier = 1;
    this.giftPowerActive = null;
    
    if (!this.isInvincible) {
      this.clearTint();
    }
  }

  destroy(fromScene) {
    if (this.healthBar) this.healthBar.destroy();
    if (this.healthBarBg) this.healthBarBg.destroy();
    super.destroy(fromScene);
  }
}
