import { useGameStore } from '../../store/gameStore';
import type { Command, CommandEffect } from '../../types';
import styles from './RestScreen.module.css';

const Q_TYPE_LABEL: Record<string, string> = {
  t1: '❄ Vocab Cloze', t2: '🌿 Open Cloze', t3: '🔮 Word Form.', t4: '👹 Key Word',
};
const Q_TYPE_COLOR: Record<string, string> = {
  t1: 'var(--t1b)', t2: 'var(--t2b)', t3: 'var(--t3b)', t4: 'var(--t4b)',
};

export function RestScreen() {
  const { currentRest, player, takeRest, upgradeCommand } = useGameStore();
  if (!currentRest) return null;

  const newHp  = Math.min(player.hp + currentRest.hpHeal, player.maxHp);
  const hpGain = newHp - player.hp;

  const upgradeable = player.commands.filter(c => !c.upgraded && player.xp >= c.upgradeCost);
  const notAffordable = player.commands.filter(c => !c.upgraded && player.xp < c.upgradeCost);

  return (
    <div className={`${styles.screen} animate-fade-in`}>
      <div className={styles.card}>
        <div className={styles.ico}>{currentRest.ico}</div>
        <h2 className={styles.title}>{currentRest.title}</h2>
        <p className={styles.text}>{currentRest.text}</p>

        <div className={styles.effects}>
          <div className={styles.effect}>
            <span className={styles.effectIcon}>❤</span>
            <span className={styles.effectVal}>
              {player.hp}/{player.maxHp}
              {hpGain > 0 && <span className={styles.gain}> +{hpGain}</span>}
              {' '}→ {newHp}/{player.maxHp}
            </span>
          </div>
          {currentRest.bonusXp && (
            <div className={styles.effect}>
              <span className={styles.effectIcon}>✦</span>
              <span className={styles.effectVal}>+{currentRest.bonusXp} XP</span>
            </div>
          )}
        </div>

        {/* ── Command upgrades ── */}
        {player.commands.length > 0 && (
          <div className={styles.upgradeSection}>
            <h3 className={styles.upgradeTitle}>⚒ Upgrade Commands</h3>
            <p className={styles.upgradeHint}>Spend XP to permanently strengthen a command.</p>
            <div className={styles.xpDisplay}>✦ {player.xp} XP available</div>

            {upgradeable.length > 0 && (
              <div className={styles.cmdList}>
                {upgradeable.map(cmd => (
                  <CommandUpgradeRow
                    key={cmd.id}
                    cmd={cmd}
                    canAfford
                    onUpgrade={() => upgradeCommand(cmd.id)}
                  />
                ))}
              </div>
            )}

            {notAffordable.length > 0 && (
              <div className={styles.cmdList}>
                {notAffordable.map(cmd => (
                  <CommandUpgradeRow
                    key={cmd.id}
                    cmd={cmd}
                    canAfford={false}
                    onUpgrade={() => {}}
                  />
                ))}
              </div>
            )}

            {player.commands.every(c => c.upgraded) && (
              <p className={styles.allUpgraded}>✦ All commands are already upgraded!</p>
            )}
          </div>
        )}

        <button className={styles.restBtn} onClick={takeRest}>
          Rest & Continue ▶
        </button>
      </div>
    </div>
  );
}

function EffectPill({ effect }: { effect: CommandEffect }) {
  if (effect.kind === 'attack')   return <span className={styles.effAtk}>⚔ {effect.damage}</span>;
  if (effect.kind === 'block')    return <span className={styles.effBlk}>🛡 {effect.amount}</span>;
  if (effect.kind === 'strength') return <span className={styles.effStr}>💪 {effect.amount}</span>;
  return null;
}

function CommandUpgradeRow({ cmd, canAfford, onUpgrade }: {
  cmd: Command; canAfford: boolean; onUpgrade: () => void;
}) {
  const color = Q_TYPE_COLOR[cmd.questionType];
  return (
    <div className={`${styles.cmdRow} ${!canAfford ? styles.cmdRowDim : ''}`}>
      <div className={styles.cmdInfo}>
        <div className={styles.cmdRowHeader}>
          <span className={styles.cmdRowName}>{cmd.name}</span>
          <span className={styles.cmdRowType} style={{ color }}>{Q_TYPE_LABEL[cmd.questionType]}</span>
        </div>
        <div className={styles.cmdRowEffects}>
          <span className={styles.cmdRowLabel}>Now: </span>
          {cmd.effects.map((e, i) => <EffectPill key={i} effect={e} />)}
          <span className={styles.arrow}>→</span>
          <span className={styles.cmdRowLabel}>After: </span>
          {cmd.upgradedEffects.map((e, i) => <EffectPill key={i} effect={e} />)}
        </div>
      </div>
      <button
        className={`${styles.upgradeBtn} ${!canAfford ? styles.upgradeBtnDim : ''}`}
        onClick={onUpgrade}
        disabled={!canAfford}
        title={canAfford ? `Upgrade for ${cmd.upgradeCost} XP` : `Need ${cmd.upgradeCost} XP`}
      >
        {canAfford ? `⚒ ${cmd.upgradeCost} XP` : `🔒 ${cmd.upgradeCost} XP`}
      </button>
    </div>
  );
}
