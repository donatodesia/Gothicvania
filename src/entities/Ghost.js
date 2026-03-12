import Character from './Character.js';

export default class Ghost extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'atlas',
      defaultFrame: 'ghost-halo-1',
      frameW:       37,
      bodyW:        20,
      bodyH:        30,
      bodyOffsetX:  8,
      bodyOffsetY:  17,
    });

    this.createAnimations(scene);

    this.on('animationcomplete-ghost-attack', () => {
      this.attackingFlag = false;
    });

    this.play('ghost-idle');
  }

  // Ghost floats — stop both axes and don't gate on jumpingFlag
  stopMoving() {
    this.body.setVelocity(0, 0);
    this.play(this.animKey('idle'), true);
  }

  // Ghost floats — attack doesn't require being on the floor
  attack() {
    if (this.attackingFlag) return;
    this.body.setVelocity(0, 0);
    this.play(this.animKey('attack'), true);
    this.attackingFlag = true;
  }

  animKey(action) {
    return 'ghost-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'ghost-idle',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 1, end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'ghost-run',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 1, end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'ghost-jump',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 1, end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'ghost-fall',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 3, end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'ghost-attack',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 1, end: 4,
      }),
      frameRate: 20,
      repeat: 0,
    });

    scene.anims.create({
      key: 'ghost-hurt',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'ghost-halo-', start: 1, end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });
  }
}
