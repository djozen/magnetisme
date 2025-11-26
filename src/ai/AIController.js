import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class AIController {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.target = null;
    this.updateInterval = 200; // Update AI decision every 200ms
    this.lastUpdate = 0;
    this.state = 'COLLECT'; // COLLECT, RETURN, CHASE
    this.aggressiveness = Math.random(); // 0-1, how likely to chase other players
  }

  update(time, delta) {
    if (!this.player.active) return;

    // Update AI decision periodically
    if (time - this.lastUpdate > this.updateInterval) {
      this.lastUpdate = time;
      this.makeDecision();
    }

    // Execute current behavior
    this.executeBehavior();
  }

  makeDecision() {
    const spirits = this.scene.spirits.filter(s => s.active && !s.followingPlayer);
    const enemySpirits = this.scene.spirits.filter(s => 
      s.active && 
      s.followingPlayer && 
      s.followingPlayer.teamId !== this.player.teamId
    );
    
    // Prioritize stealing enemy spirits if aggressive
    if (this.aggressiveness > 0.6 && enemySpirits.length > 0 && Math.random() < 0.4) {
      this.target = this.findNearest(enemySpirits);
      this.state = 'STEAL';
      return;
    }
    
    // Otherwise collect free spirits
    if (spirits.length > 0) {
      this.target = this.findNearest(spirits);
      this.state = 'COLLECT';
      return;
    }
    
    // No spirits available, try to steal
    if (enemySpirits.length > 0) {
      this.target = this.findNearest(enemySpirits);
      this.state = 'STEAL';
      return;
    }

    // Nothing to do, wander
    this.state = 'WANDER';
  }

  executeBehavior() {
    if (!this.target || !this.target.active) {
      this.makeDecision();
      return;
    }

    switch (this.state) {
      case 'COLLECT':
      case 'STEAL':
        this.moveTowards(this.target);
        break;
      case 'WANDER':
        this.wander();
        break;
    }
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
    // Random movement
    if (Math.random() < 0.05) { // Change direction 5% of the time
      const randomAngle = Math.random() * Math.PI * 2;
      const velocityX = Math.cos(randomAngle) * GAME_CONFIG.PLAYER_SPEED * 0.5;
      const velocityY = Math.sin(randomAngle) * GAME_CONFIG.PLAYER_SPEED * 0.5;
      this.player.setVelocity(velocityX, velocityY);
    }
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
