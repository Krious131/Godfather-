import type { GameState } from './types';

export interface VoteTally {
  votes: Record<string, number>; // targetId -> weighted vote count
  leaders: string[]; // tied top targets
}

export function tallyVotes(state: GameState, ballots: Record<string, string>): VoteTally {
  const votes: Record<string, number> = {};
  for (const [voterId, targetId] of Object.entries(ballots)) {
    const voter = state.players.find((p) => p.id === voterId);
    if (!voter || voter.status !== 'alive' || !targetId) continue;
    votes[targetId] = (votes[targetId] ?? 0) + voter.votesWeight;
  }
  const max = Math.max(0, ...Object.values(votes));
  const leaders = max > 0 ? Object.entries(votes).filter(([, v]) => v === max).map(([id]) => id) : [];
  return { votes, leaders };
}

export interface ExecutionResult {
  executedId: string | null;
  tied: boolean;
  chainDeaths: { playerId: string; cause: string }[];
  summary: string;
}

/** Resolves a day vote into an execution (or a no-execution tie), then applies
 *  Grandma revenge and lover-heartbreak chains that follow from the execution. */
export function resolveExecution(state: GameState, tally: VoteTally): ExecutionResult {
  const chainDeaths: { playerId: string; cause: string }[] = [];

  if (tally.leaders.length !== 1) {
    return { executedId: null, tied: true, chainDeaths, summary: 'The vote was tied. No one is executed.' };
  }

  const targetId = tally.leaders[0];
  const target = state.players.find((p) => p.id === targetId);
  if (!target || target.status !== 'alive') {
    return { executedId: null, tied: false, chainDeaths, summary: 'The vote target was invalid.' };
  }

  target.status = 'dead';
  const cause = target.role === 'clown' ? 'executed (Clown win)' : 'executed';
  state.eventLog.push(`Day ${state.day} — ${target.name} was executed (${cause}).`);

  if (target.loverId) {
    const lover = state.players.find((p) => p.id === target.loverId);
    if (lover && lover.status === 'alive') {
      lover.status = 'dead';
      chainDeaths.push({ playerId: lover.id, cause: 'heartbreak' });
      state.eventLog.push(`Day ${state.day} — ${lover.name} died of heartbreak.`);
    }
  }

  return {
    executedId: target.id,
    tied: false,
    chainDeaths,
    summary: `${target.name} was executed by the village.`,
  };
}
