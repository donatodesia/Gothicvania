import Level from './Level.js';
import MagicCliffsGenerator from '../utils/MagicCliffsGenerator.js';
import TerrainMap from '../utils/TerrainMap.js';
import { TILE_SIZE, TILE_SOLID, GROUND_ROW, DEPTH } from '../constants.js';

const SPAWN_COL = 6;
const SPAWN_ROW = 9;

// Map: 400 × 16 tiles.  Ground surface at row 12 (y = 192 px).
const MAP_COLS       = 400;
const MAP_ROWS       = 16;
const MC_GROUND_ROW  = GROUND_ROW;                   // 12
const MC_DEATH_Y     = (MC_GROUND_ROW + 2) * TILE_SIZE;  // 224 px

// Parallax scroll speeds (fraction of camera X per frame)
const PARALLAX_SKY       = 0.05;
const PARALLAX_SEA       = 0.08;
const PARALLAX_CLOUDS    = 0.15;
const PARALLAX_FARGROUND = 0.35;

const ASSET_PATH = 'assets/Magic Cliffs/Environment/PNG';

export default class MagicCliffsLevel extends Level {

  // ── Asset loading ──────────────────────────────────────────────────────────

  static preload(scene) {
    scene.load.image('mc-tileset',   `${ASSET_PATH}/tileset.png`);
    scene.load.image('mc-sky',       `${ASSET_PATH}/sky.png`);
    scene.load.image('mc-sea',       `${ASSET_PATH}/sea.png`);
    scene.load.image('mc-clouds',    `${ASSET_PATH}/clouds.png`);
    scene.load.image('mc-farground', `${ASSET_PATH}/far-grounds.png`);
  }

  // ── World construction ─────────────────────────────────────────────────────

  create() {
    const scene = this.scene;
    const W = 384, H = 224;

    // Depth order (back → front): sky → sea → clouds → far-grounds → terrain

    // 1. Sky — full backdrop, slow drift (sky.png: 112 × 304, tiles horizontally)
    this.bgSky = scene.add.tileSprite(0, 0, W, H, 'mc-sky')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY);

    // 2. Sea — fills lower portion of screen (sea.png: 112 × 96)
    this.bgSea = scene.add.tileSprite(0, H - 96, W, 96, 'mc-sea')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY + 0.3);

    // 3. Clouds — full screen, light drift (clouds.png: 544 × 236)
    this.bgClouds = scene.add.tileSprite(0, 0, W, H, 'mc-clouds')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY + 0.6);

    // 4. Far grounds — horizon hills anchored to bottom (far-grounds.png: 616 × 110)
    this.bgFarground = scene.add.tileSprite(0, H - 110, W, 110, 'mc-farground')
      .setOrigin(0).setScrollFactor(0).setDepth(DEPTH.SKY + 0.9);

    // ── Dynamic blank tilemap ──────────────────────────────────────────────

    const map = scene.make.tilemap({
      tileWidth:  TILE_SIZE,
      tileHeight: TILE_SIZE,
      width:      MAP_COLS,
      height:     MAP_ROWS,
    });

    this.mapCols     = MAP_COLS;
    this.mapWidthPx  = MAP_COLS * TILE_SIZE;
    this.mapHeightPx = MAP_ROWS * TILE_SIZE;

    const tileset       = map.addTilesetImage('mc-tileset', 'mc-tileset', TILE_SIZE, TILE_SIZE, 0, 0);
    this.backLayer      = map.createBlankLayer('Back',       tileset).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer      = map.createBlankLayer('Main',       tileset).setDepth(DEPTH.GROUND);
    this.collisionLayer = map.createBlankLayer('Collisions', tileset);
    this.collisionLayer.setVisible(false);
    this.collisionLayer.setCollision(TILE_SOLID);

    // ── Procedural terrain ─────────────────────────────────────────────────

    this.terrainHeight = new TerrainMap(MAP_COLS, MC_GROUND_ROW);
    this.generator     = new MagicCliffsGenerator(scene, {
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
    this.bgSky.tilePositionX       = camX * PARALLAX_SKY;
    this.bgSea.tilePositionX       = camX * PARALLAX_SEA;
    this.bgClouds.tilePositionX    = camX * PARALLAX_CLOUDS;
    this.bgFarground.tilePositionX = camX * PARALLAX_FARGROUND;
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  get spawnPoint() {
    return { x: SPAWN_COL * TILE_SIZE, y: SPAWN_ROW * TILE_SIZE };
  }

  get groundRow() {
    return MC_GROUND_ROW;
  }

  get deathY() {
    return MC_DEATH_Y;
  }
}
