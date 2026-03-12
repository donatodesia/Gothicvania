import HellGato from './HellGato.js';
import Enemy from './Enemy.js';

const PATROL_SPEED = 40;
const CHASE_SPEED  = 70;

/**
 * HellGatoEnemy — ground-based enemy that walks and chases on the X axis.
 *
 * Needs a collider registered by the spawner:
 *   scene.physics.add.collider(enemy.char, level.collisionLayer, null, callback);
 */
export default class HellGatoEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, new HellGato(scene, x, y), {
      health:         3,
      aggroRange:     90,
      attackRange:    22,
      patrolRange:    80,
      attackCooldown: 75,
      hurtDuration:   30,
    });
  }

  _tickPatrol() {
    const offset = this.char.x - this._originX;
    if (offset >  this.patrolRange) this._patrolDir = -1;
    if (offset < -this.patrolRange) this._patrolDir =  1;

    this.char.body.setVelocityX(this._patrolDir * PATROL_SPEED);

    if (this._patrolDir < 0) this.char.faceLeft();
    else                     this.char.faceRight();

    this.char.play(this.char.animKey('run'), true);
  }

  _tickChase(player) {
    const dir = player.character.x > this.char.x ? 1 : -1;

    this.char.body.setVelocityX(dir * CHASE_SPEED);

    if (dir < 0) this.char.faceLeft();
    else         this.char.faceRight();

    this.char.play(this.char.animKey('run'), true);
  }
}
