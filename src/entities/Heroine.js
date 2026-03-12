import Character from './Character.js';

export default class Heroine extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, {
      texture:      'heroine-idle',
      defaultFrame:  0,
      frameW:        128,
      bodyW:         24,
      bodyH:         43,
      bodyOffsetX:   47,
      bodyOffsetY:   52,
    });

    this._crouching         = false;
    this._crouchRecovering  = false;

    this.createAnimations(scene);

    this.on('animationcomplete-heroine-attack',      () => { this.attackingFlag = false; });
    this.on('animationcomplete-heroine-jump-attack', () => { this.attackingFlag = false; });
    this.on('animationcomplete-heroine-crouch-attack', () => {
      this.attackingFlag     = false;
      this._crouchRecovering = true;   // block idle for the recovery frame
      if (this._crouching) this.play(this.animKey('crouch'));
    });

    this.play('heroine-idle');
  }

  // Play the crouch animation once and hold the last frame while Down is held
  crouch() {
    this.body.setVelocityX(0);
    if (this.jumpingFlag) return;
    this._crouching        = true;
    this._crouchRecovering = false;
    if (this.anims.currentAnim?.key !== this.animKey('crouch')) {
      this.play(this.animKey('crouch'));
    }
  }

  stopMoving() {
    if (this._crouchRecovering) {
      // Recovery frame after crouch-attack: absorb the stopMoving call,
      // let crouch() take over on the next frame when down is still held.
      this._crouchRecovering = false;
      this.body.setVelocityX(0);
      return;
    }
    this._crouching = false;
    super.stopMoving();
  }

  run(direction) {
    this._crouching        = false;
    this._crouchRecovering = false;
    super.run(direction);
  }

  // Dispatch to the right attack based on current state
  attack() {
    if (this.attackingFlag) return;

    if (this.jumpingFlag || !this.body.onFloor()) {
      // In the air — jump attack (keeps X momentum)
      this.play(this.animKey('jump-attack'), true);
      this.attackingFlag = true;
      return;
    }

    if (this.anims.currentAnim?.key === this.animKey('crouch')) {
      // Crouching on ground — crouch attack
      this.play(this.animKey('crouch-attack'), true);
      this.attackingFlag = true;
      return;
    }

    super.attack();
  }

  animKey(action) {
    return 'heroine-' + action;
  }

  createAnimations(scene) {
    scene.anims.create({
      key: 'heroine-idle',
      frames: scene.anims.generateFrameNumbers('heroine-idle', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'heroine-run',
      frames: scene.anims.generateFrameNumbers('heroine-run', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: 'heroine-jump',
      frames: scene.anims.generateFrameNumbers('heroine-jump', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: 0,
    });

    scene.anims.create({
      key: 'heroine-fall',
      frames: scene.anims.generateFrameNumbers('heroine-fall', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'heroine-attack',
      frames: scene.anims.generateFrameNumbers('heroine-attack', { start: 0, end: 7 }),
      frameRate: 14,
      repeat: 0,
    });

    scene.anims.create({
      key: 'heroine-crouch',
      frames: scene.anims.generateFrameNumbers('heroine-crouch', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: 0,
    });

    scene.anims.create({
      key: 'heroine-hurt',
      frames: scene.anims.generateFrameNumbers('heroine-hurt', { start: 0, end: 0 }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'heroine-crouch-attack',
      frames: scene.anims.generateFrameNumbers('heroine-crouch-attack', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: 0,
    });

    scene.anims.create({
      key: 'heroine-jump-attack',
      frames: scene.anims.generateFrameNumbers('heroine-jump-attack', { start: 0, end: 4 }),
      frameRate: 14,
      repeat: 0,
    });
  }
}
