import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getAllQuestions } from '../../data/questions/index';
import type { Question, QuestionType, QuestionProgress, Part3Question } from '../../types';
import styles from './QuestionsScreen.module.css';

const STRENGTH_BADGE = ['🔴', '🟠', '🟡', '🟢', '🔵', '⭐'] as const;
const STRENGTH_LABEL = ['New', 'Seen', 'Weak', 'Fair', 'Good', 'Mastered'] as const;

const TABS: { type: QuestionType; label: string; icon: string }[] = [
  { type: 't1', label: 'Part 1 — Multiple Choice', icon: '❄' },
  { type: 't2', label: 'Part 2 — Open Cloze',      icon: '🌿' },
  { type: 't3', label: 'Part 3 — Word Formation',  icon: '🔮' },
  { type: 't4', label: 'Part 4 — Key Word Trans.',  icon: '⚔' },
];

function getStats(questions: Question[], progress: Record<string, QuestionProgress>) {
  const discovered = questions.filter(q => progress[q.id]?.discovered).length;
  const total = questions.length;
  const totalStrength = questions.reduce((sum, q) => sum + (progress[q.id]?.strength ?? 0), 0);
  const avgStrength = discovered > 0
    ? (questions.filter(q => progress[q.id]?.discovered).reduce((s, q) => s + (progress[q.id]?.strength ?? 0), 0) / discovered)
    : 0;
  return { discovered, total, avgStrength: avgStrength.toFixed(1), totalStrength };
}

export function QuestionsScreen() {
  const questionProgress = useGameStore(s => s.questionProgress);
  const closeCodex = useGameStore(s => s.closeCodex);
  const [activeTab, setActiveTab] = useState<QuestionType>('t1');

  const allQuestions = getAllQuestions();
  const byType = (t: QuestionType) => allQuestions.filter(q => q.type === t);
  const questions = byType(activeTab);
  const stats = getStats(questions, questionProgress);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>✦ Grammar Codex ✦</h1>
        <button className={styles.backBtn} onClick={closeCodex}>← Back</button>
      </div>

      <div className={styles.legend}>
        <span>Memory:</span>
        {STRENGTH_BADGE.map((badge, i) => (
          <span key={i} className={styles.legendItem}>{badge} {STRENGTH_LABEL[i]}</span>
        ))}
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.type}
            className={`${styles.tab} ${activeTab === tab.type ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.type)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabStats}>
        <span>Discovered: <span>{stats.discovered} / {stats.total}</span></span>
        <span>Avg strength: <span>{stats.avgStrength}</span></span>
      </div>

      <div className={styles.grid}>
        {questions.map(q => {
          const prog = questionProgress[q.id];
          const isDiscovered = prog?.discovered ?? false;

          if (!isDiscovered) {
            return (
              <div key={q.id} className={`${styles.card} ${styles.mystery}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>{q.id}</span>
                </div>
                <div className={styles.mysteryText}>???</div>
                <div className={styles.mysteryHint}>encounter to reveal</div>
              </div>
            );
          }

          const strength = prog.strength;
          return (
            <div key={q.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardId}>{q.id}</span>
                <span className={styles.badge} title={STRENGTH_LABEL[strength]}>
                  {STRENGTH_BADGE[strength]}
                </span>
              </div>
              <div className={styles.cardSentence}>{q.sentence}</div>
              {q.type === 't3' && (
                <div className={styles.cardStem}>{(q as Part3Question).stem}</div>
              )}
              <div className={styles.cardStats}>
                <span className={styles.correct}>✔ {prog.correct}</span>
                <span className={styles.incorrect}>✘ {prog.incorrect}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
