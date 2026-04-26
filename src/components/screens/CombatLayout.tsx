import { useGameStore } from '../../store/gameStore';
import { CombatScreen } from '../Combat/CombatScreen';
import { PlayerHUD } from '../PlayerHUD/PlayerHUD';
import { GameHeader } from '../GameHeader/GameHeader';
import styles from './CombatLayout.module.css';

export function CombatLayout() {
  const combat = useGameStore(s => s.combat);

  return (
    <div className={styles.layout}>
      <GameHeader />
      <PlayerHUD />

      {combat?.enemy.bossTypes && combat.enemy.bossTypes.length > 1 && combat.phase === 'rolling' && (
        <div className={styles.bossNotice}>
          🎲 Boss combat — roll to determine the question type each turn
        </div>
      )}

      <CombatScreen />
    </div>
  );
}
