import Character from './Character.js';

export default class Paladin extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'paladin-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         11,
      bodyH:         20,
      bodyOffsetX:   23,
      bodyOffsetY:   11,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-paladin-attack', () => {
      this.attackingFlag = false;
    });

    this.play('paladin-idle');
  }

  animKey(action) {
    return 'paladin-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'paladin-idle',
      frames: scene.anims.generateFrameNumbers('paladin-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'paladin-run',
      frames: scene.anims.generateFrameNumbers('paladin-run', { start: 0, end: 9 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'paladin-jump',
      frames: scene.anims.generateFrameNumbers('paladin-jump', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'paladin-fall',
      frames: scene.anims.generateFrameNumbers('paladin-fall', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'paladin-attack',
      frames: scene.anims.generateFrameNumbers('paladin-attack', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'paladin-hurt',
      frames: scene.anims.generateFrameNumbers('paladin-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
