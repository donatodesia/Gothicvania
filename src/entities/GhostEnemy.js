import Ghost from './Ghost.js';
import Enemy, { STATE } from './Enemy.js';

const PATROL_SPEED = 30;
const CHASE_SPEED  = 55;

/**
 * GhostEnemy — floats in 2D toward the player.
 * No gravity, no collider needed.
 */
export default class GhostEnemy extends Enemy {
  constructor(scene, x, y) {
    const char = new Ghost(scene, x, y);
    char.body.setAllowGravity(false);

    super(scene, char, {
      health:         2,
      aggroRange:     110,
      attackRange:    18,
      patrolRange:    60,
      attackCooldown: 90,
      hurtDuration:   20,
    });
  }

  // Float horizontally — stay at spawn Y during patrol
  _tickPatrol() {
    const offset = this.char.x - this._originX;
    if (offset >  this.patrolRange) this._patrolDir = -1;
    if (offset < -this.patrolRange) this._patrolDir =  1;

    this.char.body.setVelocityX(this._patrolDir * PATROL_SPEED);
    this.char.body.setVelocityY(0);

    if (this._patrolDir < 0) this.char.faceLeft();
    else                     this.char.faceRight();

    this.char.play(this.char.animKey('idle'), true);
  }

  // Float in 2D toward the player
  _tickChase(player) {
    const dx   = player.character.x - this.char.x;
    const dy   = player.character.y - this.char.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    this.char.body.setVelocityX((dx / dist) * CHASE_SPEED);
    this.char.body.setVelocityY((dy / dist) * CHASE_SPEED);

    if (dx < 0) this.char.faceLeft();
    else        this.char.faceRight();

    this.char.play(this.char.animKey('run'), true);
  }

  // Ghost.attack() already handles floating — just zero velocity first
  _enterAttack(player) {  // eslint-disable-line no-unused-vars
    this._enterState(STATE.ATTACK);
    this._cooldownTimer = this.attackCooldown;
    this.char.body.setVelocity(0, 0);
    this.char.attack(); // Ghost override: no floor check
  }
}
