import { useGameStore } from '../../store/gameStore';
import { getItemById } from '../../data/items';
import { MAX_INVENTORY } from '../../types';
import styles from './ShopScreen.module.css';

export function ShopScreen() {
  const { shopState, player, buyItem, leaveShop } = useGameStore();
  if (!shopState) return null;

  const { itemIds, purchased } = shopState;
  const inventoryFull = player.inventory.length >= MAX_INVENTORY;

  return (
    <div className={`${styles.screen} animate-fade-in`}>
      <div className={styles.header}>
        <span className={styles.ico}>🏪</span>
        <h2 className={styles.title}>Merchant&apos;s Wares</h2>
        <span className={styles.gold}>🪙 {player.gold} Gold</span>
      </div>

      {inventoryFull && (
        <p className={styles.fullBanner}>
          ⚠ Bag is full ({MAX_INVENTORY}/{MAX_INVENTORY}) — drop an item before buying.
        </p>
      )}

      <div className={styles.items}>
        {itemIds.map(id => {
          const item = getItemById(id);
          if (!item) return null;
          const isBought  = purchased.includes(id);
          const canAfford = player.gold >= item.cost;
          const canBuy    = canAfford && !inventoryFull;

          return (
            <div key={id} className={`${styles.item} ${isBought ? styles.sold : ''}`}>
              <span className={styles.itemIco}>{item.ico}</span>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemType}>{item.type}</div>
                <p className={styles.itemEffect}>{item.effect}</p>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemCost}>🪙 {item.cost}</span>
                {isBought ? (
                  <span className={styles.soldLabel}>Purchased</span>
                ) : (
                  <button
                    className={styles.buyBtn}
                    onClick={() => buyItem(id)}
                    disabled={!canBuy}
                    title={!canAfford ? 'Not enough gold' : inventoryFull ? 'Bag full' : undefined}
                  >
                    {!canAfford ? 'Need Gold' : inventoryFull ? 'Bag Full' : 'Buy'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className={styles.leaveBtn} onClick={leaveShop}>
        Leave Shop ▶
      </button>
    </div>
  );
}
