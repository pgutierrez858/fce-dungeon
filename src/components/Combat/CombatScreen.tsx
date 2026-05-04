import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import type {
  Command, CommandEffect, QuestionType,
  Part1Question, Part2Question, Part3Question, Part4Question,
  EnemyAction, BossCurse, BossAbility,
} from '../../types';
import styles from './CombatScreen.module.css';

const Q_TYPE_LABEL: Record<QuestionType, string> = {
  t1: '❄ Vocab Cloze', t2: '🌿 Open Cloze', t3: '🔮 Word Form.', t4: '👹 Key Word',
};
const Q_TYPE_COLOR: Record<QuestionType, string> = {
  t1: 'var(--t1b)', t2: 'var(--t2b)', t3: 'var(--t3b)', t4: 'var(--t4b)',
};

export function CombatScreen() {
  const {
    combat, player,
    selectCommand, submitAnswer, skipQuestion, swapQuestionType,
    acknowledgeResult, endTurn, acknowledgeEnemyTurn,
    pickCommandChoice, skipCommandChoice, forgetCommand,
    acknowledgeVictory,
  } = useGameStore();

  if (!combat) return null;
  const { phase, enemy, enemyHp, enemyBlock, enemyStrength, playerBlock, playerStrength, energy, log } = combat;

  return (
    <div className={styles.screen}>

      {/* ── Top arena ── */}
      <div className={styles.arena}>
        <EnemyPanel
          enemy={enemy}
          hp={enemyHp}
          block={enemyBlock}
          strength={enemyStrength}
          isShaking={phase === 'result' && combat.lastAnswerCorrect === true}
        />
        <div className={styles.arenaRight}>
          <IntentPanel combat={combat} />
          <div className={styles.battleLog}>
            {log.slice(-5).map((entry, i) => (
              <p key={i} className={styles.logEntry}>{entry}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Player status strip ── */}
      <PlayerStatusBar block={playerBlock} strength={playerStrength} energy={energy} />

      {/* ── Action zone ── */}
      <div className={styles.actionZone}>
        {phase === 'player-turn' && (
          <PlayerTurnPanel
            commands={player.commands}
            usedCommandIds={combat.usedCommandIds}
            energy={energy}
            onSelect={selectCommand}
            onEndTurn={endTurn}
            skipCharges={player.activeEffects.filter(e => e.kind === 'skip').reduce((a, e) => a + (e as any).charges, 0)}
            swapCharges={player.activeEffects.filter(e => e.kind === 'swap').reduce((a, e) => a + (e as any).charges, 0)}
            bossCurse={combat.bossCurse ?? null}
            bossTypeChanges={combat.bossTypeChanges ?? {}}
            bossAbility={combat.enemy.bossAbility}
          />
        )}

        {phase === 'question' && combat.currentQuestion && (
          <QuestionPanel
            question={combat.currentQuestion}
            qType={combat.currentQuestionType!}
            pendingCommand={combat.pendingCommand!}
            onSubmit={submitAnswer}
            skipCharges={player.activeEffects.filter(e => e.kind === 'skip').reduce((a, e) => a + (e as any).charges, 0)}
            onSkip={skipQuestion}
            swapCharges={player.activeEffects.filter(e => e.kind === 'swap').reduce((a, e) => a + (e as any).charges, 0)}
            onSwap={swapQuestionType}
          />
        )}

        {phase === 'result' && (
          <ResultPanel
            correct={combat.lastAnswerCorrect === true}
            answer={combat.currentQuestion ? getCorrectAnswerText(combat.currentQuestion) : ''}
            tip={combat.currentQuestion ? (combat.currentQuestion as any).tip ?? '' : ''}
            onContinue={acknowledgeResult}
          />
        )}

        {phase === 'enemy-turn' && (
          <EnemyTurnPanel
            log={log}
            dieRoll={combat.lastDieRoll}
            onContinue={acknowledgeEnemyTurn}
          />
        )}

        {phase === 'command-choice' && combat.commandChoices && (
          <CommandChoicePanel
            choices={combat.commandChoices}
            playerCommands={player.commands}
            onPick={pickCommandChoice}
            onSkip={skipCommandChoice}
            onForget={forgetCommand}
          />
        )}

        {phase === 'defeated' && (
          <DefeatedPanel
            enemyName={enemy.name}
            onContinue={acknowledgeVictory}
          />
        )}
      </div>
    </div>
  );
}

// ── Enemy panel ─────────────────────────────────────────────────

function EnemyPanel({
  enemy, hp, block, strength, isShaking,
}: { enemy: any; hp: number; block: number; strength: number; isShaking: boolean }) {
  const pct = enemy.maxHp > 0 ? (hp / enemy.maxHp) * 100 : 0;
  const typeColor = {
    t1: 'var(--t1b)', t2: 'var(--t2b)', t3: 'var(--t3b)', t4: 'var(--t4b)',
    boss: 'var(--tbb)', final: 'var(--tfb)',
  }[enemy.type as string] ?? 'var(--aged)';

  return (
    <div className={`${styles.enemyPanel} ${isShaking ? styles.shake : ''}`}>
      <div className={styles.enemyHeader}>
        <span className={styles.enemyName} style={{ color: typeColor }}>{enemy.name}</span>
        <div className={styles.enemyBadges}>
          {strength > 0 && <span className={styles.strBadge}>💪 {strength}</span>}
          {block > 0    && <span className={styles.blkBadge}>🛡 {block}</span>}
        </div>
      </div>

      {enemy.img
        ? <div className={styles.enemyImg}><img src={enemy.img} alt={enemy.name} /></div>
        : <div className={styles.enemyImgPlaceholder}><span className={styles.enemyEmoji}>
            {enemy.type === 'boss' ? '💀' : enemy.type === 'final' ? '🐉' :
             enemy.type === 't1' ? '❄' : enemy.type === 't2' ? '🌿' :
             enemy.type === 't3' ? '🔮' : '👹'}
          </span></div>
      }

      <div className={styles.hpBar}>
        <div className={styles.hpBarInner}>
          <div className={styles.hpFill} style={{
            width: `${pct}%`,
            background: pct > 50 ? 'var(--forest)' : pct > 25 ? 'var(--gold)' : 'var(--ember2)',
          }} />
        </div>
        <span className={styles.hpText}>HP {hp}/{enemy.maxHp}</span>
      </div>
      <p className={styles.enemyDesc}>{enemy.desc}</p>
    </div>
  );
}

// ── Intent panel ────────────────────────────────────────────────

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function actionLabel(a: EnemyAction, extraStrength = 0): string {
  return a.effects.map(e => {
    if (e.kind === 'attack')    return `⚔ ${e.damage + extraStrength} dmg${extraStrength > 0 ? ` (+${extraStrength})` : ''}`;
    if (e.kind === 'block')     return `🛡 +${e.amount} block`;
    if (e.kind === 'strengthen') return `💪 +${e.amount} str`;
    return '';
  }).filter(Boolean).join('  ');
}

function IntentPanel({ combat }: { combat: any }) {
  const { enemy, enemySequenceIndex, enemyStrength } = combat;
  const { pattern, actions } = enemy;
  const getAction = (id: string): EnemyAction => actions.find((a: EnemyAction) => a.id === id) ?? actions[0];

  if (pattern.kind === 'fixed') {
    const a = getAction(pattern.actionId);
    return (
      <div className={styles.intentPanel}>
        <span className={styles.intentTitle}>⚔ Enemy Intent</span>
        <div className={styles.intentFixed}>
          <span className={styles.intentActionIcon}>{a.icon}</span>
          <div>
            <div className={styles.intentActionName}>{a.label}</div>
            <div className={styles.intentEffects}>{actionLabel(a, enemyStrength)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (pattern.kind === 'sequence') {
    const len = pattern.actionIds.length;
    const currentIdx = enemySequenceIndex % len;
    return (
      <div className={styles.intentPanel}>
        <span className={styles.intentTitle}>📋 Enemy Sequence</span>
        <div className={styles.intentSequence}>
          {(pattern.actionIds as string[]).map((id: string, i: number) => {
            const a = getAction(id);
            const isCurrent = i === currentIdx;
            return (
              <div key={i} className={`${styles.seqStep} ${isCurrent ? styles.seqCurrent : ''}`}>
                <span className={styles.seqArrow}>{isCurrent ? '▶' : '·'}</span>
                <span className={styles.seqIcon}>{a.icon}</span>
                <span className={styles.seqLabel}>{actionLabel(a, isCurrent ? enemyStrength : 0)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // dice
  const faceMap: Record<number, string> = pattern.faceMap;
  const groups = new Map<string, number[]>();
  for (const [face, actionId] of Object.entries(faceMap)) {
    if (!groups.has(actionId as string)) groups.set(actionId as string, []);
    groups.get(actionId as string)!.push(Number(face));
  }

  return (
    <div className={styles.intentPanel}>
      <span className={styles.intentTitle}>🎲 Dice Table</span>
      <div className={styles.diceTable}>
        {[...groups.entries()].map(([actionId, faces]) => {
          const a = getAction(actionId);
          return (
            <div key={actionId} className={styles.diceRow}>
              <span className={styles.diceFaces}>
                {faces.map(f => DICE_FACES[f - 1]).join(' ')}
              </span>
              <span className={styles.diceArrow}>→</span>
              <span className={styles.diceRowIcon}>{a.icon}</span>
              <span className={styles.diceRowLabel}>{actionLabel(a, enemyStrength)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Player status bar ────────────────────────────────────────────

function PlayerStatusBar({ block, strength, energy }: { block: number; strength: number; energy: number }) {
  const dots = Array.from({ length: 3 }, (_, i) => i < energy);
  return (
    <div className={styles.playerBar}>
      <div className={styles.playerBarGroup}>
        <span className={styles.playerBarLabel}>Block</span>
        <span className={styles.playerBarVal} style={{ color: 'var(--t1b)' }}>🛡 {block}</span>
      </div>
      <div className={styles.playerBarGroup}>
        <span className={styles.playerBarLabel}>Strength</span>
        <span className={styles.playerBarVal} style={{ color: 'var(--ember2)' }}>💪 {strength}</span>
      </div>
      <div className={styles.energyRow}>
        <span className={styles.playerBarLabel}>Energy</span>
        <div className={styles.energyDots}>
          {dots.map((filled, i) => (
            <div key={i} className={`${styles.energyDot} ${filled ? styles.energyFull : styles.energyEmpty}`} />
          ))}
        </div>
        <span className={styles.playerBarLabel}>{energy}/3</span>
      </div>
    </div>
  );
}

// ── Player turn panel (command hand) ────────────────────────────

const Q_PART_NAMES: Record<QuestionType, string> = { t1: 'Part 1', t2: 'Part 2', t3: 'Part 3', t4: 'Part 4' };

function BossCursePanel({ curse, bossAbility }: { curse: BossCurse | null; bossAbility?: BossAbility }) {
  if (!curse && bossAbility?.kind !== 'bahamut') return null;
  if (bossAbility?.kind === 'bahamut' && !curse) {
    return <div className={styles.bossCurse}>🔥 <strong>BAHAMUT:</strong> Each command you cast transforms — type changes permanently.</div>;
  }
  if (!curse) return null;
  switch (curse.kind) {
    case 'disabled_type':
      return <div className={styles.bossCurse}>🔒 <strong>ULTIMECIA:</strong> {Q_PART_NAMES[curse.qType]} commands are sealed this turn!</div>;
    case 'energy_surge':
      return <div className={styles.bossCurse}>❄ <strong>SHIVA:</strong> Commands at slots {curse.positions.map(p => p + 1).join(' & ')} cost +1 energy!</div>;
    case 'type_override':
      return <div className={styles.bossCurse}>💥 <strong>BEHEMOTH:</strong> All commands require {Q_PART_NAMES[curse.qType]} this turn!</div>;
    case 'strength_leech':
      return <div className={styles.bossCurse}>⚔ <strong>GABRANTH:</strong> Using {Q_PART_NAMES[curse.qType]} commands grants +2 Strength!</div>;
  }
}

function PlayerTurnPanel({
  commands, usedCommandIds, energy, onSelect, onEndTurn, skipCharges, swapCharges,
  bossCurse, bossTypeChanges, bossAbility,
}: {
  commands: Command[];
  usedCommandIds: string[];
  energy: number;
  onSelect: (id: string) => void;
  onEndTurn: () => void;
  skipCharges: number;
  swapCharges: number;
  bossCurse: BossCurse | null;
  bossTypeChanges: Record<string, QuestionType>;
  bossAbility?: BossAbility;
}) {
  const [showDescs, setShowDescs] = useState(false);

  return (
    <div className={styles.playerTurn}>
      <BossCursePanel curse={bossCurse} bossAbility={bossAbility} />

      {showDescs ? (
        <div className={styles.descPanel}>
          {commands.map(cmd => (
            <div key={cmd.id} className={styles.descRow}>
              <div className={styles.descRowHeader}>
                <span className={styles.descRowName}>{cmd.name}{cmd.upgraded ? ' ★' : ''}</span>
                <span className={styles.descRowType} style={{ color: Q_TYPE_COLOR[cmd.questionType] }}>
                  {Q_TYPE_LABEL[cmd.questionType]}
                </span>
              </div>
              <p className={styles.descRowText}>{cmd.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.commandGrid}>
          {commands.map((cmd, cmdIndex) => {
            const effQType: QuestionType = bossCurse?.kind === 'type_override'
              ? bossCurse.qType
              : (bossTypeChanges[cmd.id] as QuestionType | undefined) ?? cmd.questionType;
            const surged = bossCurse?.kind === 'energy_surge' && bossCurse.positions.includes(cmdIndex);
            const effCost = cmd.energyCost + (surged ? 1 : 0);
            const sealed = bossCurse?.kind === 'disabled_type' && bossCurse.qType === effQType;
            const condemned = bossCurse?.kind === 'strength_leech' && bossCurse.qType === effQType;
            const mutated = bossAbility?.kind === 'bahamut' && !!bossTypeChanges[cmd.id];
            const tooExpensive = energy < effCost;
            const usedOnce = !!cmd.oncePerTurn && usedCommandIds.includes(cmd.id);
            const loneWolfBlocked = !!cmd.uniqueType && commands.some(c => {
              if (c.id === cmd.id) return false;
              const ct = bossCurse?.kind === 'type_override' ? bossCurse.qType : (bossTypeChanges[c.id] as QuestionType | undefined) ?? c.questionType;
              return ct === effQType;
            });
            const disabled = sealed || tooExpensive || loneWolfBlocked || usedOnce;
            const color = Q_TYPE_COLOR[effQType];
            return (
              <button
                key={cmd.id}
                className={[
                  styles.commandCard,
                  disabled ? styles.commandDisabled : '',
                  sealed ? styles.commandSealed : '',
                  condemned ? styles.commandCondemned : '',
                  mutated ? styles.commandMutated : '',
                ].join(' ')}
                onClick={() => !disabled && onSelect(cmd.id)}
                disabled={disabled}
              >
                <div className={styles.cmdHeader}>
                  <span className={styles.cmdName}>{cmd.name}{cmd.upgraded ? ' ★' : ''}</span>
                  <span className={styles.cmdCost} style={{ background: color }}>
                    {Array.from({ length: effCost }, (_, i) => <span key={i}>◆</span>)}
                    {surged && <span className={styles.surgePlus}>!</span>}
                  </span>
                </div>
                <div className={styles.cmdType} style={{ color }}>
                  {Q_TYPE_LABEL[effQType]}
                  {mutated && ' 🔥'}
                </div>
                <div className={styles.cmdEffects}>
                  <EffectsDisplay effects={cmd.effects} />
                </div>
                {sealed    && <div className={styles.sealedOverlay}>🔒 Sealed</div>}
                {usedOnce  && <div className={styles.sealedOverlay}>⚡ Used</div>}
                {loneWolfBlocked && !usedOnce && <div className={styles.sealedOverlay}>🐺 Not alone</div>}
                {condemned && <div className={styles.condemnedBadge}>⚔ +2 STR</div>}
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.endTurnRow}>
        {(skipCharges > 0 || swapCharges > 0) && (
          <div className={styles.activeItems}>
            {skipCharges > 0 && <span className={styles.itemBadge}>📜 Skip ×{skipCharges}</span>}
            {swapCharges > 0 && <span className={styles.itemBadge}>🔮 Swap ×{swapCharges}</span>}
          </div>
        )}
        <button
          className={styles.inspectBtn}
          onClick={() => setShowDescs(v => !v)}
          title="Read command descriptions"
        >
          {showDescs ? '🗡 Hand' : '📖 Read'}
        </button>
        <button className={styles.endTurnBtn} onClick={onEndTurn}>
          End Turn ▶
        </button>
      </div>
    </div>
  );
}

function EffectsDisplay({ effects }: { effects: CommandEffect[] }) {
  type Group = { kind: 'attack' | 'block' | 'strength'; value: number; count: number };
  const groups: Group[] = [];
  for (const eff of effects) {
    const value = eff.kind === 'attack' ? eff.damage : eff.kind === 'block' ? eff.amount : eff.amount;
    const last = groups[groups.length - 1];
    if (last && last.kind === eff.kind && last.value === value) {
      last.count++;
    } else {
      groups.push({ kind: eff.kind, value, count: 1 });
    }
  }
  return (
    <>
      {groups.map((g, i) => {
        const label = g.count > 1 ? `${g.count}×${g.value}` : `${g.value}`;
        if (g.kind === 'attack')   return <span key={i} className={styles.effAtk}>⚔ {label}</span>;
        if (g.kind === 'block')    return <span key={i} className={styles.effBlk}>🛡 {label}</span>;
        if (g.kind === 'strength') return <span key={i} className={styles.effStr}>💪 +{label}</span>;
        return null;
      })}
    </>
  );
}

// ── Question panel ───────────────────────────────────────────────

interface QuestionPanelProps {
  question: any;
  qType: QuestionType;
  pendingCommand: Command;
  onSubmit: (a: string) => void;
  skipCharges: number;
  onSkip: () => void;
  swapCharges: number;
  onSwap: (t: QuestionType) => void;
}

function QuestionPanel({ question, qType, pendingCommand, onSubmit, skipCharges, onSkip, swapCharges, onSwap }: QuestionPanelProps) {
  const [showSwap, setShowSwap] = useState(false);
  const color = Q_TYPE_COLOR[qType];

  return (
    <div className={`${styles.questionPanel} animate-fade-in`}>
      <div className={styles.qHeader}>
        <div className={styles.qHeaderLeft}>
          <span className={styles.qBadge} style={{ borderColor: color, color }}>{Q_TYPE_LABEL[qType]}</span>
          <span className={styles.qCmd}>→ {pendingCommand.name}</span>
        </div>
        <div className={styles.qHeaderRight}>
          {swapCharges > 0 && (
            <button className={styles.skipBtn} onClick={() => setShowSwap(v => !v)}>
              🔮 Swap ({swapCharges})
            </button>
          )}
          {skipCharges > 0 && (
            <button className={styles.skipBtn} onClick={onSkip}>
              📜 Skip ({skipCharges})
            </button>
          )}
        </div>
      </div>

      {showSwap && (
        <SwapPicker onPick={t => { onSwap(t); setShowSwap(false); }} current={qType} />
      )}

      {!showSwap && question.type === 't1' && <Part1Panel question={question as Part1Question} onSubmit={onSubmit} />}
      {!showSwap && question.type === 't2' && <Part2Panel question={question as Part2Question} onSubmit={onSubmit} />}
      {!showSwap && question.type === 't3' && <Part3Panel question={question as Part3Question} onSubmit={onSubmit} />}
      {!showSwap && question.type === 't4' && <Part4Panel question={question as Part4Question} onSubmit={onSubmit} />}
    </div>
  );
}

const SWAP_TYPES: { type: QuestionType; label: string }[] = [
  { type: 't1', label: '❄ Vocab Cloze' },
  { type: 't2', label: '🌿 Open Cloze' },
  { type: 't3', label: '🔮 Word Form.' },
  { type: 't4', label: '👹 Key Word' },
];

function SwapPicker({ onPick, current }: { onPick: (t: QuestionType) => void; current: QuestionType }) {
  return (
    <div className={styles.swapGrid}>
      {SWAP_TYPES.filter(s => s.type !== current).map(({ type, label }) => (
        <button
          key={type}
          className={styles.swapBtn}
          style={{ borderColor: Q_TYPE_COLOR[type], color: Q_TYPE_COLOR[type] }}
          onClick={() => onPick(type)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Question sub-panels ──────────────────────────────────────────

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
        <input ref={inputRef} className={styles.gapInput} value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
          placeholder="one word" autoComplete="off" spellCheck={false} />
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
        <input ref={inputRef} className={styles.gapInput} value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
          placeholder="transform…" autoComplete="off" spellCheck={false} />
        {parts[1]}
      </p>
      <div className={styles.stemBox}><span className={styles.stem}>{question.stem}</span></div>
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
      <input ref={inputRef} className={`${styles.gapInput} ${styles.fullWidth}`} value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onSubmit(value.trim())}
        placeholder="complete the sentence…" autoComplete="off" spellCheck={false} />
      <button className={styles.primaryBtn} onClick={() => value.trim() && onSubmit(value.trim())} disabled={!value.trim()}>
        Transform 👹
      </button>
    </div>
  );
}

// ── Result panel ─────────────────────────────────────────────────

function ResultPanel({ correct, answer, tip, onContinue }: {
  correct: boolean; answer: string; tip: string; onContinue: () => void;
}) {
  return (
    <div className={`${styles.panel} ${correct ? styles.correct : styles.incorrect} animate-pop-in`}>
      <div className={styles.resultIcon}>{correct ? '✔' : '✘'}</div>
      <p className={styles.resultLabel}>{correct ? 'Hit!' : 'Miss!'}</p>
      {!correct && (
        <>
          <p className={styles.correctAnswer}>✓ Answer: <strong>{answer}</strong></p>
          <p className={styles.tip}>💡 {tip}</p>
        </>
      )}
      <button className={styles.primaryBtn} onClick={onContinue}>Continue ▶</button>
    </div>
  );
}

// ── Enemy turn panel ─────────────────────────────────────────────

function EnemyTurnPanel({ log, dieRoll, onContinue }: {
  log: string[];
  dieRoll: number | null;
  onContinue: () => void;
}) {
  const isDice = dieRoll !== null;
  const [rollingFace, setRollingFace] = useState(isDice ? 1 : 0);
  const [revealed, setRevealed] = useState(!isDice);

  useEffect(() => {
    if (!isDice) return;
    let count = 0;
    const total = 14;
    const id = setInterval(() => {
      setRollingFace(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= total) {
        clearInterval(id);
        setRollingFace(dieRoll);
        // brief pause on the final face before revealing result
        setTimeout(() => setRevealed(true), 220);
      }
    }, 90);
    return () => clearInterval(id);
  }, [isDice, dieRoll]);

  return (
    <div className={`${styles.panel} ${styles.enemyTurnPanel} animate-pop-in`}>
      {isDice ? (
        <div className={`${styles.diceAnim} ${revealed ? styles.diceSettled : styles.diceSpinning}`}>
          <span className={styles.diceAnimFace}>{DICE_FACES[rollingFace - 1]}</span>
          {revealed && dieRoll && (
            <span className={styles.diceRollResult}>Rolled {DICE_FACES[dieRoll - 1]} ({dieRoll})</span>
          )}
        </div>
      ) : (
        <div className={styles.resultIcon}>👹</div>
      )}
      <p className={styles.resultLabel}>{revealed ? 'Enemy acts!' : 'Rolling the die…'}</p>
      {revealed && <p className={styles.panelText}>{log[log.length - 1]}</p>}
      {revealed && (
        <button className={styles.primaryBtn} onClick={onContinue}>Your Turn ▶</button>
      )}
    </div>
  );
}

// ── Command choice panel ─────────────────────────────────────────

function CommandChoicePanel({
  choices, playerCommands, onPick, onSkip, onForget,
}: {
  choices: Command[];
  playerCommands: Command[];
  onPick: (i: number) => void;
  onSkip: () => void;
  onForget: (forgetId: string, pickIndex: number) => void;
}) {
  const [forgetMode, setForgetMode] = useState<number | null>(null);
  const isFull = playerCommands.length >= 6;

  if (forgetMode !== null) {
    return (
      <div className={`${styles.panel} animate-fade-in`}>
        <p className={styles.panelTitle}>📚 Command Limit Reached</p>
        <p className={styles.panelText}>Choose a command to forget to make room for <strong>{choices[forgetMode]?.name}</strong>.</p>
        <div className={styles.commandGrid}>
          {playerCommands.map(cmd => (
            <button
              key={cmd.id}
              className={`${styles.commandCard} ${styles.forgetCard}`}
              onClick={() => onForget(cmd.id, forgetMode)}
            >
              <div className={styles.cmdHeader}>
                <span className={styles.cmdName}>{cmd.name}{cmd.upgraded ? ' ★' : ''}</span>
              </div>
              <div className={styles.cmdType} style={{ color: Q_TYPE_COLOR[cmd.questionType] }}>
                {Q_TYPE_LABEL[cmd.questionType]}
              </div>
              <div className={styles.cmdEffects}>
                <EffectsDisplay effects={cmd.effects} />
              </div>
            </button>
          ))}
        </div>
        <button className={styles.skipBtn} onClick={() => setForgetMode(null)}>← Back</button>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} animate-fade-in`}>
      <p className={styles.panelTitle}>🏆 Choose a Command!</p>
      <p className={styles.panelText}>
        {isFull
          ? `Your command slot is full (${playerCommands.length}/6). Picking one will ask you to forget another.`
          : `Add a new command to your arsenal (${playerCommands.length}/6).`}
      </p>
      <div className={styles.commandGrid}>
        {choices.map((cmd, i) => (
          <button
            key={cmd.id}
            className={styles.commandCard}
            onClick={() => isFull ? setForgetMode(i) : onPick(i)}
          >
            <div className={styles.cmdHeader}>
              <span className={styles.cmdName}>{cmd.name}</span>
              <span className={styles.cmdCost} style={{ background: Q_TYPE_COLOR[cmd.questionType] }}>
                {Array.from({ length: cmd.energyCost }, (_, j) => <span key={j}>◆</span>)}
              </span>
            </div>
            <div className={styles.cmdType} style={{ color: Q_TYPE_COLOR[cmd.questionType] }}>
              {Q_TYPE_LABEL[cmd.questionType]}
            </div>
            <div className={styles.cmdEffects}>
              <EffectsDisplay effects={cmd.effects} />
            </div>
            <p className={styles.cmdDesc}>{cmd.description}</p>
          </button>
        ))}
      </div>
      <button className={styles.skipBtn} onClick={onSkip}>Skip</button>
    </div>
  );
}

// ── Defeated panel ───────────────────────────────────────────────

function DefeatedPanel({ enemyName, onContinue }: {
  enemyName: string; onContinue: () => void;
}) {
  return (
    <div className={`${styles.panel} ${styles.defeat} animate-pop-in`}>
      <div className={styles.resultIcon}>💀</div>
      <p className={styles.resultLabel}>You have fallen…</p>
      <p className={styles.panelText}>{enemyName} has bested you.</p>
      <button className={`${styles.primaryBtn} ${styles.dangerBtn}`} onClick={onContinue}>
        See Final Score
      </button>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function getCorrectAnswerText(q: any): string {
  if (q.type === 't1') return (q as Part1Question).answer;
  if (q.type === 't2') {
    const a = (q as Part2Question).answer;
    return Array.isArray(a) ? a.join(' / ') : a;
  }
  if (q.type === 't3') {
    const a = (q as Part3Question).answer;
    return Array.isArray(a) ? a.join(' / ') : a;
  }
  if (q.type === 't4') {
    const p = q as Part4Question;
    const ans = Array.isArray(p.answer) ? p.answer[0] : p.answer;
    return `${p.beginWith} ${ans}`;
  }
  return '';
}
