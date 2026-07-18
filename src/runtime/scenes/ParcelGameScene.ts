import Phaser from 'phaser';
import type { ParcelPatrolServices } from '../../application/ParcelPatrolServices';
import { parcelPatrolBalance } from '../../content/parcelPatrol/balance';
import { createParcelPatrolTextures } from '../parcelPatrol/ArtFactory';
import { addParcelPatrolBackdrop, type ParcelPatrolBackdrop } from '../parcelPatrol/Backdrop';
import type { ParcelResultData } from '../parcelPatrol/ParcelResultData';
import type { ToneSfx } from '../parcelPatrol/ToneSfx';

type EnemyKind = 'scout' | 'raider';

export class ParcelGameScene extends Phaser.Scene {
  #services!: ParcelPatrolServices;
  #sfx!: ToneSfx;
  #backdrop!: ParcelPatrolBackdrop;
  #player!: Phaser.Physics.Arcade.Image;
  #enemies!: Phaser.Physics.Arcade.Group;
  #bolts!: Phaser.Physics.Arcade.Group;
  #enemyBolts!: Phaser.Physics.Arcade.Group;
  #parcels!: Phaser.Physics.Arcade.Group;
  #cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  #upKey: Phaser.Input.Keyboard.Key | null = null;
  #downKey: Phaser.Input.Keyboard.Key | null = null;
  #fireKey: Phaser.Input.Keyboard.Key | null = null;
  #scoreText!: Phaser.GameObjects.Text;
  #timeText!: Phaser.GameObjects.Text;
  #deliveriesText!: Phaser.GameObjects.Text;
  #livesText!: Phaser.GameObjects.Text;
  #comboText!: Phaser.GameObjects.Text;
  #timeBar!: Phaser.GameObjects.Rectangle;
  #pointerTargetY: number | null = null;
  #remainingMs = parcelPatrolBalance.missionDurationSeconds * 1000;
  #enemySpawnMs = parcelPatrolBalance.enemy.firstSpawnDelayMs;
  #parcelSpawnMs = parcelPatrolBalance.parcel.spawnDelayMs;
  #lastFireMs = -9999;
  #invulnerableUntilMs = 0;
  #score = 0;
  #deliveries = 0;
  #lives = parcelPatrolBalance.player.lives;
  #combo = 1;
  #finished = false;

  constructor() {
    super('parcel-game');
  }

  create(): void {
    createParcelPatrolTextures(this);
    this.#services = this.registry.get('parcelServices') as ParcelPatrolServices;
    this.#sfx = this.registry.get('parcelSfx') as ToneSfx;
    this.#backdrop = addParcelPatrolBackdrop(this);
    this.cameras.main.fadeIn(220, 5, 15, 26);

    this.#createPlayer();
    this.#createGroups();
    this.#createHud();
    this.#createInput();
    this.#createCollisions();

    this.#services.platform.gameplayStart();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#shutdown, this);
  }

  override update(time: number, delta: number): void {
    if (this.#finished) {
      return;
    }

    this.#backdrop.update(delta, 1 + this.#score / 9000);
    this.#updatePlayer(delta);
    this.#updateMission(time, delta);
    this.#updateEnemies(time);
    this.#cleanupObjects();
    this.#updateHud();
  }

  #createPlayer(): void {
    const balance = parcelPatrolBalance.player;
    this.#player = this.physics.add.image(balance.startX, balance.startY, 'pp-player');
    this.#player.setCollideWorldBounds(true);
    this.#player.setDepth(20);
    this.#player.setDragY(1200);
    this.#player.setMaxVelocity(0, balance.speed);
    const body = this.#player.body as Phaser.Physics.Arcade.Body;
    body.setSize(76, 38, true);

