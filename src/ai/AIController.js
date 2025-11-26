import { GAME_CONFIG } from '../config.js';

export default class AIController {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.target = null;
    this.updateInterval = 300;
    this.lastUpdate = 0;
    this.state = 'COLLECT';
    this.aggressiveness = Math.random();
    this.returnTimer = 0;
    this.returnInterval = Phaser.Math.Between(8000, 15000); // Return every 8-15 seconds
  }

  update(time, delta) {
    if (!this.player.active) return;

    // Check if should return to base
    this.returnTimer += delta;
    const spiritsCarrying = this.scene.spirits.filter(s => s.followingPlayer === this.player).length;
    
    if (spiritsCarrying > 3 && this.returnTimer > this.returnInterval) {
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
    
    // Aggressive: prioritize stealing from enemies
    if (this.aggressiveness > 0.5 && enemyPlayers.length > 0 && Math.random() < 0.7) {
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

    const velocityX = Math.cos(angle) * GAME_CONFIG.PLAYER_SPEED;
    const velocityY = Math.sin(angle) * GAME_CONFIG.PLAYER_SPEED;

    // Add some randomness to make AI less perfect
    const randomness = 0.1;
    const randomX = (Math.random() - 0.5) * GAME_CONFIG.PLAYER_SPEED * randomness;
    const randomY = (Math.random() - 0.5) * GAME_CONFIG.PLAYER_SPEED * randomness;

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
}
