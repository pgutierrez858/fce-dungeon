import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getXpRank } from '../../engine/combat';
import type { InventoryItem } from '../../types';
import { MAX_INVENTORY } from '../../types';
import styles from './PlayerHUD.module.css';

export function PlayerHUD() {
  const { player, useItem, dropItem, phase } = useGameStore();
  const { hp, maxHp, xp, gold, inventory, activeEffects } = player;
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const slots = Array.from({ length: MAX_INVENTORY }, (_, i) => inventory[i] ?? null);

  function handleUse() {
    if (!selectedItem) return;
    useItem(selectedItem.instanceId);
    setSelectedItem(null);
  }

  function handleDrop() {
    if (!selectedItem) return;
    dropItem(selectedItem.instanceId);
    setSelectedItem(null);
  }

  const combatOnlyTypes = ['FIRE_POTION', 'BLOCK_POTION', 'STRENGTH_POTION'] as string[];
  const isUsable = selectedItem
    ? selectedItem.type !== 'FAIRY' &&
      !(combatOnlyTypes.includes(selectedItem.type) && phase !== 'combat')
    : false;

  const usabilityHint = !selectedItem ? '' :
    selectedItem.type === 'FAIRY' ? 'Passive — triggers automatically when you would die.' :
    !isUsable ? 'Can only be used in combat.' : '';

  return (
    <div className={styles.hud}>
      <div className={styles.stats}>
        <StatBar icon="❤" value={hp} max={maxHp} color="var(--ember2)" />
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
               `🔮 Swap ×${(eff as any).charges}`}
            </span>
          ))}
        </div>
      )}

      <div className={styles.inventory}>
        <span className={styles.invLabel}>🎒 {inventory.length}/{MAX_INVENTORY}</span>
        <div className={styles.slots}>
          {slots.map((item, i) => (
            <button
              key={i}
              className={`${styles.slot} ${item ? styles.slotFilled : styles.slotEmpty}`}
              onClick={() => item && setSelectedItem(item)}
              disabled={!item}
              title={item ? `${item.name}: ${item.effect}` : 'Empty slot'}
            >
              {item ? (
                <>
                  <span className={styles.slotIco}>{item.ico}</span>
                  <span className={styles.slotName}>{item.name}</span>
                </>
              ) : (
                <span className={styles.emptySlot}>—</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Item action modal */}
      {selectedItem && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIco}>{selectedItem.ico}</span>
              <div>
                <div className={styles.modalName}>{selectedItem.name}</div>
                <div className={styles.modalType}>{selectedItem.type}</div>
              </div>
            </div>
            <p className={styles.modalEffect}>{selectedItem.effect}</p>
            <div className={styles.modalActions}>
              {selectedItem.type !== 'FAIRY' && (
                <button className={styles.useBtn} onClick={handleUse} disabled={!isUsable}
                  title={usabilityHint || undefined}>
                  ✨ Use
                </button>
              )}
              <button className={styles.dropBtn} onClick={handleDrop}>🗑 Drop</button>
            </div>
            {usabilityHint && <p className={styles.modalHint}>{usabilityHint}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatBarProps { icon: string; value: number; max: number; color: string; }

function StatBar({ icon, value, max, color }: StatBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className={styles.statBar}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className={styles.statValue} style={{ color }}>{value}/{max}</span>
    </div>
  );
}
