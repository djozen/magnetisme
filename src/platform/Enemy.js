import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, enemyType) {
    // Create enemy texture
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Draw enemy based on type
    graphics.fillStyle(enemyType.color, 1);
    
    // Different shapes for variety
    const shapeType = Math.floor(Math.random() * 3);
    switch (shapeType) {
      case 0: // Circle
        graphics.fillCircle(15, 15, 12);
        break;
      case 1: // Square
        graphics.fillRect(3, 3, 24, 24);
        break;
      case 2: // Triangle
        graphics.beginPath();
        graphics.moveTo(15, 3);
        graphics.lineTo(27, 27);
        graphics.lineTo(3, 27);
        graphics.closePath();
        graphics.fillPath();
        break;
    }
    
    // Darker outline
    graphics.lineStyle(2, 0x000000, 0.8);
    graphics.strokeCircle(15, 15, 12);
    
    const key = `enemy_${enemyType.key}_${Date.now()}_${Math.random()}`;
    graphics.generateTexture(key, 30, 30);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = enemyType;
    this.maxHealth = enemyType.health;
    this.health = this.maxHealth;
    this.damage = enemyType.damage;
    this.isDead = false;

    // AI behavior
    this.behavior = enemyType.behavior;
    this.aiTimer = 0;
    this.aiState = 'idle';
    this.targetX = x;
    this.patrolStart = x;
    this.patrolEnd = x + 200;
    this.patrolDirection = 1;

    // Physics
    this.setBounce(0.2);
    this.setCollideWorldBounds(true);
    this.setGravityY(enemyType.speed > 100 ? 400 : 800); // Flying enemies less gravity
    this.setDepth(8);

    // Create health bar
    this.createHealthBar(scene);
  }

  createHealthBar(scene) {
    this.healthBarBg = scene.add.rectangle(this.x, this.y - 20, 30, 4, 0x000000);
    this.healthBarBg.setOrigin(0, 0.5);
    this.healthBarBg.setDepth(9);

    this.healthBar = scene.add.rectangle(this.x, this.y - 20, 30, 4, 0xff0000);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(10);
  }

  update(time, delta, player) {
    if (this.isDead) return;

    this.aiTimer += delta;
    this.updateAI(time, delta, player);
    this.updateHealthBar();
  }

  updateAI(time, delta, player) {
    if (!player || player.isDead) return;

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    switch (this.behavior) {
      case 'patrol':
        this.patrolBehavior();
        break;
      
      case 'chase':
        if (distToPlayer < 300) {
          this.chaseBehavior(player);
        } else {
          this.patrolBehavior();
        }
        break;
      
      case 'fly_shoot':
      case 'hover_shoot':
        this.flyingBehavior(player, distToPlayer);
        break;
      
      case 'stationary_shoot':
        this.stationaryBehavior(player);
        break;
      
      default:
        this.patrolBehavior();
    }
  }

  patrolBehavior() {
    if (this.x >= this.patrolEnd) {
      this.patrolDirection = -1;
      this.setFlipX(true);
    } else if (this.x <= this.patrolStart) {
      this.patrolDirection = 1;
      this.setFlipX(false);
    }
    
    this.setVelocityX(this.enemyType.speed * 0.5 * this.patrolDirection);
  }

  chaseBehavior(player) {
    const direction = player.x > this.x ? 1 : -1;
    this.setVelocityX(this.enemyType.speed * direction);
    this.setFlipX(direction < 0);
  }

  flyingBehavior(player, distToPlayer) {
    // Hover at player's height but keep distance
    const targetY = player.y - 100;
    const targetX = distToPlayer > 200 ? player.x : (player.x > this.x ? this.x - 150 : this.x + 150);
    
    const dirX = targetX - this.x;
    const dirY = targetY - this.y;
    
    this.setVelocityX(Math.sign(dirX) * Math.min(Math.abs(dirX), this.enemyType.speed * 0.3));
    this.setVelocityY(Math.sign(dirY) * Math.min(Math.abs(dirY), this.enemyType.speed * 0.3));
    
    this.setFlipX(dirX < 0);
  }

  stationaryBehavior(player) {
    this.setVelocityX(0);
    // Just look at player
    this.setFlipX(player.x < this.x);
  }

  updateHealthBar() {
    const healthPercent = this.health / this.maxHealth;
    this.healthBarBg.setPosition(this.x - 15, this.y - 20);
    this.healthBar.setPosition(this.x - 15, this.y - 20);
    this.healthBar.setSize(30 * healthPercent, 4);
  }

  takeDamage(damage) {
    if (this.isDead) return;

    this.health -= damage;
    
    // Flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.clearTint();
    });
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    
    this.updateHealthBar();
  }

  die() {
    this.isDead = true;
    this.setTint(0x666666);
    this.setVelocity(0, -150);
    
    // Drop collectible chance
    if (Math.random() < 0.3) {
      this.scene.events.emit('enemyDrop', this.x, this.y);
    }
    
    // Fade out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 180,
      duration: 500,
      onComplete: () => {
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        this.destroy();
      }
    });
    
    // Emit event for score
    this.scene.events.emit('enemyKilled', this.enemyType);
  }

  destroy(fromScene) {
    if (this.healthBar) this.healthBar.destroy();
    if (this.healthBarBg) this.healthBarBg.destroy();
    super.destroy(fromScene);
  }
}
