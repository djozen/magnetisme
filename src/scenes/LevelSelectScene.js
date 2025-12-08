import Phaser from 'phaser';
import { getLevelType, LEVEL_CONFIG } from '../platform/ChapterConfig.js';
import { platformProgress } from '../platform/PlatformProgress.js';
import { PLATFORM_CONFIG } from '../platform/PlatformConfig.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
    this.chapter = null;
    this.selectedElement = null;
  }

  init(data) {
    this.chapter = data.chapter;
    this.selectedElement = data.selectedElement;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background with chapter color
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0, 0);
    this.add.rectangle(0, 0, width, 150, this.chapter.color, 0.3).setOrigin(0, 0);

    // Chapter title
    this.add.text(width / 2, 50, this.chapter.name, {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Chapter description
    this.add.text(width / 2, 90, this.chapter.description, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#cccccc',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Player element
    this.add.text(width / 2, 120, `Playing as: ${this.selectedElement.name}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#' + this.selectedElement.color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Display levels
    const startY = 180;
    const levelHeight = 80;
    const levelWidth = 600;

    for (let i = 1; i <= this.chapter.levels; i++) {
      const y = startY + (i - 1) * levelHeight;
      this.createLevelButton(i, width / 2, y, levelWidth, levelHeight - 10);
    }

    // Back button
    this.createBackButton(50, height - 50);

    // Debug controls info
    if (PLATFORM_CONFIG.DEBUG_MODE) {
      this.add.text(width / 2, height - 30, 'Debug: Ctrl+N = Next Level | Ctrl+P = Previous Level', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ff00ff'
      }).setOrigin(0.5);
    }
  }

  createLevelButton(levelNumber, x, y, width, height) {
    const isUnlocked = platformProgress.isLevelUnlocked(this.chapter.key, levelNumber);
    const isCompleted = platformProgress.isLevelCompleted(this.chapter.key, levelNumber);
    const levelType = getLevelType(this.chapter.key, levelNumber);
    const score = platformProgress.getLevelScore(this.chapter.key, levelNumber);

    // Container
    const container = this.add.container(x, y);

    // Background
    let bgColor = 0x333333;
    if (isUnlocked) {
      switch (levelType) {
        case LEVEL_CONFIG.TYPES.FINAL_BOSS:
          bgColor = 0xff0000;
          break;
        case LEVEL_CONFIG.TYPES.AI_BOSS:
          bgColor = 0xff8800;
          break;
        case LEVEL_CONFIG.TYPES.MID_BOSS:
          bgColor = 0xffaa00;
          break;
        default:
          bgColor = this.chapter.color;
      }
    }

    const bg = this.add.rectangle(0, 0, width, height, bgColor, isUnlocked ? 0.6 : 0.2);
    bg.setStrokeStyle(3, isCompleted ? 0x00ff00 : (isUnlocked ? 0xffffff : 0x666666));
    container.add(bg);

    // Level number and type
    let levelTitle = `Level ${levelNumber}`;
    let icon = '';
    
    switch (levelType) {
      case LEVEL_CONFIG.TYPES.MID_BOSS:
        levelTitle += ' - Mid Boss';
        icon = '👹';
        break;
      case LEVEL_CONFIG.TYPES.AI_BOSS:
        levelTitle += ' - AI Champion';
        icon = '🤖';
        break;
      case LEVEL_CONFIG.TYPES.FINAL_BOSS:
        levelTitle += ' - FINAL BOSS';
        icon = '💀';
        break;
      default:
        icon = '🎮';
    }

    // Lock if not unlocked
    if (!isUnlocked) {
      icon = '🔒';
    }

    // Icon
    const iconText = this.add.text(-width / 2 + 40, 0, icon, {
      fontSize: '32px'
    }).setOrigin(0.5);
    container.add(iconText);

    // Title
    const title = this.add.text(-width / 2 + 100, -10, levelTitle, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: isUnlocked ? '#ffffff' : '#666666',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    container.add(title);

    // Status
    if (isCompleted) {
      const completedText = this.add.text(-width / 2 + 100, 12, `✓ Score: ${score}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#00ff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0, 0.5);
      container.add(completedText);
    } else if (isUnlocked) {
      const playText = this.add.text(-width / 2 + 100, 12, 'Click to play', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }).setOrigin(0, 0.5);
      container.add(playText);
    }

    // Play button
    if (isUnlocked) {
      const playBtn = this.add.text(width / 2 - 40, 0, 'PLAY ►', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#006600',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);
      container.add(playBtn);

      playBtn.setInteractive({ useHandCursor: true });
      
      playBtn.on('pointerover', () => {
        playBtn.setStyle({ backgroundColor: '#00aa00' });
        bg.setStrokeStyle(4, 0xffff00);
      });
      
      playBtn.on('pointerout', () => {
        playBtn.setStyle({ backgroundColor: '#006600' });
        bg.setStrokeStyle(3, isCompleted ? 0x00ff00 : 0xffffff);
      });
      
      playBtn.on('pointerdown', () => {
        this.startLevel(levelNumber);
      });
    }
  }

  startLevel(levelNumber) {
    this.scene.start('PlatformScene', {
      chapter: this.chapter,
      level: levelNumber,
      selectedElement: this.selectedElement
    });
  }

  createBackButton(x, y) {
    const button = this.add.text(x, y, '← Back to Chapters', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 10 }
    }).setOrigin(0, 0.5);

    button.setInteractive({ useHandCursor: true });
    
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: '#555555' });
    });
    
    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: '#333333' });
    });
    
    button.on('pointerdown', () => {
      this.scene.start('ChapterSelectScene', { 
        selectedElement: this.selectedElement 
      });
    });
  }
}
