import Phaser from 'phaser';
import {
  GRAVITY_NORMAL,
  GRAVITY_FALL,
  MOVE_SPEED,
  JUMP_VELOCITY,
  JUMP_CUT_THRESHOLD,
  JUMP_CUT_FACTOR,
  FALL_ANIM_THRESHOLD,
  DROP_THROUGH_MS,
  DROP_THROUGH_NUDGE,
  DEATH_Y,
} from '../constants.js';

export default class Character extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.texture, config.defaultFrame);

    this.frameW      = config.frameW;
    this.bodyW       = config.bodyW;
    this.bodyH       = config.bodyH;
    this.bodyOffsetX = config.bodyOffsetX;
    this.bodyOffsetY = config.bodyOffsetY;

    // Spawn point
    this.spawnX = x;
    this.spawnY = y;

    // State
    this.jumpingFlag     = false;
    this.attackingFlag   = false;
    this.droppingThrough = false;

    // Physics
    scene.physics.add.existing(this);
    this.body.setSize(config.bodyW, config.bodyH);
    this.body.setOffset(config.bodyOffsetX, config.bodyOffsetY);
    this.body.setGravityY(GRAVITY_NORMAL);
  }

  /** Subclass must override — maps action name to animation key. */
  animKey(action) {
    throw new Error('Character subclass must override animKey()');
  }

  // ── Facing ───────────────────────────────────────────────────────────────

  faceLeft() {
    if (!this.flipX) {
      this.setFlipX(true);
      this.body.setOffset(this.frameW - this.bodyOffsetX - this.bodyW, this.bodyOffsetY);
    }
  }

  faceRight() {
    if (this.flipX) {
      this.setFlipX(false);
      this.body.setOffset(this.bodyOffsetX, this.bodyOffsetY);
    }
  }

  // ── Per-frame physics ────────────────────────────────────────────────────

  /** Call once per frame before any actions. Returns true if the frame
   *  should be skipped (death or attack lock). */
  updatePhysics() {
    // Death / respawn
    const deathY = this.scene.level?.deathY ?? DEATH_Y;
    if (this.y > deathY) {
      this.setPosition(this.spawnX, this.spawnY);
      this.body.setVelocity(0, 0);
      this.jumpingFlag   = false;
      this.attackingFlag = false;
      return true;
    }

    // Attack lock
    if (this.attackingFlag) return true;

    // Landing
    if (this.body.onFloor()) {
      this.jumpingFlag = false;
    }

    // Heavier fall gravity
    if (!this.body.onFloor() && this.body.velocity.y > 0) {
      this.body.setGravityY(GRAVITY_FALL);
    } else {
      this.body.setGravityY(GRAVITY_NORMAL);
    }

    // Fall animation
    if (this.jumpingFlag && this.body.velocity.y > FALL_ANIM_THRESHOLD) {
      this.play(this.animKey('fall'), true);
    }

    return false;
  }

  // ── Action methods (called by controllers) ───────────────────────────────

  run(direction) {
    this.body.setVelocityX(direction * MOVE_SPEED);
    if (direction < 0) this.faceLeft();
    else               this.faceRight();

    if (!this.jumpingFlag) {
      this.play(this.animKey('run'), true);
    }
  }

  stopMoving() {
    this.body.setVelocityX(0);
    if (!this.jumpingFlag) {
      this.play(this.animKey('idle'), true);
    }
  }

  crouch() {
    this.body.setVelocityX(0);
    if (!this.jumpingFlag) {
      if (this.scene.anims.exists(this.animKey('crouch'))) {
        this.play(this.animKey('crouch'), true);
      } else {
        this.play(this.animKey('idle'), true);
      }
    }
  }

  jump() {
    if (!this.body.onFloor() || this.jumpingFlag) return;
    this.body.setVelocityY(JUMP_VELOCITY);
    this.play(this.animKey('jump'), true);
    this.jumpingFlag = true;
  }

  /** Called on the frame the jump key is released while still ascending. */
  releaseJump() {
    if (this.jumpingFlag && this.body.velocity.y < JUMP_CUT_THRESHOLD) {
      this.body.setVelocityY(this.body.velocity.y * JUMP_CUT_FACTOR);
    }
  }

  attack() {
    if (!this.body.onFloor() || this.jumpingFlag) return;
    this.body.setVelocityX(0);
    this.play(this.animKey('attack'), true);
    this.attackingFlag = true;
  }

  dropThrough() {
    if (!this.body.onFloor()) return;
    this.droppingThrough = true;
    this.y += DROP_THROUGH_NUDGE;
    this.scene.time.delayedCall(DROP_THROUGH_MS, () => {
      this.droppingThrough = false;
    });
  }

  /** Park this character — clear all transient state. */
  reset() {
    this.body.setVelocity(0, 0);
    this.jumpingFlag     = false;
    this.attackingFlag   = false;
    this.droppingThrough = false;
    this.play(this.animKey('idle'));
  }
}
