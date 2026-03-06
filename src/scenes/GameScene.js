import Phaser from 'phaser';
import Player from '../entities/Player.js';

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
    const tileset = map.addTilesetImage('tileset', 'tileset');

    this.backLayer  = map.createLayer('Back Layer',       [tileset]).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer  = map.createLayer('Main Layer',       [tileset]).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createLayer('Collisions Layer', [tileset]);
    this.collisionLayer.setVisible(false);

    this.collisionLayer.setCollision(1);

    // Row 11 is the decorative grass cap — disable its collision so
    // the player walks on row 12 (the actual ground surface).
    for (let c = 0; c < 300; c++) {
      const t = this.collisionLayer.getTileAt(c, 11);
      if (t) t.setCollision(false, false, false, false);
    }

    // --- Procedural terrain ---
    this.terrainHeight = new Array(300).fill(12); // ground surface row per column
    this.generateSlopes();
    this.generateBackgroundSlopes();

    // --- Procedural props ---
    this.generateBackground();

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

  generateBackground() {
    const GROUND_Y = 11 * 16; // 176px — top edge of ground tiles
    const MAP_W    = 300 * 16;

    const backPool = [
      'tree-1', 'tree-2', 'tree-3',
      'statue',
      'bush-large',
      'stone-1', 'stone-1',
      'stone-2', 'stone-2',
      'stone-3', 'stone-4',
    ];

    const frontPool = [
      'tree-1', 'tree-2',
      'statue',
      'bush-large',
      'stone-1', 'stone-1',
      'stone-2', 'stone-2',
      'stone-3', 'stone-4',
    ];

    // PROPS_BACK — behind the ground tiles, bases embedded 20px.
    let x = Phaser.Math.Between(50, 180);
    while (x < MAP_W - 50) {
      const key = backPool[Phaser.Math.Between(0, backPool.length - 1)];
      const w = this.textures.getFrame(key).realWidth;
      this.add.image(x + w / 2, GROUND_Y + 20, key).setOrigin(0.5, 1).setDepth(DEPTH.PROPS_BACK);
      x += w + Phaser.Math.Between(20, 80);
    }

    // PROPS_FRONT — in front of the player, bases 35px below ground edge.
    x = Phaser.Math.Between(20, 80);
    while (x < MAP_W - 20) {
      const key = frontPool[Phaser.Math.Between(0, frontPool.length - 1)];
      const w = this.textures.getFrame(key).realWidth;
      this.add.image(x + w / 2, GROUND_Y + 35, key).setOrigin(0.5, 1).setDepth(DEPTH.PROPS_FRONT);
      x += w + Phaser.Math.Between(20, 80);
    }
  }

  generateSlopes() {
    const GROUND_ROW = 12;
    const MAP_COLS   = 300;

    let col = Phaser.Math.Between(15, 30);
    while (col < MAP_COLS - 20) {
      const height = Phaser.Math.Between(2, 3);
      const flat   = Phaser.Math.Between(3, 7);

      // Ascending — each step is 2 cols wide, colHeight increases per step
      for (let i = 0; i < height; i++) {
        this.placeStep(col + i * 2,     i + 1, 'ascending', 0, GROUND_ROW);
        this.placeStep(col + i * 2 + 1, i + 1, 'ascending', 1, GROUND_ROW);
      }

      // Flat plateau — all columns at full height
      const flatStart = col + height * 2;
      for (let i = 0; i < flat; i++) {
        this.placeStep(flatStart + i, height, 'flat', i, GROUND_ROW);
      }

      // Descending — colHeight decreases per step
      const descStart = flatStart + flat;
      for (let i = 0; i < height; i++) {
        this.placeStep(descStart + i * 2,     height - i, 'descending', 0, GROUND_ROW);
        this.placeStep(descStart + i * 2 + 1, height - i, 'descending', 1, GROUND_ROW);
      }

      col += height * 4 + flat + Phaser.Math.Between(5, 20);
    }
  }

  generateBackgroundSlopes() {
    const GROUND_ROW = 12;
    const MAP_COLS   = 300;

    let col = Phaser.Math.Between(5, 20);
    while (col < MAP_COLS - 15) {
      const height = Phaser.Math.Between(1, 2);
      const flat   = Phaser.Math.Between(4, 10);

      for (let i = 0; i < height; i++) {
        this.placeStep(col + i * 2,     i + 1, 'ascending', 0, GROUND_ROW, this.backLayer);
        this.placeStep(col + i * 2 + 1, i + 1, 'ascending', 1, GROUND_ROW, this.backLayer);
      }

      const flatStart = col + height * 2;
      for (let i = 0; i < flat; i++) {
        this.placeStep(flatStart + i, height, 'flat', i, GROUND_ROW, this.backLayer);
      }

      const descStart = flatStart + flat;
      for (let i = 0; i < height; i++) {
        this.placeStep(descStart + i * 2,     height - i, 'descending', 0, GROUND_ROW, this.backLayer);
        this.placeStep(descStart + i * 2 + 1, height - i, 'descending', 1, GROUND_ROW, this.backLayer);
      }

      col += height * 4 + flat + Phaser.Math.Between(8, 25);
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
  placeStep(col, colHeight, type, tileCol, groundRow, layer) {
    const ASC      = [[114, 115], [142, 143], [170, 171]];
    const DESC     = [[124, 125], [152, 153], [180, 181]];
    const FLAT     = [[117,118,119,120], [145,146,147,148], [171,171,180,180]];
    const FLAT_CAP = [89, 90, 91, 92];

    const targetLayer = layer || this.mainLayer;
    const surfaceRow = groundRow - colHeight;

    if (type === 'flat') {
      // Visual cap one row above the surface
      targetLayer.putTileAt(FLAT_CAP[tileCol % 4], col, surfaceRow - 1);
      // Surface and fill rows
      for (let r = surfaceRow; r < groundRow; r++) {
        const d = r - surfaceRow;
        const idx = Math.min(d, FLAT.length - 1);
        targetLayer.putTileAt(FLAT[idx][tileCol % 4], col, r);
      }
    } else {
      const tiles = type === 'ascending' ? ASC : DESC;
      for (let r = surfaceRow; r < groundRow; r++) {
        const d = r - surfaceRow;
        const idx = Math.min(d, tiles.length - 1);
        targetLayer.putTileAt(tiles[idx][tileCol % 2], col, r);
      }
    }

    // Collision only for main layer
    if (targetLayer === this.mainLayer) {
      if (surfaceRow < this.terrainHeight[col]) {
        this.terrainHeight[col] = surfaceRow;
      }
      if (surfaceRow < groundRow) {
        const tile = this.collisionLayer.putTileAt(2, col, surfaceRow);
        tile.setCollision(false, false, true, false);
      }
    }
  }

  update() {
    this.player.update();

    // Slope step-up / step-down: only when already on elevated terrain (not ground)
    if (this.player.body.onFloor() && this.player.body.velocity.x !== 0 && !this.player.droppingThrough) {
      const currentCol = Math.floor(this.player.body.center.x / 16);
      const currentTerrain = currentCol >= 0 && currentCol < 300 ? this.terrainHeight[currentCol] : 12;
      const onElevated = currentTerrain < 12 && this.player.body.bottom <= currentTerrain * 16 + 4;

      if (onElevated) {
        const dir = this.player.body.velocity.x > 0 ? 1 : -1;
        const checkX = dir > 0 ? this.player.body.right + 2 : this.player.body.left - 2;
        const nextCol = Math.floor(checkX / 16);

        if (nextCol >= 0 && nextCol < 300) {
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
