import Character from './Character.js';

export default class FlyingEye extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'flyingeye-idle',
      defaultFrame:  0,
      frameW:        60,
      bodyW:         10,
      bodyH:         20,
      bodyOffsetX:   25,
      bodyOffsetY:   17,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-flyingeye-attack', () => {
      this.attackingFlag = false;
    });

    this.play('flyingeye-idle');
  }

  animKey(action) {
    return 'flyingeye-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'flyingeye-idle',
      frames: scene.anims.generateFrameNumbers('flyingeye-idle', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'flyingeye-run',
      frames: scene.anims.generateFrameNumbers('flyingeye-run', { start: 0, end: 7 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'flyingeye-jump',
      frames: scene.anims.generateFrameNumbers('flyingeye-jump', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'flyingeye-fall',
      frames: scene.anims.generateFrameNumbers('flyingeye-fall', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'flyingeye-attack',
      frames: scene.anims.generateFrameNumbers('flyingeye-attack', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: 'flyingeye-hurt',
      frames: scene.anims.generateFrameNumbers('flyingeye-hurt', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    });
  }
}
