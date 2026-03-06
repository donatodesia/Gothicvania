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
 *      const playerCol = Math.floor(this.player.body.center.x / 16);
 *      this.chunkGen.advanceIfNeeded(playerCol);
 *
 * ── CONSTRUCTOR OPTIONS ─────────────────────────────────────────────────────
 *   chunkSize  (default 300) — columns generated per advance
 *   lookahead  (default 50)  — cols ahead of player that trigger the next chunk
 */

// ── Tile data (mirrors GameScene.placeStep constants) ───────────────────────
const GROUND_ROW = 12;

const ASC      = [[114, 115], [142, 143], [170, 171]];
const DESC     = [[124, 125], [152, 153], [180, 181]];
const FLAT     = [[117,118,119,120], [145,146,147,148], [171,171,180,180]];
const FLAT_CAP = [89, 90, 91, 92];

// ── Prop pools (mirror GameScene.generateBackground) ────────────────────────
const BACK_POOL = [
  'tree-1', 'tree-2', 'tree-3',
  'statue',
  'bush-large',
  'stone-1', 'stone-1',
  'stone-2', 'stone-2',
  'stone-3', 'stone-4',
];

const FRONT_POOL = [
  'tree-1', 'tree-2',
  'statue',
  'bush-large',
  'stone-1', 'stone-1',
  'stone-2', 'stone-2',
  'stone-3', 'stone-4',
];

const GROUND_Y = 11 * 16; // 176px — top edge of ground tiles

// ── Depth values (match GameScene DEPTH constants) ───────────────────────────
const DEPTH_PROPS_BACK  = 1;
const DEPTH_PROPS_FRONT = 4;

// ────────────────────────────────────────────────────────────────────────────

export default class ChunkGenerator {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }} opts
   * @param {number} [chunkSize=300]
   * @param {number} [lookahead=50]
   */
  constructor(scene, { mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }, chunkSize = 300, lookahead = 50) {
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
   * @param {number} playerCol  Math.floor(player.body.center.x / 16)
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
      this.collisionLayer.putTileAt(1, c, 12).setCollision(true, true, true, true);
      this.collisionLayer.putTileAt(1, c, 13).setCollision(true, true, true, true);
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
        this._placeStep(col + i * 2,     i + 1, 'ascending',  0, this.backLayer);
        this._placeStep(col + i * 2 + 1, i + 1, 'ascending',  1, this.backLayer);
      }

      const flatStart = col + height * 2;
      for (let i = 0; i < flat; i++) {
        this._placeStep(flatStart + i, height, 'flat', i, this.backLayer);
      }

      const descStart = flatStart + flat;
      for (let i = 0; i < height; i++) {
        this._placeStep(descStart + i * 2,     height - i, 'descending', 0, this.backLayer);
        this._placeStep(descStart + i * 2 + 1, height - i, 'descending', 1, this.backLayer);
      }

      this.nextBgSlopeCol = col + height * 4 + flat + Phaser.Math.Between(8, 25);
    }
  }

  _generateProps(toCol) {
    const toX = toCol * 16;

    while (this.nextBackPropX < toX) {
      const key = BACK_POOL[Phaser.Math.Between(0, BACK_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextBackPropX + w / 2, GROUND_Y + 20, key)
        .setOrigin(0.5, 1).setDepth(DEPTH_PROPS_BACK);
      this.nextBackPropX += w + Phaser.Math.Between(20, 80);
    }

    while (this.nextFrontPropX < toX) {
      const key = FRONT_POOL[Phaser.Math.Between(0, FRONT_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(this.nextFrontPropX + w / 2, GROUND_Y + 35, key)
        .setOrigin(0.5, 1).setDepth(DEPTH_PROPS_FRONT);
      this.nextFrontPropX += w + Phaser.Math.Between(20, 80);
    }
  }

  _placeStep(col, colHeight, type, tileCol, layer) {
    if (col < 0 || col >= this.mapCols) return;

    const targetLayer = layer || this.mainLayer;
    const surfaceRow  = GROUND_ROW - colHeight;

    if (type === 'flat') {
      targetLayer.putTileAt(FLAT_CAP[tileCol % 4], col, surfaceRow - 1);
      for (let r = surfaceRow; r < GROUND_ROW; r++) {
        const idx = Math.min(r - surfaceRow, FLAT.length - 1);
        targetLayer.putTileAt(FLAT[idx][tileCol % 4], col, r);
      }
    } else {
      const tiles = type === 'ascending' ? ASC : DESC;
      for (let r = surfaceRow; r < GROUND_ROW; r++) {
        const idx = Math.min(r - surfaceRow, tiles.length - 1);
        targetLayer.putTileAt(tiles[idx][tileCol % 2], col, r);
      }
    }

    if (targetLayer === this.mainLayer) {
      if (surfaceRow < this.terrainHeight[col]) {
        this.terrainHeight[col] = surfaceRow;
      }
      if (surfaceRow < GROUND_ROW) {
        const tile = this.collisionLayer.putTileAt(2, col, surfaceRow);
        tile.setCollision(false, false, true, false);
      }
    }
  }
}
