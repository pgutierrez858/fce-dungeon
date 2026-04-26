import { useGameStore } from '../../store/gameStore';
import styles from './RestScreen.module.css';

export function RestScreen() {
  const { currentRest, player, takeRest } = useGameStore();
  if (!currentRest) return null;

  const newHp = Math.min(player.hp + currentRest.hpHeal, player.maxHp);
  const hpGain = newHp - player.hp;

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
              <span className={styles.effectVal}>
                +{currentRest.bonusXp} XP
              </span>
            </div>
          )}
        </div>

        <button className={styles.restBtn} onClick={takeRest}>
          Rest & Continue ▶
        </button>
      </div>
    </div>
  );
}
