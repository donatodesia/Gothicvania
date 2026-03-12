import Phaser from 'phaser';

// Add new tabs here — order determines display order
const TABS = [
  { key: 'controls',   label: 'CONTROLS'   },
  { key: 'levels',     label: 'LEVELS'     },
  { key: 'characters', label: 'CHARACTERS' },
];

// Add new levels here as they are implemented
const LEVELS = [
  { key: 'cemetery',     label: 'Cemetery'     },
  { key: 'town',         label: 'Town'         },
  { key: 'cathedral',    label: 'Cathedral'    },
  { key: 'magic-cliffs', label: 'Magic Cliffs' },
];

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    const boxW = 210;
    const boxH = 190;
    const boxX = width  / 2;
    const boxY = height / 2;

    // Overlay + box
    this.add.rectangle(boxX, boxY, width, height, 0x000000, 0.7);
    this.add.rectangle(boxX, boxY, boxW, boxH, 0x1a1a2e).setStrokeStyle(2, 0x8888cc);

    // Title
    this.add.text(boxX, boxY - 78, 'PAUSED', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);

    // --- Tab bar ---
    this._activeTab    = TABS[0].key;
    this._tabLabels    = {};
    this._tabContents  = {};

    const tabW = (boxW - 4) / TABS.length;

    TABS.forEach((tab, i) => {
      const tx = (boxX - boxW / 2 + 2) + tabW * i + tabW / 2;
      const ty = boxY - 59;

      const label = this.add.text(tx, ty, tab.label, {
        fontFamily: 'monospace', fontSize: '7px', color: '#666688',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      label.on('pointerdown', () => this._switchTab(tab.key));
      label.on('pointerover', () => { if (this._activeTab !== tab.key) label.setColor('#aaaacc'); });
      label.on('pointerout',  () => { if (this._activeTab !== tab.key) label.setColor('#666688'); });

      this._tabLabels[tab.key] = label;
    });

    // Divider under tabs
    this.add.rectangle(boxX, boxY - 49, boxW - 4, 1, 0x8888cc);

    // --- Tab content ---
    this._tabContents.controls   = this._buildControlsTab(boxX, boxY);
    this._tabContents.levels     = this._buildLevelsTab(boxX, boxY);
    this._tabContents.characters = this._buildCharactersTab(boxX, boxY);

    // Activate first tab
    this._switchTab(TABS[0].key);

    // Resume hint + ESC handler
    this.add.text(boxX, boxY + 82, 'ESC to resume', {
      fontFamily: 'monospace', fontSize: '7px', color: '#444466',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.resume('GameScene');
      this.scene.stop();
    });
  }

  // ── Tab switching ──────────────────────────────────────────────────────────

  _switchTab(key) {
    this._activeTab = key;

    for (const [k, container] of Object.entries(this._tabContents)) {
      container.setVisible(k === key);
    }

    for (const [k, label] of Object.entries(this._tabLabels)) {
      label.setColor(k === key ? '#ffffff' : '#666688');
    }
  }

  // ── Tab builders ───────────────────────────────────────────────────────────

  _buildControlsTab(boxX, boxY) {
    const container = this.add.container(0, 0);

    const controls = [
      ['Left / Right', 'Move'],
      ['Up',           'Jump'],
      ['Down',         'Crouch'],
      ['Down + Space', 'Drop Through'],
      ['X',            'Attack'],
      ['Tab',          'Switch Character'],
    ];

    const startY = boxY - 35;
    const lineH  = 17;

    controls.forEach(([key, action], i) => {
      const y = startY + i * lineH;
      container.add([
        this.add.text(boxX - 90, y, key, {
          fontFamily: 'monospace', fontSize: '8px', color: '#ccccff',
        }).setOrigin(0, 0.5),
        this.add.text(boxX + 90, y, action, {
          fontFamily: 'monospace', fontSize: '8px', color: '#aaaaaa',
        }).setOrigin(1, 0.5),
      ]);
    });

    return container;
  }

  _buildCharactersTab(boxX, boxY) {
    const container = this.add.container(0, 0);
    const gs        = this.scene.get('GameScene');
    const chars     = gs.characters;
    const btns      = [];

    // Two-column layout — fits all 13 characters
    const COL_X  = [boxX - 85, boxX + 5];
    const startY = boxY - 38;
    const lineH  = 14;

    const refresh = () => {
      btns.forEach((btn, i) => {
        btn.setColor(i === gs.activeIndex ? '#ffff88' : '#ccccff');
      });
    };

    chars.forEach((char, i) => {
      const x    = COL_X[i % 2];
      const y    = startY + Math.floor(i / 2) * lineH;
      const name = char.constructor.name;

      const btn = this.add.text(x, y, name, {
        fontFamily: 'monospace', fontSize: '8px', color: '#ccccff',
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout',  () => refresh());
      btn.on('pointerdown', () => {
        gs.activeIndex = i;
        gs.player.switchCharacter(chars[i]);
        refresh();
      });

      btns.push(btn);
      container.add(btn);
    });

    refresh();
    return container;
  }

  _buildLevelsTab(boxX, boxY) {
    const container = this.add.container(0, 0);

    const startY = boxY - 25;
    const lineH  = 22;

    LEVELS.forEach(({ key, label }, i) => {
      const y   = startY + i * lineH;
      const btn = this.add.text(boxX, y, `▶  ${label}`, {
        fontFamily: 'monospace', fontSize: '10px', color: '#ccccff',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout',  () => btn.setColor('#ccccff'));
      btn.on('pointerdown', () => {
        this.scene.stop();
        this.scene.start('GameScene', { level: key });
      });

      container.add(btn);
    });

    return container;
  }
}
