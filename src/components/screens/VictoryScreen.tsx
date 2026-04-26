import { useGameStore } from '../../store/gameStore';
import { getXpRank } from '../../engine/combat';
import styles from './EndScreen.module.css';

export function VictoryScreen() {
  const { player, resetGame } = useGameStore();
  const rank = getXpRank(player.xp);

  return (
    <div className={`${styles.screen} ${styles.victory}`}>
      <div className={styles.content}>
        <div className={styles.icon}>🐉</div>
        <h1 className={styles.headline}>Bahamut Defeated!</h1>
        <p className={styles.sub}>The Dungeon of Grammar is purified. Language is restored.</p>

        <div className={styles.scoreCard}>
          <div className={styles.scoreRow}>
            <span>Final HP</span>
            <span className={styles.scoreVal}>{player.hp}/{player.maxHp}</span>
          </div>
          <div className={styles.scoreRow}>
            <span>Total XP</span>
            <span className={styles.scoreVal}>{player.xp} XP</span>
          </div>
          <div className={styles.scoreRow}>
            <span>Gold Remaining</span>
            <span className={styles.scoreVal}>🪙 {player.gold}</span>
          </div>
          <div className={`${styles.scoreRow} ${styles.rankRow}`}>
            <span>Final Rank</span>
            <span className={styles.rank}>{rank}</span>
          </div>
        </div>

        <button className={styles.btn} onClick={resetGame}>
          Play Again ⚔
        </button>
      </div>
    </div>
  );
}
