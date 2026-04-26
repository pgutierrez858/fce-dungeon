import { useGameStore } from '../../store/gameStore';
import { getXpRank } from '../../engine/combat';
import styles from './EndScreen.module.css';

export function DefeatScreen() {
  const { player, currentFloor, resetGame } = useGameStore();
  const rank = getXpRank(player.xp);

  return (
    <div className={`${styles.screen} ${styles.defeat}`}>
      <div className={styles.content}>
        <div className={styles.icon}>💀</div>
        <h1 className={styles.headline}>You Have Fallen</h1>
        <p className={styles.sub}>The monsters of broken language have bested you. The dungeon remains.</p>

        <div className={styles.scoreCard}>
          <div className={styles.scoreRow}>
            <span>Reached Floor</span>
            <span className={styles.scoreVal}>{currentFloor} / 5</span>
          </div>
          <div className={styles.scoreRow}>
            <span>XP Earned</span>
            <span className={styles.scoreVal}>{player.xp} XP</span>
          </div>
          <div className={styles.scoreRow}>
            <span>Gold Collected</span>
            <span className={styles.scoreVal}>🪙 {player.gold}</span>
          </div>
          <div className={`${styles.scoreRow} ${styles.rankRow}`}>
            <span>Rank Achieved</span>
            <span className={styles.rank}>{rank}</span>
          </div>
        </div>

        <button className={`${styles.btn} ${styles.dangerBtn}`} onClick={resetGame}>
          Try Again ⚔
        </button>
      </div>
    </div>
  );
}
