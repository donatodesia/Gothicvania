import Character from './Character.js';

export default class Archer extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'archer-idle',
      defaultFrame:  0,
      frameW:        46,
      bodyW:         14,
      bodyH:         33,
      bodyOffsetX:   17,
      bodyOffsetY:   19,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-archer-attack', () => {
      this.attackingFlag = false;
    });

    this.play('archer-idle');
  }

  animKey(action) {
    return 'archer-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'archer-idle',
      frames: scene.anims.generateFrameNumbers('archer-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'archer-run',
      frames: scene.anims.generateFrameNumbers('archer-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'archer-jump',
      frames: scene.anims.generateFrameNumbers('archer-jump', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'archer-fall',
      frames: scene.anims.generateFrameNumbers('archer-fall', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'archer-attack',
      frames: scene.anims.generateFrameNumbers('archer-attack', { start: 0, end: 9 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'archer-hurt',
      frames: scene.anims.generateFrameNumbers('archer-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
