import Character from './Character.js';

export default class King extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'king-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         20,
      bodyOffsetX:   24,
      bodyOffsetY:   16,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-king-attack', () => {
      this.attackingFlag = false;
    });

    this.play('king-idle');
  }

  animKey(action) {
    return 'king-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'king-idle',
      frames: scene.anims.generateFrameNumbers('king-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'king-run',
      frames: scene.anims.generateFrameNumbers('king-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'king-jump',
      frames: scene.anims.generateFrameNumbers('king-jump', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'king-fall',
      frames: scene.anims.generateFrameNumbers('king-fall', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'king-attack',
      frames: scene.anims.generateFrameNumbers('king-attack', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'king-hurt',
      frames: scene.anims.generateFrameNumbers('king-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
