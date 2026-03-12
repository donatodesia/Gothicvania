import Phaser from 'phaser';
import { DEPTH } from '../constants.js';

export const STATE = Object.freeze({
  PATROL: 'patrol',
  CHASE:  'chase',
  ATTACK: 'attack',
  HURT:   'hurt',
  DEAD:   'dead',
});

/**
 * Enemy — AI controller that wraps a Character, mirroring the Player controller.
 *
 * State machine:  PATROL ↔ CHASE → ATTACK → CHASE
 *                                ↘ HURT → PATROL
 *                                         DEAD (terminal)
 *
 * Usage (in a scene):
 *   const enemy = new GhostEnemy(scene, x, y);
 *   // Ground enemies also need a collider:
 *   scene.physics.add.collider(enemy.char, level.collisionLayer, null, callback);
 *   // Each frame:
 *   enemy.update(player);
 *   // When the player's attack lands:
 *   enemy.takeDamage(1);
 */
export default class Enemy {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./Character.js').default} character  — already constructed Character instance
   * @param {object} [config]
   * @param {number} [config.health=3]
   * @param {number} [config.aggroRange=100]     px — patrol → chase trigger distance
   * @param {number} [config.attackRange=24]     px — chase → attack trigger distance
   * @param {number} [config.patrolRange=64]     px either side of spawn origin
   * @param {number} [config.attackCooldown=60]  frames between attacks
   * @param {number} [config.hurtDuration=30]    frames of stun after a hit
   */
  constructor(scene, character, config = {}) {
    this.scene  = scene;
    this.char   = character;

    this.health         = config.health         ?? 3;
    this.aggroRange     = config.aggroRange     ?? 100;
    this.attackRange    = config.attackRange    ?? 24;
    this.patrolRange    = config.patrolRange    ?? 64;
    this.attackCooldown = config.attackCooldown ?? 60;
    this.hurtDuration   = config.hurtDuration   ?? 30;

    this.state          = STATE.PATROL;
    this._originX       = character.x;
    this._patrolDir     = 1;
    this._hurtTimer     = 0;
    this._cooldownTimer = 0;

    scene.add.existing(character);
    character.setDepth(DEPTH.PLAYER);
  }

  // ── Public accessors ───────────────────────────────────────────────────────

  get x()      { return this.char.x; }
  get y()      { return this.char.y; }
  get active() { return this.state !== STATE.DEAD; }

  // ── Main tick — call once per frame ───────────────────────────────────────

  /** @param {import('./Player.js').default} player */
  update(player) {
    if (this.state === STATE.DEAD) return;

    if (this._cooldownTimer > 0) this._cooldownTimer--;

    // Attack animation finished → resume chasing
    if (this.state === STATE.ATTACK && !this.char.attackingFlag) {
      this._enterState(STATE.CHASE);
    }

    // Hurt stun countdown
    if (this.state === STATE.HURT) {
      if (--this._hurtTimer <= 0) this._enterState(STATE.PATROL);
      return;
    }

    if (this.state === STATE.ATTACK) return;

    this._checkTransitions(player);
    this._tickState(player);
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  takeDamage(amount = 1) {
    if (this.state === STATE.DEAD) return;
    this.health -= amount;
    if (this.health <= 0) this._die();
    else                  this._enterHurt();
  }

  destroy() {
    this.char.destroy();
  }

  // ── State machine (subclasses may override any of these) ──────────────────

  _enterState(state) {
    this.state = state;
  }

  _tickState(player) {
    if (this.state === STATE.PATROL) this._tickPatrol();
    if (this.state === STATE.CHASE)  this._tickChase(player);
  }

  _checkTransitions(player) {
    const dist = this._distTo(player);

    if (this.state === STATE.PATROL && dist <= this.aggroRange) {
      this._enterState(STATE.CHASE);
      return;
    }

    if (this.state === STATE.CHASE) {
      if (dist <= this.attackRange && this._cooldownTimer === 0) {
        this._enterAttack(player);
      } else if (dist > this.aggroRange * 1.5) {
        // Lost the player — reset patrol to current position
        this._originX = this.char.x;
        this._enterState(STATE.PATROL);
      }
    }
  }

  // Default patrol: walk back and forth around spawn origin at full MOVE_SPEED.
  // Subclasses should override to tune speed.
  _tickPatrol() {
    const offset = this.char.x - this._originX;
    if (offset >  this.patrolRange) this._patrolDir = -1;
    if (offset < -this.patrolRange) this._patrolDir =  1;
    this.char.run(this._patrolDir);
  }

  // Default chase: run toward player on X axis at full MOVE_SPEED.
  // Subclasses should override to tune speed or add Y axis movement.
  _tickChase(player) {
    const dir = player.character.x > this.char.x ? 1 : -1;
    this.char.run(dir);
  }

  _enterAttack(player) {  // eslint-disable-line no-unused-vars
    this._enterState(STATE.ATTACK);
    this._cooldownTimer = this.attackCooldown;
    this.char.stopMoving();
    this.char.attack();
  }

  _enterHurt() {
    this._enterState(STATE.HURT);
    this._hurtTimer = this.hurtDuration;
    this.char.stopMoving();
    if (this.scene.anims.exists(this.char.animKey('hurt'))) {
      this.char.play(this.char.animKey('hurt'), true);
    }
  }

  _die() {
    this._enterState(STATE.DEAD);
    this.char.body.setVelocity(0, 0);
    this.char.body.enable = false;
    this.char.destroy();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _distTo(player) {
    return Phaser.Math.Distance.Between(
      this.char.x, this.char.y,
      player.character.x, player.character.y,
    );
  }
}
