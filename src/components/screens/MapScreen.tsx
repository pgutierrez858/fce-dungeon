import { useGameStore } from '../../store/gameStore';
import { FloorBoard } from '../FloorBoard/FloorBoard';
import { PlayerHUD } from '../PlayerHUD/PlayerHUD';
import { GameHeader } from '../GameHeader/GameHeader';
import styles from './MapScreen.module.css';

export function MapScreen() {
  const { currentFloor, playerPos, floorBoard, descendFloor } = useGameStore();

  const currentTile = floorBoard?.tiles[playerPos.row]?.[playerPos.col];
  const onClearedBoss = currentTile?.type === 'boss' && currentTile.cleared;
  const canDescend = onClearedBoss && currentFloor < 5;

  return (
    <div className={styles.screen}>
      <GameHeader />
      <PlayerHUD />

      <div className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>
          🗺 Floor {currentFloor} — {floorBoard?.floorName}
        </h2>
        <FloorBoard />
      </div>

      {canDescend && (
        <div className={styles.advanceBar}>
          <p className={styles.advanceText}>
            Boss defeated! The path to Floor {currentFloor + 1} is open.
          </p>
          <button className={styles.advanceBtn} onClick={descendFloor}>
            Descend to Floor {currentFloor + 1} ▶
          </button>
        </div>
      )}
    </div>
  );
}
