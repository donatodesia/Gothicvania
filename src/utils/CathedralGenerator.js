import ChunkGenerator from './ChunkGenerator.js';
import { DEPTH } from '../constants.js';

// ── Cathedral tileset geometry ──────────────────────────────────────────────
// Tiles.png — 352 × 384 px, 16 × 16 px, 22 cols × 24 rows = 528 tiles
// ID formula: row * 22 + col + 1  (0-indexed row/col, firstgid = 1)
//
// Visual section map:
//   Rows  0-10, Cols  0-10  — Stone arch/cross wall brickwork
//   Rows  0- 7, Cols 11-21  — Grass surface + stone fill; pillar strip at col 21
//   Rows  8-11, Cols 11-21  — Curved grass mound
//   Rows 14-23, Cols  0- 1  — Iron fence panels
//   Row  16,    Cols  2-10  — Stone platform slab (walkable surface row)
//   Rows 14-23, Cols 10-12  — Stone column / pillar segments
//   Rows 15-23, Cols 11-21  — Dirt/soil crater
//
// Ground surface (top-right section):
//   cap    row  0, cols 11-14 → IDs  12,  13,  14,  15
//   fill-0 row  1, cols 11-14 → IDs  34,  35,  36,  37
//   fill-1 row  2, cols 11-14 → IDs  56,  57,  58,  59
//
// Stone slab platform (row 16, full width 9 tiles):
//   left edge   col  2 → ID 355
//   centre      col  6 → ID 359   (any of cols 3-9 works as filler)
//   right edge  col 10 → ID 363
//
// Stone column pillar (rows 14-23, cols 10-12):
//   top row  → IDs 319, 320, 321
//   shaft    → IDs 341, 342, 343  …  (row+1)*22+col+1 per row
// ─────────────────────────────────────────────────────────────────────────

const GROUND_ROW = 12;
const CAP_ROW    = 11;

const CATHEDRAL_FLAT_CAP = [12, 13, 14, 15];

const CATHEDRAL_FLAT = [
  [34, 35, 36, 37],  // stone fill immediately below grass cap
  [56, 57, 58, 59],  // deeper stone fill
];

// Stone slab surface tiles (row 16 of the tileset).
const PLATFORM_L = 355;  // left edge
const PLATFORM_M = 359;  // centre fill
const PLATFORM_R = 363;  // right edge

// Dummy values — _generateSlopes is fully overridden below.
const ASC  = [[12, 12], [34, 34]];
const DESC = [[12, 12], [34, 34]];

// Props: hooded statue (Salt.png) and bush pair (brush.png).
// TODO: add 'cathedral-pillar' once a standalone pillar image is available.
const BACK_POOL  = ['cathedral-statue', 'cathedral-brush', 'cathedral-statue'];
const FRONT_POOL = ['cathedral-brush'];

/**
 * CathedralGenerator — ChunkGenerator preset for the Cathedral tileset.
 *
 * Elevated platforms are flat stone slabs (3–7 tiles wide, 1–3 tile heights
 * above the ground) placed using the stone slab art from row 16 of Tiles.png.
 * Left/right edge tiles give the slab proper bevelled ends.
 *
 * Pillars will be added as prop images below platform ends once a
 * standalone pillar asset is available.
 */
export default class CathedralGenerator extends ChunkGenerator {
  constructor(scene, layers, chunkSize, lookahead) {
    super(
      scene,
      layers,
      {
        groundRow: GROUND_ROW,
        capRow:    CAP_ROW,
        flatCap:   CATHEDRAL_FLAT_CAP,
        flat:      CATHEDRAL_FLAT,
        asc:       ASC,
        desc:      DESC,
        backPool:  BACK_POOL,
        frontPool: FRONT_POOL,
      },
      chunkSize,
      lookahead
    );
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  /** Flat stone slab platforms instead of organic slopes. */
  _generateSlopes(toCol) {
    while (this.nextSlopeCol < toCol - 20) {
      const width = Phaser.Math.Between(3, 7);
      this._buildPlatform(this.nextSlopeCol, width);
      this.nextSlopeCol += width + Phaser.Math.Between(20, 45);
    }
  }

  /** Cathedral uses parallax image backgrounds — no tile-based bg slopes. */
  _generateBgSlopes(toCol) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Places a flat one-way stone slab platform starting at startCol.
   *
   * Height is 1–3 tiles above the base ground (reachable with a normal jump).
   * Only the surface row gets a visual tile and collision; the space below is
   * left open to give the open-archway feel of the reference art.
   *
   * Left and right edge tiles use the bevelled slab ends; all inner columns
   * use the centre fill tile.
   *
   * @param {number} startCol  First tile column of the platform.
   * @param {number} width     Width in tiles (≥ 1).
   */
  _buildPlatform(startCol, width) {
    const height     = Phaser.Math.Between(1, 3);
    const surfaceRow = this.groundRow - height;

    for (let i = 0; i < width; i++) {
      const col = startCol + i;
      if (col < 0 || col >= this.mapCols) continue;

      let tileId;
      if (width === 1)          tileId = PLATFORM_M;
      else if (i === 0)         tileId = PLATFORM_L;
      else if (i === width - 1) tileId = PLATFORM_R;
      else                      tileId = PLATFORM_M;

      this.mainLayer.putTileAt(tileId, col, surfaceRow);
      this._placeCollision(col, surfaceRow);
      this._updateHeight(col, surfaceRow);
    }

    // TODO: place pillar prop images below the platform's two ends once
    //       a 'cathedral-pillar' image asset is available, e.g.:
    //
    //   const groundY = this.groundRow * TILE_SIZE;
    //   [startCol, startCol + width - 1].forEach(c => {
    //     this.scene.add.image((c + 0.5) * TILE_SIZE, groundY, 'cathedral-pillar')
    //       .setOrigin(0.5, 1).setDepth(DEPTH.PROPS_BACK);
    //   });
  }
}
