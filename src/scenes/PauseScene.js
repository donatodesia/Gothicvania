import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Box background
    const boxW = 200;
    const boxH = 158;
    const boxX = width / 2;
    const boxY = height / 2;

    this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e)
      .setStrokeStyle(2, 0x8888cc);

    // Title
    this.add.text(boxX, boxY - 55, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Controls list
    const controls = [
      ['Arrow Left/Right', 'Move'],
      ['Arrow Up', 'Jump'],
      ['Arrow Down', 'Crouch'],
      ['Down + Space', 'Drop Through'],
      ['X', 'Attack'],
      ['ESC', 'Pause/Resume'],
    ];

    const startY = boxY - 30;
    const lineH = 18;

    controls.forEach(([key, action], i) => {
      const y = startY + i * lineH;
      // Key label (left-aligned)
      this.add.text(boxX - 90, y, key, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#ccccff',
      }).setOrigin(0, 0.5);
      // Action label (right-aligned)
      this.add.text(boxX + 90, y, action, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#aaaaaa',
      }).setOrigin(1, 0.5);
    });

    // "Press ESC to resume" hint
    this.add.text(boxX, boxY + 58, 'Press ESC to resume', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#666688',
    }).setOrigin(0.5);

    // ESC to resume
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }
}
