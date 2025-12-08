import Phaser from 'phaser';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bossType, isFinal = false) {
    // Create boss texture (larger)
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    const size = isFinal ? 80 : 60;
    const radius = size / 2;
    
    // Main body
    graphics.fillStyle(bossType.color, 1);
    graphics.fillCircle(radius, radius, radius - 5);
    
    // Crown/horns for boss indicator
    graphics.fillStyle(0xffaa00, 1);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = radius + Math.cos(angle) * (radius - 10);
      const y = radius + Math.sin(angle) * (radius - 10);
      graphics.fillCircle(x, y, 6);
    }
    
    // Eyes
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(radius - 10, radius - 5, 4);
    graphics.fillCircle(radius + 10, radius - 5, 4);
    
    // Outline
    graphics.lineStyle(3, 0x000000, 1);
    graphics.strokeCircle(radius, radius, radius - 5);
    
    const key = `boss_${bossType.key}_${Date.now()}`;
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.bossType = bossType;
    this.maxHealth = bossType.health;
    this.health = this.maxHealth;
    this.damage = bossType.damage;
    this.isDead = false;
    this.isFinal = isFinal;

    // AI behavior
    this.aiTimer = 0;
    this.phaseTimer = 0;
    this.currentPhase = 1;
    this.currentAttack = 0;
    this.attackTimer = 0;
    this.attackCooldown = 2000; // ms between attacks
    this.isAttacking = false;

    // Movement patterns
    this.movePattern = 'hover';
    this.hoverTarget = { x: x, y: y - 100 };
    this.floatOffset = 0;

    // Physics
    this.setCollideWorldBounds(true);
    this.setGravityY(-200); // Bosses float
    this.setDepth(15);
    this.setBounce(0);

    // Create health bar (larger for bosses)
    this.createHealthBar(scene);

    // Invulnerability during phase transition
    this.isInvulnerable = false;
  }

  createHealthBar(scene) {
    const barWidth = this.isFinal ? 400 : 300;
    const barX = scene.cameras.main.centerX - barWidth / 2;
    
    this.healthBarBg = scene.add.rectangle(barX, 30, barWidth, 20, 0x000000);
    this.healthBarBg.setOrigin(0, 0.5);
    this.healthBarBg.setScrollFactor(0);
    this.healthBarBg.setDepth(100);

    this.healthBar = scene.add.rectangle(barX, 30, barWidth, 20, 0xff0000);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(101);

    // Boss name text
    this.nameText = scene.add.text(scene.cameras.main.centerX, 50, this.bossType.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setScrollFactor(0);
    this.nameText.setDepth(101);
  }

  update(time, delta, player) {
    if (this.isDead) return;

    this.aiTimer += delta;
    this.attackTimer += delta;
    this.phaseTimer += delta;
    
    this.checkPhaseTransition();
    this.updateMovement(time, delta);
    this.updateAttacks(time, delta, player);
    this.updateHealthBar();
  }

  checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;
    
    // Phase 1: 100-66% HP
    // Phase 2: 66-33% HP  
    // Phase 3: 33-0% HP (final bosses only)
    
    const newPhase = healthPercent > 0.66 ? 1 : (healthPercent > 0.33 ? 2 : 3);
    
    if (newPhase !== this.currentPhase && (this.isFinal || newPhase <= 2)) {
      this.currentPhase = newPhase;
      this.onPhaseChange();
    }
  }

  onPhaseChange() {
    this.isInvulnerable = true;
    this.setTint(0xffff00);
    
    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      yoyo: true,
      repeat: 3,
      duration: 200,
      onComplete: () => {
        this.clearTint();
        this.setAlpha(1);
        this.isInvulnerable = false;
      }
    });
    
    // Reduce attack cooldown in higher phases
    this.attackCooldown = Math.max(1000, 2000 - (this.currentPhase - 1) * 500);
  }

  updateMovement(time, delta) {
    this.floatOffset += delta * 0.002;
    
    switch (this.movePattern) {
      case 'hover':
        // Gentle floating motion
        const targetY = this.hoverTarget.y + Math.sin(this.floatOffset) * 30;
        const diffY = targetY - this.y;
        this.setVelocityY(diffY * 0.02);
        
        // Slight horizontal drift
        const targetX = this.hoverTarget.x + Math.cos(this.floatOffset * 0.5) * 50;
        const diffX = targetX - this.x;
        this.setVelocityX(diffX * 0.02);
        break;
        
      case 'circle':
        // Circle around center point
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY - 100;
        const radius = 150;
        const angle = this.floatOffset;
        
        const circleX = centerX + Math.cos(angle) * radius;
        const circleY = centerY + Math.sin(angle) * radius;
        
        this.setVelocity(
          (circleX - this.x) * 0.1,
          (circleY - this.y) * 0.1
        );
        break;
    }
    
    // Flip to face player
    if (this.scene.player) {
      this.setFlipX(this.scene.player.x < this.x);
    }
  }

  updateAttacks(time, delta, player) {
    if (!player || player.isDead || this.isAttacking || this.attackTimer < this.attackCooldown) {
      return;
    }

    // Choose attack based on phase
    const attacks = this.bossType.attacks || [];
    if (attacks.length === 0) return;
    
    const attackIndex = this.currentPhase > attacks.length ? 
      attacks.length - 1 : this.currentPhase - 1;
    
    const attack = attacks[attackIndex];
    this.performAttack(attack, player);
    
    this.attackTimer = 0;
  }

  performAttack(attack, player) {
    this.isAttacking = true;
    
    // Telegraph attack
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        this.executeAttack(attack, player);
        this.isAttacking = false;
      }
    });
  }

  executeAttack(attack, player) {
    // Emit attack event for scene to handle projectiles
    this.scene.events.emit('bossAttack', {
      boss: this,
      attack: attack,
      player: player
    });
  }

  updateHealthBar() {
    const healthPercent = this.health / this.maxHealth;
    const barWidth = this.isFinal ? 400 : 300;
    this.healthBar.setSize(barWidth * healthPercent, 20);
    
    // Change color based on health
    if (healthPercent > 0.66) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.33) {
      this.healthBar.setFillStyle(0xffaa00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }

  takeDamage(damage) {
    if (this.isDead || this.isInvulnerable) return;

    this.health -= damage;
    
    // Flash white
    this.setTint(0xffffff);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead && !this.isInvulnerable) this.clearTint();
    });
    
    // Screen shake on boss hit
    this.scene.cameras.main.shake(100, 0.005);
    
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
    
    this.updateHealthBar();
  }

  die() {
    this.isDead = true;
    this.isInvulnerable = true;
    
    // Epic death animation
    this.scene.cameras.main.shake(500, 0.01);
    
    // Explosions
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const offsetX = Phaser.Math.Between(-30, 30);
        const offsetY = Phaser.Math.Between(-30, 30);
        
        // Emit explosion particle event
        this.scene.events.emit('bossExplosion', this.x + offsetX, this.y + offsetY);
      });
    }
    
    // Final fade
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      angle: 360,
      duration: 1000,
      delay: 800,
      onComplete: () => {
        if (this.healthBar) this.healthBar.destroy();
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.nameText) this.nameText.destroy();
        
        // Emit boss defeated event
        this.scene.events.emit('bossDefeated', this.bossType, this.isFinal);
        
        this.destroy();
      }
    });
  }

  destroy(fromScene) {
    if (this.healthBar) this.healthBar.destroy();
    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.nameText) this.nameText.destroy();
    super.destroy(fromScene);
  }
}
