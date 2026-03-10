import { TILE_SIZE, DEATH_Y } from '../constants.js';

/**
 * Level — base class for all game levels.
 *
 * Mirrors the Character / Player pattern:
 *   Level (base)    ←→  Character (base)
 *   CemeteryLevel   ←→  Warrior, Vampire, …
 *   GameScene       ←→  Player (controller / runner)
 *
 * A Level owns: tilemap, terrain generation, backgrounds, parallax scrolling.
 * GameScene owns: characters, the player controller, colliders, input.
 */
export default class Level {
  constructor(scene) {
    this.scene = scene;

    // Populated by subclass create() — consumed by GameScene
    this.mainLayer      = null;
    this.collisionLayer = null;
    this.backLayer      = null;
    this.terrainHeight  = null;
    this.generator      = null;
    this.mapCols        = 0;
    this.mapWidthPx     = 0;
    this.mapHeightPx    = 0;
  }

  /**
   * Override in subclass.
   * Called from BootScene.preload() to register all assets for this level.
   * @param {Phaser.Scene} scene  The BootScene (or any scene in preload phase)
   */
  static preload(scene) {}

  /**
   * Override in subclass.
   * Build the world: backgrounds, tilemap, terrain generator.
   * Must populate mainLayer, collisionLayer, backLayer,
   * terrainHeight, generator, mapCols, mapWidthPx, mapHeightPx.
   */
  create() {
    throw new Error(`${this.constructor.name} must override create()`);
  }

  /**
   * Called every frame from GameScene.update().
   * Base implementation advances the chunk generator.
   * Subclasses should call super.update(character) then add parallax / effects.
   * @param {Character} character  The currently active character
   */
  update(character) {
    if (this.generator) {
      this.generator.advanceIfNeeded(
        Math.floor(character.body.center.x / TILE_SIZE)
      );
    }
  }

  /**
   * Pixel-space spawn coordinates for the player.
   * Override in subclass.
   * @returns {{ x: number, y: number }}
   */
  get spawnPoint() {
    throw new Error(`${this.constructor.name} must override spawnPoint`);
  }

  /**
   * Y pixel threshold below which a character is considered dead (fell off map).
   * Override in subclass when the map is taller than the default Cemetery layout.
   * @returns {number}
   */
  get deathY() {
    return DEATH_Y;
  }

  /**
   * Tile row index of the base ground surface (used by GameScene step-up).
   * Override in subclass to match the level's map geometry.
   * @returns {number}
   */
  get groundRow() {
    throw new Error(`${this.constructor.name} must override groundRow`);
  }
}
