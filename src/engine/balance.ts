import { ROLES, ALL_ROLE_IDS } from './roles';
import type { RoleId, Team } from './types';

export interface CompositionResult {
  playerCount: number;
  roles: RoleId[];
  counts: Record<Team, number>;
}

function teamTargetCounts(n: number): { evil: number; neutral: number; good: number } {
  const evil = Math.max(2, Math.floor(n / 3));
  let neutral = 0;
  if (n >= 8) neutral = 1;
  if (n >= 11) neutral = 2;
  const good = n - evil - neutral;
  return { evil, neutral, good };
}

function eligiblePool(team: Team, n: number, exclude: Set<RoleId>): RoleId[] {
  return ALL_ROLE_IDS
    .filter((id) => ROLES[id].team === team)
    .filter((id) => !exclude.has(id))
    .filter((id) => n >= ROLES[id].minPlayers && n <= ROLES[id].maxPlayers)
    .sort((a, b) => ROLES[a].tier - ROLES[b].tier || ROLES[b].weight - ROLES[a].weight);
}

function pickRoles(team: Team, count: number, n: number, mustInclude: RoleId[] = []): RoleId[] {
  const chosen: RoleId[] = [];
  const used = new Set<RoleId>();
  for (const id of mustInclude) {
    if (chosen.length >= count) break;
    if (n >= ROLES[id].minPlayers && n <= ROLES[id].maxPlayers) {
      chosen.push(id);
      used.add(id);
    }
  }
  const pool = eligiblePool(team, n, used);
  let i = 0;
  while (chosen.length < count && i < pool.length) {
    chosen.push(pool[i]);
    used.add(pool[i]);
    i += 1;
  }
  // If the pool ran out (shouldn't happen for n in 8-16 given role table), pad with duplicates
  // of the lowest-tier role for that team so the game can still start.
  while (chosen.length < count) {
    const fallback = eligiblePool(team, n, new Set())[0];
    if (!fallback) break;
    chosen.push(fallback);
  }
  return chosen;
}

/** Builds a balanced role list for `n` players (8-16). Deterministic given the same n. */
export function buildComposition(n: number): CompositionResult {
  if (n < 8 || n > 16) throw new Error(`Player count must be 8-16, got ${n}`);
  const targets = teamTargetCounts(n);

  const evilRoles = pickRoles('evil', targets.evil, n, ['killer', 'alchemist', 'assassin', 'puppeteer']);
  const goodRoles = pickRoles('good', targets.good, n, [
    'sheriff', 'doctor', 'grandma', 'bartender', 'blacksmith', 'prophet', 'politician', 'gossip', 'medium',
  ]);
  const neutralRoles = pickRoles('neutral', targets.neutral, n, ['cupid', 'clown']);

  const roles = [...evilRoles, ...goodRoles, ...neutralRoles];

  // Safety net: if rounding left us short/over, trim or pad from the good pool.
  while (roles.length > n) roles.pop();
  while (roles.length < n) {
    const filler = eligiblePool('good', n, new Set(roles))[0] ?? 'sheriff';
    roles.push(filler);
  }

  const counts: Record<Team, number> = { good: 0, evil: 0, neutral: 0 };
  for (const id of roles) counts[ROLES[id].team] += 1;

  return { playerCount: n, roles, counts };
}

export function shuffledCopy<T>(arr: T[], rng: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
