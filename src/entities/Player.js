import Phaser from 'phaser';

const FRAME_W = 100;
const BODY_W = 22;
const BODY_H = 39;
const BODY_OFFSET_X = 41;
const BODY_OFFSET_Y = 19;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'atlas', 'hero-idle-1');

    // Store spawn point for respawn
    this.spawnX = x;
    this.spawnY = y;

    // State flags
    this.jumpingFlag = false;
    this.attackingFlag = false;
    this.droppingThrough = false;

    // Enable physics
    scene.physics.add.existing(this);
    this.body.setSize(BODY_W, BODY_H);
    this.body.setOffset(BODY_OFFSET_X, BODY_OFFSET_Y);
    this.body.setGravityY(800);

    // --- Animations ---
    scene.anims.create({
      key: 'idle',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-idle-',
        start: 1,
        end: 4,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'run',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-run-',
        start: 1,
        end: 6,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: 'jump',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-jump-',
        start: 1,
        end: 2,
      }),
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'fall',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-jump-',
        start: 3,
        end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'attack',
      frames: scene.anims.generateFrameNames('atlas', {
        prefix: 'hero-attack-',
        start: 1,
        end: 5,
      }),
      frameRate: 12,
      repeat: 0,
    });

    scene.anims.create({
      key: 'crouch',
      frames: [{ key: 'atlas', frame: 'hero-crouch' }],
      frameRate: 4,
      repeat: 0,
    });

    scene.anims.create({
      key: 'hurt',
      frames: [{ key: 'atlas', frame: 'hero-hurt' }],
      frameRate: 4,
      repeat: 0,
    });

    // Listen for attack animation complete
    this.on('animationcomplete-attack', () => {
      this.attackingFlag = false;
    });

    // --- Input ---
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Start idle
    this.play('idle');
  }

  faceLeft() {
    if (!this.flipX) {
      this.setFlipX(true);
      this.body.setOffset(FRAME_W - BODY_OFFSET_X - BODY_W, BODY_OFFSET_Y);
    }
  }

  faceRight() {
    if (this.flipX) {
      this.setFlipX(false);
      this.body.setOffset(BODY_OFFSET_X, BODY_OFFSET_Y);
    }
  }

  update() {
    const onFloor = this.body.onFloor();
    const vel = 150;

    // Spike death — respawn
    if (this.y > 200) {
      this.setPosition(this.spawnX, this.spawnY);
      this.body.setVelocity(0, 0);
      this.jumpingFlag = false;
      this.attackingFlag = false;
      return;
    }

    // Block movement during attack
    if (this.attackingFlag) {
      return;
    }

    // Reset jumping flag on landing
    if (onFloor) {
      this.jumpingFlag = false;
    }

    // --- Fall faster for heavier feel ---
    if (!onFloor && this.body.velocity.y > 0) {
      this.body.setGravityY(1200);
    } else {
      this.body.setGravityY(800);
    }

    // --- Variable jump height: release early = short hop ---
    if (this.jumpingFlag && !this.cursors.up.isDown && this.body.velocity.y < -50) {
      this.body.setVelocityY(this.body.velocity.y * 0.5);
    }

    // --- Falling animation ---
    if (this.jumpingFlag && this.body.velocity.y > 10) {
      this.play('fall', true);
    }

    // --- Ground movement (only when not jumping) ---
    if (!this.jumpingFlag) {
      if (this.cursors.left.isDown) {
        this.body.setVelocityX(-vel);
        this.play('run', true);
        this.faceLeft();
      } else if (this.cursors.right.isDown) {
        this.body.setVelocityX(vel);
        this.play('run', true);
        this.faceRight();
      } else {
        this.body.setVelocityX(0);
        if (this.cursors.down.isDown) {
          this.play('crouch', true);
        } else {
          this.play('idle', true);
        }
      }
    } else {
      // Allow air control while jumping
      if (this.cursors.left.isDown) {
        this.body.setVelocityX(-vel);
        this.faceLeft();
      } else if (this.cursors.right.isDown) {
        this.body.setVelocityX(vel);
        this.faceRight();
      } else {
        this.body.setVelocityX(0);
      }
    }

    // --- Drop through one-way platforms ---
    if (this.cursors.down.isDown && Phaser.Input.Keyboard.JustDown(this.keySpace) && onFloor) {
      this.droppingThrough = true;
      this.y += 2;
      this.scene.time.delayedCall(200, () => {
        this.droppingThrough = false;
      });
    }

    // --- Jump ---
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onFloor) {
      this.body.setVelocityY(-290);
      this.play('jump', true);
      this.jumpingFlag = true;
    }

    // --- Attack ---
    if (this.keyX.isDown && onFloor && !this.jumpingFlag) {
      this.body.setVelocityX(0);
      this.play('attack', true);
      this.attackingFlag = true;
    }
  }
}
