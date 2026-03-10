import ChunkGenerator from './ChunkGenerator.js';
import { TILE_SIZE, DEPTH } from '../constants.js';

// ── Town tileset geometry ──────────────────────────────────────────────────
// Tileset: 37 cols × 12 rows = 444 tiles, 16×16px, firstgid = 1
// ID formula: row * 37 + col + 1  (0-indexed row/col)
//
// Ground tiles occupy column 20 of rows 8–10:
//   Row 8  (cap):     317  — confirmed flat ground cap from map
//   Row 9  (fill 1):  354  — confirmed underground fill
//   Row 10 (fill 2):  391  — confirmed deep underground
// ─────────────────────────────────────────────────────────────────────────

const GROUND_ROW = 15;
const CAP_ROW    = 14;

const TOWN_FLAT_CAP = [316, 317, 316, 317];

const TOWN_FLAT = [
  [353, 354, 353, 354],  // road continues one row lower — wider road impression
  [390, 391, 390, 391],
];

// Slopes are not used in Town — _generateSlopes is fully overridden.
// These dummy values satisfy the base constructor signature.
const TOWN_ASC  = [[317, 317], [354, 354]];
const TOWN_DESC = [[317, 317], [354, 354]];

// Both platform types use crate-stack (2 tiles tall = 32px).
// H2 stacks a second crate-stack on top of the inner columns for height=4.
const CRATE_STACK = 'town-crate-stack';

// Back props: buildings as backdrop, small items as foreground
const TOWN_BACK_POOL = [
  'town-house-a', 'town-house-a',
  'town-house-b', 'town-house-b',
  'town-house-c', 'town-house-c',
  'town-church',
  'town-lamp',    'town-well',
  'town-wagon',
];

const TOWN_FRONT_POOL = [
  'town-crate',  'town-barrel',
  'town-lamp',  'town-wagon',
];

/**
 * TownGenerator — ChunkGenerator preset for the Gothicvania Town tileset.
 *
 * Elevated platforms are rendered as stacked barrels/crates (prop images)
 * instead of tile art. Collision and terrain height are still tile-based.
 * Background tile slopes are suppressed — town uses parallax images instead.
 */
export default class TownGenerator extends ChunkGenerator {
  constructor(scene, layers, chunkSize, lookahead) {
    super(
      scene,
      layers,
      {
        groundRow: GROUND_ROW,
        capRow:    CAP_ROW,
        flatCap:   TOWN_FLAT_CAP,
        flat:      TOWN_FLAT,
        asc:       TOWN_ASC,
        desc:      TOWN_DESC,
        backPool:  TOWN_BACK_POOL,
        frontPool: TOWN_FRONT_POOL,
      },
      chunkSize,
      lookahead
    );
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  /** Delegates each platform slot to _buildCrateStack. */
  _generateSlopes(toCol) {
    while (this.nextSlopeCol < toCol - 20) {
      const wide = this._buildCrateStack(this.nextSlopeCol);
      this.nextSlopeCol += wide + Phaser.Math.Between(30, 55);
    }
  }

  /** Suppressed — town uses parallax background images, not tile-based bg slopes. */
  _generateBgSlopes(toCol) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Builds one randomised crate-stack structure starting at startCol.
   *
   * Image dimensions are read at runtime so tile coverage is always accurate.
   *
   * Floors (vertical):  1 – weight 6 (60 %) | 2 – weight 3 (30 %) | 3 – weight 1 (10 %)
   * Width  (horizontal): 1–3 stacks, uniform.
   *
   * Collision:
   *   Top surface  → one-way (player can jump up and land).
   *   Body below   → TILE_SOLID on every row from top+1 down to groundRow−1,
   *                  blocking horizontal passage through the structure.
   *
   * Visuals:
   *   One image per floor per horizontal stack, placed sequentially with no
   *   overlap (each stack starts exactly where the previous one ends).
   *
   * @param  {number} startCol
   * @returns {number} tile columns consumed (used for gap spacing)
   */
  _buildCrateStack(startCol) {
    const roll   = Phaser.Math.Between(1, 10);
    const floors = roll <= 6 ? 1 : roll <= 9 ? 2 : 3;
    const wide   = Phaser.Math.Between(1, 3);

    for (let i = 0; i < wide; i++) {
      const c = startCol + i;
      if (c < 0 || c >= this.mapCols) continue;

      for (let f = 1; f <= floors; f++) {
        const surfaceRow = this.groundRow - f * 2;
        this._placeCollision(c, surfaceRow);
        this._updateHeight(c, surfaceRow);

        const x       = (c + 0.5) * TILE_SIZE;
        const bottomY = (this.groundRow - (f - 1) * 2) * TILE_SIZE;
        this.scene.add.image(x, bottomY, CRATE_STACK)
          .setOrigin(0.5, 1).setDepth(DEPTH.GROUND + 0.5);
      }
    }

    return wide;
  }
}
