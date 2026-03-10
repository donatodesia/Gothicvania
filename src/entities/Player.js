import Phaser from 'phaser';

/**
 * Player controller — thin input-to-action mapper.
 * Reads keyboard input each frame and calls action methods on the active Character.
 */
export default class Player {
  constructor(scene, character) {
    this.scene     = scene;
    this.character = character;

    // Input
    this.cursors  = scene.input.keyboard.createCursorKeys();
    this.keyX     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Tracks previous frame's up-key state for variable jump cut
    this.wasUpDown = false;
  }

  switchCharacter(newCharacter) {
    const old = this.character;

    // Transfer position and velocity
    newCharacter.setPosition(old.x, old.y);
    newCharacter.body.setVelocity(old.body.velocity.x, old.body.velocity.y);

    // Transfer facing direction
    const wasLeft = old.flipX;
    newCharacter.flipX = !wasLeft;
    if (wasLeft) newCharacter.faceLeft();
    else         newCharacter.faceRight();

    // Park old character — hide and remove from physics
    old.reset();
    old.setVisible(false);
    old.body.enable = false;

    // Bring in new character
    newCharacter.setVisible(true);
    newCharacter.body.enable = true;

    this.character  = newCharacter;
    this.wasUpDown  = false;

    // Camera follows the new character
    this.scene.cameras.main.startFollow(newCharacter, true);
  }

  update() {
    const char = this.character;

    // Physics tick (gravity, landing, fall anim, death, attack lock)
    if (char.updatePhysics()) return;

    // Variable jump — detect the frame up-key is released
    const upDown = this.cursors.up.isDown;
    if (this.wasUpDown && !upDown) {
      char.releaseJump();
    }
    this.wasUpDown = upDown;

    // Movement
    if (this.cursors.left.isDown)       char.run(-1);
    else if (this.cursors.right.isDown) char.run(1);
    else if (this.cursors.down.isDown)  char.crouch();
    else                                char.stopMoving();

    // Drop through one-way platforms
    if (this.cursors.down.isDown && Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      char.dropThrough();
    }

    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      char.jump();
    }

    // Attack
    if (this.keyX.isDown) {
      char.attack();
    }
  }
}
