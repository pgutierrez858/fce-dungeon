import { useGameStore } from '../../store/gameStore';
import { getXpRank } from '../../engine/combat';
import styles from './PlayerHUD.module.css';

export function PlayerHUD() {
  const { player, useItem, phase } = useGameStore();
  const { hp, maxHp, xp, gold, inventory, activeEffects } = player;

  return (
    <div className={styles.hud}>
      <div className={styles.stats}>
        <StatBar
          icon="❤"
          value={hp}
          max={maxHp}
          color="var(--ember2)"
        />
        <div className={styles.numbers}>
          <span className={styles.xp}>✦ {xp} XP</span>
          <span className={styles.rank}>{getXpRank(xp)}</span>
        </div>
        <div className={styles.gold}>🪙 {gold} Gold</div>
      </div>

      {activeEffects.length > 0 && (
        <div className={styles.effects}>
          {activeEffects.map((eff, i) => (
            <span key={i} className={styles.effectBadge}>
              {eff.kind === 'shield' ? `🛡 Shield ×${(eff as any).charges}` :
               eff.kind === 'skip'   ? `📜 Skip ×${(eff as any).charges}` :
               '🔮 Swap'}
            </span>
          ))}
        </div>
      )}

      {inventory.length > 0 && (
        <div className={styles.inventory}>
          <span className={styles.invLabel}>🎒 Bag</span>
          <div className={styles.items}>
            {inventory.map(item => (
              <button
                key={item.instanceId}
                className={styles.itemBtn}
                title={`${item.name}: ${item.effect}`}
                onClick={() => useItem(item.instanceId)}
                disabled={item.id === 'i11' && phase === 'combat'}
              >
                <span className={styles.itemIco}>{item.ico}</span>
                <span className={styles.itemName}>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatBarProps {
  icon: string;
  value: number;
  max: number;
  color: string;
}

function StatBar({ icon, value, max, color }: StatBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={styles.statBar}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.statValue} style={{ color }}>
        {value}/{max}
      </span>
    </div>
  );
}