    this.tweens.add({
      targets: this.#player,
      scaleX: 1.03,
      scaleY: 0.97,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  #createGroups(): void {
    this.#enemies = this.physics.add.group({ maxSize: 45 });
    this.#bolts = this.physics.add.group({ maxSize: 55 });
    this.#enemyBolts = this.physics.add.group({ maxSize: 35 });
    this.#parcels = this.physics.add.group({ maxSize: 12 });
  }

  #createHud(): void {
    const { width } = this.scale;
    this.add.rectangle(width / 2, 42, width - 48, 68, 0x061424, 0.78)
      .setStrokeStyle(2, 0x83d7e6, 0.22)
      .setDepth(100);

    this.add.text(42, 22, 'ROUTE 01 · DOWNTOWN AIRSPACE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#bfefff',
      fontStyle: 'bold',
    }).setDepth(110);

    this.#scoreText = this.add.text(42, 48, 'SCORE 000000', {
      fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setDepth(110);
    this.#deliveriesText = this.add.text(340, 48, 'PARCELS 0', {
      fontFamily: 'Arial, sans-serif', fontSize: '21px', color: '#ffd98a', fontStyle: 'bold',
    }).setDepth(110);
    this.#comboText = this.add.text(540, 48, 'COMBO x1.0', {
      fontFamily: 'Arial, sans-serif', fontSize: '21px', color: '#75f1ff', fontStyle: 'bold',
    }).setDepth(110);
    this.#livesText = this.add.text(width - 250, 22, '♥ ♥ ♥', {
      fontFamily: 'Arial, sans-serif', fontSize: '25px', color: '#ff7184', fontStyle: 'bold',
    }).setDepth(110);
    this.#timeText = this.add.text(width - 250, 50, 'TIME 60', {
      fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setDepth(110);

    this.add.rectangle(width / 2, 84, width - 88, 8, 0x07111d, 0.75).setDepth(100);
    this.#timeBar = this.add.rectangle(44, 84, width - 88, 8, 0x59e7b0, 1)
      .setOrigin(0, 0.5)
      .setDepth(101);

    this.add.text(width / 2, this.scale.height - 32, 'MOVE WITH POINTER / ↑ ↓   ·   FIRE WITH CLICK / TAP / SPACE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#d7eff7',
      backgroundColor: '#07111dbb',
      padding: { x: 16, y: 9 },
    }).setOrigin(0.5).setDepth(100);
  }

  #createInput(): void {
    this.#cursors = this.input.keyboard?.createCursorKeys() ?? ({} as Phaser.Types.Input.Keyboard.CursorKeys);
    this.#upKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) ?? null;
    this.#downKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) ?? null;
    this.#fireKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null;
    this.#fireKey?.on('down', () => this.#tryFire(this.time.now));

    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
  }

  #createCollisions(): void {
    this.physics.add.overlap(this.#bolts, this.#enemies, (boltObject, enemyObject) => {
      this.#handleBoltEnemy(
        boltObject as Phaser.Physics.Arcade.Image,
        enemyObject as Phaser.Physics.Arcade.Image,
      );
    });

    this.physics.add.overlap(this.#player, this.#enemyBolts, (_playerObject, bulletObject) => {
      this.#damagePlayer(bulletObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.overlap(this.#player, this.#enemies, (_playerObject, enemyObject) => {
      this.#damagePlayer(enemyObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.overlap(this.#player, this.#parcels, (_playerObject, parcelObject) => {
      this.#collectParcel(parcelObject as Phaser.Physics.Arcade.Image);
    });
  }

  #updatePlayer(deltaMs: number): void {
    const speed = parcelPatrolBalance.player.speed;
    const movingUp = this.#cursors.up?.isDown === true || this.#upKey?.isDown === true;
    const movingDown = this.#cursors.down?.isDown === true || this.#downKey?.isDown === true;

    if (movingUp) {
      this.#player.setVelocityY(-speed);
      this.#pointerTargetY = null;
    } else if (movingDown) {
      this.#player.setVelocityY(speed);
      this.#pointerTargetY = null;
    } else if (this.#pointerTargetY !== null) {
      const difference = this.#pointerTargetY - this.#player.y;
      const desiredVelocity = Phaser.Math.Clamp(difference * 6.2, -speed, speed);
      this.#player.setVelocityY(Math.abs(difference) < 6 ? 0 : desiredVelocity);
    } else {
      this.#player.setVelocityY(0);
    }

    const lean = Phaser.Math.Clamp(this.#player.body.velocity.y / speed, -1, 1);
    this.#player.setAngle(lean * 8);
    this.#player.x = Phaser.Math.Linear(this.#player.x, parcelPatrolBalance.player.startX, deltaMs * 0.004);
  }

  #updateMission(time: number, deltaMs: number): void {
    this.#remainingMs = Math.max(0, this.#remainingMs - deltaMs);
    if (this.#remainingMs <= 0) {
      this.#finish(true);
      return;
    }

    this.#enemySpawnMs -= deltaMs;
    if (this.#enemySpawnMs <= 0) {
      this.#spawnEnemy(time);
      const elapsedSeconds = parcelPatrolBalance.missionDurationSeconds - this.#remainingMs / 1000;
      this.#enemySpawnMs = Math.max(
        parcelPatrolBalance.enemy.minimumSpawnDelayMs,
        parcelPatrolBalance.enemy.firstSpawnDelayMs -
          elapsedSeconds * parcelPatrolBalance.enemy.spawnAccelerationPerSecond,
      );
    }

    this.#parcelSpawnMs -= deltaMs;
    if (this.#parcelSpawnMs <= 0) {
      this.#spawnParcel();
      this.#parcelSpawnMs = parcelPatrolBalance.parcel.spawnDelayMs + Phaser.Math.Between(-500, 650);
    }
  }

  #updateEnemies(time: number): void {
    for (const child of this.#enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Image;
      if (!enemy.active || enemy.getData('kind') !== 'raider') {
        continue;
      }

      const nextShot = enemy.getData('nextShot') as number;
      if (enemy.x < this.scale.width - 110 && time >= nextShot) {
        this.#fireEnemyBolt(enemy);
        enemy.setData('nextShot', time + Phaser.Math.Between(1250, 2100));
      }
    }
  }

  #spawnEnemy(time: number): void {
    const raiderChance = Phaser.Math.Clamp(0.18 + this.#score / 12000, 0.18, 0.52);
    const kind: EnemyKind = Math.random() < raiderChance ? 'raider' : 'scout';
    const texture = kind === 'raider' ? 'pp-raider' : 'pp-scout';
    const y = Phaser.Math.Between(120, this.scale.height - 110);
    const enemy = this.#enemies.get(this.scale.width + 90, y, texture) as Phaser.Physics.Arcade.Image | null;
    if (!enemy) {
      return;
    }

    enemy.enableBody(true, this.scale.width + 90, y, true, true);
    enemy.setDepth(15);
    enemy.setData('kind', kind);
    enemy.setData('hp', kind === 'raider' ? 2 : 1);
    enemy.setData('nextShot', time + Phaser.Math.Between(900, 1700));
    const speed = kind === 'raider'
      ? Phaser.Math.Between(parcelPatrolBalance.enemy.raiderSpeedMin, parcelPatrolBalance.enemy.raiderSpeedMax)
      : Phaser.Math.Between(parcelPatrolBalance.enemy.scoutSpeedMin, parcelPatrolBalance.enemy.scoutSpeedMax);
    enemy.setVelocityX(-speed);
    enemy.setAngularVelocity(kind === 'raider' ? -8 : 5);
    const body = enemy.body as Phaser.Physics.Arcade.Body;
    body.setSize(kind === 'raider' ? 80 : 62, kind === 'raider' ? 43 : 34, true);
  }

  #spawnParcel(): void {
    const y = Phaser.Math.Between(135, this.scale.height - 125);
    const parcel = this.#parcels.get(this.scale.width + 65, y, 'pp-parcel') as Phaser.Physics.Arcade.Image | null;
    if (!parcel) {
      return;
    }

    parcel.enableBody(true, this.scale.width + 65, y, true, true);
    parcel.setVelocityX(-parcelPatrolBalance.parcel.speed);
    parcel.setAngularVelocity(30);
    parcel.setDepth(14);
    this.tweens.add({
      targets: parcel,
      scale: 1.16,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  #tryFire(time: number): void {
    if (time - this.#lastFireMs < parcelPatrolBalance.player.fireCooldownMs || this.#finished) {
      return;
    }

    const bolt = this.#bolts.get(this.#player.x + 55, this.#player.y, 'pp-bolt') as Phaser.Physics.Arcade.Image | null;
    if (!bolt) {
      return;
    }

    this.#lastFireMs = time;
    bolt.enableBody(true, this.#player.x + 55, this.#player.y, true, true);
    bolt.setVelocityX(850);
    bolt.setDepth(18);
    this.#sfx.play('fire');
    this.#player.setScale(0.96, 1.04);
    this.tweens.add({ targets: this.#player, scaleX: 1, scaleY: 1, duration: 90 });
  }

  #fireEnemyBolt(enemy: Phaser.Physics.Arcade.Image): void {
    const bullet = this.#enemyBolts.get(enemy.x - 38, enemy.y, 'pp-enemy-bolt') as Phaser.Physics.Arcade.Image | null;
    if (!bullet) {
      return;
    }

    bullet.enableBody(true, enemy.x - 38, enemy.y, true, true);
    bullet.setDepth(17);
    this.physics.moveToObject(bullet, this.#player, 280);
  }

  #handleBoltEnemy(
    bolt: Phaser.Physics.Arcade.Image,
    enemy: Phaser.Physics.Arcade.Image,
  ): void {
    if (!bolt.active || !enemy.active) {
      return;
    }

    bolt.disableBody(true, true);
    const hp = (enemy.getData('hp') as number) - 1;
    enemy.setData('hp', hp);
    this.#burst(enemy.x, enemy.y, hp <= 0 ? 0xffd36f : 0xffffff, hp <= 0 ? 10 : 4);
    this.#sfx.play('hit');

    if (hp > 0) {
      enemy.setTintFill(0xffffff);
      this.time.delayedCall(70, () => enemy.active && enemy.clearTint());
      return;
    }

    const kind = enemy.getData('kind') as EnemyKind;
    const baseScore = kind === 'raider'
      ? parcelPatrolBalance.scoring.raider
      : parcelPatrolBalance.scoring.scout;
    const awarded = Math.round(baseScore * this.#combo);
    this.#score += awarded;
    this.#combo = Math.min(
      parcelPatrolBalance.scoring.maximumCombo,
      this.#combo + parcelPatrolBalance.scoring.comboStep,
    );
    this.#floatScore(enemy.x, enemy.y, `+${awarded}`);
    enemy.disableBody(true, true);
  }

  #collectParcel(parcel: Phaser.Physics.Arcade.Image): void {
    if (!parcel.active) {
      return;
    }

    parcel.disableBody(true, true);
    this.#deliveries += 1;
    const awarded = Math.round(parcelPatrolBalance.parcel.value * this.#combo);
    this.#score += awarded;
    this.#combo = Math.min(
      parcelPatrolBalance.scoring.maximumCombo,
      this.#combo + parcelPatrolBalance.scoring.comboStep * 2,
    );
    this.#sfx.play('pickup');
    this.#burst(this.#player.x + 28, this.#player.y, 0x72f6b8, 14);
    this.#floatScore(this.#player.x + 60, this.#player.y - 30, `DELIVERED +${awarded}`);
  }

  #damagePlayer(source: Phaser.Physics.Arcade.Image): void {
    if (!source.active || this.time.now < this.#invulnerableUntilMs || this.#finished) {
      return;
    }

    source.disableBody(true, true);
    this.#invulnerableUntilMs = this.time.now + parcelPatrolBalance.player.invulnerabilityMs;
    this.#lives -= 1;
    this.#combo = 1;
    this.#sfx.play('damage');
    this.cameras.main.shake(170, 0.012);
    this.cameras.main.flash(160, 255, 70, 85, false);
    this.#burst(this.#player.x, this.#player.y, 0xff7184, 16);

    this.tweens.add({
      targets: this.#player,
      alpha: 0.2,
      duration: 95,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.#player.setAlpha(1),
    });

    if (this.#lives <= 0) {
      this.#finish(false);
    }
  }

  #cleanupObjects(): void {
    for (const child of this.#enemies.getChildren()) {
      const enemy = child as Phaser.Physics.Arcade.Image;
      if (enemy.active && enemy.x < -120) {
        enemy.disableBody(true, true);
        this.#combo = Math.max(1, this.#combo - 0.3);
      }
    }

    for (const child of this.#bolts.getChildren()) {
      const bolt = child as Phaser.Physics.Arcade.Image;
      if (bolt.active && bolt.x > this.scale.width + 80) {
        bolt.disableBody(true, true);
      }
    }

    for (const child of this.#enemyBolts.getChildren()) {
      const bullet = child as Phaser.Physics.Arcade.Image;
      if (bullet.active && (bullet.x < -60 || bullet.y < -60 || bullet.y > this.scale.height + 60)) {
        bullet.disableBody(true, true);
      }
    }

    for (const child of this.#parcels.getChildren()) {
      const parcel = child as Phaser.Physics.Arcade.Image;
      if (parcel.active && parcel.x < -70) {
        parcel.disableBody(true, true);
        this.#combo = 1;
      }
    }
  }

  #updateHud(): void {
    this.#scoreText.setText(`SCORE ${String(this.#score).padStart(6, '0')}`);
    this.#deliveriesText.setText(`PARCELS ${this.#deliveries}`);
    this.#comboText.setText(`COMBO x${this.#combo.toFixed(1)}`);
    this.#livesText.setText(Array.from({ length: Math.max(0, this.#lives) }, () => '♥').join(' '));
    const seconds = Math.ceil(this.#remainingMs / 1000);
    this.#timeText.setText(`TIME ${String(seconds).padStart(2, '0')}`);
    const ratio = this.#remainingMs / (parcelPatrolBalance.missionDurationSeconds * 1000);
    this.#timeBar.setScale(Phaser.Math.Clamp(ratio, 0, 1), 1);
    this.#timeBar.setFillStyle(ratio < 0.2 ? 0xff7184 : ratio < 0.45 ? 0xffd36f : 0x59e7b0);
  }

  #floatScore(x: number, y: number, message: string): void {
    const text = this.add.text(x, y, message, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#0b1728',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: text,
      y: y - 55,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.out',
      onComplete: () => text.destroy(),
    });
  }

  #burst(x: number, y: number, color: number, count: number): void {
    for (let index = 0; index < count; index += 1) {
      const spark = this.add.image(x, y, 'pp-spark').setTint(color).setDepth(40);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(30, 90);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(260, 520),
        ease: 'Cubic.out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  #finish(success: boolean): void {
    if (this.#finished) {
      return;
    }
    this.#finished = true;
    this.#services.platform.gameplayStop();

    const previousBest = this.#services.highScore.load();
    const bestScore = Math.max(previousBest, this.#score);
    if (bestScore > previousBest) {
      this.#services.highScore.save(bestScore);
    }

    this.#sfx.play(success ? 'success' : 'failure');
    this.cameras.main.fadeOut(360, 5, 15, 26);
    const result: ParcelResultData = {
      score: this.#score,
      deliveries: this.#deliveries,
      success,
      bestScore,
    };
    this.time.delayedCall(380, () => this.scene.start('parcel-result', result));
  }

  readonly #handlePointerMove = (pointer: Phaser.Input.Pointer): void => {
    this.#pointerTargetY = Phaser.Math.Clamp(pointer.y, 105, this.scale.height - 82);
  };

  readonly #handlePointerDown = (pointer: Phaser.Input.Pointer): void => {
    this.#pointerTargetY = Phaser.Math.Clamp(pointer.y, 105, this.scale.height - 82);
    this.#tryFire(this.time.now);
  };

  readonly #shutdown = (): void => {
    this.#services.platform.gameplayStop();
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.#fireKey?.removeAllListeners();
  };
}
