import Phaser from 'phaser';
import PlatformPlayer from '../platform/PlatformPlayer.js';
import Enemy from '../platform/Enemy.js';
import Boss from '../platform/Boss.js';
import { CHAPTERS } from '../platform/ChapterConfig.js';
import { ENEMY_TYPES } from '../platform/EnemyTypes.js';
import { BOSS_TYPES } from '../platform/BossTypes.js';
import { PLATFORM_CONFIG } from '../platform/PlatformConfig.js';
import PlatformProgress from '../platform/PlatformProgress.js';

export default class PlatformScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlatformScene' });
  }

  init(data) {
    this.selectedElement = data.element;
    this.chapterId = data.chapterId;
    this.levelNumber = data.levelNumber;
    
    this.chapter = CHAPTERS.find(c => c.id === this.chapterId);
    this.levelType = this.getLevelType(this.levelNumber);
    
    this.score = 0;
    this.lives = 3;
    this.timeElapsed = 0;
    this.isComplete = false;
    this.isPaused = false;
    
    // Debug mode
    this.debugMode = false;
    this.showHitboxes = false;
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.createBackground();
    
    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.createLevel();
    
    // Player
    this.player = new PlatformPlayer(
      this,
      100,
      height - 200,
      this.selectedElement
    );
    
    // Enemies and bosses
    this.enemies = this.physics.add.group();
    this.bosses = this.physics.add.group();
    this.spawnEnemies();
    
    // Projectiles
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    
    // Collectibles
    this.gifts = this.physics.add.group();
    this.spirits = this.physics.add.group();
    
    // Collisions
    this.setupCollisions();
    
    // UI
    this.createUI();
    
    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.controls = {
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };
    
    // Debug controls
    this.debugControls = {
      ctrlN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N, false),
      ctrlP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P, false),
      ctrlH: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H, false),
      ctrlI: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I, false)
    };
    
    // Events
    this.events.on('enemyKilled', this.onEnemyKilled, this);
    this.events.on('bossDefeated', this.onBossDefeated, this);
    this.events.on('enemyDrop', this.spawnCollectible, this);
    this.events.on('bossAttack', this.handleBossAttack, this);
    this.events.on('bossExplosion', this.createExplosion, this);
    
    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, width * 3, height);
    this.physics.world.setBounds(0, 0, width * 3, height);
    
    // Timer
    this.time.addEvent({
      delay: 1000,
      callback: () => { this.timeElapsed++; },
      loop: true
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    const bg = this.add.rectangle(0, 0, width * 3, height, this.chapter.color);
    bg.setOrigin(0, 0);
    bg.setAlpha(0.3);
    bg.setScrollFactor(0.5);
  }

  createLevel() {
    const { width, height } = this.cameras.main;
    const platformWidth = width * 3;
    
    // Ground
    const ground = this.add.rectangle(platformWidth / 2, height - 20, platformWidth, 40, 0x654321);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
    
    // Generate platforms based on level type
    if (this.levelType === 'boss') {
      this.createBossArena();
    } else {
      this.createNormalPlatforms();
    }
  }

  createNormalPlatforms() {
    const { width, height } = this.cameras.main;
    
    // Create procedural platforms
    const platformCount = 15 + this.levelNumber * 3;
    const segmentWidth = (width * 3) / platformCount;
    
    for (let i = 1; i < platformCount; i++) {
      const x = i * segmentWidth + Phaser.Math.Between(-50, 50);
      const y = Phaser.Math.Between(height * 0.3, height * 0.8);
      const w = Phaser.Math.Between(100, 200);
      
      const platform = this.add.rectangle(x, y, w, 20, 0x8b4513);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }
    
    // Add some vertical platforms for variety
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(200, width * 3 - 200);
      const y = Phaser.Math.Between(height * 0.4, height * 0.7);
      
      for (let j = 0; j < 3; j++) {
        const platform = this.add.rectangle(x, y - j * 80, 120, 15, 0x8b4513);
        this.physics.add.existing(platform, true);
        this.platforms.add(platform);
      }
    }
  }

  createBossArena() {
    const { width, height } = this.cameras.main;
    
    // Simple arena with a few platforms
    const platforms = [
      { x: width * 0.5, y: height * 0.7, w: 300 },
      { x: width * 1.0, y: height * 0.7, w: 300 },
      { x: width * 1.5, y: height * 0.7, w: 300 },
      { x: width * 0.75, y: height * 0.5, w: 200 },
      { x: width * 1.25, y: height * 0.5, w: 200 }
    ];
    
    platforms.forEach(p => {
      const platform = this.add.rectangle(p.x, p.y, p.w, 25, 0x8b4513);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });
  }

  spawnEnemies() {
    const { width, height } = this.cameras.main;
    
    if (this.levelType === 'boss') {
      // Spawn boss
      this.spawnBoss();
    } else {
      // Spawn normal enemies
      const enemyCount = 5 + this.levelNumber * 2;
      const elementEnemies = ENEMY_TYPES.filter(e => e.element === this.chapter.key);
      
      for (let i = 0; i < enemyCount; i++) {
        const enemyType = Phaser.Utils.Array.GetRandom(elementEnemies);
        if (enemyType) {
          const x = Phaser.Math.Between(300, width * 3 - 300);
          const y = Phaser.Math.Between(height * 0.2, height * 0.6);
          
          const enemy = new Enemy(this, x, y, enemyType);
          this.enemies.add(enemy);
        }
      }
    }
  }

  spawnBoss() {
    const { width, height } = this.cameras.main;
    const isFinal = this.levelNumber === 5;
    
    const bossType = isFinal ? 
      BOSS_TYPES.final.find(b => b.element === this.chapter.key) :
      BOSS_TYPES.mid.find(b => b.element === this.chapter.key);
    
    if (bossType) {
      const boss = new Boss(this, width * 1.5, height * 0.3, bossType, isFinal);
      this.bosses.add(boss);
    }
  }

  setupCollisions() {
    // Player vs platforms
    this.physics.add.collider(this.player, this.platforms);
    
    // Enemies vs platforms
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.bosses, this.platforms);
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.bosses, this.playerHitBoss, null, this);
    
    // Projectiles
    this.physics.add.overlap(this.playerProjectiles, this.enemies, this.projectileHitEnemy, null, this);
    this.physics.add.overlap(this.playerProjectiles, this.bosses, this.projectileHitBoss, null, this);
    this.physics.add.overlap(this.player, this.enemyProjectiles, this.enemyProjectileHitPlayer, null, this);
    
    // Collectibles
    this.physics.add.overlap(this.player, this.gifts, this.collectGift, null, this);
    this.physics.add.overlap(this.player, this.spirits, this.collectSpirit, null, this);
  }

  createUI() {
    const { width, height } = this.cameras.main;
    
    // Score
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(200);
    
    // Lives
    this.livesText = this.add.text(20, 50, `Lives: ${this.lives}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.livesText.setScrollFactor(0);
    this.livesText.setDepth(200);
    
    // Time
    this.timeText = this.add.text(width - 20, 20, `Time: 0`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.timeText.setOrigin(1, 0);
    this.timeText.setScrollFactor(0);
    this.timeText.setDepth(200);
    
    // Level info
    const levelTypeText = this.levelType === 'boss' ? '👹 BOSS BATTLE' : `Level ${this.levelNumber}`;
    this.levelText = this.add.text(width / 2, 20, `${this.chapter.name} - ${levelTypeText}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.levelText.setOrigin(0.5, 0);
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(200);
  }

  update(time, delta) {
    if (this.isPaused) return;
    
    // Handle debug controls
    this.handleDebugControls();
    
    // Handle pause
    if (Phaser.Input.Keyboard.JustDown(this.controls.esc)) {
      this.togglePause();
      return;
    }
    
    // Update player
    if (!this.player.isDead) {
      this.player.update(time, delta, this.cursors, this.controls);
      
      // Shoot projectile
      if (Phaser.Input.Keyboard.JustDown(this.controls.space)) {
        this.shootProjectile();
      }
      
      // Use gift power
      if (Phaser.Input.Keyboard.JustDown(this.controls.shift) && this.player.canUseGiftPower()) {
        this.player.activateGiftPower();
      }
    }
    
    // Update enemies
    this.enemies.getChildren().forEach(enemy => {
      enemy.update(time, delta, this.player);
    });
    
    // Update bosses
    this.bosses.getChildren().forEach(boss => {
      boss.update(time, delta, this.player);
    });
    
    // Update UI
    this.updateUI();
    
    // Check win condition
    if (!this.isComplete && this.checkLevelComplete()) {
      this.completeLevel();
    }
    
    // Check lose condition
    if (this.player.isDead && !this.isComplete) {
      this.loseLife();
    }
  }

  shootProjectile() {
    if (!this.player.canUsePower()) return;
    
    this.player.usePower();
    
    const direction = this.player.flipX ? -1 : 1;
    const projectileCount = this.player.hasMultiShot ? 3 : 1;
    
    for (let i = 0; i < projectileCount; i++) {
      const angle = projectileCount > 1 ? (i - 1) * 15 : 0;
      const radians = Phaser.Math.DegToRad(angle);
      
      const velocityX = Math.cos(radians) * 400 * direction;
      const velocityY = Math.sin(radians) * 400;
      
      const projectile = this.add.circle(
        this.player.x + direction * 20,
        this.player.y,
        8,
        this.selectedElement.color
      );
      
      this.physics.add.existing(projectile);
      projectile.body.setVelocity(velocityX, velocityY);
      projectile.body.setAllowGravity(false);
      projectile.damage = this.player.hasDoubleDamage ? 40 : 20;
      
      this.playerProjectiles.add(projectile);
      
      // Auto-destroy after 2 seconds
      this.time.delayedCall(2000, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  handleBossAttack(data) {
    const { boss, attack, player } = data;
    
    // Create projectiles based on attack pattern
    const count = attack.pattern === 'spread' ? 5 : (attack.pattern === 'circle' ? 8 : 1);
    
    for (let i = 0; i < count; i++) {
      let angle;
      
      if (attack.pattern === 'spread') {
        angle = -60 + (i * 30);
      } else if (attack.pattern === 'circle') {
        angle = (i / count) * 360;
      } else {
        // Aim at player
        angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(
          boss.x, boss.y, player.x, player.y
        ));
      }
      
      const radians = Phaser.Math.DegToRad(angle);
      const projectile = this.add.circle(boss.x, boss.y, 10, 0xff0000);
      
      this.physics.add.existing(projectile);
      projectile.body.setVelocity(
        Math.cos(radians) * 300,
        Math.sin(radians) * 300
      );
      projectile.body.setAllowGravity(false);
      projectile.damage = boss.damage;
      
      this.enemyProjectiles.add(projectile);
      
      this.time.delayedCall(3000, () => {
        if (projectile.active) projectile.destroy();
      });
    }
  }

  playerHitEnemy(player, enemy) {
    if (!player.isInvulnerable && !enemy.isDead) {
      player.takeDamage(enemy.damage);
    }
  }

  playerHitBoss(player, boss) {
    if (!player.isInvulnerable && !boss.isDead) {
      player.takeDamage(boss.damage);
    }
  }

  projectileHitEnemy(projectile, enemy) {
    if (!enemy.isDead) {
      enemy.takeDamage(projectile.damage);
      projectile.destroy();
    }
  }

  projectileHitBoss(projectile, boss) {
    if (!boss.isDead) {
      boss.takeDamage(projectile.damage);
      projectile.destroy();
    }
  }

  enemyProjectileHitPlayer(player, projectile) {
    if (!player.isInvulnerable) {
      player.takeDamage(projectile.damage);
      projectile.destroy();
    }
  }

  collectGift(player, gift) {
    this.player.activateGiftPower(gift.giftType);
    gift.destroy();
    this.score += 100;
  }

  collectSpirit(player, spirit) {
    spirit.destroy();
    this.score += 50;
  }

  spawnCollectible(x, y) {
    const rand = Math.random();
    
    if (rand < 0.3) {
      // Spawn gift
      const giftTypes = ['shield', 'speed', 'doubleDamage', 'heal', 'multiShot'];
      const giftType = Phaser.Utils.Array.GetRandom(giftTypes);
      
      const gift = this.add.circle(x, y, 15, 0xffaa00);
      this.physics.add.existing(gift);
      gift.body.setVelocity(0, -100);
      gift.giftType = giftType;
      this.gifts.add(gift);
    } else {
      // Spawn spirit
      const spirit = this.add.circle(x, y, 10, 0xffffff);
      this.physics.add.existing(spirit);
      spirit.body.setVelocity(Phaser.Math.Between(-50, 50), -150);
      this.spirits.add(spirit);
    }
  }

  createExplosion(x, y) {
    const explosion = this.add.circle(x, y, 5, 0xff6600);
    this.tweens.add({
      targets: explosion,
      radius: 40,
      alpha: 0,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
  }

  onEnemyKilled(enemyType) {
    this.score += 100;
  }

  onBossDefeated(bossType, isFinal) {
    this.score += isFinal ? 1000 : 500;
  }

  checkLevelComplete() {
    if (this.levelType === 'boss') {
      return this.bosses.getChildren().every(b => b.isDead);
    } else {
      return this.enemies.getChildren().every(e => e.isDead);
    }
  }

  completeLevel() {
    this.isComplete = true;
    
    // Save progress
    const progress = new PlatformProgress();
    const timeBonus = Math.max(0, 300 - this.timeElapsed) * 10;
    const finalScore = this.score + timeBonus;
    
    progress.completeLevel(this.chapterId, this.levelNumber, finalScore);
    progress.save();
    
    // Show completion message
    const { width, height } = this.cameras.main;
    const completeText = this.add.text(width / 2, height / 2, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    });
    completeText.setOrigin(0.5);
    completeText.setScrollFactor(0);
    completeText.setDepth(300);
    
    const scoreText = this.add.text(width / 2, height / 2 + 60, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreText.setOrigin(0.5);
    scoreText.setScrollFactor(0);
    scoreText.setDepth(300);
    
    // Return to level select after 3 seconds
    this.time.delayedCall(3000, () => {
      this.scene.start('LevelSelectScene', {
        element: this.selectedElement,
        chapterId: this.chapterId
      });
    });
  }

  loseLife() {
    this.lives--;
    
    if (this.lives > 0) {
      // Respawn player
      this.time.delayedCall(1000, () => {
        const { width, height } = this.cameras.main;
        this.player.destroy();
        this.player = new PlatformPlayer(this, 100, height - 200, this.selectedElement);
        this.setupCollisions();
      });
    } else {
      // Game over
      this.gameOver();
    }
  }

  gameOver() {
    const { width, height } = this.cameras.main;
    
    const gameOverText = this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(300);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('LevelSelectScene', {
        element: this.selectedElement,
        chapterId: this.chapterId
      });
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      const { width, height } = this.cameras.main;
      this.pauseText = this.add.text(width / 2, height / 2, 'PAUSED', {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8
      });
      this.pauseText.setOrigin(0.5);
      this.pauseText.setScrollFactor(0);
      this.pauseText.setDepth(300);
    } else {
      if (this.pauseText) {
        this.pauseText.destroy();
        this.pauseText = null;
      }
    }
  }

  handleDebugControls() {
    const ctrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    
    if (ctrl.isDown) {
      // Next level: Ctrl+N
      if (Phaser.Input.Keyboard.JustDown(this.debugControls.ctrlN)) {
        const nextLevel = this.levelNumber < 5 ? this.levelNumber + 1 : 1;
        this.scene.restart({
          element: this.selectedElement,
          chapterId: this.chapterId,
          levelNumber: nextLevel
        });
      }
      
      // Previous level: Ctrl+P
      if (Phaser.Input.Keyboard.JustDown(this.debugControls.ctrlP)) {
        const prevLevel = this.levelNumber > 1 ? this.levelNumber - 1 : 5;
        this.scene.restart({
          element: this.selectedElement,
          chapterId: this.chapterId,
          levelNumber: prevLevel
        });
      }
      
      // Toggle hitboxes: Ctrl+H
      if (Phaser.Input.Keyboard.JustDown(this.debugControls.ctrlH)) {
        this.showHitboxes = !this.showHitboxes;
        this.physics.world.drawDebug = this.showHitboxes;
        this.physics.world.debugGraphic.clear();
      }
      
      // Toggle invincibility: Ctrl+I
      if (Phaser.Input.Keyboard.JustDown(this.debugControls.ctrlI)) {
        this.debugMode = !this.debugMode;
        this.player.isInvulnerable = this.debugMode;
        if (this.debugMode) {
          this.player.setTint(0x00ffff);
        } else {
          this.player.clearTint();
        }
      }
    }
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.livesText.setText(`Lives: ${this.lives}`);
    this.timeText.setText(`Time: ${this.timeElapsed}s`);
  }

  getLevelType(levelNum) {
    if (levelNum === 4) return 'boss'; // Mid-boss
    if (levelNum === 5) return 'boss'; // Final boss
    return 'normal';
  }
}
