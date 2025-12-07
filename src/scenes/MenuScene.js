import Phaser from 'phaser';
import { ELEMENTS, GAME_CONFIG } from '../config.js';
import { playerProgress } from '../systems/PlayerProgress.js';
import { TERRAINS } from '../systems/TerrainSystem.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.selectedPlayers = [];
    this.selectedTerrain = null;
    this.canChooseTerrain = false;
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Load player progress
    playerProgress.load();
    
    // In debug mode, set level to DEBUG_LEVEL to unlock all elements/terrains
    if (GAME_CONFIG.DEBUG_MODE && playerProgress.level < GAME_CONFIG.DEBUG_LEVEL) {
      playerProgress.level = GAME_CONFIG.DEBUG_LEVEL;
    }
    
    // Load saved options from game-options.json
    await this.loadOptions();
    
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
    this.add.text(width / 2 + 3, 83, 'ELEMENTAL BALLS DUEL', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00000080',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, 'ELEMENTAL BALLS DUEL', {
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
      this.saveOptions();
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
      this.saveOptions();
    });

    // Terrain selection option (discrete, at bottom left)
    const terrainOptX = 150;
    const terrainOptY = height - 80;
    
    // Checkbox for terrain choice
    const checkboxBg = this.add.rectangle(terrainOptX, terrainOptY, 20, 20, 0x333333)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const checkmark = this.add.text(terrainOptX, terrainOptY, '✓', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5).setVisible(this.canChooseTerrain);
    
    this.add.text(terrainOptX + 30, terrainOptY, 'Choose Terrain', {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0, 0.5);
    
    checkboxBg.on('pointerdown', () => {
      this.canChooseTerrain = !this.canChooseTerrain;
      checkmark.setVisible(this.canChooseTerrain);
      this.saveOptions();
    });

    // Save Options Button
    const saveButtonX = terrainOptX;
    const saveButtonY = terrainOptY + 35;
    
    const saveButton = this.add.rectangle(saveButtonX, saveButtonY, 140, 25, 0x4a7c2f)
      .setStrokeStyle(2, 0x6b9d47)
      .setInteractive({ useHandCursor: true });
    
    const saveButtonText = this.add.text(saveButtonX, saveButtonY, '💾 Save Options', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    saveButton.on('pointerover', () => {
      saveButton.setFillStyle(0x5d8a3a);
      saveButton.setScale(1.05);
      saveButtonText.setScale(1.05);
    });
    
    saveButton.on('pointerout', () => {
      saveButton.setFillStyle(0x4a7c2f);
      saveButton.setScale(1);
      saveButtonText.setScale(1);
    });
    
    saveButton.on('pointerdown', () => {
      this.downloadOptionsFile();
    });
    
    // Info text below save button
    this.add.text(saveButtonX, saveButtonY + 18, 'Downloads updated file', {
      fontSize: '10px',
      color: '#999999',
      align: 'center'
    }).setOrigin(0.5);

    // Slider 1: Player Speed
    const slider1X = width / 2 + 150;
    const slider1Y = height - 40;
    const sliderWidth = 150;
    
    this.add.text(slider1X - 80, slider1Y, 'Player Speed:', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    
    this.playerSpeedText = this.add.text(slider1X + sliderWidth + 10, slider1Y, `${this.playerSpeed}`, {
      fontSize: '14px',
      color: '#00ff00'
    }).setOrigin(0, 0.5);
    
    // Slider background
    this.add.rectangle(slider1X, slider1Y, sliderWidth, 6, 0x333333);
    
    // Slider handle
    this.playerSpeedHandle = this.add.circle(
      slider1X - sliderWidth/2 + ((this.playerSpeed - 100) / 300) * sliderWidth,
      slider1Y,
      8,
      0xffffff
    ).setInteractive({ useHandCursor: true, draggable: true });
    
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === this.playerSpeedHandle) {
        const minX = slider1X - sliderWidth/2;
        const maxX = slider1X + sliderWidth/2;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        gameObject.x = clampedX;
        
        // Convert position to speed (100-400)
        const ratio = (clampedX - minX) / sliderWidth;
        this.playerSpeed = Math.round(100 + ratio * 300);
        this.playerSpeedText.setText(`${this.playerSpeed}`);
      } else if (gameObject === this.spiritSpeedHandle) {
        const minX = slider2X - sliderWidth/2;
        const maxX = slider2X + sliderWidth/2;
        const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
        gameObject.x = clampedX;
        
        // Convert position to speed (100-500)
        const ratio = (clampedX - minX) / sliderWidth;
        this.spiritSpeed = Math.round(100 + ratio * 400);
        this.spiritSpeedText.setText(`${this.spiritSpeed}`);
      }
    });
    
    this.input.on('dragend', (pointer, gameObject) => {
      // Save options when slider is released
      if (gameObject === this.playerSpeedHandle || gameObject === this.ballSpeedHandle) {
        this.saveOptions();
      }
    });
    
    // Slider 2: Spirit Speed
    const slider2X = slider1X;
    const slider2Y = height - 10;
    
    this.add.text(slider2X - 80, slider2Y, 'Ball Speed:', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    
    this.ballSpeedText = this.add.text(slider2X + sliderWidth + 10, slider2Y, `${this.ballSpeed}`, {
      fontSize: '14px',
      color: '#00ff00'
    }).setOrigin(0, 0.5);
    
    // Slider background
    this.add.rectangle(slider2X, slider2Y, sliderWidth, 6, 0x333333);
    
    // Slider handle
    this.ballSpeedHandle = this.add.circle(
      slider2X - sliderWidth/2 + ((this.ballSpeed - 100) / 400) * sliderWidth,
      slider2Y,
      8,
      0xffffff
    ).setInteractive({ useHandCursor: true, draggable: true });
  }

  selectElement(element) {
    // Store selected element
    this.selectedElement = element;
    
    // If terrain choice is enabled, show terrain selection
    if (this.canChooseTerrain) {
      this.showTerrainSelection();
    } else {
      // Start game directly
      this.startGame();
    }
  }
  
  startGame() {
    // Start game with selected element and terrain
    this.scene.start('GameScene', { 
      playerElement: this.selectedElement,
      playerCount: 1, // Human player count, AI will fill the rest
      friendlyFire: this.friendlyFire,
      giftPowerSharing: this.giftPowerSharing,
      debugMode: GAME_CONFIG.DEBUG_MODE,
      playerSpeed: this.playerSpeed,
      ballSpeed: this.ballSpeed,
      selectedTerrain: this.selectedTerrain
    });
  }

  showTerrainSelection() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Semi-transparent overlay
    this.terrainOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0)
      .setDepth(1000);
    
    // Title
    this.add.text(width / 2, 100, 'SELECT TERRAIN', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001);
    
    // Terrain grid
    const terrains = Object.values(TERRAINS);
    const cols = 4;
    const startX = width / 2 - 300;
    const startY = 180;
    const spacing = 150;
    
    this.terrainButtons = [];
    
    let visibleIndex = 0;
    terrains.forEach((terrain, index) => {
      const isUnlocked = GAME_CONFIG.DEBUG_MODE || playerProgress.level >= terrain.requiredLevel;
      
      if (!isUnlocked && !GAME_CONFIG.DEBUG_MODE) return;
      
      const row = Math.floor(visibleIndex / cols);
      const col = visibleIndex % cols;
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      // Terrain button background
      const button = this.add.rectangle(x, y, 120, 100, 0x444444)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setDepth(1001);
      
      // Terrain name
      this.add.text(x, y - 30, terrain.name, {
        fontSize: '12px',
        color: '#ffffff',
        wordWrap: { width: 110 }
      }).setOrigin(0.5).setDepth(1002);
      
      // Required level
      this.add.text(x, y + 35, `Level ${terrain.requiredLevel}`, {
        fontSize: '10px',
        color: '#ffff00'
      }).setOrigin(0.5).setDepth(1002);
      
      button.on('pointerover', () => {
        button.setStrokeStyle(3, 0x00ff00);
      });
      
      button.on('pointerout', () => {
        button.setStrokeStyle(2, this.selectedTerrain === terrain ? 0x00ff00 : 0xffffff);
      });
      
      button.on('pointerdown', () => {
        this.selectedTerrain = terrain;
        // Update all buttons
        this.terrainButtons.forEach(b => {
          b.button.setStrokeStyle(2, 0xffffff);
        });
        button.setStrokeStyle(3, 0x00ff00);
        
        // Start game after terrain selection
        this.hideTerrainSelection();
        this.startGame();
      });
      
      this.terrainButtons.push({ button, terrain });
      visibleIndex++;
    });
    
    // Close button (Cancel)
    const closeBtn = this.add.text(width / 2, height - 80, 'CANCEL', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(1001).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => {
      this.hideTerrainSelection();
    });
  }

  hideTerrainSelection() {
    if (this.terrainOverlay) {
      // Destroy all terrain selection UI
      this.children.list.forEach(child => {
        if (child.depth >= 1000) {
          child.destroy();
        }
      });
      this.terrainOverlay = null;
      this.terrainButtons = [];
    }
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

  // Load saved options from game-options.json
  async loadOptions() {
    try {
      const response = await fetch('/game-options.json');
      if (response.ok) {
        const options = await response.json();
        this.friendlyFire = options.friendlyFire || false;
        this.giftPowerSharing = options.giftPowerSharing || false;
        this.canChooseTerrain = options.canChooseTerrain || false;
        this.playerSpeed = options.playerSpeed || GAME_CONFIG.PLAYER_SPEED;
        this.ballSpeed = options.ballSpeed || options.spiritSpeed || GAME_CONFIG.SPIRIT_FOLLOW_SPEED;
      } else {
        this.setDefaultOptions();
      }
    } catch (e) {
      console.error('Error loading options from file:', e);
      console.log('Using default options. You can create/edit game-options.json to customize.');
      this.setDefaultOptions();
    }
  }

  setDefaultOptions() {
    this.friendlyFire = false;
    this.giftPowerSharing = false;
    this.canChooseTerrain = false;
    this.playerSpeed = GAME_CONFIG.PLAYER_SPEED;
    this.ballSpeed = GAME_CONFIG.SPIRIT_FOLLOW_SPEED;
  }

  // Save options to game-options.json
  saveOptions() {
    const options = {
      friendlyFire: this.friendlyFire,
      giftPowerSharing: this.giftPowerSharing,
      canChooseTerrain: this.canChooseTerrain,
      playerSpeed: this.playerSpeed,
      ballSpeed: this.ballSpeed
    };
    
    // Display options in console for manual editing
    console.log('=== GAME OPTIONS ===');
    console.log('To customize, edit the file: game-options.json');
    console.log('Current settings:', JSON.stringify(options, null, 2));
    console.log('===================');
    
    // Note: We can't write to file from browser, but we can copy from localStorage
    // Save to localStorage as backup
    try {
      localStorage.setItem('elementalSpiritsOptions', JSON.stringify(options));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Download options as game-options.json file
  downloadOptionsFile() {
    const options = {
      friendlyFire: this.friendlyFire,
      giftPowerSharing: this.giftPowerSharing,
      canChooseTerrain: this.canChooseTerrain,
      playerSpeed: this.playerSpeed,
      ballSpeed: this.ballSpeed
    };
    
    // Create JSON content with nice formatting
    const jsonContent = JSON.stringify(options, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-options.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show confirmation
    const confirmText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '✓ Options saved to game-options.json\nReplace the file in your game folder',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    ).setOrigin(0.5).setDepth(2000);
    
    // Fade out confirmation after 3 seconds
    this.tweens.add({
      targets: confirmText,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => confirmText.destroy()
    });
    
    console.log('✓ Options file downloaded! Replace game-options.json in your game folder.');
    console.log('Downloaded content:', jsonContent);
  }
}
