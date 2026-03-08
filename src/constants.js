// ── Map geometry ──────────────────────────────────────────────────────────────
export const TILE_SIZE  = 16;
export const GROUND_ROW = 12;  // Row index where the base ground surface sits
export const CAP_ROW    = 11;  // Row index for the decorative grass cap
export const GROUND_Y   = CAP_ROW * TILE_SIZE;  // 176px — top edge of ground tiles

// ── Tile indices (Collisions Layer) ───────────────────────────────────────────
export const TILE_SOLID   = 1;  // Full solid block, all sides collide
export const TILE_ONE_WAY = 2;  // One-way platform, top-only collision

// ── Tile art — terrain patterns ───────────────────────────────────────────────
export const ASC      = [[114, 115], [142, 143], [170, 171]];
export const DESC     = [[124, 125], [152, 153], [180, 181]];
export const FLAT     = [[117, 118, 119, 120], [145, 146, 147, 148], [171, 171, 180, 180]];
export const FLAT_CAP = [89, 90, 91, 92];

// ── Prop pools ────────────────────────────────────────────────────────────────
export const BACK_POOL = [
  'tree-1', 'tree-2', 'tree-3',
  'statue',
  'bush-large',
  'stone-1', 'stone-1',
  'stone-2', 'stone-2',
  'stone-3', 'stone-4',
];

export const FRONT_POOL = [
  'tree-1', 'tree-2',
  'statue',
  'bush-large',
  'stone-1', 'stone-1',
  'stone-2', 'stone-2',
  'stone-3', 'stone-4',
];

// ── Depth (render order) ──────────────────────────────────────────────────────
export const DEPTH = {
  SKY:         0,
  PROPS_BACK:  1,
  GROUND:      2,
  PLAYER:      3,
  PROPS_FRONT: 4,
};

// ── Player physics ────────────────────────────────────────────────────────────
export const GRAVITY_NORMAL       = 800;
export const GRAVITY_FALL         = 1200;
export const MOVE_SPEED           = 150;
export const JUMP_VELOCITY        = -290;
export const JUMP_CUT_THRESHOLD   = -50;   // vy must be below this to apply cut
export const JUMP_CUT_FACTOR      = 0.5;   // halve upward velocity on early release
export const FALL_ANIM_THRESHOLD  = 10;    // vy above this triggers fall animation
export const DROP_THROUGH_MS      = 200;   // duration of drop-through flag in ms
export const DROP_THROUGH_NUDGE   = 2;     // px to nudge player down when dropping
export const DEATH_Y              = 200;   // y position that triggers respawn

// ── Player spawn ──────────────────────────────────────────────────────────────
export const SPAWN_COL = 6;
export const SPAWN_ROW = 9;

// ── Parallax scroll factors ───────────────────────────────────────────────────
export const PARALLAX_MOUNTAINS = 0.07;
export const PARALLAX_GRAVEYARD = 0.25;

// ── Chunk generation ──────────────────────────────────────────────────────────
export const CHUNK_SIZE      = 300;  // columns per generated chunk
export const CHUNK_LOOKAHEAD = 50;   // columns before frontier that trigger next chunk
