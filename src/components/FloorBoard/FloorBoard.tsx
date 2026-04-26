import { useGameStore } from '../../store/gameStore';
import styles from './FloorBoard.module.css';

const TILE_ICONS: Record<string, string> = {
  start:   '🚪',
  monster: '⚔',
  chest:   '📦',
  rest:    '🔥',
  shop:    '🏪',
  boss:    '💀',
};

const TILE_LABELS: Record<string, string> = {
  start:   'Start',
  monster: 'Foe',
  chest:   'Chest',
  rest:    'Rest',
  shop:    'Shop',
  boss:    'Boss',
};

export function FloorBoard() {
  const { floorBoard, playerPos, phase, moveToTile } = useGameStore();
  if (!floorBoard) return null;

  const { tiles, width } = floorBoard;
  const canMove = phase === 'map';

  return (
    <div
      className={styles.grid}
      style={{ '--cols': width } as React.CSSProperties}
    >
      {tiles.flat().map(tile => {
        const isPlayer = tile.row === playerPos.row && tile.col === playerPos.col;
        const dr = Math.abs(tile.row - playerPos.row);
        const dc = Math.abs(tile.col - playerPos.col);
        const isAdjacent = dr + dc === 1;
        const isClickable = canMove && isAdjacent;

        const cls = [
          styles.tile,
          styles[`type-${tile.type}`],
          tile.cleared  ? styles.cleared  : '',
          isPlayer      ? styles.player   : '',
          isAdjacent && canMove ? styles.adjacent : '',
        ].filter(Boolean).join(' ');

        const enemyInfo = tile.enemy && !tile.cleared
          ? `${tile.enemy.name} (HP ${tile.enemy.maxHp}, ATK ${tile.enemy.atk})`
          : null;

        return (
          <button
            key={tile.id}
            className={cls}
            onClick={() => isClickable && moveToTile(tile.row, tile.col)}
            disabled={!isClickable}
            title={enemyInfo ?? TILE_LABELS[tile.type]}
          >
            {isPlayer && <span className={styles.playerDot}>●</span>}

            <span className={styles.tileIcon}>
              {tile.cleared && tile.type !== 'shop' && tile.type !== 'rest' && tile.type !== 'start'
                ? '✓'
                : TILE_ICONS[tile.type]}
            </span>

            {tile.type === 'boss' && tile.enemy && !tile.cleared && (
              <span className={styles.tileDetail}>{tile.enemy.name}</span>
            )}

            {tile.type === 'monster' && tile.enemy && !tile.cleared && (
              <span className={styles.tileDetail}>{tile.enemy.name}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
