import Phaser from 'phaser';
import Player from '../entities/Player.js';
import StaticGenerator from '../utils/StaticGenerator.js';
import ChunkGenerator  from '../utils/ChunkGenerator.js';

// Toggle terrain generation mode:
//   false → StaticGenerator: whole map generated at scene start
//   true  → ChunkGenerator:  generated on demand as the player advances
const USE_CHUNKS = true;
const Generator  = USE_CHUNKS ? ChunkGenerator : StaticGenerator;

const DEPTH = {
  SKY:         0,
  PROPS_BACK:  1,
  GROUND:      2,
  PLAYER:      3,
  PROPS_FRONT: 4,
};

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

    this.collisionLayer.setCollision(1);

    // Rows 0–11: disable any solid (index 1) tile collision.
    // Row 11 is the decorative grass cap; rows 0–10 are sky and may contain
    // map-boundary wall tiles (originally the left/right edge of the 300-col map)
    // that must not block the player now that the map has been extended.
    for (let c = 0; c < this.mapCols; c++) {
      for (let r = 0; r <= 11; r++) {
        const t = this.collisionLayer.getTileAt(c, r);
        if (t && t.index === 1) t.setCollision(false, false, false, false);
      }
    }

    // --- Procedural terrain + props ---
    this.terrainHeight = new Array(this.mapCols).fill(12); // ground surface row per column
    this.generator = new Generator(this, {
      mainLayer:      this.mainLayer,
      collisionLayer: this.collisionLayer,
      backLayer:      this.backLayer,
      terrainHeight:  this.terrainHeight,
      mapCols:        this.mapCols,
    });
    this.generator.bootstrap();

    // --- Player ---
    this.player = new Player(this, 6 * 16, 9 * 16);
    this.add.existing(this.player);
    this.player.setDepth(DEPTH.PLAYER);

    this.physics.add.collider(this.player, this.collisionLayer, null, (player, tile) => {
      if (tile.index === 1) return true; // solid ground always collides
      // Slope tile (index 2): skip collision when dropping through
      if (player.droppingThrough) return false;
      // One-way: only collide when player is above tile and falling/standing
      const playerBottom = player.body.bottom;
      const tileTop = tile.pixelY;
      return playerBottom <= tileTop + 6 && player.body.velocity.y >= 0;
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
    this.generator.advanceIfNeeded(Math.floor(this.player.body.center.x / 16));

    // Slope step-up / step-down: only when already on elevated terrain (not ground)
    if (this.player.body.onFloor() && this.player.body.velocity.x !== 0 && !this.player.droppingThrough) {
      const currentCol = Math.floor(this.player.body.center.x / 16);
      const currentTerrain = currentCol >= 0 && currentCol < this.mapCols ? this.terrainHeight[currentCol] : 12;
      const onElevated = currentTerrain < 12 && this.player.body.bottom <= currentTerrain * 16 + 4;

      if (onElevated) {
        const dir = this.player.body.velocity.x > 0 ? 1 : -1;
        const checkX = dir > 0 ? this.player.body.right + 2 : this.player.body.left - 2;
        const nextCol = Math.floor(checkX / 16);

        if (nextCol >= 0 && nextCol < this.mapCols) {
          const targetY = this.terrainHeight[nextCol] * 16;
          const diff = targetY - this.player.body.bottom;

          if (diff !== 0 && Math.abs(diff) <= 16) {
            this.player.body.position.y = targetY - this.player.body.height;
            this.player.body.velocity.y = 0;
          }
        }
      }
    }

    const camX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = camX * 0.07;
    this.bgGraveyard.tilePositionX = camX * 0.25;
  }
}
