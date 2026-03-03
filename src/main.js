import Phaser from 'phaser';
import './style.css';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';

const config = {
  type: Phaser.AUTO,
  width: 384,
  height: 224,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, PauseScene],
};

new Phaser.Game(config);
