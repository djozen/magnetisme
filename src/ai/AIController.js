import { GAME_CONFIG } from '../config.js';

export default class AIController {
  constructor(scene, player, playerSpeed) {
    this.scene = scene;
    this.player = player;
    this.target = null;
    this.updateInterval = 200; // Faster decision updates (was 300)
    this.lastUpdate = 0;
    this.state = 'COLLECT';
    this.aggressiveness = Math.random() * 0.5 + 0.3; // Range 0.3-0.8 (more aggressive)
    this.returnTimer = 0;
    this.returnInterval = Phaser.Math.Between(10000, 18000); // Return every 10-18 seconds (longer)
    this.lastPowerUse = Date.now(); // Initialize to current time to prevent immediate use
    this.powerCooldown = 30000; // 30 seconds in milliseconds (increased from 20)
    this.initialDelay = 45000; // 45 seconds initial delay before first power use
    this.playerSpeed = playerSpeed || GAME_CONFIG.PLAYER_SPEED;
  }

  update(time, delta) {
    if (!this.player.active) return;

    // Check if AI can use power (with cooldown and initial delay)
    const timeSinceLastPower = time - this.lastPowerUse;
    const gameStartDelay = time < this.initialDelay; // Don't use powers in first 45 seconds
    
    if (!gameStartDelay && this.player.canUsePower() && this.scene.powerSystem && timeSinceLastPower >= this.powerCooldown) {
      // Use power strategically
      const shouldUsePower = this.decidePowerUsage();
      if (shouldUsePower) {
        // Decide which power to use (base element or gift power)
        const powerToUse = this.selectPowerToUse();
        this.scene.powerSystem.activatePower(this.player, powerToUse);
        this.lastPowerUse = time; // Record time of power use
      }
    }

    // Check if should return to base
    this.returnTimer += delta;
    const spiritsCarrying = this.scene.spirits.filter(s => s.followingPlayer === this.player).length;
    
    // Return with more spirits (5+) or after timer expires with 3+
    if ((spiritsCarrying >= 5) || (spiritsCarrying > 2 && this.returnTimer > this.returnInterval)) {
      this.state = 'RETURN';
      this.returnTimer = 0;
    }

    // Update AI decision periodically
    if (time - this.lastUpdate > this.updateInterval) {
      this.lastUpdate = time;
      if (this.state !== 'RETURN') {
        this.makeDecision();
      }
    }

    // Execute current behavior
    this.executeBehavior();
  }

  makeDecision() {
    const spirits = this.scene.spirits.filter(s => s.active && !s.followingPlayer);
    const enemyPlayers = this.scene.players.filter(p => 
      p.active && 
      p.teamId !== this.player.teamId &&
      this.scene.spirits.some(s => s.followingPlayer === p)
    );
    
    // Prioritize free spirits that are close
    if (spirits.length > 0) {
      const nearestSpirit = this.findNearest(spirits);
      const distanceToSpirit = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        nearestSpirit.x, nearestSpirit.y
      );
      
      // If spirit is close, always prioritize it
      if (distanceToSpirit < 300) {
        this.target = nearestSpirit;
        this.state = 'COLLECT';
        return;
      }
    }
    
    // Aggressive: prioritize stealing from enemies
    if (this.aggressiveness > 0.5 && enemyPlayers.length > 0 && Math.random() < 0.6) {
      const targetPlayer = this.findNearest(enemyPlayers);
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    // Collect free spirits
    if (spirits.length > 0) {
      this.target = this.findNearest(spirits);
      this.state = 'COLLECT';
      return;
    }
    
    // Try to steal from any enemy
    const allEnemySpirits = this.scene.spirits.filter(s => 
      s.active && 
      s.followingPlayer && 
      s.followingPlayer.teamId !== this.player.teamId
    );
    
    if (allEnemySpirits.length > 0) {
      this.target = this.findNearest(allEnemySpirits);
      this.state = 'STEAL';
      return;
    }

    // Wander around
    this.state = 'WANDER';
    this.wanderTarget = this.getRandomPosition();
  }

