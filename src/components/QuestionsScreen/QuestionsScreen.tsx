import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getAllQuestions } from '../../data/questions/index';
import type { Question, QuestionType, QuestionProgress, Part1Question, Part3Question, Part4Question } from '../../types';
import styles from './QuestionsScreen.module.css';

const STRENGTH_LABEL = ['New', 'Seen', 'Weak', 'Fair', 'Good', 'Mastered'] as const;

const TABS: { type: QuestionType; label: string; icon: string }[] = [
  { type: 't1', label: 'Part 1 — Multiple Choice', icon: '❄' },
  { type: 't2', label: 'Part 2 — Open Cloze',      icon: '🌿' },
  { type: 't3', label: 'Part 3 — Word Formation',  icon: '🔮' },
  { type: 't4', label: 'Part 4 — Key Word Trans.',  icon: '👹' },
];

// Okabe-Ito colorblind-safe palette, each level also has a distinct shape
const STRENGTH_CONFIG = [
  { color: '#888888' },  // 0 New       — circle outline
  { color: '#E69F00' },  // 1 Seen      — triangle
  { color: '#D4B800' },  // 2 Weak      — diamond (slightly darker yellow for dark-bg contrast)
  { color: '#56B4E9' },  // 3 Fair      — square
  { color: '#3399DD' },  // 4 Good      — filled circle
  { color: '#FFD700' },  // 5 Mastered  — star
] as const;

function StrengthBadge({ strength, size = 15 }: { strength: number; size?: number }) {
  const { color } = STRENGTH_CONFIG[strength] ?? STRENGTH_CONFIG[0];
  const label = STRENGTH_LABEL[strength] ?? 'Unknown';

  const shapes: Record<number, React.ReactNode> = {
    0: <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.8" fill="none" />,
    1: <polygon points="7,1.5 13,12.5 1,12.5" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />,
    2: <polygon points="7,1.5 12.5,7 7,12.5 1.5,7" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" />,
    3: <rect x="1.5" y="1.5" width="11" height="11" stroke={color} strokeWidth="1.8" fill="none" />,
    4: <circle cx="7" cy="7" r="5.5" fill={color} />,
    5: (
      <polygon
        points="7,1.5 8.3,5.2 12.2,5.3 9.1,7.7 10.2,11.5 7,9.2 3.8,11.5 4.9,7.7 1.8,5.3 5.7,5.2"
        fill={color}
      />
    ),
  };

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 14 14"
      aria-label={label}
      className={styles.strengthBadge}
    >
      <title>{label}</title>
      {shapes[strength] ?? shapes[0]}
    </svg>
  );
}

function QuestionDetail({ question, prog, onClose }: {
  question: Question;
  prog: QuestionProgress;
  onClose: () => void;
}) {
  const tip = (question as Part1Question).tip;

  const renderBody = () => {
    switch (question.type) {
      case 't1': {
        const q = question as Part1Question;
        const letters = ['A', 'B', 'C', 'D'];
        return (
          <>
            <p className={styles.detailSentence}>{q.sentence}</p>
            <div className={styles.detailOptions}>
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={`${styles.detailOption} ${opt === q.answer ? styles.detailCorrect : ''}`}
                >
                  <span className={styles.detailLetter}>{letters[i]}</span>
                  <span>{opt}</span>
                  {opt === q.answer && <span className={styles.detailMark}>✔</span>}
                </div>
              ))}
            </div>
          </>
        );
      }
      case 't2': {
        const a2 = question.answer;
        return (
          <>
            <p className={styles.detailSentence}>{question.sentence}</p>
            <div className={styles.detailAnswer}>
              Answer: <strong>{Array.isArray(a2) ? a2.join(' / ') : a2}</strong>
            </div>
          </>
        );
      }
      case 't3': {
        const q = question as Part3Question;
        const a3 = q.answer;
        return (
          <>
            <p className={styles.detailSentence}>{q.sentence}</p>
            <div className={styles.detailStemRow}>
              Stem: <strong>{q.stem}</strong>
            </div>
            <div className={styles.detailAnswer}>
              Answer: <strong>{Array.isArray(a3) ? a3.join(' / ') : a3}</strong>
            </div>
          </>
        );
      }
      case 't4': {
        const q = question as Part4Question;
        const answers = Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer;
        return (
          <>
            <p className={styles.detailSentence}>{q.sentence}</p>
            <div className={styles.detailMeta}>
              <span>Begin with: <strong>{q.beginWith}</strong></span>
              <span>Keyword: <strong>{q.keyword}</strong></span>
            </div>
            <div className={styles.detailAnswer}>
              Answer: <strong>{answers}</strong>
            </div>
          </>
        );
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <span className={styles.detailId}>{question.id}</span>
          <div className={styles.detailStrength}>
            <StrengthBadge strength={prog.strength} size={16} />
            <span>{STRENGTH_LABEL[prog.strength]}</span>
          </div>
          <button className={styles.detailClose} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {renderBody()}

        {tip && (
          <div className={styles.detailTip}>
            <span className={styles.detailTipLabel}>Tip</span>
            {tip}
          </div>
        )}

        <div className={styles.detailStats}>
          <span className={styles.correct}>✔ {prog.correct} correct</span>
          <span className={styles.incorrect}>✘ {prog.incorrect} incorrect</span>
        </div>
      </div>
    </div>
  );
}

function getStats(questions: Question[], progress: Record<string, QuestionProgress>) {
  const discovered = questions.filter(q => progress[q.id]?.discovered).length;
  const total = questions.length;
  const avgStrength = discovered > 0
    ? (questions.filter(q => progress[q.id]?.discovered)
        .reduce((s, q) => s + (progress[q.id]?.strength ?? 0), 0) / discovered)
    : 0;
  return { discovered, total, avgStrength: avgStrength.toFixed(1) };
}

export function QuestionsScreen() {
  const questionProgress = useGameStore(s => s.questionProgress);
  const closeCodex = useGameStore(s => s.closeCodex);
  const [activeTab, setActiveTab] = useState<QuestionType>('t1');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const allQuestions = getAllQuestions();
  const byType = (t: QuestionType) => allQuestions.filter(q => q.type === t);
  const questions = byType(activeTab);
  const stats = getStats(questions, questionProgress);

  const selectedProg = selectedQuestion ? questionProgress[selectedQuestion.id] : null;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>✦ Grammar Codex ✦</h1>
        <button className={styles.backBtn} onClick={closeCodex}>← Back</button>
      </div>

      <div className={styles.legend}>
        <span>Memory:</span>
        {STRENGTH_CONFIG.map((_cfg, i) => (
          <span key={i} className={styles.legendItem}>
            <StrengthBadge strength={i} size={13} />
            {STRENGTH_LABEL[i]}
          </span>
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

          return (
            <div
              key={q.id}
              className={`${styles.card} ${styles.cardClickable}`}
              onClick={() => setSelectedQuestion(q)}
              title="Click to view full question"
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardId}>{q.id}</span>
                <StrengthBadge strength={prog.strength} />
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

      {selectedQuestion && selectedProg && (
        <QuestionDetail
          question={selectedQuestion}
          prog={selectedProg}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </div>
  );
}
