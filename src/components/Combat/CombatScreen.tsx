import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Part1Question, Part2Question, Part3Question, Part4Question } from '../../types';
import styles from './CombatScreen.module.css';

export function CombatScreen() {
  const { combat, rollForQuestion, pickSwapType, submitAnswer, skipQuestion, acknowledgeResult, player } = useGameStore();
  if (!combat) return null;

  const { phase, enemy, enemyHp, log, currentQuestionType } = combat;

  return (
    <div className={styles.screen}>
      <div className={styles.arena}>
        <EnemyPanel
          enemy={enemy}
          hp={enemyHp}
          isShaking={phase === 'result' && combat.lastAnswerCorrect === true}
        />

        <div className={styles.battleLog}>
          {log.slice(-4).map((entry, i) => (
            <p key={i} className={styles.logEntry}>{entry}</p>
          ))}
        </div>
      </div>

      <div className={styles.actionZone}>
        {phase === 'rolling' && (
          <RollPanel onRoll={rollForQuestion} />
        )}

        {phase === 'swapping' && (
          <SwapPanel
            suggestedType={currentQuestionType}
            onPick={pickSwapType}
          />
        )}

        {phase === 'question' && combat.currentQuestion && (
          <QuestionPanel
            question={combat.currentQuestion}
            qType={currentQuestionType!}
            onSubmit={submitAnswer}
            skipCharges={player.activeEffects.filter(e => e.kind === 'skip').reduce((acc, e) => acc + (e as any).charges, 0)}
            onSkip={skipQuestion}
          />
        )}

        {phase === 'result' && (
          <ResultPanel
            correct={combat.lastAnswerCorrect === true}
            answer={combat.currentQuestion ? getCorrectAnswerText(combat.currentQuestion) : ''}
            tip={combat.currentQuestion ? getQuestionTip(combat.currentQuestion) : ''}
            onContinue={acknowledgeResult}
          />
        )}

        {phase === 'defeated' && (
          <DefeatedPanel
            victory={enemyHp <= 0}
            enemyName={enemy.name}
            gold={enemy.gold}
            xp={enemy.xp}
            onContinue={acknowledgeResult}
          />
        )}
      </div>
    </div>
  );
}

// ── Enemy panel ────────────────────────────────────────────────

function EnemyPanel({ enemy, hp, isShaking }: { enemy: any; hp: number; isShaking: boolean }) {
  const pct = enemy.maxHp > 0 ? (hp / enemy.maxHp) * 100 : 0;
  const typeColor = {
    t1: 'var(--t1b)', t2: 'var(--t2b)', t3: 'var(--t3b)', t4: 'var(--t4b)',
    boss: 'var(--tbb)', final: 'var(--tfb)',
  }[enemy.type as string] ?? 'var(--aged)';

  return (
    <div className={`${styles.enemyPanel} ${isShaking ? styles.shake : ''}`}>
      <div className={styles.enemyHeader}>
        <span className={styles.enemyName} style={{ color: typeColor }}>{enemy.name}</span>
        <span className={styles.enemyBadge} style={{ borderColor: typeColor, color: typeColor }}>
          ATK {enemy.atk}
        </span>
      </div>

      {enemy.img && (
        <div className={styles.enemyImg}>
          <img src={enemy.img} alt={enemy.name} />
        </div>
      )}

      {!enemy.img && (
        <div className={styles.enemyImgPlaceholder}>
          <span className={styles.enemyEmoji}>
            {enemy.type === 'boss' ? '💀' : enemy.type === 'final' ? '🐉' :
             enemy.type === 't1' ? '❄' : enemy.type === 't2' ? '🌿' :
             enemy.type === 't3' ? '🔮' : '⚔'}
          </span>
        </div>
      )}

      <div className={styles.hpBar}>
        <div className={styles.hpBarInner}>
          <div
            className={styles.hpFill}
            style={{ width: `${pct}%`, background: pct > 50 ? 'var(--forest)' : pct > 25 ? 'var(--gold)' : 'var(--ember2)' }}
          />
        </div>
        <span className={styles.hpText}>HP {hp}/{enemy.maxHp}</span>
      </div>

      <p className={styles.enemyDesc}>{enemy.desc}</p>
    </div>
  );
}

// ── Swap panel ─────────────────────────────────────────────────

