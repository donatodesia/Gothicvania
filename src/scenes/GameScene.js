import Phaser from 'phaser';
import Player from '../entities/Player.js';
import ChunkGenerator from '../utils/ChunkGenerator.js';
import TerrainMap from '../utils/TerrainMap.js';
import {
  TILE_SIZE,
  GROUND_ROW,
  CAP_ROW,
  TILE_SOLID,
  DEPTH,
  SPAWN_COL,
  SPAWN_ROW,
  PARALLAX_MOUNTAINS,
  PARALLAX_GRAVEYARD,
} from '../constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // --- Parallax backgrounds (DEPTH.SKY) ---
    this.bgMoon = this.add.tileSprite(0, 0, 384, 224, 'bg-moon').setOrigin(0).setScrollFactor(0);
    this.bgMountains = this.add.tileSprite(0, 0, 384, 224, 'bg-mountains').setOrigin(0).setScrollFactor(0);
    this.bgGraveyard = this.add.tileSprite(0, 0, 384, 224, 'bg-graveyard').setOrigin(0).setScrollFactor(0);

    // --- Tilemap ---
    const map = this.make.tilemap({ key: 'map' });
    this.mapCols = map.width;
    const tileset = map.addTilesetImage('tileset', 'tileset');

    this.backLayer  = map.createLayer('Back Layer',       [tileset]).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer  = map.createLayer('Main Layer',       [tileset]).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createLayer('Collisions Layer', [tileset]);
    this.collisionLayer.setVisible(false);

    this.collisionLayer.setCollision(TILE_SOLID);

    // Rows 0–CAP_ROW: disable any solid tile collision.
    // CAP_ROW is the decorative grass cap; rows 0–(CAP_ROW-1) are sky and may contain
    // map-boundary wall tiles (originally the left/right edge of the 300-col map)
    // that must not block the player now that the map has been extended.
    for (let c = 0; c < this.mapCols; c++) {
      for (let r = 0; r <= CAP_ROW; r++) {
        const t = this.collisionLayer.getTileAt(c, r);
        if (t && t.index === TILE_SOLID) t.setCollision(false, false, false, false);
      }
    }

    // --- Procedural terrain + props ---
    this.terrainHeight = new TerrainMap(this.mapCols);
    this.generator = new ChunkGenerator(this, {
      mainLayer:      this.mainLayer,
      collisionLayer: this.collisionLayer,
      backLayer:      this.backLayer,
      terrainHeight:  this.terrainHeight,
      mapCols:        this.mapCols,
    });
    this.generator.bootstrap();

    // --- Player ---
    this.player = new Player(this, SPAWN_COL * TILE_SIZE, SPAWN_ROW * TILE_SIZE);
    this.add.existing(this.player);
    this.player.setDepth(DEPTH.PLAYER);

    this.physics.add.collider(this.player, this.collisionLayer, null, (player, tile) => {
      if (tile.index === TILE_SOLID) return true; // solid ground always collides
      // One-way tile: skip collision when dropping through
      if (player.droppingThrough) return false;
      // One-way: only collide when player approaches from above.
      // Tolerance is derived from actual body movement this frame so fast falls
      // don't clip through the platform regardless of frame rate.
      const playerBottom = player.body.bottom;
      const tileTop      = tile.pixelY;
      const tolerance    = Math.max(Math.abs(player.body.deltaY()), 1);
      return playerBottom <= tileTop + tolerance && player.body.velocity.y >= 0;
    });

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);

    // --- World bounds ---
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // --- Pause menu on ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  update() {
    this.player.update();
    this.generator.advanceIfNeeded(Math.floor(this.player.body.center.x / TILE_SIZE));

    // Step-up: when walking on elevated terrain toward a higher surface, apply
    // a vertical velocity so the player rides the slope smoothly.
    // Step-down is intentionally omitted — gravity handles descending naturally,
    // and teleporting the player downward conflicts with it causing jitter.
    if (this.player.body.onFloor() && this.player.body.velocity.x !== 0 && !this.player.droppingThrough) {
      const currentCol     = Math.floor(this.player.body.center.x / TILE_SIZE);
      const currentTerrain = this.terrainHeight.get(currentCol);
      const onElevated     = currentTerrain < GROUND_ROW && this.player.body.bottom <= currentTerrain * TILE_SIZE + 4;

      if (onElevated) {
        const dir    = this.player.body.velocity.x > 0 ? 1 : -1;
        const checkX = dir > 0 ? this.player.body.right + 2 : this.player.body.left - 2;
        const nextCol  = Math.floor(checkX / TILE_SIZE);
        const targetY  = this.terrainHeight.get(nextCol) * TILE_SIZE;
        const diff     = targetY - this.player.body.bottom;

        // Only step up (diff < 0 = next surface is above current feet), max 1 tile.
        // Position assignment is intentional: one-way tiles don't block upward
        // movement, so a velocity-based push would send the player through them.
        if (diff < 0 && Math.abs(diff) <= TILE_SIZE) {
          this.player.body.position.y = targetY - this.player.body.height;
          this.player.body.velocity.y = 0;
        }
      }
    }

    const camX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = camX * PARALLAX_MOUNTAINS;
    this.bgGraveyard.tilePositionX = camX * PARALLAX_GRAVEYARD;
  }
}
