import Character from './Character.js';

export default class Warrior extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:     'atlas',
      defaultFrame: 'hero-idle-1',
      frameW:       100,
      bodyW:        22,
      bodyH:        39,
      bodyOffsetX:  41,
      bodyOffsetY:  23,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-warrior-attack', () => {
      this.attackingFlag = false;
    });

    this.play('warrior-idle');
  }

  animKey(action) {
    return 'warrior-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'warrior-idle',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-idle-', start: 1, end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'warrior-run',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-run-', start: 1, end: 6,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'warrior-jump',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-jump-', start: 1, end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'warrior-fall',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-jump-', start: 3, end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'warrior-attack',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-attack-', start: 1, end: 5,
      }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'warrior-crouch',
      frames: [{ key: 'atlas', frame: 'hero-crouch' }],
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'warrior-hurt',
      frames: [{ key: 'atlas', frame: 'hero-hurt' }],
      frameRate: 4,
      repeat: 0,
    });
  }
}
