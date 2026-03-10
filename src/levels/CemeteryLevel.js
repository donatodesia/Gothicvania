import Level from './Level.js';
import CemeteryGenerator from '../utils/CemeteryGenerator.js';
import TerrainMap from '../utils/TerrainMap.js';
import { TILE_SIZE, TILE_SOLID, GROUND_ROW, CAP_ROW, DEPTH } from '../constants.js';

const SPAWN_COL = 6;
const SPAWN_ROW = 9;

const PARALLAX_MOUNTAINS = 0.07;
const PARALLAX_GRAVEYARD = 0.25;

const ASSET_PATH = 'assets/Gothicvania Cemetery/Phaser Demo/assets';
const PROPS_PATH = 'assets/Gothicvania Cemetery/Environment/sliced-objects';

export default class CemeteryLevel extends Level {

  // ── Asset loading ──────────────────────────────────────────────────────────

  static preload(scene) {
    // Tilemap + tileset
    scene.load.tilemapTiledJSON('map',      `${ASSET_PATH}/maps/map.json`);
    scene.load.image('tileset',             `${ASSET_PATH}/environment/tileset.png`);
    scene.load.image('objects',             `${ASSET_PATH}/environment/objects.png`);

    // Backgrounds
    scene.load.image('bg-moon',             `${ASSET_PATH}/environment/bg-moon.png`);
    scene.load.image('bg-mountains',        `${ASSET_PATH}/environment/bg-mountains.png`);
    scene.load.image('bg-graveyard',        `${ASSET_PATH}/environment/bg-graveyard.png`);

    // Procedural background props
    const props = [
      'tree-1', 'tree-2', 'tree-3',
      'statue',
      'bush-large',
      'stone-1', 'stone-2', 'stone-3', 'stone-4',
    ];
    for (const p of props) {
      scene.load.image(p, `${PROPS_PATH}/${p}.png`);
    }
  }

  // ── World construction ─────────────────────────────────────────────────────

  create() {
    const scene = this.scene;

    // Parallax backgrounds (pinned — no scroll factor)
    this.bgMoon      = scene.add.tileSprite(0, 0, 384, 224, 'bg-moon').setOrigin(0).setScrollFactor(0);
    this.bgMountains = scene.add.tileSprite(0, 0, 384, 224, 'bg-mountains').setOrigin(0).setScrollFactor(0);
    this.bgGraveyard = scene.add.tileSprite(0, 0, 384, 224, 'bg-graveyard').setOrigin(0).setScrollFactor(0);

    // Tilemap
    const map        = scene.make.tilemap({ key: 'map' });
    this.mapCols     = map.width;
    this.mapWidthPx  = map.widthInPixels;
    this.mapHeightPx = map.heightInPixels;

    const tileset        = map.addTilesetImage('tileset', 'tileset');
    this.backLayer       = map.createLayer('Back Layer',        [tileset]).setDepth(DEPTH.PROPS_BACK);
    this.mainLayer       = map.createLayer('Main Layer',        [tileset]).setDepth(DEPTH.GROUND);
    this.collisionLayer  = map.createLayer('Collisions Layer',  [tileset]);
    this.collisionLayer.setVisible(false);
    this.collisionLayer.setCollision(TILE_SOLID);

    // Disable solid-tile collision in sky rows (0 – CAP_ROW)
    for (let c = 0; c < this.mapCols; c++) {
      for (let r = 0; r <= CAP_ROW; r++) {
        const t = this.collisionLayer.getTileAt(c, r);
        if (t && t.index === TILE_SOLID) t.setCollision(false, false, false, false);
      }
    }

    // Procedural terrain
    this.terrainHeight = new TerrainMap(this.mapCols);
    this.generator     = new CemeteryGenerator(scene, {
      mainLayer:      this.mainLayer,
      collisionLayer: this.collisionLayer,
      backLayer:      this.backLayer,
      terrainHeight:  this.terrainHeight,
      mapCols:        this.mapCols,
    });
    this.generator.bootstrap();
  }

  // ── Per-frame ──────────────────────────────────────────────────────────────

  update(character) {
    super.update(character);
    const camX = this.scene.cameras.main.scrollX;
    this.bgMountains.tilePositionX = camX * PARALLAX_MOUNTAINS;
    this.bgGraveyard.tilePositionX = camX * PARALLAX_GRAVEYARD;
  }

  // ── Overrides ─────────────────────────────────────────────────────────────

  get spawnPoint() {
    return { x: SPAWN_COL * TILE_SIZE, y: SPAWN_ROW * TILE_SIZE };
  }

  get groundRow() {
    return GROUND_ROW;
  }
}
