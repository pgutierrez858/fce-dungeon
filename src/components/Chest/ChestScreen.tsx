import { useGameStore } from '../../store/gameStore';
import { getItemById } from '../../data/items';
import { MAX_INVENTORY } from '../../types';
import styles from './ChestScreen.module.css';

export function ChestScreen() {
  const { currentChestItemId, collectChest, abandonChest, player } = useGameStore();
  const item = currentChestItemId ? getItemById(currentChestItemId) : null;
  const isFull = player.inventory.length >= MAX_INVENTORY;

  return (
    <div className={`${styles.screen} animate-fade-in`}>
      <div className={styles.card}>
        <div className={styles.chestIco}>📦</div>
        <h2 className={styles.title}>Treasure Chest!</h2>

        {item ? (
          <>
            <div className={styles.itemReveal}>
              <span className={styles.itemIco}>{item.ico}</span>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemType}>{item.type}</div>
                <p className={styles.itemEffect}>{item.effect}</p>
              </div>
            </div>

            {isFull ? (
              <p className={styles.fullWarning}>
                ⚠ Inventory full! Drop an item from your bag first.
              </p>
            ) : (
              <p className={styles.freeLabel}>✨ Added to inventory for free!</p>
            )}
          </>
        ) : (
          <p className={styles.emptyLabel}>The chest is empty...</p>
        )}

        <div className={styles.actions}>
          {item && (
            <button
              className={styles.takeBtn}
              onClick={collectChest}
              disabled={isFull}
            >
              {isFull ? '🎒 Bag Full' : 'Take Item ▶'}
            </button>
          )}
          <button className={styles.abandonBtn} onClick={abandonChest}>
            {item ? 'Leave Behind' : 'Close ▶'}
          </button>
        </div>
      </div>
    </div>
  );
}
