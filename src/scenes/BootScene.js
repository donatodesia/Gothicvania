import Phaser from 'phaser';
import CemeteryLevel from '../levels/CemeteryLevel.js';
import TownLevel from '../levels/TownLevel.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Level assets (tilemap data, tilesets, backgrounds, props)
    CemeteryLevel.preload(this);
    TownLevel.preload(this);  // dynamic tilemap — no JSON file

    // --- Character assets ---

    // Warrior atlas (Phaser Demo)
    const ATLAS = 'assets/Gothicvania Cemetery/Phaser Demo/assets/atlas';
    this.load.atlas('atlas', `${ATLAS}/atlas.png`, `${ATLAS}/atlas.json`);

    // Vampire spritesheets
    const VAMP = 'assets/Gothicvania Cemetery/Characters/Vampire';
    this.load.spritesheet('vampire-idle',   `${VAMP}/vampire-idle.png`,   { frameWidth: 55, frameHeight: 60 });
    this.load.spritesheet('vampire-walk',   `${VAMP}/vampire-walk.png`,   { frameWidth: 55, frameHeight: 60 });
    this.load.spritesheet('vampire-run',    `${VAMP}/vampire-run.png`,    { frameWidth: 55, frameHeight: 60 });
    this.load.spritesheet('vampire-jump',   `${VAMP}/vampire-jump.png`,   { frameWidth: 55, frameHeight: 60 });
    this.load.spritesheet('vampire-attack', `${VAMP}/vampire-attack.png`, { frameWidth: 55, frameHeight: 60 });
    this.load.spritesheet('vampire-hurt',   `${VAMP}/vampire-hurt.png`,   { frameWidth: 55, frameHeight: 60 });

    // Characters from unwrapped-assets
    const CHARS = 'assets/characters';
    const ANIMS = ['idle', 'run', 'jump', 'fall', 'attack', 'hurt'];

    const uniform60 = ['king', 'necromancer', 'paladin', 'goblin', 'skeleton', 'mushroom', 'flyingeye'];
    for (const name of uniform60) {
      for (const anim of ANIMS) {
        this.load.spritesheet(`${name}-${anim}`, `${CHARS}/${name}/${name}-${anim}.png`, { frameWidth: 60, frameHeight: 60 });
      }
    }

    const archerFW    = { idle: 46, run: 74, jump: 54, fall: 57, attack: 164, hurt: 48 };
    const barbarianFW = { idle: 60, run: 70, jump: 161, fall: 94, attack: 90,  hurt: 60 };
    const knightFW    = { idle: 54, run: 96, jump: 61, fall: 57, attack: 87,  hurt: 216 };
    for (const anim of ANIMS) {
      this.load.spritesheet(`archer-${anim}`,    `${CHARS}/archer/archer-${anim}.png`,       { frameWidth: archerFW[anim],    frameHeight: 52 });
      this.load.spritesheet(`barbarian-${anim}`, `${CHARS}/barbarian/barbarian-${anim}.png`, { frameWidth: barbarianFW[anim], frameHeight: 52 });
      this.load.spritesheet(`knight-${anim}`,    `${CHARS}/knight/knight-${anim}.png`,       { frameWidth: knightFW[anim],    frameHeight: 52 });
    }

    for (const anim of ANIMS) {
      this.load.spritesheet(`rat-${anim}`, `${CHARS}/rat/rat-${anim}.png`, { frameWidth: 24, frameHeight: 24 });
    }
  }

  create() {
    this.scene.start('GameScene');
  }
}
