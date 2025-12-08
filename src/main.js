import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ChapterSelectScene from './scenes/ChapterSelectScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import PlatformScene from './scenes/PlatformScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, ChapterSelectScene, LevelSelectScene, PlatformScene]
};

const game = new Phaser.Game(config);
