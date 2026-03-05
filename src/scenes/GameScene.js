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

    this.backLayer  = map.createLayer('Back Layer',       [tileset, objects]).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer  = map.createLayer('Main Layer',       [tileset, objects]).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createLayer('Collisions Layer', [tileset, objects]);
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

    // // PROPS_BACK — behind the ground tiles, bases embedded 20px.
    // let x = Phaser.Math.Between(50, 180);
    // while (x < MAP_W - 50) {
    //   const key = backPool[Phaser.Math.Between(0, backPool.length - 1)];
    //   const w = this.textures.getFrame(key).realWidth;
    //   this.add.image(x + w / 2, GROUND_Y + 20, key).setOrigin(0.5, 1).setDepth(DEPTH.PROPS_BACK);
    //   x += w + Phaser.Math.Between(20, 80);
    // }

    // // PROPS_FRONT — in front of the player, bases 35px below ground edge.
    // x = Phaser.Math.Between(20, 80);
    // while (x < MAP_W - 20) {
    //   const key = frontPool[Phaser.Math.Between(0, frontPool.length - 1)];
    //   const w = this.textures.getFrame(key).realWidth;
    //   this.add.image(x + w / 2, GROUND_Y + 35, key).setOrigin(0.5, 1).setDepth(DEPTH.PROPS_FRONT);
    //   x += w + Phaser.Math.Between(20, 80);
    // }
  }

  generateSlopes() {
    const GROUND_ROW = 12;
    const MAP_COLS   = 300;

    let col = Phaser.Math.Between(15, 30);
    let firstHill = true;
    while (col < MAP_COLS - 20) {
      const height = Phaser.Math.Between(2, 3);
      const flat   = Phaser.Math.Between(3, 7);

      // Ascending left side — i=0 is base (lowest), i=height-1 is cap (highest)
      for (let i = 0; i < height; i++) {
        this.placeStep(col + i, GROUND_ROW -1 - i, 'ascending', height - 1 - i, GROUND_ROW);
      }

      // Flat plateau
      for (let i = 0; i < flat; i++) {
        this.placeStep(col + height + i, GROUND_ROW - height, 'flat', 0, GROUND_ROW);
      }

      // Descending right side — i=0 is cap (highest), i=height-1 is base (lowest)
      for (let i = 0; i < height; i++) {
        this.placeStep(col + height + flat + i, GROUND_ROW - height + i , 'descending', i, GROUND_ROW);
      }

      if (firstHill) {
        firstHill = false;
        const hillWidth = 2 * height + flat;
        console.log(`=== FIRST HILL: col=${col}, height=${height}, flat=${flat} ===`);
        for (let c = col; c < col + hillWidth; c++) {
          const idx = c - col;
          let topRow;
          if (idx < height) topRow = GROUND_ROW - 1 - idx;
          else if (idx < height + flat) topRow = GROUND_ROW - height;
          else topRow = GROUND_ROW - height + (idx - height - flat);
          const surfaceTile = this.mainLayer.getTileAt(c, topRow);
          const fills = [];
          for (let r = topRow + 1; r <= GROUND_ROW; r++) {
            const t = this.mainLayer.getTileAt(c, r);
            fills.push(t ? t.index : '---');
          }
          console.log(`  col ${c}: surface row${topRow}=${surfaceTile ? surfaceTile.index : '---'} | fill=[${fills.join(', ')}]`);
        }
      }

      col += 2 * height + flat + Phaser.Math.Between(5, 20);
    }
  }

  // Tile layout from Tileset_ID.txt (28 cols, 1-based IDs, tile (0,0) = ID 1)
  //
  //   Flat surface rows    : [89-92]  [117-120]  [145-148]   (level 0=cap → 2=base)
  //   Ascending slope rows : [142,143] [170,171] [198,199]   (level 0=cap → 2=base)
  //   Descending slope rows: [123,124] [151,152] [179,180]   (level 0=cap → 2=base)
  //   Fill soil            : [187-193]
  //
  // level: 0 = cap/top, 1 = middle, 2 = base
  placeStep(col, topRow, type, level, groundRow) {
    const FLAT = [[89,90,91,92], [117,118,119,120], [145,146,147,148]];
    const ASC  = [[142, 143], [170, 171], [198, 199]];
    const DESC = [[123, 124], [151, 152], [179, 180]];

    let surfaceGid;
    switch (type) {
      case 'ascending':  surfaceGid = ASC[level][col % 2];   break;
      case 'flat':       surfaceGid = FLAT[level][col % 4];  break;
      case 'descending': surfaceGid = DESC[level][col % 2];  break;
    }

    this.mainLayer.putTileAt(surfaceGid, col, topRow);

    // Collision one row below visual surface (same offset as ground:
    // visual grass cap at row 11, player walks on row 12).
    const collisionRow = topRow + 1;
    if (collisionRow < this.terrainHeight[col]) {
      this.terrainHeight[col] = collisionRow;
    }
    if (collisionRow < 12) {
      const tile = this.collisionLayer.putTileAt(2, col, collisionRow);
      tile.setCollision(false, false, true, false);
    }

    // Fill below surface using Filling Grass structure per column.
    // Row 0: [null, null, 133,134,135, null, null]  (top — grass, flat only)
    // Row 1: [159, 160,  161,162,163, 164,  165]    (mid — asc/flat/desc)
    // Row 2: [187, 188,  189,190,191, 192,  193]    (soil — asc/flat/desc)
    // Ascending/descending skip Row 0 (null) → start at Row 1.
    const FILL = {
      flat:       [[133,134,135], [161,162,163], [189,190,191]],
      ascending:  [[159,160],     [187,188]],
      descending: [[164,165],     [192,193]],
    };
    const pools = FILL[type];

    for (let r = topRow + 1; r <= groundRow; r++) {
      const depth = r - topRow; // 1, 2, 3, ...
      const poolIdx = Math.min(depth - 1, pools.length - 1);
      const pool = pools[poolIdx];
      this.mainLayer.putTileAt(pool[(col + r) % pool.length], col, r);
    }
  }

  update() {
    this.player.update();

    // Slope step-up / step-down: snap player to terrain height when walking
    if (this.player.body.onFloor() && this.player.body.velocity.x !== 0 && !this.player.droppingThrough) {
      const dir = this.player.body.velocity.x > 0 ? 1 : -1;
      const checkX = dir > 0 ? this.player.body.right + 2 : this.player.body.left - 2;
      const nextCol = Math.floor(checkX / 16);

      if (nextCol >= 0 && nextCol < 300) {
        const targetY = this.terrainHeight[nextCol] * 16;
        const playerBottom = this.player.body.bottom;
        const diff = targetY - playerBottom;

        // Step up (diff < 0) or step down (diff > 0), max 1 tile per frame
        if (diff !== 0 && Math.abs(diff) <= 16) {
          this.player.body.position.y = targetY - this.player.body.height;
          this.player.body.velocity.y = 0;
        }
      }
    }

    const camX = this.cameras.main.scrollX;
    this.bgMountains.tilePositionX = camX * 0.07;
    this.bgGraveyard.tilePositionX = camX * 0.25;
  }
}
