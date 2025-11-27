import Phaser from 'phaser';
import { ELEMENTS, GAME_CONFIG } from '../config.js';
import { playerProgress } from '../systems/PlayerProgress.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.selectedPlayers = [];
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Load player progress
    playerProgress.load();
    
    // Options
    this.friendlyFire = false; // Allies are NOT affected by powers
    this.giftPowerSharing = false; // Allies can NOT use gift powers by default

    // Natural background
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1);
    sky.fillRect(0, 0, width, height);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x6b9d47, 1);
    ground.fillRect(0, height * 0.7, width, height * 0.3);

    // Decorative trees in background
    this.createBackgroundTrees(width, height);

    // Title with shadow
    this.add.text(width / 2 + 3, 83, 'ELEMENTAL SPIRITS DUEL', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00000080',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, 'ELEMENTAL SPIRITS DUEL', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Display player progress (Level and Score)
    const progressText = `Level ${playerProgress.level} - Score: ${playerProgress.globalScore}`;
    const nextLevelScore = playerProgress.getScoreForNextLevel();
    const progressSubtext = `Next level: ${nextLevelScore}`;
    
    this.add.text(width / 2, 130, progressText, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Only show next level in debug mode
    if (GAME_CONFIG.DEBUG_MODE) {
      this.add.text(width / 2, 155, progressSubtext, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#cccccc',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Subtitle
    this.add.text(width / 2, 190, 'Select Your Elemental Pet', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    // Display elemental options in a grid
    const elements = Object.values(ELEMENTS);
    const cols = 7;
    const startX = 200;
    const startY = 250;
    const spacing = 140;

    this.elementButtons = [];

    let visibleIndex = 0;
    elements.forEach((element) => {
      // Check if element is unlocked (in debug mode, all elements are unlocked)
      const isUnlocked = GAME_CONFIG.DEBUG_MODE || playerProgress.level >= element.requiredLevel;
      
      // Skip locked elements (don't display them at all)
      if (!isUnlocked && !GAME_CONFIG.DEBUG_MODE) {
        return;
      }
      
      const col = visibleIndex % cols;
      const row = Math.floor(visibleIndex / cols);
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      visibleIndex++;

      // Element button
      const button = this.add.circle(x, y, 40, element.color);
      button.setInteractive({ useHandCursor: isUnlocked });
      button.setStrokeStyle(3, isUnlocked ? 0xffffff : 0x666666);
      
      // Debug mode: show lock overlay if locked
      if (!isUnlocked && GAME_CONFIG.DEBUG_MODE) {
        button.setAlpha(0.3);
        const lockIcon = this.add.text(x, y, '🔒', {
          fontSize: '32px'
        }).setOrigin(0.5);
        
        // Level requirement
        this.add.text(x, y + 45, `Lv ${element.requiredLevel}`, {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#ff0000',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
      }

      // Element name
      this.add.text(x, y + 60, element.name, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: isUnlocked ? '#ffffff' : '#666666',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      if (isUnlocked) {
        button.on('pointerover', () => {
          button.setScale(1.2);
        });

        button.on('pointerout', () => {
          button.setScale(1.0);
        });

        button.on('pointerdown', () => {
          this.selectElement(element);
        });
      }

      this.elementButtons.push({ button, element, isUnlocked });
    });

    // Instructions
    this.add.text(width / 2, height - 100, 'Click an element to start the game', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 60, 'AI players will fill remaining slots', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    // Option 1: Friendly Fire (allies affected by powers)
    const checkbox1X = width / 2 - 150;
    const checkbox1Y = height - 40;
    
    this.checkboxBg1 = this.add.rectangle(checkbox1X, checkbox1Y, 20, 20, 0x333333);
    this.checkboxBg1.setStrokeStyle(2, 0xffffff);
    this.checkboxBg1.setInteractive({ useHandCursor: true });
    
    this.checkboxCheck1 = this.add.text(checkbox1X, checkbox1Y, '✓', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.checkboxCheck1.setVisible(this.friendlyFire);
    
    this.add.text(checkbox1X + 30, checkbox1Y, 'Friendly Fire (allies affected by powers)', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    this.checkboxBg1.on('pointerdown', () => {
      this.friendlyFire = !this.friendlyFire;
      this.checkboxCheck1.setVisible(this.friendlyFire);
    });
    
    // Option 2: Gift Power Sharing (allies can use gift powers)
    const checkbox2X = width / 2 - 150;
    const checkbox2Y = height - 10;
    
    this.checkboxBg2 = this.add.rectangle(checkbox2X, checkbox2Y, 20, 20, 0x333333);
    this.checkboxBg2.setStrokeStyle(2, 0xffffff);
    this.checkboxBg2.setInteractive({ useHandCursor: true });
    
    this.checkboxCheck2 = this.add.text(checkbox2X, checkbox2Y, '✓', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.checkboxCheck2.setVisible(this.giftPowerSharing);
    
    this.add.text(checkbox2X + 30, checkbox2Y, 'Gift Power Sharing (allies can use gift powers)', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    this.checkboxBg2.on('pointerdown', () => {
      this.giftPowerSharing = !this.giftPowerSharing;
      this.checkboxCheck2.setVisible(this.giftPowerSharing);
    });
  }

  selectElement(element) {
    // Start game with selected element
    this.scene.start('GameScene', { 
      playerElement: element,
      playerCount: 1, // Human player count, AI will fill the rest
      friendlyFire: this.friendlyFire,
      giftPowerSharing: this.giftPowerSharing,
      debugMode: GAME_CONFIG.DEBUG_MODE
    });
  }

  createBackgroundTrees(width, height) {
    // Left side trees
    for (let i = 0; i < 5; i++) {
      const x = 50 + i * 60;
      const y = height * 0.6 - i * 10;
      this.createSimpleTree(x, y, 0.7);
    }

    // Right side trees
    for (let i = 0; i < 5; i++) {
      const x = width - 50 - i * 60;
      const y = height * 0.6 - i * 10;
      this.createSimpleTree(x, y, 0.7);
    }
  }

  createSimpleTree(x, y, scale = 1) {
    // Trunk
    const trunk = this.add.rectangle(x, y, 10 * scale, 30 * scale, 0x654321);
    
    // Foliage
    const foliage1 = this.add.circle(x, y - 20 * scale, 25 * scale, 0x2d5016, 0.8);
    const foliage2 = this.add.circle(x, y - 30 * scale, 20 * scale, 0x4a7c2f, 0.8);
  }
}
