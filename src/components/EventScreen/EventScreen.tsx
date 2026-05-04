import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Command } from '../../types';
import styles from './EventScreen.module.css';

const Q_TYPE_LABEL: Record<string, string> = {
  t1: '❄ Vocab Cloze', t2: '🌿 Open Cloze', t3: '🔮 Word Form.', t4: '👹 Key Word',
};

export function EventScreen() {
  const {
    currentEvent, player,
    acceptEvent, refuseEvent,
    rerollCursedMirror, acceptCursedRemoval,
    pickCommandForUpgrade,
  } = useGameStore();

  const [upgradePicking, setUpgradePicking] = useState(false);

  if (!currentEvent) return null;
  const { kind } = currentEvent;

  // ── Potion Trade ───────────────────────────────────────────────
  if (kind === 'potion-trade') {
    const POTION_TYPES = new Set(['POTION', 'HIGH_POTION', 'FIRE_POTION', 'BLOCK_POTION', 'STRENGTH_POTION']);
    const potions = player.inventory.filter(i => POTION_TYPES.has(i.type));
    const earned  = potions.length * 10;
    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>🧪</div>
          <h2 className={styles.title}>Desperate Alchemist</h2>
          <p className={styles.desc}>
            A frantic merchant grabs your sleeve. "I'll pay handsomely for your potions — any price, just name it!" He offers <strong>10 gold per potion</strong>.
          </p>
          <div className={styles.offerBox}>
            <div className={styles.offerRow}>
              <span>Your potions</span>
              <span className={styles.offerVal}>{potions.length}</span>
            </div>
            <div className={styles.offerRow}>
              <span>You would earn</span>
              <span className={styles.offerVal} style={{ color: 'var(--gold)' }}>+{earned} 💰</span>
            </div>
            {potions.length === 0 && (
              <p className={styles.offerNote}>You have no potions to sell.</p>
            )}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.acceptBtn}
              onClick={acceptEvent}
              disabled={potions.length === 0}
            >
              Sell Potions ▶
            </button>
            <button className={styles.refuseBtn} onClick={refuseEvent}>
              Refuse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Command Upgrade Trade ──────────────────────────────────────
  if (kind === 'command-upgrade') {
    const upgradeable = player.commands.filter(c => !c.upgraded);

    if (upgradePicking) {
      return (
        <div className={`${styles.screen} animate-fade-in`}>
          <div className={styles.card}>
            <div className={styles.ico}>🔮</div>
            <h2 className={styles.title}>Choose a Command to Upgrade</h2>
            <p className={styles.desc}>Select one command to permanently strengthen — for free.</p>
            <div className={styles.cmdList}>
              {upgradeable.map(cmd => (
                <UpgradePickRow
                  key={cmd.id}
                  cmd={cmd}
                  onPick={() => pickCommandForUpgrade(cmd.id)}
                />
              ))}
              {upgradeable.length === 0 && (
                <p className={styles.offerNote}>All commands are already upgraded!</p>
              )}
            </div>
            {upgradeable.length === 0 && (
              <div className={styles.actions}>
                <button className={styles.refuseBtn} onClick={refuseEvent}>Close</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>🔮</div>
          <h2 className={styles.title}>Mystical Sorcerer</h2>
          <p className={styles.desc}>
            A robed figure beckons. "Knowledge for gold — a fair trade." He offers to <strong>permanently upgrade one of your commands</strong> in exchange for <strong>all your gold</strong>.
          </p>
          <div className={styles.offerBox}>
            <div className={styles.offerRow}>
              <span>You will lose</span>
              <span className={styles.offerVal} style={{ color: 'var(--ember2)' }}>−{player.gold} 💰</span>
            </div>
            <div className={styles.offerRow}>
              <span>You will gain</span>
              <span className={styles.offerVal} style={{ color: 'var(--gold)' }}>Free upgrade ⚒</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.acceptBtn}
              onClick={() => setUpgradePicking(true)}
              disabled={player.gold === 0 || upgradeable.length === 0}
            >
              {player.gold === 0 ? 'No Gold' : upgradeable.length === 0 ? 'All Upgraded' : 'Accept ▶'}
            </button>
            <button className={styles.refuseBtn} onClick={refuseEvent}>
              Refuse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Cursed Mirror ──────────────────────────────────────────────
  if (kind === 'cursed-mirror') {
    const target = player.commands.find(c => c.id === currentEvent.targetCommandId);
    const canReroll = player.hp > 5 && player.commands.length > 1;
    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>🪞</div>
          <h2 className={styles.title}>Cursed Mirror</h2>
          <p className={styles.desc}>
            Your reflection grins and reaches through the glass, tearing away a piece of your knowledge. You cannot stop it.
          </p>
          {target ? (
            <div className={styles.curseBox}>
              <span className={styles.curseLabel}>Command to be removed:</span>
              <div className={styles.cmdPill} style={{ borderColor: 'var(--ember)' }}>
                <span className={styles.cmdName}>{target.name}</span>
                <span className={styles.cmdType}>{Q_TYPE_LABEL[target.questionType]}</span>
              </div>
            </div>
          ) : (
            <p className={styles.offerNote}>No commands to remove.</p>
          )}
          <div className={styles.actions}>
            <button
              className={styles.rerollBtn}
              onClick={rerollCursedMirror}
              disabled={!canReroll}
              title={!canReroll ? (player.hp <= 5 ? 'Not enough HP' : 'Only one command') : ''}
            >
              Reroll (−5 HP)
            </button>
            <button
              className={styles.acceptBtn}
              onClick={acceptCursedRemoval}
              disabled={!target}
            >
              Accept Removal
            </button>
          </div>
          {player.commands.length <= 1 && (
            <p className={styles.offerNote}>Cannot reroll — only one command remains.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Ancient Altar ──────────────────────────────────────────────
  if (kind === 'ancient-altar') {
    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>🗿</div>
          <h2 className={styles.title}>Ancient Altar</h2>
          <p className={styles.desc}>
            A stone altar pulses with arcane energy. An inscription reads: <em>"Bleed for wisdom."</em> You may offer your blood in exchange for knowledge.
          </p>
          <div className={styles.offerBox}>
            <div className={styles.offerRow}>
              <span>You will take</span>
              <span className={styles.offerVal} style={{ color: 'var(--ember2)' }}>−5 ❤ HP</span>
            </div>
            <div className={styles.offerRow}>
              <span>You will gain</span>
              <span className={styles.offerVal} style={{ color: 'var(--gold)' }}>+15 ✦ XP</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.acceptBtn}
              onClick={acceptEvent}
              disabled={player.hp <= 5}
            >
              {player.hp <= 5 ? 'Too Dangerous' : 'Offer Blood ▶'}
            </button>
            <button className={styles.refuseBtn} onClick={refuseEvent}>
              Refuse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dark Ritual (forced) ───────────────────────────────────────
  if (kind === 'dark-ritual') {
    const newMaxHp = Math.max(10, Math.floor(player.maxHp * 0.8));
    const hpLost   = player.maxHp - newMaxHp;
    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>🩸</div>
          <h2 className={styles.title}>Dark Ritual</h2>
          <p className={styles.desc}>
            Dark energies flood the chamber and mend your wounds — but they exact a terrible price. Your life force is permanently diminished.
          </p>
          <div className={styles.offerBox}>
            <div className={styles.offerRow}>
              <span>Healed to</span>
              <span className={styles.offerVal} style={{ color: 'var(--hp-green, #4a8a60)' }}>{newMaxHp}/{newMaxHp} ❤</span>
            </div>
            <div className={styles.offerRow}>
              <span>Max HP lost</span>
              <span className={styles.offerVal} style={{ color: 'var(--ember2)' }}>−{hpLost} ❤ (permanent)</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.acceptBtn} onClick={acceptEvent}>
              Accept Ritual ▶
            </button>
            <button className={styles.refuseBtn} onClick={refuseEvent}>
              Refuse
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Enemy Encounter (forced) ────────────────────────────────────
  if (kind === 'enemy-encounter') {
    return (
      <div className={`${styles.screen} animate-fade-in`}>
        <div className={styles.card}>
          <div className={styles.ico}>👁</div>
          <h2 className={styles.title}>Something Stirs...</h2>
          <p className={styles.desc}>
            As you step into the chamber, the shadows coil and a creature lunges from the darkness. There is no escape.
          </p>
          <div className={styles.actions}>
            <button className={styles.acceptBtn} onClick={acceptEvent}>
              Fight! ▶
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function UpgradePickRow({ cmd, onPick }: { cmd: Command; onPick: () => void }) {
  return (
    <div className={styles.upgradeRow}>
      <div className={styles.upgradeRowInfo}>
        <span className={styles.cmdName}>{cmd.name}</span>
        <span className={styles.cmdType}>{Q_TYPE_LABEL[cmd.questionType]}</span>
      </div>
      <button className={styles.pickBtn} onClick={onPick}>
        Upgrade ⚒
      </button>
    </div>
  );
}
