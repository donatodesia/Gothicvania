import ChunkGenerator from './ChunkGenerator.js';
import { GROUND_ROW, CAP_ROW } from '../constants.js';

// ── Magic Cliffs tileset geometry ──────────────────────────────────────────
// tileset.png — 928 × 320 px, 16 × 16 px, 58 cols × 20 rows = 1160 tiles
// ID formula: row * 58 + col + 1  (0-indexed row/col, firstgid = 1)
//
// Rows 0-10 contain large composed platform/island art pieces.
// Rows 11-19 contain the individual systematic terrain tiles used below.
//
// Flat ground surface (row 11 grass cap + rows 12-13 stone fill):
//   cap    row 11, cols 3-6 → IDs 642, 643, 644, 645  (yellow-green grass)
//   fill-0 row 12, cols 3-6 → IDs 700, 701, 702, 703  (grass-to-stone transition)
//   fill-1 row 13, cols 3-6 → IDs 758, 759, 760, 761  (dark stone)
//
// Ascending slope (rows 11-13, cols 32-33):
//   cap    row 11 → IDs 671, 672  (grass cap, going up)
//   fill-0 row 12 → IDs 729, 730
//   fill-1 row 13 → IDs 787, 788
//
// Descending slope (rows 11-13, cols 36-37):
//   cap    row 11 → IDs 675, 676  (grass cap, going down)
//   fill-0 row 12 → IDs 733, 734
//   fill-1 row 13 → IDs 791, 792
//
// !! If tiles look wrong in-game, verify by opening tileset.png with a
//    16 × 16 px grid overlay and cross-checking the IDs above. !!
// ─────────────────────────────────────────────────────────────────────────

const FLAT_CAP = [642, 643, 644, 645];

const FLAT = [
  [700, 701, 702, 703],  // grass-to-stone transition, row 12
  [758, 759, 760, 761],  // dark stone fill, row 13
];

const ASC  = [[671, 672], [729, 730], [787, 788]];
const DESC = [[675, 676], [733, 734], [791, 792]];

// No standalone prop images in the Magic Cliffs asset pack.
// _generateProps is suppressed below to prevent crashes.
// TODO: slice tree, small floating rock, and bush sprites from tileset.png
//       rows 0-10 and add keys here once available.
const BACK_POOL  = [];
const FRONT_POOL = [];

/**
 * MagicCliffsGenerator — ChunkGenerator preset for the Magic Cliffs tileset.
 *
 * Terrain algorithm is fully inherited from ChunkGenerator (ascending and
 * descending grass-capped rock slopes with flat sections between them).
 * Background tile slopes are also inherited, creating a parallax depth effect
 * on the backLayer using the same tile art.
 */
export default class MagicCliffsGenerator extends ChunkGenerator {
  constructor(scene, layers, chunkSize, lookahead) {
    super(
      scene,
      layers,
      {
        groundRow: GROUND_ROW,
        capRow:    CAP_ROW,
        flatCap:   FLAT_CAP,
        flat:      FLAT,
        asc:       ASC,
        desc:      DESC,
        backPool:  BACK_POOL,
        frontPool: FRONT_POOL,
      },
      chunkSize,
      lookahead
    );
  }

  /**
   * Suppressed — no standalone prop image assets exist for this pack yet.
   * Remove this override once prop images are available and BACK_POOL /
   * FRONT_POOL are populated.
   */
  _generateProps(toCol) {}
}
