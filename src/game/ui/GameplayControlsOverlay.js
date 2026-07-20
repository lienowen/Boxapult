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
      title: 'FIRST EXTRACTION',
      body: 'EVADE\nPointer / Touch / ↑ ↓ / W S\n\nRETURN FIRE\nClick / Tap / Space\n\nSteal the required energy cores and survive the corporate blockade.',
      primaryLabel: 'BEGIN THE RUN',
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
      title: 'RUN PAUSED',
      body: 'Corporate scanners have temporarily lost your signal.\n\nP / ESC · Resume\nM · Toggle sound',
      primaryLabel: 'RESUME RUN',
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

    const blocker = scene.add.rectangle(width / 2, height / 2, width, height, 0x02040a, 0.84)
      .setInteractive();
    const panel = scene.add.rectangle(width / 2, height / 2, 660, 430, 0x050914, 0.98)
      .setStrokeStyle(4, 0xff6f9f, 0.55);
    const titleText = scene.add.text(width / 2, height / 2 - 150, title, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '42px',
      color: '#ffffff',
      stroke: '#050813',
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
    const primary = this.#createModalButton(width / 2, primaryY, 320, primaryLabel, 0xff5b78);
    primary.hit.on('pointerdown', onPrimary);

    container.add([blocker, panel, titleText, bodyText, primary.hit, primary.label]);

    if (showQuit) {
      const quit = this.#createModalButton(width / 2, primaryY + 72, 320, 'ABORT TO SECTORS', 0x325f82);
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
    const hit = this.#scene.add.rectangle(x, y, 50, 42, 0x050914, 0.94)
      .setStrokeStyle(2, 0xff6f9f, 0.45)
      .setDepth(160)
      .setInteractive({ useHandCursor: true });
    const text = this.#scene.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: label === 'SFX' ? '13px' : '20px',
      color: '#f8f9ff',
    }).setOrigin(0.5).setDepth(161);
    return { hit, label: text };
  }

  #createModalButton(x, y, width, label, color) {
    const hit = this.#scene.add.rectangle(x, y, width, 58, color, 1)
      .setStrokeStyle(3, 0xffd7df, 0.65)
      .setInteractive({ useHandCursor: true });
    const text = this.#scene.add.text(x, y, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '21px',
      color: '#09040a',
    }).setOrigin(0.5);
    return { hit, label: text };
  }

  #renderMuteState() {
    const muted = this.#audio.isMuted();
    this.#muteLabel.setText(muted ? 'OFF' : 'SFX');
    this.#muteButton.setFillStyle(muted ? 0x4a2531 : 0x050914, 0.94);
    this.#muteButton.setStrokeStyle(2, muted ? 0xff8597 : 0xff6f9f, 0.55);
  }
}
