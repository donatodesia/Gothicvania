import Level from './Level.js';
import CathedralGenerator from '../utils/CathedralGenerator.js';
import TerrainMap from '../utils/TerrainMap.js';
import { TILE_SIZE, TILE_SOLID, DEPTH } from '../constants.js';

const SPAWN_COL = 3;
const SPAWN_ROW = 9;

// Cathedral map: 300 × 14 tiles (half the width of Town, same height family).
// Ground surface at row 12 (y = 192 px).  Death zone just past the bottom.
const MAP_COLS        = 300;
const MAP_ROWS        = 14;
const CATHEDRAL_GROUND_ROW = 12;
const CATHEDRAL_DEATH_Y    = MAP_ROWS * TILE_SIZE;  // 224 px

const PARALLAX_SKY    = 0.10;
const PARALLAX_FOREST = 0.40;

const ASSET_PATH = 'assets/Cathedral';

export default class CathedralLevel extends Level {

  // ── Asset loading ──────────────────────────────────────────────────────────

  static preload(scene) {
    scene.load.image('cathedral-tileset', `${ASSET_PATH}/Tiles.png`);
    scene.load.image('cathedral-bg0',     `${ASSET_PATH}/Background_0.png`);
    scene.load.image('cathedral-bg1',     `${ASSET_PATH}/Background_1.png`);
    scene.load.image('cathedral-statue',  `${ASSET_PATH}/Salt.png`);
    scene.load.image('cathedral-brush',   `${ASSET_PATH}/brush.png`);
  }

  // ── World construction ─────────────────────────────────────────────────────

  create() {
    const scene = this.scene;

    // Parallax backgrounds (pinned — no scroll factor)
    this.bgSky    = scene.add.tileSprite(0, 0, 384, 224, 'cathedral-bg0')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY);
    this.bgForest = scene.add.tileSprite(0, 0, 384, 224, 'cathedral-bg1')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY + 0.5);

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

    // tileWidth/tileHeight must be explicit for blank tilemaps.
    const tileset       = map.addTilesetImage('cathedral-tileset', 'cathedral-tileset', TILE_SIZE, TILE_SIZE, 0, 0);
    this.backLayer      = map.createBlankLayer('Back',       tileset).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer      = map.createBlankLayer('Main',       tileset).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createBlankLayer('Collisions', tileset);
    this.collisionLayer.setVisible(false);
    this.collisionLayer.setCollision(TILE_SOLID);

    // Procedural terrain
    this.terrainHeight = new TerrainMap(MAP_COLS, CATHEDRAL_GROUND_ROW);
    this.generator     = new CathedralGenerator(scene, {
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
    this.bgSky.tilePositionX    = camX * PARALLAX_SKY;
    this.bgForest.tilePositionX = camX * PARALLAX_FOREST;
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  get spawnPoint() {
    return { x: SPAWN_COL * TILE_SIZE, y: SPAWN_ROW * TILE_SIZE };
  }

  get groundRow() {
    return CATHEDRAL_GROUND_ROW;
  }

  get deathY() {
    return CATHEDRAL_DEATH_Y;
  }
}
