/**
 * ChunkGenerator — on-demand terrain and prop generator.
 *
 * Generates slopes and background props in fixed-width column chunks as the
 * player advances, instead of populating the entire map at scene start.
 *
 * ── CONSTRUCTOR ──────────────────────────────────────────────────────────────
 *
 *   new ChunkGenerator(scene, layers, tileConfig, chunkSize?, lookahead?)
 *
 *   layers:     { mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }
 *   tileConfig: { groundRow, capRow, flatCap, flat, asc, desc, backPool, frontPool }
 *
 *   chunkSize  (default CHUNK_SIZE)      — columns generated per advance
 *   lookahead  (default CHUNK_LOOKAHEAD) — cols ahead of player that trigger next chunk
 *
 * ── HOW TO INTEGRATE ────────────────────────────────────────────────────────
 *
 *   In Level.create(), after tilemap + terrainHeight setup:
 *
 *     this.generator = new ChunkGenerator(scene, {
 *       mainLayer, collisionLayer, backLayer, terrainHeight, mapCols,
 *     }, {
 *       groundRow, capRow, flatCap, flat, asc, desc, backPool, frontPool,
 *     });
 *     this.generator.bootstrap();
 *
 *   The Level base class calls advanceIfNeeded() each frame automatically.
 */
import {
  TILE_SIZE,
  TILE_SOLID,
  TILE_ONE_WAY,
  DEPTH,
  CHUNK_SIZE,
  CHUNK_LOOKAHEAD,
} from '../constants.js';

// ────────────────────────────────────────────────────────────────────────────

export default class ChunkGenerator {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }} layers
   * @param {{ groundRow, capRow, flatCap, flat, asc, desc, backPool, frontPool }} tileConfig
   * @param {number} [chunkSize]
   * @param {number} [lookahead]
   */
  constructor(scene, layers, tileConfig, chunkSize = CHUNK_SIZE, lookahead = CHUNK_LOOKAHEAD) {
    this.scene          = scene;
    this.mainLayer      = layers.mainLayer;
    this.collisionLayer = layers.collisionLayer;
    this.backLayer      = layers.backLayer;
    this.terrainHeight  = layers.terrainHeight;
    this.mapCols        = layers.mapCols;
    this.chunkSize      = chunkSize;
    this.lookahead      = lookahead;

    // Tile config — all level-specific values live here
    this.groundRow = tileConfig.groundRow;
    this.capRow    = tileConfig.capRow;
    this.flatCap   = tileConfig.flatCap;
    this.flat      = tileConfig.flat;
    this.asc       = tileConfig.asc;
    this.desc      = tileConfig.desc;
    this.backPool  = tileConfig.backPool;
    this.frontPool = tileConfig.frontPool;
    this.groundY   = tileConfig.capRow * TILE_SIZE;

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
      this.mainLayer.putTileAt(this.flatCap[ci], c, this.capRow);
      for (let i = 0; i < this.flat.length; i++) {
        this.mainLayer.putTileAt(this.flat[i][ci], c, this.groundRow + i);
      }
      this.collisionLayer.putTileAt(TILE_SOLID, c, this.groundRow).setCollision(true, true, true, true);
      if (this.flat.length > 1) {
        this.collisionLayer.putTileAt(TILE_SOLID, c, this.groundRow + 1).setCollision(true, true, true, true);
      }
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
      const key = this.backPool[Phaser.Math.Between(0, this.backPool.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextBackPropX + w / 2, this.groundY + 20, key)
        .setOrigin(0.5, 1).setDepth(DEPTH.PROPS_BACK);
      this.nextBackPropX += w + Phaser.Math.Between(20, 80);
    }

    while (this.nextFrontPropX < toX) {
      const key = this.frontPool[Phaser.Math.Between(0, this.frontPool.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextFrontPropX + w / 2, this.groundY + 35, key)
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
    const surfaceRow = this.groundRow - colHeight;
    this._placeVisual(col, colHeight, type, tileCol, this.mainLayer);
    this._placeCollision(col, surfaceRow);
    this._updateHeight(col, surfaceRow);
  }

  /** Place visual tiles for one column on the given layer. No physics side-effects. */
  _placeVisual(col, colHeight, type, tileCol, layer) {
    if (col < 0 || col >= this.mapCols) return;
    const surfaceRow = this.groundRow - colHeight;
    if (type === 'flat') {
      layer.putTileAt(this.flatCap[tileCol % 4], col, surfaceRow - 1);
      for (let r = surfaceRow; r < this.groundRow; r++) {
        const idx = Math.min(r - surfaceRow, this.flat.length - 1);
        layer.putTileAt(this.flat[idx][tileCol % 4], col, r);
      }
    } else {
      const tiles = type === 'ascending' ? this.asc : this.desc;
      for (let r = surfaceRow; r < this.groundRow; r++) {
        const idx = Math.min(r - surfaceRow, tiles.length - 1);
        layer.putTileAt(tiles[idx][tileCol % 2], col, r);
      }
    }
  }

  /** Place a one-way collision tile at surfaceRow for col. No visual side-effects. */
  _placeCollision(col, surfaceRow) {
    if (col < 0 || col >= this.mapCols) return;
    if (surfaceRow >= this.groundRow) return;
    // recalculateFaces=false: prevents Phaser's CalculateFacesAround from
    // disabling the faceTop of the solid ground tile directly below.
    const tile = this.collisionLayer.putTileAt(TILE_ONE_WAY, col, surfaceRow, false);
    tile.setCollision(false, false, true, false);
  }

  /** Update the terrain height map for col. No layer side-effects. */
  _updateHeight(col, surfaceRow) {
    this.terrainHeight.setMin(col, surfaceRow);
  }
}
