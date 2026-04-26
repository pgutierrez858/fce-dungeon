import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { MapScreen } from './components/screens/MapScreen';
import { CombatLayout } from './components/screens/CombatLayout';
import { ShopScreen } from './components/Shop/ShopScreen';
import { RestScreen } from './components/Rest/RestScreen';
import { ChestScreen } from './components/Chest/ChestScreen';
import { VictoryScreen } from './components/screens/VictoryScreen';
import { DefeatScreen } from './components/screens/DefeatScreen';
import { QuestionsScreen } from './components/QuestionsScreen/QuestionsScreen';
import { PlayerHUD } from './components/PlayerHUD/PlayerHUD';
import { GameHeader } from './components/GameHeader/GameHeader';
import styles from './App.module.css';

export function App() {
  const phase = useGameStore(s => s.phase);

  if (phase === 'title')     return <TitleScreen />;
  if (phase === 'questions') return <QuestionsScreen />;
  if (phase === 'victory')   return <VictoryScreen />;
  if (phase === 'defeat')    return <DefeatScreen />;
  if (phase === 'combat')    return <CombatLayout />;

  return (
    <div className={styles.wrapper}>
      {phase === 'map'   && <MapScreen />}
      {phase === 'shop'  && <NonCombatLayout><ShopScreen /></NonCombatLayout>}
      {phase === 'rest'  && <NonCombatLayout><RestScreen /></NonCombatLayout>}
      {phase === 'chest' && <NonCombatLayout><ChestScreen /></NonCombatLayout>}
    </div>
  );
}

function NonCombatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.nonCombatLayout}>
      <GameHeader />
      <PlayerHUD />
      {children}
    </div>
  );
}

export default App;
