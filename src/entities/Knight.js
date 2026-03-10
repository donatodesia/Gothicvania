import Character from './Character.js';

export default class Knight extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'knight-idle',
      defaultFrame:  0,
      frameW:        54,
      bodyW:         18,
      bodyH:         33,
      bodyOffsetX:   16,
      bodyOffsetY:   19,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-knight-attack', () => {
      this.attackingFlag = false;
    });

    this.play('knight-idle');
  }

  animKey(action) {
    return 'knight-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'knight-idle',
      frames: scene.anims.generateFrameNumbers('knight-idle', { start: 0, end: 14 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'knight-run',
      frames: scene.anims.generateFrameNumbers('knight-run', { start: 0, end: 11 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'knight-jump',
      frames: scene.anims.generateFrameNumbers('knight-jump', { start: 0, end: 4 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'knight-fall',
      frames: scene.anims.generateFrameNumbers('knight-fall', { start: 0, end: 6 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'knight-attack',
      frames: scene.anims.generateFrameNumbers('knight-attack', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'knight-hurt',
      frames: scene.anims.generateFrameNumbers('knight-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
