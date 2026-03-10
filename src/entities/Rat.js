import Character from './Character.js';

export default class Rat extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'rat-idle',
      defaultFrame:  0,
      frameW:        24,
      bodyW:         10,
      bodyH:         11,
      bodyOffsetX:   7,
      bodyOffsetY:   13,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-rat-attack', () => {
      this.attackingFlag = false;
    });

    this.play('rat-idle');
  }

  animKey(action) {
    return 'rat-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'rat-idle',
      frames: scene.anims.generateFrameNumbers('rat-idle', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: 'rat-run',
      frames: scene.anims.generateFrameNumbers('rat-run', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'rat-jump',
      frames: scene.anims.generateFrameNumbers('rat-jump', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'rat-fall',
      frames: scene.anims.generateFrameNumbers('rat-fall', { start: 0, end: 2 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'rat-attack',
      frames: scene.anims.generateFrameNumbers('rat-attack', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'rat-hurt',
      frames: scene.anims.generateFrameNumbers('rat-hurt', { start: 0, end: 0 }),
      frameRate: 4,
      repeat: 0,
    });
  }
}
