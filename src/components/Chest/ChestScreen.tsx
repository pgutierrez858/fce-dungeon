import { useGameStore } from '../../store/gameStore';
import { getItemById } from '../../data/items';
import styles from './ChestScreen.module.css';

export function ChestScreen() {
  const { currentChestItemId, collectChest } = useGameStore();
  const item = currentChestItemId ? getItemById(currentChestItemId) : null;

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
            <p className={styles.freeLabel}>✨ Added to inventory for free!</p>
          </>
        ) : (
          <p className={styles.emptyLabel}>The chest is empty...</p>
        )}

        <button className={styles.takeBtn} onClick={collectChest}>
          {item ? 'Take Item ▶' : 'Close ▶'}
        </button>
      </div>
    </div>
  );
}
