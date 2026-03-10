import Character from './Character.js';

export default class Barbarian extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'barbarian-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         22,
      bodyH:         32,
      bodyOffsetX:   18,
      bodyOffsetY:   20,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-barbarian-attack', () => {
      this.attackingFlag = false;
    });

    this.play('barbarian-idle');
  }

  animKey(action) {
    return 'barbarian-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'barbarian-idle',
      frames: scene.anims.generateFrameNumbers('barbarian-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'barbarian-run',
      frames: scene.anims.generateFrameNumbers('barbarian-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'barbarian-jump',
      frames: scene.anims.generateFrameNumbers('barbarian-jump', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'barbarian-fall',
      frames: scene.anims.generateFrameNumbers('barbarian-fall', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'barbarian-attack',
      frames: scene.anims.generateFrameNumbers('barbarian-attack', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'barbarian-hurt',
      frames: scene.anims.generateFrameNumbers('barbarian-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
