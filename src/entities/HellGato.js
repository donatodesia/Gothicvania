import Character from './Character.js';

export default class HellGato extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'atlas',
      defaultFrame: 'hell-gato-1',
      frameW:       96,
      bodyW:        28,
      bodyH:        26,
      bodyOffsetX:  34,
      bodyOffsetY:  24,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-hell-gato-attack', () => {
      this.attackingFlag = false;
    });

    this.play('hell-gato-idle');
  }

  animKey(action) {
    return 'hell-gato-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'hell-gato-idle',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 1, end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'hell-gato-run',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 1, end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'hell-gato-jump',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 1, end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'hell-gato-fall',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 3, end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'hell-gato-attack',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 1, end: 4,
      }),
      frameRate: 20,
      repeat: 0,
    });

    scene.anims.create({
      key: 'hell-gato-hurt',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hell-gato-', start: 1, end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });
  }
}
