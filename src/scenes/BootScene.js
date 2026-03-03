import Phaser from 'phaser';

const ASSET_PATH = 'assets/Gothicvania Cemetery/Phaser Demo/assets';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Atlas
    this.load.atlas(
      'atlas',
      `${ASSET_PATH}/atlas/atlas.png`,
      `${ASSET_PATH}/atlas/atlas.json`
    );

    // Tilemap
    this.load.tilemapTiledJSON('map', `${ASSET_PATH}/maps/map.json`);

    // Tileset images
    this.load.image('tileset', `${ASSET_PATH}/environment/tileset.png`);
    this.load.image('objects', `${ASSET_PATH}/environment/objects.png`);

    // Backgrounds
    this.load.image('bg-moon', `${ASSET_PATH}/environment/bg-moon.png`);
    this.load.image('bg-mountains', `${ASSET_PATH}/environment/bg-mountains.png`);
    this.load.image('bg-graveyard', `${ASSET_PATH}/environment/bg-graveyard.png`);

    // Procedural background props
    const PROPS = 'assets/Gothicvania Cemetery/Environment/sliced-objects';
    this.load.image('tree-1',     `${PROPS}/tree-1.png`);
    this.load.image('tree-2',     `${PROPS}/tree-2.png`);
    this.load.image('tree-3',     `${PROPS}/tree-3.png`);
    this.load.image('statue',     `${PROPS}/statue.png`);
    this.load.image('bush-large', `${PROPS}/bush-large.png`);
    this.load.image('stone-1',    `${PROPS}/stone-1.png`);
    this.load.image('stone-2',    `${PROPS}/stone-2.png`);
    this.load.image('stone-3',    `${PROPS}/stone-3.png`);
    this.load.image('stone-4',    `${PROPS}/stone-4.png`);
  }

  create() {
    this.scene.start('GameScene');
  }
}
