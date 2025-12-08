import Phaser from 'phaser';
import { CHAPTERS, getChapterList } from '../platform/ChapterConfig.js';
import { ELEMENTS, PLATFORM_CONFIG } from '../platform/PlatformConfig.js';
import { platformProgress } from '../platform/PlatformProgress.js';

export default class ChapterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChapterSelectScene' });
    this.selectedChapter = null;
    this.selectedElement = null;
  }

  init(data) {
    this.selectedElement = data.selectedElement || ELEMENTS.EARTH;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a1a).setOrigin(0, 0);

    // Title
    this.add.text(width / 2, 50, 'SELECT CHAPTER', {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Player element indicator
    this.add.text(width / 2, 100, `Playing as: ${this.selectedElement.name}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#' + this.selectedElement.color.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Get available chapters (exclude player's element chapter)
    const allChapters = getChapterList();
    const availableChapters = allChapters.filter(chapter => {
      // Skip the final chapter for now
      if (chapter.key === 'final') return false;
      
      // IMPORTANT: Player never plays their own element chapter
      if (chapter.key === this.selectedElement.key) return false;
      
      return true;
    });

    // Display chapters in a grid
    const cols = 4;
    const rows = Math.ceil(availableChapters.length / cols);
    const startX = 100;
    const startY = 160;
    const cellWidth = (width - 200) / cols;
    const cellHeight = 120;

    availableChapters.forEach((chapter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * cellWidth + cellWidth / 2;
      const y = startY + row * cellHeight;

      this.createChapterButton(chapter, x, y, cellWidth - 20, cellHeight - 20);
    });

    // Add final chapter at the bottom if all other chapters are complete
    const completedCount = availableChapters.filter(c => 
      platformProgress.completedChapters.includes(c.key)
    ).length;
    
    if (completedCount >= availableChapters.length) {
      const finalChapter = allChapters.find(c => c.key === 'final');
      if (finalChapter) {
        const finalY = startY + rows * cellHeight + 30;
        this.createChapterButton(finalChapter, width / 2, finalY, 400, 80);
      }
    }

    // Back button
    this.createBackButton(50, height - 50);

    // Instructions
    const instructions = PLATFORM_CONFIG.DEBUG_MODE 
      ? 'Debug Mode: All chapters unlocked | Click to select'
      : 'Complete chapters to unlock new ones';
    
    this.add.text(width / 2, height - 30, instructions, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);
  }

  createChapterButton(chapter, x, y, width, height) {
    const isUnlocked = platformProgress.isChapterUnlocked(chapter.key, chapter.unlockLevel);
    const isCompleted = platformProgress.completedChapters.includes(chapter.key);
    
    // Container
    const container = this.add.container(x, y);

    // Background
    const bgColor = isUnlocked ? chapter.color : 0x333333;
    const bg = this.add.rectangle(0, 0, width, height, bgColor, isUnlocked ? 0.8 : 0.3);
    bg.setStrokeStyle(3, isCompleted ? 0x00ff00 : (isUnlocked ? 0xffffff : 0x666666));
    container.add(bg);

    // Lock icon if locked
    if (!isUnlocked) {
      const lock = this.add.text(0, -10, '🔒', {
        fontSize: '32px'
      }).setOrigin(0.5);
      container.add(lock);
    }

    // Chapter name
    const name = this.add.text(0, isUnlocked ? -15 : 20, chapter.name, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: isUnlocked ? '#ffffff' : '#666666',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    container.add(name);

    // Completion status
    if (isUnlocked) {
      const levelsCompleted = (platformProgress.completedLevels[chapter.key] || []).length;
      const totalLevels = chapter.levels;
      const statusText = isCompleted ? '✓ COMPLETED' : `${levelsCompleted}/${totalLevels} levels`;
      
      const status = this.add.text(0, 15, statusText, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: isCompleted ? '#00ff00' : '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      container.add(status);
    }

    // Make interactive if unlocked
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true });
      
      bg.on('pointerover', () => {
        bg.setStrokeStyle(4, 0xffff00);
        bg.setAlpha(1);
      });
      
      bg.on('pointerout', () => {
        bg.setStrokeStyle(3, isCompleted ? 0x00ff00 : 0xffffff);
        bg.setAlpha(0.8);
      });
      
      bg.on('pointerdown', () => {
        this.selectChapter(chapter);
      });
    }
  }

  selectChapter(chapter) {
    // Go to level select
    this.scene.start('LevelSelectScene', { 
      chapter: chapter,
      selectedElement: this.selectedElement 
    });
  }

  createBackButton(x, y) {
    const button = this.add.text(x, y, '← Back to Menu', {
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
      this.scene.start('MenuScene');
    });
  }
}
