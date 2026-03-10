import ChunkGenerator from './ChunkGenerator.js';
import { GROUND_ROW, CAP_ROW } from '../constants.js';

// ── Cemetery tileset geometry ──────────────────────────────────────────────
// Tileset: 28 cols × 10 rows = 280 tiles, 16×16px, firstgid = 1
// ID formula: row * 28 + col + 1  (0-indexed row/col)

const FLAT_CAP = [89, 90, 91, 92];

const FLAT = [
  [117, 118, 119, 120],
  [145, 146, 147, 148],
  [171, 171, 180, 180],
];

const ASC  = [[114, 115], [142, 143], [170, 171]];
const DESC = [[124, 125], [152, 153], [180, 181]];

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

/**
 * CemeteryGenerator — ChunkGenerator preset for the Gothicvania Cemetery tileset.
 *
 * Provides cemetery-specific tile art and prop pools.
 * Terrain algorithm is inherited from ChunkGenerator.
 */
export default class CemeteryGenerator extends ChunkGenerator {
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
}
