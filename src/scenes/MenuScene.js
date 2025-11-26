import Phaser from 'phaser';
import { ELEMENTS, GAME_CONFIG } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    this.selectedPlayers = [];
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

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

    // Subtitle
    this.add.text(width / 2, 140, 'Select Your Elemental Pet', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    // Display elemental options in a grid
    const elements = Object.values(ELEMENTS);
    const cols = 7;
    const startX = 200;
    const startY = 220;
    const spacing = 140;

    this.elementButtons = [];

    elements.forEach((element, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      // Element button
      const button = this.add.circle(x, y, 40, element.color);
      button.setInteractive({ useHandCursor: true });
      button.setStrokeStyle(3, 0xffffff);

      // Element name
      this.add.text(x, y + 60, element.name, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      button.on('pointerover', () => {
        button.setScale(1.2);
      });

      button.on('pointerout', () => {
        button.setScale(1.0);
      });

      button.on('pointerdown', () => {
        this.selectElement(element);
      });

      this.elementButtons.push({ button, element });
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
  }

  selectElement(element) {
    // Start game with selected element
    this.scene.start('GameScene', { 
      playerElement: element,
      playerCount: 1 // Human player count, AI will fill the rest
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
