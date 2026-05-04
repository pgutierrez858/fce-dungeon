import { useGameStore } from '../../store/gameStore';
import styles from './FloorBoard.module.css';

const TILE_ICONS: Record<string, string> = {
  start:   '🚪',
  monster: '👹',
  chest:   '📦',
  rest:    '🔥',
  shop:    '🏪',
  boss:    '💀',
  event:   '❓',
};

const NODE_LABELS: Record<string, string> = {
  start:   'Start',
  monster: 'Foe',
  chest:   'Chest',
  rest:    'Rest',
  shop:    'Shop',
  boss:    'BOSS',
  event:   'Event',
};

const TYPE_STROKE: Record<string, string> = {
  start:   '#4a8a60',
  monster: '#c0392b',
  chest:   '#c9a227',
  rest:    '#3a8aaa',
  shop:    '#5a9a4a',
  boss:    '#9b30d0',
  event:   '#a0609a',
};

const TYPE_FILL: Record<string, string> = {
  start:   'rgba(74,138,96,0.25)',
  monster: 'rgba(192,57,43,0.22)',
  chest:   'rgba(201,162,39,0.22)',
  rest:    'rgba(58,138,170,0.22)',
  shop:    'rgba(90,154,74,0.22)',
  boss:    'rgba(155,48,208,0.25)',
  event:   'rgba(160,96,154,0.22)',
};

const SVG_W   = 760;
const SVG_H   = 720;
const PAD_X   = 80;
const PAD_Y   = 58;
const R_NODE  = 28;
const R_BOSS  = 34;
// Gap between circle edge and label baseline
const LABEL_GAP = 18;

export function FloorBoard() {
  const { floorBoard, playerNodeId, phase, moveToNode } = useGameStore();
  if (!floorBoard) return null;

  const { nodes, layerCount } = floorBoard;
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const canMove = phase === 'map';

  const currentNode = nodeMap.get(playerNodeId);
  const reachableIds = new Set(currentNode?.connections ?? []);

  const getX = (xPct: number) => PAD_X + (xPct / 100) * (SVG_W - 2 * PAD_X);
  const getY = (layer: number) => PAD_Y + (layer / (layerCount - 1)) * (SVG_H - 2 * PAD_Y);

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        aria-label="Dungeon floor map"
      >
        <defs>
          <filter id="glow-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-boss" x="-55%" y="-55%" width="210%" height="210%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-reach" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Edges ── */}
        {nodes.map(node =>
          node.connections.map(targetId => {
            const target = nodeMap.get(targetId);
            if (!target) return null;
            const x1 = getX(node.xPct), y1 = getY(node.layer);
            const x2 = getX(target.xPct), y2 = getY(target.layer);
            const isActive = reachableIds.has(target.id) && node.id === playerNodeId;
            const isWalked = node.cleared;

            return (
              <line
                key={`${node.id}-${targetId}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                className={[
                  styles.edge,
                  isWalked  ? styles.edgeWalked  : '',
                  isActive  ? styles.edgeActive  : '',
                ].filter(Boolean).join(' ')}
              />
            );
          })
        )}

        {/* ── Nodes ── */}
        {nodes.map(node => {
          const isPlayer    = node.id === playerNodeId;
          const isReachable = canMove && reachableIds.has(node.id);
          const isVisited   = node.cleared && !isPlayer;
          const isBoss      = node.type === 'boss';
          const isDimmed    = !isPlayer && !isReachable && !isVisited;

          const cx = getX(node.xPct);
          const cy = getY(node.layer);
          const r  = isBoss ? R_BOSS : R_NODE;
          const stroke = TYPE_STROKE[node.type];
          const fill   = TYPE_FILL[node.type];

          return (
            <g
              key={node.id}
              onClick={() => isReachable && moveToNode(node.id)}
              style={{ cursor: isReachable ? 'pointer' : 'default' }}
              className={[
                isReachable ? styles.nodeReachable : '',
                isBoss && !node.cleared ? styles.nodeBoss : '',
              ].filter(Boolean).join(' ') || undefined}
              aria-label={NODE_LABELS[node.type] + (node.enemy ? ` — ${node.enemy.name}` : '')}
            >
              {/* Visited dashed ring */}
              {isVisited && (
                <circle
                  cx={cx} cy={cy} r={r + 8}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                  opacity="0.45"
                />
              )}

              {/* Reachable outer glow ring */}
              {isReachable && (
                <circle
                  cx={cx} cy={cy} r={r + 10}
                  fill="none"
                  stroke={stroke}
                  strokeWidth="2"
                  opacity="0.65"
                  filter="url(#glow-reach)"
                />
              )}

              {/* Boss aura */}
              {isBoss && !node.cleared && (
                <circle
                  cx={cx} cy={cy} r={r + 16}
                  fill="none"
                  stroke="#9b30d0"
                  strokeWidth="1.5"
                  opacity="0.4"
                  filter="url(#glow-boss)"
                  className={styles.bossAura}
                />
              )}

              {/* Main circle */}
              <circle
                cx={cx} cy={cy} r={r}
                fill={isVisited ? 'rgba(26,22,20,0.55)' : fill}
                stroke={isVisited ? '#3a3530' : stroke}
                strokeWidth={isBoss ? 2.5 : 2}
                opacity={isDimmed ? 0.28 : 1}
                filter={isBoss && !node.cleared ? 'url(#glow-boss)' : undefined}
              />

              {/* Dark backdrop for icon contrast */}
              <circle
                cx={cx} cy={cy} r={r * 0.62}
                fill="rgba(10,8,7,0.70)"
                opacity={isDimmed ? 0.28 : 1}
              />

              {/* Icon */}
              <text
                x={cx} y={cy}
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize={isBoss ? 22 : 17}
                opacity={isDimmed ? 0.28 : isVisited ? 0.45 : 1}
                className={styles.nodeIcon}
              >
                {isVisited && node.type !== 'shop' && node.type !== 'start'
                  ? '✓'
                  : TILE_ICONS[node.type]}
              </text>

              {/* Label — only for reachable, boss, or current player position */}
              {(isReachable || isBoss) && (
                <text
                  x={cx}
                  y={cy + r + LABEL_GAP}
                  textAnchor="middle"
                  className={styles.nodeLabel}
                  fill={isBoss ? '#c070f0' : stroke}
                >
                  {isBoss && node.enemy
                    ? node.enemy.name
                    : isReachable && node.enemy && !node.cleared
                    ? node.enemy.name
                    : NODE_LABELS[node.type]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className={styles.legend}>
        {(['monster','boss','chest','rest','shop','event'] as const).map(type => (
          <span key={type} className={styles.legendItem} style={{ color: TYPE_STROKE[type] }}>
            {TILE_ICONS[type]} <span>{NODE_LABELS[type]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