  executeBehavior() {
    switch (this.state) {
      case 'RETURN':
        this.returnToBase();
        break;
      case 'COLLECT':
      case 'STEAL':
        if (this.target && this.target.active) {
          this.moveTowards(this.target);
        } else {
          this.makeDecision();
        }
        break;
      case 'WANDER':
        this.wander();
        break;
    }
  }

  returnToBase() {
    const teamBase = this.scene.teamBases.find(b => b.teamId === this.player.teamId);
    if (!teamBase) {
      this.state = 'COLLECT';
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      teamBase.x, teamBase.y
    );

    if (distance < GAME_CONFIG.BASE_DEPOSIT_DISTANCE) {
      // Arrived at base, spirits will be deposited automatically
      this.state = 'COLLECT';
      this.returnTimer = 0;
    } else {
      this.moveTowards(teamBase);
    }
  }

  getRandomPosition() {
    return {
      x: Phaser.Math.Between(100, GAME_CONFIG.WORLD_WIDTH - 100),
      y: Phaser.Math.Between(100, GAME_CONFIG.WORLD_HEIGHT - 100)
    };
  }

  moveTowards(target) {
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    let velocityX = Math.cos(angle) * this.playerSpeed;
    let velocityY = Math.sin(angle) * this.playerSpeed;

    // Check for nearby allies to avoid collision/blocking
    const nearbyAllies = this.scene.players.filter(p => {
      if (p === this.player || p.teamId !== this.player.teamId || !p.active) return false;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      return dist < 60; // Very close
    });
    
    // If blocked by ally, add perpendicular offset
    if (nearbyAllies.length > 0) {
      const ally = nearbyAllies[0];
      const avoidAngle = Phaser.Math.Angle.Between(ally.x, ally.y, this.player.x, this.player.y);
      velocityX += Math.cos(avoidAngle) * this.playerSpeed * 0.5;
      velocityY += Math.sin(avoidAngle) * this.playerSpeed * 0.5;
    }

    // Add some randomness to make AI less perfect
    const randomness = 0.08; // Reduced from 0.15 for better accuracy
    const randomX = (Math.random() - 0.5) * this.playerSpeed * randomness;
    const randomY = (Math.random() - 0.5) * this.playerSpeed * randomness;

    this.player.setVelocity(
      velocityX + randomX,
      velocityY + randomY
    );
  }

  wander() {
    if (!this.wanderTarget) {
      this.wanderTarget = this.getRandomPosition();
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.wanderTarget.x, this.wanderTarget.y
    );

    if (distance < 50) {
      // Reached wander target, pick new one
      this.wanderTarget = this.getRandomPosition();
    }

    this.moveTowards(this.wanderTarget);
  }

  findNearest(objects) {
    let nearest = null;
    let minDistance = Infinity;

    objects.forEach(obj => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        obj.x, obj.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = obj;
      }
    });

    return nearest;
  }

  decidePowerUsage() {
    // Simplified: AI uses power randomly when available
    // 15% chance per frame when power is full
    return Math.random() < 0.15;
  }

  selectPowerToUse() {
    // Check if AI has gift powers available
    if (!this.player.availablePowers || this.player.availablePowers.length <= 1) {
      // No gift powers, use base element
      return this.player.element.key;
    }

    // Check gift power sharing setting
    const giftPowerSharing = this.scene.giftPowerSharing;
    
    if (!giftPowerSharing) {
      // Gift power sharing disabled - AI cannot use gift powers
      return this.player.element.key;
    }

    // Gift power sharing enabled - AI can use gift powers very rarely (5% chance)
    if (Math.random() < 0.05) {
      // Select random gift power (skip index 0 which is base element)
      const giftPowerIndex = Phaser.Math.Between(1, this.player.availablePowers.length - 1);
      return this.player.availablePowers[giftPowerIndex];
    }

    // Default to base element
    return this.player.element.key;
  }
}
