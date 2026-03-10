import Character from './Character.js';

export default class Mushroom extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'mushroom-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         20,
      bodyOffsetX:   24,
      bodyOffsetY:   21,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-mushroom-attack', () => {
      this.attackingFlag = false;
    });

    this.play('mushroom-idle');
  }

  animKey(action) {
    return 'mushroom-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'mushroom-idle',
      frames: scene.anims.generateFrameNumbers('mushroom-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: 'mushroom-run',
      frames: scene.anims.generateFrameNumbers('mushroom-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'mushroom-jump',
      frames: scene.anims.generateFrameNumbers('mushroom-jump', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'mushroom-fall',
      frames: scene.anims.generateFrameNumbers('mushroom-fall', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'mushroom-attack',
      frames: scene.anims.generateFrameNumbers('mushroom-attack', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'mushroom-hurt',
      frames: scene.anims.generateFrameNumbers('mushroom-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
