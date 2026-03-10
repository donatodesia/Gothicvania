import Character from './Character.js';

export default class Skeleton extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'skeleton-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         20,
      bodyOffsetX:   27,
      bodyOffsetY:   21,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-skeleton-attack', () => {
      this.attackingFlag = false;
    });

    this.play('skeleton-idle');
  }

  animKey(action) {
    return 'skeleton-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'skeleton-idle',
      frames: scene.anims.generateFrameNumbers('skeleton-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: 'skeleton-run',
      frames: scene.anims.generateFrameNumbers('skeleton-run', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'skeleton-jump',
      frames: scene.anims.generateFrameNumbers('skeleton-jump', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'skeleton-fall',
      frames: scene.anims.generateFrameNumbers('skeleton-fall', { start: 0, end: 1 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'skeleton-attack',
      frames: scene.anims.generateFrameNumbers('skeleton-attack', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'skeleton-hurt',
      frames: scene.anims.generateFrameNumbers('skeleton-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
