import Character from './Character.js';

export default class Goblin extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'goblin-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         20,
      bodyOffsetX:   24,
      bodyOffsetY:   21,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-goblin-attack', () => {
      this.attackingFlag = false;
    });

    this.play('goblin-idle');
  }

  animKey(action) {
    return 'goblin-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'goblin-idle',
      frames: scene.anims.generateFrameNumbers('goblin-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    scene.anims.create({
      key: 'goblin-run',
      frames: scene.anims.generateFrameNumbers('goblin-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'goblin-jump',
      frames: scene.anims.generateFrameNumbers('goblin-jump', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'goblin-fall',
      frames: scene.anims.generateFrameNumbers('goblin-fall', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'goblin-attack',
      frames: scene.anims.generateFrameNumbers('goblin-attack', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'goblin-hurt',
      frames: scene.anims.generateFrameNumbers('goblin-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
