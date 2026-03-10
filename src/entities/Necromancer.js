import Character from './Character.js';

export default class Necromancer extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'necromancer-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         24,
      bodyOffsetX:   27,
      bodyOffsetY:   17,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-necromancer-attack', () => {
      this.attackingFlag = false;
    });

    this.play('necromancer-idle');
  }

  animKey(action) {
    return 'necromancer-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'necromancer-idle',
      frames: scene.anims.generateFrameNumbers('necromancer-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'necromancer-run',
      frames: scene.anims.generateFrameNumbers('necromancer-run', { start: 0, end: 9 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'necromancer-jump',
      frames: scene.anims.generateFrameNumbers('necromancer-jump', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'necromancer-fall',
      frames: scene.anims.generateFrameNumbers('necromancer-fall', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'necromancer-attack',
      frames: scene.anims.generateFrameNumbers('necromancer-attack', { start: 0, end: 11 }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'necromancer-hurt',
      frames: scene.anims.generateFrameNumbers('necromancer-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
