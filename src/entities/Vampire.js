import Character from './Character.js';

export default class Vampire extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'vampire-idle',
      defaultFrame:  0,
      frameW:        55,
      bodyW:         14,
      bodyH:         38,
      bodyOffsetX:   20,
      bodyOffsetY:   20,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-vampire-attack', () => {
      this.attackingFlag = false;
    });

    this.play('vampire-idle');
  }

  animKey(action) {
    return 'vampire-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'vampire-idle',
      frames: scene.anims.generateFrameNumbers('vampire-idle', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: 'vampire-run',
      frames: scene.anims.generateFrameNumbers('vampire-walk', { start: 0, end: 4 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'vampire-jump',
      frames: scene.anims.generateFrameNumbers('vampire-jump', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'vampire-fall',
      frames: scene.anims.generateFrameNumbers('vampire-jump', { start: 3, end: 4 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'vampire-attack',
      frames: scene.anims.generateFrameNumbers('vampire-attack', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'vampire-hurt',
      frames: scene.anims.generateFrameNumbers('vampire-hurt', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: 0,
    });
  }
}
