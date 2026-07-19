export class GameplayControlsOverlay {
  #scene;
  #audio;
  #settings;
  #onPauseChange;
  #onQuit;
  #modal = null;
  #mode = null;
  #pauseButton;
  #pauseLabel;
  #muteButton;
  #muteLabel;
  #pauseKey = null;
  #escapeKey = null;
  #muteKey = null;

  constructor(scene, { audio, settings, onPauseChange, onQuit }) {
    this.#scene = scene;
    this.#audio = audio;
    this.#settings = settings;
    this.#onPauseChange = onPauseChange;
    this.#onQuit = onQuit;

    const width = scene.scale.width;
    const pauseControl = this.#createCompactButton(width - 48, 120, 'Ⅱ');
    this.#pauseButton = pauseControl.hit;
    this.#pauseLabel = pauseControl.label;
    const muteControl = this.#createCompactButton(width - 106, 120, 'SFX');
    this.#muteButton = muteControl.hit;
    this.#muteLabel = muteControl.label;

    this.#pauseButton.on('pointerdown', this.togglePause, this);
    this.#muteButton.on('pointerdown', this.toggleMute, this);

    const keyboard = scene.input.keyboard;
    this.#pauseKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P) ?? null;
    this.#escapeKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) ?? null;
    this.#muteKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M) ?? null;
    this.#pauseKey?.on('down', this.togglePause, this);
    this.#escapeKey?.on('down', this.togglePause, this);
    this.#muteKey?.on('down', this.toggleMute, this);

    this.#renderMuteState();
    if (!settings.hasSeenTutorial()) this.#showTutorial();
  }

  get blocksGameplay() {
    return this.#mode !== null;
  }

  togglePause() {
    if (this.#mode === 'tutorial') return;
    if (this.#mode === 'pause') {
      this.#closeModal();
      return;
    }
    this.#showPause();
  }

  toggleMute() {
    this.#audio.toggleMuted();
    this.#renderMuteState();
  }

  destroy() {
    this.#pauseButton.off('pointerdown', this.togglePause, this);
    this.#muteButton.off('pointerdown', this.toggleMute, this);
    this.#pauseKey?.off('down', this.togglePause, this);
    this.#escapeKey?.off('down', this.togglePause, this);
    this.#muteKey?.off('down', this.toggleMute, this);
    this.#modal?.destroy(true);
    this.#pauseButton.destroy();
    this.#pauseLabel.destroy();
    this.#muteButton.destroy();
    this.#muteLabel.destroy();
  }

  #showTutorial() {
    this.#mode = 'tutorial';
    this.#onPauseChange(true, 'tutorial');
    this.#modal = this.#createModal({
      title: 'FIRST DELIVERY',
      body: 'MOVE\nPointer / Touch / ↑ ↓ / W S\n\nFIRE\nClick / Tap / Space\n\nCollect the required parcels and survive the route.',
      primaryLabel: 'START ROUTE',
      onPrimary: () => {
        this.#settings.markTutorialSeen();
        this.#closeModal();
      },
      showQuit: false,
    });
  }

  #showPause() {
    this.#mode = 'pause';
    this.#onPauseChange(true, 'pause');
    this.#modal = this.#createModal({
      title: 'ROUTE PAUSED',
      body: 'The delivery route is holding position.\n\nP / ESC · Resume\nM · Toggle sound',
      primaryLabel: 'RESUME',
      onPrimary: () => this.#closeModal(),
      showQuit: true,
    });
  }

  #closeModal() {
    if (!this.#mode) return;
    this.#modal?.destroy(true);
    this.#modal = null;
    this.#mode = null;
    this.#onPauseChange(false, null);
  }

  #createModal({ title, body, primaryLabel, onPrimary, showQuit }) {
    const scene = this.#scene;
    const width = scene.scale.width;
    const height = scene.scale.height;
    const container = scene.add.container(0, 0).setDepth(500);

    const blocker = scene.add.rectangle(width / 2, height / 2, width, height, 0x020914, 0.78)
      .setInteractive();
    const panel = scene.add.rectangle(width / 2, height / 2, 660, 430, 0x081a2e, 0.98)
      .setStrokeStyle(4, 0x79e7f4, 0.5);
    const titleText = scene.add.text(width / 2, height / 2 - 150, title, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#06101e',
      strokeThickness: 7,
    }).setOrigin(0.5);
    const bodyText = scene.add.text(width / 2, height / 2 - 55, body, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#dff6ff',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: 560 },
    }).setOrigin(0.5);

    const primaryY = height / 2 + 145;
    const primary = this.#createModalButton(width / 2, primaryY, 320, primaryLabel, 0x1fc490);
    primary.hit.on('pointerdown', onPrimary);

    container.add([blocker, panel, titleText, bodyText, primary.hit, primary.label]);

    if (showQuit) {
      const quit = this.#createModalButton(width / 2, primaryY + 72, 320, 'QUIT TO ROUTES', 0x325f82);
      quit.hit.on('pointerdown', () => {
        this.#modal = null;
        this.#mode = null;
        this.#onQuit();
      });
      container.add([quit.hit, quit.label]);
      panel.setSize(660, 500);
    }

    return container;
  }

  #createCompactButton(x, y, label) {
    const hit = this.#scene.add.rectangle(x, y, 50, 42, 0x07182a, 0.9)
      .setStrokeStyle(2, 0x91ddea, 0.42)
      .setDepth(160)
      .setInteractive({ useHandCursor: true });
    const text = this.#scene.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: label === 'SFX' ? '13px' : '20px',
      color: '#e8faff',
    }).setOrigin(0.5).setDepth(161);
    return { hit, label: text };
  }

  #createModalButton(x, y, width, label, color) {
    const hit = this.#scene.add.rectangle(x, y, width, 58, color, 1)
      .setStrokeStyle(3, 0xc9fff0, 0.65)
      .setInteractive({ useHandCursor: true });
    const text = this.#scene.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '21px',
      color: '#061822',
    }).setOrigin(0.5);
    return { hit, label: text };
  }

  #renderMuteState() {
    const muted = this.#audio.isMuted();
    this.#muteLabel.setText(muted ? 'OFF' : 'SFX');
    this.#muteButton.setFillStyle(muted ? 0x4a2531 : 0x07182a, 0.9);
    this.#muteButton.setStrokeStyle(2, muted ? 0xff8597 : 0x91ddea, 0.52);
  }
}