const SWAP_TYPES: { type: import('../../types').QuestionType; label: string; icon: string; color: string }[] = [
  { type: 't1', label: 'Part 1 — Multiple Choice', icon: '❄', color: 'var(--t1b)' },
  { type: 't2', label: 'Part 2 — Open Cloze',      icon: '🌿', color: 'var(--t2b)' },
  { type: 't3', label: 'Part 3 — Word Formation',  icon: '🔮', color: 'var(--t3b)' },
  { type: 't4', label: 'Part 4 — Key Word Trans.',  icon: '⚔',  color: 'var(--t4b)' },
];

function SwapPanel({ suggestedType, onPick }: {
  suggestedType: import('../../types').QuestionType | null;
  onPick: (t: import('../../types').QuestionType) => void;
}) {
  return (
    <div className={`${styles.panel} animate-fade-in`}>
      <h3 className={styles.panelTitle}>🔮 Prism Swap</h3>
      <p className={styles.panelText}>
        Choose which question type to face next.
        {suggestedType && <> (Rolled: <strong>{suggestedType.toUpperCase()}</strong>)</>}
      </p>
      <div className={styles.swapGrid}>
        {SWAP_TYPES.map(({ type, label, icon, color }) => (
          <button
            key={type}
            className={styles.swapBtn}
            style={{ borderColor: color, color }}
            onClick={() => onPick(type)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Roll panel ─────────────────────────────────────────────────

function RollPanel({ onRoll }: { onRoll: () => void }) {
  return (
    <div className={`${styles.panel} animate-fade-in`}>
      <h3 className={styles.panelTitle}>🎲 Boss Battle</h3>
      <p className={styles.panelText}>
        This boss uses multiple question types. Roll the die to discover your challenge!
      </p>
      <button className={styles.primaryBtn} onClick={onRoll}>
        Roll the Die 🎲
      </button>
    </div>
  );
}

// ── Question panels ────────────────────────────────────────────

interface QuestionPanelProps {
  question: any;
  qType: string;
  onSubmit: (answer: string) => void;
  skipCharges: number;
  onSkip: () => void;
}

function QuestionPanel({ question, qType, onSubmit, skipCharges, onSkip }: QuestionPanelProps) {
  const typeLabel = { t1: '❄ Vocab Cloze', t2: '🌿 Open Cloze', t3: '🔮 Word Formation', t4: '⚔ Key Word Trans' }[qType] ?? '';
  const typeColor = { t1: 'var(--t1b)', t2: 'var(--t2b)', t3: 'var(--t3b)', t4: 'var(--t4b)' }[qType] ?? 'var(--aged)';

  return (
    <div className={`${styles.questionPanel} animate-fade-in`}>
      <div className={styles.qHeader}>
        <span className={styles.qBadge} style={{ borderColor: typeColor, color: typeColor }}>{typeLabel}</span>
        {skipCharges > 0 && (
          <button className={styles.skipBtn} onClick={onSkip}>
            📜 Skip ({skipCharges})
          </button>
        )}
      </div>

      {question.type === 't1' && <Part1Panel question={question as Part1Question} onSubmit={onSubmit} />}
      {question.type === 't2' && <Part2Panel question={question as Part2Question} onSubmit={onSubmit} />}
      {question.type === 't3' && <Part3Panel question={question as Part3Question} onSubmit={onSubmit} />}
      {question.type === 't4' && <Part4Panel question={question as Part4Question} onSubmit={onSubmit} />}
    </div>
  );
}

function Part1Panel({ question, onSubmit }: { question: Part1Question; onSubmit: (a: string) => void }) {
  return (
    <div className={styles.part1}>
      <p className={styles.sentence}>{question.sentence}</p>
      <div className={styles.choiceGrid}>
        {question.options.map((opt, i) => {
          const letter = ['A', 'B', 'C', 'D'][i];
          return (
            <button key={letter} className={styles.choiceBtn} onClick={() => onSubmit(letter)}>
              <span className={styles.choiceLetter}>{letter}</span>
              <span>{opt.slice(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Part2Panel({ question, onSubmit }: { question: Part2Question; onSubmit: (a: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); setValue(''); }, [question.id]);

  const parts = question.sentence.split('______');
  return (
    <div className={styles.part2}>
      <p className={styles.sentence}>
        {parts[0]}
        <input
          ref={inputRef}
          className={styles.gapInput}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
          placeholder="one word"
          autoComplete="off"
          spellCheck={false}
        />
        {parts[1]}
      </p>
      <p className={styles.hint}>Write ONE grammar word only.</p>
      <button className={styles.primaryBtn} onClick={() => value.trim() && onSubmit(value.trim())} disabled={!value.trim()}>
        Cast Spell ⚡
      </button>
    </div>
  );
}

function Part3Panel({ question, onSubmit }: { question: Part3Question; onSubmit: (a: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); setValue(''); }, [question.id]);

  const parts = question.sentence.split('______');
  return (
    <div className={styles.part3}>
      <p className={styles.sentence}>
        {parts[0]}
        <input
          ref={inputRef}
          className={styles.gapInput}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
          placeholder="transform…"
          autoComplete="off"
          spellCheck={false}
        />
        {parts[1]}
      </p>
      <div className={styles.stemBox}>
        <span className={styles.stem}>{question.stem}</span>
      </div>
      <button className={styles.primaryBtn} onClick={() => value.trim() && onSubmit(value.trim())} disabled={!value.trim()}>
        Transform 🔮
      </button>
    </div>
  );
}

function Part4Panel({ question, onSubmit }: { question: Part4Question; onSubmit: (a: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); setValue(''); }, [question.id]);

  return (
    <div className={styles.part4}>
      <p className={styles.sentence}>{question.sentence}</p>
      <p className={styles.beginWith}>
        <em>{question.beginWith}</em> <span className={styles.gap}>__________________</span>
      </p>
      <div className={styles.kwRow}>
        <span className={styles.kwLabel}>Key word</span>
        <span className={styles.kw}>{question.keyword}</span>
      </div>
      <input
        ref={inputRef}
        className={`${styles.gapInput} ${styles.fullWidth}`}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
        placeholder="complete the sentence…"
        autoComplete="off"
        spellCheck={false}
      />
      <button className={styles.primaryBtn} onClick={() => value.trim() && onSubmit(value.trim())} disabled={!value.trim()}>
        Transform ⚔
      </button>
    </div>
  );
}

// ── Result panel ───────────────────────────────────────────────

function ResultPanel({ correct, answer, tip, onContinue }: {
  correct: boolean; answer: string; tip: string; onContinue: () => void;
}) {
  return (
    <div className={`${styles.panel} ${correct ? styles.correct : styles.incorrect} animate-pop-in`}>
      <div className={styles.resultIcon}>{correct ? '✔' : '✘'}</div>
      <p className={styles.resultLabel}>{correct ? 'Correct!' : 'Wrong!'}</p>
      {!correct && (
        <>
          <p className={styles.correctAnswer}>✓ Answer: <strong>{answer}</strong></p>
          <p className={styles.tip}>💡 {tip}</p>
        </>
      )}
      <button className={styles.primaryBtn} onClick={onContinue}>
        {correct ? 'Press On ▶' : 'Next Question ▶'}
      </button>
    </div>
  );
}

// ── Defeated panel ─────────────────────────────────────────────

function DefeatedPanel({ victory, enemyName, gold, xp, onContinue }: {
  victory: boolean; enemyName: string; gold: number; xp: number; onContinue: () => void;
}) {
  return (
    <div className={`${styles.panel} ${victory ? styles.victory : styles.defeat} animate-pop-in`}>
      {victory ? (
        <>
          <div className={styles.resultIcon}>🏆</div>
          <p className={styles.resultLabel}>{enemyName} Defeated!</p>
          <div className={styles.rewards}>
            {gold > 0 && <span>🪙 +{gold} Gold</span>}
            <span>✦ +{xp} XP</span>
          </div>
          <button className={styles.primaryBtn} onClick={onContinue}>
            Continue ▶
          </button>
        </>
      ) : (
        <>
          <div className={styles.resultIcon}>💀</div>
          <p className={styles.resultLabel}>You have fallen…</p>
          <p className={styles.panelText}>{enemyName} has bested you.</p>
          <button className={`${styles.primaryBtn} ${styles.dangerBtn}`} onClick={onContinue}>
            See Final Score
          </button>
        </>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function getCorrectAnswerText(q: any): string {
  if (q.type === 't1') return (q as Part1Question).answer;
  if (q.type === 't2') return (q as Part2Question).answer;
  if (q.type === 't3') return (q as Part3Question).answer;
  if (q.type === 't4') {
    const p = q as Part4Question;
    const ans = Array.isArray(p.answer) ? p.answer[0] : p.answer;
    return `${p.beginWith} ${ans}`;
  }
  return '';
}

function getQuestionTip(q: any): string {
  return (q as any).tip ?? '';
}
