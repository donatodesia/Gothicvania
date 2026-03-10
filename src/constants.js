// ── Map geometry ──────────────────────────────────────────────────────────────
export const TILE_SIZE  = 16;
export const GROUND_ROW = 12;  // Cemetery base ground surface row
export const CAP_ROW    = 11;  // Cemetery decorative grass cap row

// ── Tile indices (Collisions Layer) ───────────────────────────────────────────
export const TILE_SOLID   = 1;  // Full solid block, all sides collide
export const TILE_ONE_WAY = 2;  // One-way platform, top-only collision

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

// ── Chunk generation ──────────────────────────────────────────────────────────
export const CHUNK_SIZE      = 300;  // columns per generated chunk
export const CHUNK_LOOKAHEAD = 50;   // columns before frontier that trigger next chunk
