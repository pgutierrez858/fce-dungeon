import { useGameStore } from '../../store/gameStore';
import styles from './TitleScreen.module.css';

export function TitleScreen() {
  const startGame = useGameStore(s => s.startGame);
  const openCodex = useGameStore(s => s.openCodex);

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <div className={styles.runeRow}>✦ ✦ ✦</div>
        <h1 className={styles.title}>Dungeon of Grammar</h1>
        <p className={styles.subtitle}>FCE Use of English · Solo Combat Adventure</p>
        <p className={styles.edition}>Final Fantasy Edition</p>

        <div className={styles.lore}>
          <p>
            The Dungeon of Grammar rises beneath Lexicon City. Its monsters are
            creatures of broken language — and only correct English can slay them.
          </p>
          <p>
            You are the lone <strong>Word-Knight</strong>. Descend five floors.
            Defeat Bahamut. Restore the language.
          </p>
        </div>

        <div className={styles.quickRules}>
          <div className={styles.rule}><span>❄</span><span>Floor I — Multiple Choice Cloze (Part 1)</span></div>
          <div className={styles.rule}><span>🌿</span><span>Floor II — Open Cloze (Part 2)</span></div>
          <div className={styles.rule}><span>🔮</span><span>Floor III — Word Formation (Part 3)</span></div>
          <div className={styles.rule}><span>⚔</span><span>Floor IV — Key Word Transformation (Part 4)</span></div>
          <div className={styles.rule}><span>🐉</span><span>Floor V — All Types · Face Bahamut</span></div>
        </div>

        <button className={styles.startBtn} onClick={startGame}>
          Begin Your Quest ⚔
        </button>

        <button className={styles.codexBtn} onClick={openCodex}>
          Grammar Codex 📖
        </button>

        <p className={styles.footer}>20 HP · 5 Floors · 200 Questions</p>
      </div>
    </div>
  );
}
