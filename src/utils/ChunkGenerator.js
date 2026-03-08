/**
 * ChunkGenerator — on-demand terrain and prop generator.
 *
 * Generates slopes and background props in fixed-width column chunks as the
 * player advances, instead of populating the entire map at scene start.
 *
 * ── HOW TO INTEGRATE ────────────────────────────────────────────────────────
 *
 * 1. Import at the top of GameScene.js:
 *      import ChunkGenerator from '../utils/ChunkGenerator.js';
 *
 * 2. In GameScene.create(), AFTER tilemap + terrainHeight setup,
 *    INSTEAD OF calling generateSlopes / generateBackgroundSlopes / generateBackground:
 *
 *      this.chunkGen = new ChunkGenerator(this, {
 *        mainLayer:      this.mainLayer,
 *        collisionLayer: this.collisionLayer,
 *        backLayer:      this.backLayer,
 *        terrainHeight:  this.terrainHeight,
 *        mapCols:        this.mapCols,
 *      });
 *      this.chunkGen.bootstrap(); // fills the first chunk immediately
 *
 * 3. In GameScene.update(), add one line:
 *      const playerCol = Math.floor(this.player.body.center.x / TILE_SIZE);
 *      this.chunkGen.advanceIfNeeded(playerCol);
 *
 * ── CONSTRUCTOR OPTIONS ─────────────────────────────────────────────────────
 *   chunkSize  (default CHUNK_SIZE)      — columns generated per advance
 *   lookahead  (default CHUNK_LOOKAHEAD) — cols ahead of player that trigger the next chunk
 */
import {
  TILE_SIZE,
  GROUND_ROW,
  TILE_SOLID,
  TILE_ONE_WAY,
  ASC,
  DESC,
  FLAT,
  FLAT_CAP,
  BACK_POOL,
  FRONT_POOL,
  GROUND_Y,
  DEPTH,
  CHUNK_SIZE,
  CHUNK_LOOKAHEAD,
} from '../constants.js';

// ────────────────────────────────────────────────────────────────────────────

