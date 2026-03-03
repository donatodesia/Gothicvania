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
    const objects = map.addTilesetImage('objects', 'objects');

    this.mainLayer = map.createLayer('Main Layer', [tileset, objects]).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createLayer('Collisions Layer', [tileset, objects]);
    this.collisionLayer.setVisible(false);

    this.collisionLayer.setCollision(1);

    // --- Procedural terrain ---
    this.generateSlopes();

    // --- Procedural props ---
    this.generateBackground();

    // --- Player ---
    this.player = new Player(this, 6 * 16, 9 * 16);
    this.add.existing(this.player);
    this.player.setDepth(DEPTH.PLAYER);

    this.physics.add.collider(this.player, this.collisionLayer);

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
    const GROUND_ROW = 11;
    const MAP_COLS   = 300;

    let col = Phaser.Math.Between(15, 30);
    while (col < MAP_COLS - 20) {
      const height = Phaser.Math.Between(1, 3);
      const flat   = Phaser.Math.Between(3, 7);

      // Ascending left side
      for (let i = 0; i < height; i++) {
        this.placeStep(col + i, GROUND_ROW - 1 - i, i === 0 ? 'asc-base' : 'ascending', GROUND_ROW);
      }

      // Flat plateau
      for (let i = 0; i < flat; i++) {
        this.placeStep(col + height + i, GROUND_ROW - height, 'flat', GROUND_ROW);
      }

      // Descending right side
      for (let i = 0; i < height; i++) {
        this.placeStep(col + height + flat + i, GROUND_ROW - height + i, i === height - 1 ? 'desc-base' : 'descending', GROUND_ROW);
      }

      col += 2 * height + flat + Phaser.Math.Between(5, 20);
    }
  }

  // type: 'asc-base' | 'ascending' | 'flat' | 'descending' | 'desc-base'
  // Tile layout in tileset.png (28 cols):
  //   Left-edge cap surface : row 3, col 2  → GID 87
  //   Left slope-face top   : row 3, cols 23-24 → GIDs 108-109  (used in Back Layer)
  //   Flat surface          : row 3, cols 4-7  → GIDs 89-92
  //   Right slope-face top  : row 3, cols 25-26 → GIDs 110-111  (unused — mirror side)
  //   Right-edge cap surface: row 3, col 8  → GID 93
  placeStep(col, topRow, type, groundRow) {
    let surfaceGid;

    switch (type) {
      case 'asc-base':   surfaceGid = 87;                     break;
      case 'ascending':  surfaceGid = [108, 109][col % 2];    break;
      case 'flat':       surfaceGid = [89,90,91,92][col % 4]; break;
      case 'descending': surfaceGid = [110, 111][col % 2];    break;
      case 'desc-base':  surfaceGid = 93;                     break;
    }

    this.mainLayer.putTileAt(surfaceGid, col, topRow);

    // Top-only collision — player lands from above, passes through from sides
    const tile = this.collisionLayer.putTileAt(2, col, topRow);
    tile.setCollision(false, false, true, false);

    // Fill below surface with standard underground tiles
    const fillTiles = [117, 118, 119, 120];
    for (let r = topRow + 1; r < groundRow; r++) {
      this.mainLayer.putTileAt(fillTiles[(col + r) % 4], col, r);
    }
  }

  update() {
    this.player.update();

    const camX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = camX * 0.07;
    this.bgGraveyard.tilePositionX = camX * 0.25;
  }
}
