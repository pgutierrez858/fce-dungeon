import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import styles from './GameHeader.module.css';

export function GameHeader() {
  const { currentFloor, floorBoard, phase, resetGame, openCodex } = useGameStore();
  const [confirming, setConfirming] = useState(false);

  function handleRestart() {
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    resetGame();
  }

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>👹 Dungeon of Grammar 👹</h1>

      <div className={styles.right}>
        {floorBoard && (
          <span className={styles.roomTag}>
            Floor {currentFloor} — {floorBoard.floorName}
          </span>
        )}

        <button
          className={styles.codexBtn}
          onClick={openCodex}
          disabled={phase === 'combat'}
          title={phase === 'combat' ? 'Cannot open during combat' : 'Grammar Codex'}
        >
          📖 Codex
        </button>

        {confirming ? (
          <div className={styles.confirmRow}>
            <span className={styles.confirmText}>Restart?</span>
            <button className={styles.confirmYes} onClick={handleRestart}>Yes</button>
            <button className={styles.confirmNo} onClick={() => setConfirming(false)}>No</button>
          </div>
        ) : (
          <button className={styles.restartBtn} onClick={handleRestart} title="Restart quest">
            ↺ Restart
          </button>
        )}
      </div>
    </div>
  );
}
