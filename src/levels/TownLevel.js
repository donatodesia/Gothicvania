import Level from './Level.js';
import TownGenerator from '../utils/TownGenerator.js';
import TerrainMap from '../utils/TerrainMap.js';
import { TILE_SIZE, TILE_SOLID, DEPTH } from '../constants.js';

const SPAWN_COL = 3;
const SPAWN_ROW = 11;

// Town map: 600 × 17 tiles. Ground surface at row 15 (y = 240px).
const MAP_COLS       = 600;
const MAP_ROWS       = 17;
const TOWN_GROUND_ROW = 15;

// Town map height = 17 × 16 = 272px. Death zone safely below the floor.
const TOWN_DEATH_Y = 265;

const PARALLAX_BG  = 0.10;
const PARALLAX_MID = 0.30;

const ASSET_PATH = 'assets/GothicVania-town-files/phaser-code/assets';
const PROPS_PATH = 'assets/GothicVania-town-files/PNG/environment/props-sliced';

export default class TownLevel extends Level {

  // ── Asset loading ──────────────────────────────────────────────────────────

  static preload(scene) {
    // Tileset + backgrounds (no map JSON — tilemap is built dynamically)
    scene.load.image('town-tileset', `${ASSET_PATH}/environment/tileset.png`);
    scene.load.image('town-bg',      `${ASSET_PATH}/environment/background.png`);
    scene.load.image('town-mid',     `${ASSET_PATH}/environment/middleground.png`);

    // Town props — small foreground items
    scene.load.image('town-barrel',      `${PROPS_PATH}/barrel.png`);
    scene.load.image('town-crate',       `${PROPS_PATH}/crate.png`);
    scene.load.image('town-crate-stack', `${PROPS_PATH}/crate-stack.png`);
    scene.load.image('town-sign',        `${PROPS_PATH}/sign.png`);
    scene.load.image('town-lamp',        `${PROPS_PATH}/street-lamp.png`);
    scene.load.image('town-wagon',       `${PROPS_PATH}/wagon.png`);
    scene.load.image('town-well',        `${PROPS_PATH}/well.png`);

    // Town buildings — back layer facades
    scene.load.image('town-house-a', `${PROPS_PATH}/house-a.png`);
    scene.load.image('town-house-b', `${PROPS_PATH}/house-b.png`);
    scene.load.image('town-house-c', `${PROPS_PATH}/house-c.png`);
    scene.load.image('town-church',  `${PROPS_PATH}/chuch.png`);
  }

  // ── World construction ─────────────────────────────────────────────────────

  create() {
    const scene = this.scene;

    // Parallax backgrounds (pinned — no scroll factor)
    this.bgBack = scene.add.tileSprite(0, 0, 384, 224, 'town-bg').setOrigin(0).setScrollFactor(0);
    this.bgMid  = scene.add.tileSprite(0, 0, 384, 224, 'town-mid').setOrigin(0).setScrollFactor(0);

    // Dynamic blank tilemap — no JSON file needed
    const map = scene.make.tilemap({
      tileWidth:  TILE_SIZE,
      tileHeight: TILE_SIZE,
      width:      MAP_COLS,
      height:     MAP_ROWS,
    });

    this.mapCols     = MAP_COLS;
    this.mapWidthPx  = MAP_COLS * TILE_SIZE;
    this.mapHeightPx = MAP_ROWS * TILE_SIZE;

    // tileWidth/tileHeight/margin/spacing must be explicit for blank tilemaps —
    // without them Phaser cannot slice the image and renders nothing.
    const tileset        = map.addTilesetImage('town-tileset', 'town-tileset', TILE_SIZE, TILE_SIZE, 0, 0);
    this.backLayer       = map.createBlankLayer('Back Layer',       tileset).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer       = map.createBlankLayer('Main Layer',       tileset).setDepth(DEPTH.GROUND);
    this.collisionLayer  = map.createBlankLayer('Collisions Layer', tileset);
    this.collisionLayer.setVisible(false);
    this.collisionLayer.setCollision(TILE_SOLID);

    // Procedural terrain
    this.terrainHeight = new TerrainMap(MAP_COLS, TOWN_GROUND_ROW);
    this.generator     = new TownGenerator(scene, {
      mainLayer:      this.mainLayer,
      collisionLayer: this.collisionLayer,
      backLayer:      this.backLayer,
      terrainHeight:  this.terrainHeight,
      mapCols:        MAP_COLS,
    });
    this.generator.bootstrap();
  }

  // ── Per-frame ──────────────────────────────────────────────────────────────

  update(character) {
    super.update(character);
    const camX = this.scene.cameras.main.scrollX;
    this.bgBack.tilePositionX = camX * PARALLAX_BG;
    this.bgMid.tilePositionX  = camX * PARALLAX_MID;
  }

  // ── Overrides ─────────────────────────────────────────────────────────────

  get spawnPoint() {
    return { x: SPAWN_COL * TILE_SIZE, y: SPAWN_ROW * TILE_SIZE };
  }

  get groundRow() {
    return TOWN_GROUND_ROW;
  }

  get deathY() {
    return TOWN_DEATH_Y;
  }
}
