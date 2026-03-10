import Phaser from 'phaser';
import Warrior from '../entities/Warrior.js';
import Vampire from '../entities/Vampire.js';
import Archer from '../entities/Archer.js';
import Barbarian from '../entities/Barbarian.js';
import Knight from '../entities/Knight.js';
import King from '../entities/King.js';
import Necromancer from '../entities/Necromancer.js';
import Paladin from '../entities/Paladin.js';
import Goblin from '../entities/Goblin.js';
import Skeleton from '../entities/Skeleton.js';
import Mushroom from '../entities/Mushroom.js';
import FlyingEye from '../entities/FlyingEye.js';
import Rat from '../entities/Rat.js';
import Player from '../entities/Player.js';
import CemeteryLevel from '../levels/CemeteryLevel.js';
import TownLevel from '../levels/TownLevel.js';
import { TILE_SIZE, TILE_SOLID, DEPTH } from '../constants.js';

const LEVELS = {
  cemetery: CemeteryLevel,
  town:     TownLevel,
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data = {}) {
    this.LevelClass = LEVELS[data.level] ?? TownLevel;
  }

  create() {
    // --- Level ---
    this.level = new this.LevelClass(this);
    this.level.create();

    // --- Characters ---
    const { x: spawnX, y: spawnY } = this.level.spawnPoint;

    const CharClasses = [
      Warrior, Vampire, Archer, Barbarian, Knight, King,
      Necromancer, Paladin, Goblin, Skeleton, Mushroom, FlyingEye, Rat,
    ];

    this.characters = [];
    for (let i = 0; i < CharClasses.length; i++) {
      const char = new CharClasses[i](this, spawnX, spawnY);
      this.add.existing(char);
      char.setDepth(DEPTH.PLAYER);
      this.characters.push(char);
    }

    // Only the first character is active; the rest wait off-screen
    for (let i = 1; i < this.characters.length; i++) {
      this.characters[i].setVisible(false);
      this.characters[i].body.enable = false;
    }

    this.activeIndex = 0;

    // --- Player controller ---
    this.player = new Player(this, this.characters[0]);

    // --- One-way collision callback ---
    const oneWayCallback = (sprite, tile) => {
      if (tile.index === TILE_SOLID) return true;
      if (sprite.droppingThrough) return false;
      const bottom    = sprite.body.bottom;
      const tileTop   = tile.pixelY;
      const tolerance = Math.max(Math.abs(sprite.body.deltaY()), 1);
      return bottom <= tileTop + tolerance && sprite.body.velocity.y >= 0;
    };

    for (const char of this.characters) {
      this.physics.add.collider(char, this.level.collisionLayer, null, oneWayCallback);
    }

    // --- Camera & world bounds ---
    this.cameras.main.setBounds(0, 0, this.level.mapWidthPx, this.level.mapHeightPx);
    this.cameras.main.startFollow(this.characters[0], true);
    this.physics.world.setBounds(0, 0, this.level.mapWidthPx, this.level.mapHeightPx);

    // --- Switch character on Tab ---
    this.input.keyboard.on('keydown-TAB', (event) => {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.characters.length;
      this.player.switchCharacter(this.characters[this.activeIndex]);
    });

    // --- Pause on ESC ---
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  update() {
    this.player.update();
    const char = this.player.character;
    this.level.update(char);

    // Step-up: smoothly ride elevated terrain when walking into a higher surface
    if (char.body.onFloor() && char.body.velocity.x !== 0 && !char.droppingThrough) {
      const currentCol     = Math.floor(char.body.center.x / TILE_SIZE);
      const currentTerrain = this.level.terrainHeight.get(currentCol);
      const onElevated     = currentTerrain < this.level.groundRow && char.body.bottom <= currentTerrain * TILE_SIZE + 4;

      if (onElevated) {
        const dir    = char.body.velocity.x > 0 ? 1 : -1;
        const checkX = dir > 0 ? char.body.right + 2 : char.body.left - 2;
        const nextCol  = Math.floor(checkX / TILE_SIZE);
        const targetY  = this.level.terrainHeight.get(nextCol) * TILE_SIZE;
        const diff     = targetY - char.body.bottom;

        if (diff < 0 && Math.abs(diff) <= TILE_SIZE) {
          char.body.position.y = targetY - char.body.height;
          char.body.velocity.y = 0;
        }
      }
    }
  }
}
