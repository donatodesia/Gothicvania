# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (hot reload)
npm run build     # Production build
npm run preview   # Preview production build
```

No linting or test commands are configured.

## Architecture

**Stack**: Phaser 3.90 + Vite, vanilla JavaScript ES modules. No TypeScript.

**Entry point**: `src/main.js` — creates the Phaser game at 384×224 (pixel art, arcade physics, no world gravity — gravity is applied per-body in Player).

**Scene flow**: `BootScene` → `GameScene` (with `PauseScene` launched as an overlay on ESC, never replacing GameScene).

### Scene responsibilities

- **`src/scenes/BootScene.js`** — loads all assets, then immediately starts GameScene. Nothing else.
- **`src/scenes/GameScene.js`** — builds the level: parallax backgrounds, tilemap, procedural slopes (`generateSlopes`), procedural background props (`generateBackground`), player, physics collider, camera. Owns `this.mainLayer` and `this.collisionLayer`.
- **`src/scenes/PauseScene.js`** — overlay drawn on top of GameScene. Displays controls list. Closed by ESC.
- **`src/entities/Player.js`** — extends `Phaser.Physics.Arcade.Sprite`. Handles all input, movement, animation, and the drop-through mechanic.

### Tilemap two-layer pattern

The map has two layers that must always be updated together when adding terrain:

- **Main Layer** (`this.mainLayer`) — visual tiles only. Tile GIDs for surfaces: flat=89-92, asc-base=87, desc-base=93, ascending=108-109, descending=110-111, underground fill=117-120.
- **Collisions Layer** (`this.collisionLayer`, invisible) — physics only. Tile index `1` = full solid block. Tile index `2` = one-way platform (set via `tile.setCollision(false, false, true, false)` — collides only from above).

When adding a platform programmatically, always `putTileAt` on both layers and call `tile.setCollision(false, false, true, false)` on the collision tile.

### Drop-through mechanic

The collider uses a process callback (4th arg to `physics.add.collider`) that returns `false` when `player.droppingThrough === true && tile.index === 2`. Triggered in `Player.update()` by Down+Space while on floor; re-enabled after 200ms via `delayedCall`.

### Key input conventions

- `key.isDown` — continuous (movement)
- `Phaser.Input.Keyboard.JustDown(key)` — discrete, first frame only (jump, drop-through)

### Depth constants (GameScene)

`SKY=0, PROPS_BACK=1, GROUND=2, PLAYER=3, PROPS_FRONT=4`

### Player physics details

- Gravity: `setGravityY(800)` normally, `1200` while falling (heavier feel)
- Variable jump: releasing Up early while `velocity.y < -50` halves Y velocity
- Spawn: tile (6, 9). Death/respawn trigger: `player.y > 172`
- Physics body: 22×39px, offset (41, 19) when facing right; offset flips to `(FRAME_W - offset_x - body_w, 19)` when facing left

### Asset paths

Tilemap assets served from `public/assets/Gothicvania Cemetery/Phaser Demo/assets/` (atlas, tileset, environment, maps, sounds). Procedural prop images from `public/assets/Gothicvania Cemetery/Environment/sliced-objects/`.
