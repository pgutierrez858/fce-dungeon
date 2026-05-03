import { CombatScreen } from '../Combat/CombatScreen';
import { PlayerHUD } from '../PlayerHUD/PlayerHUD';
import { GameHeader } from '../GameHeader/GameHeader';
import styles from './CombatLayout.module.css';

export function CombatLayout() {
  return (
    <div className={styles.layout}>
      <GameHeader />
      <PlayerHUD />
      <CombatScreen />
    </div>
  );
}
