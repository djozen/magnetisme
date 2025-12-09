import Phaser from 'phaser';
import PlatformPlayer from '../platform/PlatformPlayer.js';
import Enemy from '../platform/Enemy.js';
import Boss from '../platform/Boss.js';
import { CHAPTERS, getChapterList } from '../platform/ChapterConfig.js';
import { ENEMY_TYPES, getEnemiesForElement } from '../platform/EnemyTypes.js';
import { BOSS_TYPES } from '../platform/BossTypes.js';
import { PLATFORM_CONFIG } from '../platform/PlatformConfig.js';
import { PlatformProgress } from '../platform/PlatformProgress.js';

export default class PlatformScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlatformScene' });
  }

  init(data) {
    this.selectedElement = data.element;
    this.chapterId = data.chapterId;
    this.levelNumber = data.levelNumber;
    
    const chapterList = getChapterList();
    this.chapter = chapterList.find(c => c.id === this.chapterId);
    
    // Fallback to first chapter if not found
    if (!this.chapter) {
      console.warn(`Chapter with id ${this.chapterId} not found, using first chapter`);
      this.chapter = chapterList[0];
      this.chapterId = this.chapter.id;
    }
    
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
    
    // Multi-layer gradient background
    const graphics = this.add.graphics();
    
    // Base layer - dark gradient
    const colorObj = Phaser.Display.Color.IntegerToColor(this.chapter.color);
    const darkColor = colorObj.clone().darken(50).color;
    const lightColor = colorObj.clone().lighten(20).color;
    
    graphics.fillGradientStyle(darkColor, darkColor, this.chapter.color, this.chapter.color, 1);
    graphics.fillRect(0, 0, width * 3, height);
    graphics.setScrollFactor(0.5);
    graphics.setDepth(-10);
    
    // Add atmospheric particles
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width * 3),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        this.chapter.color,
        0.2
      );
      particle.setScrollFactor(0.3 + Math.random() * 0.3);
      particle.setDepth(-9);
      
      // Gentle floating animation
      this.tweens.add({
        targets: particle,
        y: particle.y + Phaser.Math.Between(-50, 50),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: 0.1 + Math.random() * 0.3,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createLevel() {
    const { width, height } = this.cameras.main;
    const worldWidth = PLATFORM_CONFIG.WORLD_WIDTH;
    
    // Create continuous ground with holes
    this.createGroundWithHoles();
    
    // Generate platforms based on level type
    if (this.levelType === 'boss') {
      this.createBossArena();
    } else {
      this.createNormalPlatforms();
    }
  }

  createGroundWithHoles() {
    const worldWidth = PLATFORM_CONFIG.WORLD_WIDTH;
    const groundY = PLATFORM_CONFIG.GROUND_Y;
    const groundHeight = PLATFORM_CONFIG.GROUND_HEIGHT;
    
    // Generate random holes
    const holes = [];
    const holeCount = PLATFORM_CONFIG.HOLES_PER_LEVEL;
    
    for (let i = 0; i < holeCount; i++) {
      const holeX = 300 + (i * (worldWidth - 600) / holeCount) + Math.random() * 200;
      const holeWidth = Phaser.Math.Between(
        PLATFORM_CONFIG.HOLE_WIDTH_MIN,
        PLATFORM_CONFIG.HOLE_WIDTH_MAX
      );
      holes.push({ x: holeX, width: holeWidth });
    }
    
    // Sort holes by x position
    holes.sort((a, b) => a.x - b.x);
    
    // Create ground segments between holes
    let currentX = 0;
    
    for (let hole of holes) {
      const segmentWidth = hole.x - currentX;
      if (segmentWidth > 50) {
        this.createGroundSegment(currentX, groundY, segmentWidth, groundHeight);
      }
      
      // Create elemental hole
      this.createElementalHole(hole.x, groundY, hole.width, groundHeight);
      
      currentX = hole.x + hole.width;
    }
    
    // Final segment to end of world
    const finalWidth = worldWidth - currentX;
    if (finalWidth > 0) {
      this.createGroundSegment(currentX, groundY, finalWidth, groundHeight);
    }
  }

  createGroundSegment(x, y, width, height) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const groundColor = Phaser.Display.Color.IntegerToColor(this.chapter.color).darken(40).color;
    const darkColor = Phaser.Display.Color.IntegerToColor(this.chapter.color).darken(50).color;
    
    // Ground gradient
    graphics.fillGradientStyle(groundColor, groundColor, darkColor, darkColor, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Add texture details
    for (let i = 0; i < width; i += 20) {
      graphics.fillStyle(0x000000, 0.1 + Math.random() * 0.1);
      graphics.fillRect(i, Math.random() * 10, 10, height);
    }
    
    // Top highlight
    graphics.fillStyle(Phaser.Display.Color.IntegerToColor(this.chapter.color).lighten(10).color, 0.3);
    graphics.fillRect(0, 0, width, 3);
    
    const key = `ground_${x}_${Date.now()}`;
    graphics.generateTexture(key, width, height);
    graphics.destroy();
    
    const ground = this.add.image(x + width / 2, y + height / 2, key);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
  }

  createElementalHole(x, y, width, height) {
    // Visual effect for the hole (danger zone)
    const holeTypes = ['fire', 'ice', 'wind', 'void', 'light', 'shadow', 'lightning', 'poison'];
    const holeType = Phaser.Utils.Array.GetRandom(holeTypes);
    
    const colors = {
      fire: 0xff4400,
      ice: 0x00ddff,
      wind: 0xaaffaa,
      void: 0x220033,
      light: 0xffffaa,
      shadow: 0x330033,
      lightning: 0xffff00,
      poison: 0x88ff00
    };
    
    const holeColor = colors[holeType] || 0x000000;
    
    // Animated particles rising from hole
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        x + Math.random() * width,
        y,
        3 + Math.random() * 3,
        holeColor,
        0.6
      );
      particle.setDepth(1);
      
      this.tweens.add({
        targets: particle,
        y: y - 100,
        alpha: 0,
        duration: 2000 + Math.random() * 1000,
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
    
    // Glow at bottom of hole
    const glow = this.add.rectangle(x + width / 2, y + height, width, 20, holeColor, 0.3);
    glow.setDepth(1);
    
    this.tweens.add({
      targets: glow,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  createNormalPlatforms() {
    const { width, height } = this.cameras.main;
    
    // Create procedural platforms with better visuals
    const platformCount = 15 + this.levelNumber * 3;
    const segmentWidth = (width * 3) / platformCount;
    const platformColor = Phaser.Display.Color.IntegerToColor(this.chapter.color).darken(30).color;
    
    for (let i = 1; i < platformCount; i++) {
      const x = i * segmentWidth + Phaser.Math.Between(-50, 50);
      const y = Phaser.Math.Between(height * 0.3, height * 0.8);
      const w = Phaser.Math.Between(100, 200);
      
      // Create platform with gradient and border
      const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      const lightColor = Phaser.Display.Color.IntegerToColor(platformColor).lighten(20).color;
      
      // Shadow
      platformGraphics.fillStyle(0x000000, 0.3);
      platformGraphics.fillRect(2, 22, w, 4);
      
      // Main platform with gradient
      platformGraphics.fillGradientStyle(lightColor, lightColor, platformColor, platformColor, 1);
      platformGraphics.fillRect(0, 0, w, 20);
      
      // Border
      platformGraphics.lineStyle(2, 0x000000, 0.5);
      platformGraphics.strokeRect(0, 0, w, 20);
      
      // Top highlight
      platformGraphics.lineStyle(1, 0xffffff, 0.3);
      platformGraphics.lineBetween(2, 2, w - 2, 2);
      
      const key = `platform_${i}_${Date.now()}`;
      platformGraphics.generateTexture(key, w + 4, 26);
      platformGraphics.destroy();
      
      const platform = this.add.image(x, y, key);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    }
    
    // Add some vertical platforms for variety
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(200, width * 3 - 200);
      const y = Phaser.Math.Between(height * 0.4, height * 0.7);
      
      for (let j = 0; j < 3; j++) {
        const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        const lightColor = Phaser.Display.Color.IntegerToColor(platformColor).lighten(20).color;
        
        platformGraphics.fillGradientStyle(lightColor, lightColor, platformColor, platformColor, 1);
        platformGraphics.fillRect(0, 0, 120, 15);
        platformGraphics.lineStyle(2, 0x000000, 0.5);
        platformGraphics.strokeRect(0, 0, 120, 15);
        platformGraphics.lineStyle(1, 0xffffff, 0.3);
        platformGraphics.lineBetween(2, 2, 118, 2);
        
        const key = `vplatform_${i}_${j}_${Date.now()}`;
        platformGraphics.generateTexture(key, 120, 15);
        platformGraphics.destroy();
        
        const platform = this.add.image(x, y - j * 80, key);
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
      const elementEnemies = getEnemiesForElement(this.chapter.key);
      
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
      this.player.update(time, delta);
      
      // Shoot projectile (using player's keys state)
      if (this.player.keys.power && this.player.canUsePower()) {
        this.shootProjectile();
      }
      
      // Use gift power
      if (this.player.keys.power && this.player.canUseGiftPower()) {
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
