/**
 * StaticGenerator — generates all terrain and props at once during bootstrap.
 *
 * Shares the same interface as ChunkGenerator so GameScene can swap between
 * them with a single flag. advanceIfNeeded() is a no-op here.
 */

// ── Tile data ────────────────────────────────────────────────────────────────
const GROUND_ROW = 12;

const ASC      = [[114, 115], [142, 143], [170, 171]];
const DESC     = [[124, 125], [152, 153], [180, 181]];
const FLAT     = [[117,118,119,120], [145,146,147,148], [171,171,180,180]];
const FLAT_CAP = [89, 90, 91, 92];

// ── Prop pools ───────────────────────────────────────────────────────────────
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

const GROUND_Y          = 11 * 16;
const DEPTH_PROPS_BACK  = 1;
const DEPTH_PROPS_FRONT = 4;

// ────────────────────────────────────────────────────────────────────────────

export default class StaticGenerator {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }} opts
   */
  constructor(scene, { mainLayer, collisionLayer, backLayer, terrainHeight, mapCols }) {
    this.scene          = scene;
    this.mainLayer      = mainLayer;
    this.collisionLayer = collisionLayer;
    this.backLayer      = backLayer;
    this.terrainHeight  = terrainHeight;
    this.mapCols        = mapCols;
  }

  /** Generate everything immediately. */
  bootstrap() {
    this._fillBaseGround(0, this.mapCols);
    this._generateSlopes();
    this._generateBgSlopes();
    this._generateProps();
  }

  /** No-op — everything was generated at bootstrap. */
  advanceIfNeeded(_playerCol) {}

  // ── Private ───────────────────────────────────────────────────────────────

  // Lay the flat base ground for every column in [fromCol, toCol).
  // Must run before slope generation so slopes can overwrite as needed.
  // putTileAt does not inherit the layer's setCollision config, so collision
  // is set explicitly on each new collision tile.
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

  _generateSlopes() {
    let col = Phaser.Math.Between(15, 30);
    while (col < this.mapCols - 20) {
      const height = Phaser.Math.Between(2, 3);
      const flat   = Phaser.Math.Between(3, 7);

      for (let i = 0; i < height; i++) {
        this._placeStep(col + i * 2,     i + 1, 'ascending', 0);
        this._placeStep(col + i * 2 + 1, i + 1, 'ascending', 1);
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

      col += height * 4 + flat + Phaser.Math.Between(5, 20);
    }
  }

  _generateBgSlopes() {
    let col = Phaser.Math.Between(5, 20);
    while (col < this.mapCols - 15) {
      const height = Phaser.Math.Between(1, 2);
      const flat   = Phaser.Math.Between(4, 10);

      for (let i = 0; i < height; i++) {
        this._placeStep(col + i * 2,     i + 1, 'ascending', 0, this.backLayer);
        this._placeStep(col + i * 2 + 1, i + 1, 'ascending', 1, this.backLayer);
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

      col += height * 4 + flat + Phaser.Math.Between(8, 25);
    }
  }

  _generateProps() {
    const MAP_W = this.mapCols * 16;

    // PROPS_BACK — behind ground tiles, bases embedded 20px
    let x = Phaser.Math.Between(50, 180);
    while (x < MAP_W - 50) {
      const key = BACK_POOL[Phaser.Math.Between(0, BACK_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(x + w / 2, GROUND_Y + 20, key).setOrigin(0.5, 1).setDepth(DEPTH_PROPS_BACK);
      x += w + Phaser.Math.Between(20, 80);
    }

    // PROPS_FRONT — in front of the player, bases 35px below ground edge
    x = Phaser.Math.Between(20, 80);
    while (x < MAP_W - 20) {
      const key = FRONT_POOL[Phaser.Math.Between(0, FRONT_POOL.length - 1)];
      const w   = this.scene.textures.getFrame(key).realWidth;
      this.scene.add.image(x + w / 2, GROUND_Y + 35, key).setOrigin(0.5, 1).setDepth(DEPTH_PROPS_FRONT);
      x += w + Phaser.Math.Between(20, 80);
    }
  }

  // Tileset row correlation (same map row must use same tileset row):
  //   visual cap (flat only) : [null,null, 89,90,91,92, null,null]
  //   surface row            : [114,115,  117,118,119,120, 124,125]
  //   fill row 1             : [142,143,  145,146,147,148, 152,153]
  //   fill row 2             : [170,171,  171,171,180,180, 180,181]
  //
  // colHeight: how many tile rows this column fills above the ground row
  // tileCol:   0 or 1 for ASC/DESC, 0-3 for FLAT (cycles within tile width)
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