export default class ChunkGenerator {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }} opts
   * @param {number} [chunkSize]
   * @param {number} [lookahead]
   */
  constructor(scene, { mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }, chunkSize = CHUNK_SIZE, lookahead = CHUNK_LOOKAHEAD) {
    this.scene          = scene;
    this.mainLayer      = mainLayer;
    this.collisionLayer = collisionLayer;
    this.backLayer      = backLayer;
    this.terrainHeight  = terrainHeight;
    this.mapCols        = mapCols;
    this.chunkSize      = chunkSize;
    this.lookahead      = lookahead;

    // Generation frontier
    this.generatedUpTo = 0;

    // Carry state between chunks so terrain/props connect seamlessly
    this.nextSlopeCol   = Phaser.Math.Between(15, 30);
    this.nextBgSlopeCol = Phaser.Math.Between(5, 20);
    this.nextBackPropX  = Phaser.Math.Between(50, 180);
    this.nextFrontPropX = Phaser.Math.Between(20, 80);
  }

  /** Generate the first chunk immediately. Call once at the end of create(). */
  bootstrap() {
    this._generateChunk(0, this.chunkSize);
    this.generatedUpTo = Math.min(this.chunkSize, this.mapCols);
  }

  /**
   * Call every frame in update(). Triggers the next chunk when the player
   * is within `lookahead` columns of the current frontier.
   * @param {number} playerCol  Math.floor(player.body.center.x / TILE_SIZE)
   */
  advanceIfNeeded(playerCol) {
    if (this.generatedUpTo >= this.mapCols) return;
    if (playerCol >= this.generatedUpTo - this.lookahead) {
      const from = this.generatedUpTo;
      const to   = Math.min(from + this.chunkSize, this.mapCols);
      this._generateChunk(from, to);
      this.generatedUpTo = to;
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _generateChunk(fromCol, toCol) {
    this._fillBaseGround(fromCol, toCol);
    this._generateSlopes(toCol);
    this._generateBgSlopes(toCol);
    this._generateProps(toCol);
  }

  _fillBaseGround(fromCol, toCol) {
    for (let c = fromCol; c < toCol; c++) {
      const ci = c % 4;
      this.mainLayer.putTileAt(FLAT_CAP[ci], c, 11);
      this.mainLayer.putTileAt(FLAT[0][ci],  c, 12);
      this.mainLayer.putTileAt(FLAT[1][ci],  c, 13);
      this.collisionLayer.putTileAt(TILE_SOLID, c, 12).setCollision(true, true, true, true);
      this.collisionLayer.putTileAt(TILE_SOLID, c, 13).setCollision(true, true, true, true);
    }
  }

  _generateSlopes(toCol) {
    while (this.nextSlopeCol < toCol - 20) {
      const col    = this.nextSlopeCol;
      const height = Phaser.Math.Between(2, 3);
      const flat   = Phaser.Math.Between(3, 7);

      for (let i = 0; i < height; i++) {
        this._placeStep(col + i * 2,     i + 1, 'ascending',  0);
        this._placeStep(col + i * 2 + 1, i + 1, 'ascending',  1);
      }

      const flatStart = col + height * 2;
      for (let i = 0; i < flat; i++) {
        this._placeStep(flatStart + i, height, 'flat', i);
      }

      const descStart = flatStart + flat;
      for (let i = 0; i < height; i++) {
        this._placeStep(descStart + i * 2,     height - i, 'descending', 0);
        this._placeStep(descStart + i * 2 + 1, height - i, 'descending', 1);
      }

      this.nextSlopeCol = col + height * 4 + flat + Phaser.Math.Between(5, 20);
    }
  }

  _generateBgSlopes(toCol) {
    while (this.nextBgSlopeCol < toCol - 15) {
      const col    = this.nextBgSlopeCol;
      const height = Phaser.Math.Between(1, 2);
      const flat   = Phaser.Math.Between(4, 10);

      for (let i = 0; i < height; i++) {
        this._placeVisual(col + i * 2,     i + 1, 'ascending',  0, this.backLayer);
        this._placeVisual(col + i * 2 + 1, i + 1, 'ascending',  1, this.backLayer);
      }

      const flatStart = col + height * 2;
      for (let i = 0; i < flat; i++) {
        this._placeVisual(flatStart + i, height, 'flat', i, this.backLayer);
      }

      const descStart = flatStart + flat;
      for (let i = 0; i < height; i++) {
        this._placeVisual(descStart + i * 2,     height - i, 'descending', 0, this.backLayer);
        this._placeVisual(descStart + i * 2 + 1, height - i, 'descending', 1, this.backLayer);
      }

      this.nextBgSlopeCol = col + height * 4 + flat + Phaser.Math.Between(8, 25);
    }
  }

  _generateProps(toCol) {
    const toX = toCol * TILE_SIZE;

    while (this.nextBackPropX < toX) {
      const key = BACK_POOL[Phaser.Math.Between(0, BACK_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextBackPropX + w / 2, GROUND_Y + 20, key)
        .setOrigin(0.5, 1).setDepth(DEPTH.PROPS_BACK);
      this.nextBackPropX += w + Phaser.Math.Between(20, 80);
    }

    while (this.nextFrontPropX < toX) {
      const key = FRONT_POOL[Phaser.Math.Between(0, FRONT_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextFrontPropX + w / 2, GROUND_Y + 35, key)
        .setOrigin(0.5, 1).setDepth(DEPTH.PROPS_FRONT);
      this.nextFrontPropX += w + Phaser.Math.Between(20, 80);
    }
  }

  /**
   * Orchestrator for a main-layer column: places visual tiles, collision tile,
   * and updates terrain height. Use _placeVisual directly for background layers.
   */
  _placeStep(col, colHeight, type, tileCol) {
    if (col < 0 || col >= this.mapCols) return;
    const surfaceRow = GROUND_ROW - colHeight;
    this._placeVisual(col, colHeight, type, tileCol, this.mainLayer);
    this._placeCollision(col, surfaceRow);
    this._updateHeight(col, surfaceRow);
  }

  /** Place visual tiles for one column on the given layer. No physics side-effects. */
  _placeVisual(col, colHeight, type, tileCol, layer) {
    if (col < 0 || col >= this.mapCols) return;
    const surfaceRow = GROUND_ROW - colHeight;
    if (type === 'flat') {
      layer.putTileAt(FLAT_CAP[tileCol % 4], col, surfaceRow - 1);
      for (let r = surfaceRow; r < GROUND_ROW; r++) {
        const idx = Math.min(r - surfaceRow, FLAT.length - 1);
        layer.putTileAt(FLAT[idx][tileCol % 4], col, r);
      }
    } else {
      const tiles = type === 'ascending' ? ASC : DESC;
      for (let r = surfaceRow; r < GROUND_ROW; r++) {
        const idx = Math.min(r - surfaceRow, tiles.length - 1);
        layer.putTileAt(tiles[idx][tileCol % 2], col, r);
      }
    }
  }

  /** Place a one-way collision tile at surfaceRow for col. No visual side-effects. */
  _placeCollision(col, surfaceRow) {
    if (col < 0 || col >= this.mapCols) return;
    if (surfaceRow >= GROUND_ROW) return;
    const tile = this.collisionLayer.putTileAt(TILE_ONE_WAY, col, surfaceRow);
    tile.setCollision(false, false, true, false);
  }

  /** Update the terrain height map for col. No layer side-effects. */
  _updateHeight(col, surfaceRow) {
    this.terrainHeight.setMin(col, surfaceRow);
  }
}
