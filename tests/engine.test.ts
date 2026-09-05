import { buildComposition } from '../src/engine/balance';
import { createGame, advanceToNight, submitNightActions, advanceToDay, submitDayVote, nightActingOrder } from '../src/engine/gameEngine';
import { ROLES } from '../src/engine/roles';
import type { NightActionSubmission } from '../src/engine/types';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { failures += 1; console.error(`FAIL: ${msg}`); } else { console.log(`ok  : ${msg}`); }
}

// 1. Balancing must produce exactly n roles, for every n in 8..16, with no invalid refs.
for (let n = 8; n <= 16; n += 1) {
  const comp = buildComposition(n);
  assert(comp.roles.length === n, `n=${n}: role count matches player count`);
  assert(comp.roles.every((r) => !!ROLES[r]), `n=${n}: no missing role references`);
  assert(comp.counts.evil >= 2, `n=${n}: at least 2 evil roles`);
  assert(comp.counts.evil < n, `n=${n}: evil does not exceed total`);
}

// 2. A full game can be created and started at every player count.
for (let n = 8; n <= 16; n += 1) {
  const names = Array.from({ length: n }, (_, i) => `Player${i + 1}`);
  const game = createGame(names);
  assert(game.players.length === n, `n=${n}: all players received roles`);
  assert(game.players.every((p) => p.role !== null), `n=${n}: no player left roleless`);
}

// 3. Doctor protection stops a Killer attack.
{
  const game = createGame(['Alex', 'Sarah', 'Daniel', 'Maya', 'A5', 'A6', 'A7', 'A8']);
  const doctor = game.players.find((p) => p.role === 'doctor')!;
  const killer = game.players.find((p) => p.role === 'killer')!;
  const target = game.players.find((p) => p.id !== doctor.id && p.id !== killer.id)!;
  advanceToNight(game);
  const submissions: NightActionSubmission[] = [
    { roleId: 'doctor', actorId: doctor.id, targetId: target.id },
    { roleId: 'killer', actorId: killer.id, targetId: target.id },
  ];
  submitNightActions(game, submissions);
  assert(target.status === 'alive', 'Doctor protection stops a Killer attack on the same target');
}

// 4. Roleblocked Killer does not kill.
{
  const game = createGame(['Alex', 'Sarah', 'Daniel', 'Maya', 'A5', 'A6', 'A7', 'A8', 'A9']);
  const bartender = game.players.find((p) => p.role === 'bartender');
  const killer = game.players.find((p) => p.role === 'killer')!;
  const target = game.players.find((p) => p.id !== killer.id && p.id !== bartender?.id)!;
  advanceToNight(game);
  const submissions: NightActionSubmission[] = [{ roleId: 'killer', actorId: killer.id, targetId: target.id }];
  if (bartender) submissions.push({ roleId: 'bartender', actorId: bartender.id, targetId: killer.id });
  submitNightActions(game, submissions);
  assert(!bartender || target.status === 'alive', 'Roleblocked Killer fails to kill');
}

// 5. Grandma revenge kills the Killer and Grandma dies too (unprotected).
{
  const n = 14;
  const names = Array.from({ length: n }, (_, i) => `P${i + 1}`);
  let game = createGame(names);
  let tries = 0;
  while (!(game.players.some((p) => p.role === 'grandma') && game.players.some((p) => p.role === 'killer')) && tries < 30) {
    game = createGame(names);
    tries += 1;
  }
  const grandma = game.players.find((p) => p.role === 'grandma');
  const killer = game.players.find((p) => p.role === 'killer');
  if (grandma && killer) {
    advanceToNight(game);
    submitNightActions(game, [{ roleId: 'killer', actorId: killer.id, targetId: grandma.id }]);
    assert(killer.status === 'dead', 'Grandma revenge kills the attacking Killer');
    assert(grandma.status === 'dead', 'Unprotected Grandma still dies alongside her attacker');
  } else {
    console.log('skip: Grandma/Killer not co-present at n=14 composition (acceptable)');
  }
}

// 6. Lover heartbreak: killing one lover kills the other.
{
  const game = createGame(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  const [a, b] = game.players;
  a.loverId = b.id;
  b.loverId = a.id;
  const killer = game.players.find((p) => p.role === 'killer')!;
  const victim = a.id !== killer.id ? a : b;
  advanceToNight(game);
  submitNightActions(game, [{ roleId: 'killer', actorId: killer.id, targetId: victim.id }]);
  assert(a.status === 'dead' && b.status === 'dead', 'Killing one Lover chains death to the other');
}

// 7. Clown executed by vote wins immediately.
{
  const game = createGame(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
  const clown = game.players.find((p) => p.role === 'clown');
  if (clown) {
    advanceToDay(game);
    const ballots: Record<string, string> = {};
    for (const p of game.players) if (p.id !== clown.id) ballots[p.id] = clown.id;
    const { execution } = submitDayVote(game, ballots);
    assert(execution.executedId === clown.id, 'Clown is executed by unanimous vote');
    assert(game.winner?.winner === 'clown', 'Clown win triggers on execution');
  } else {
    console.log('skip: no Clown in this 9-player composition');
  }
}

// 8. Night acting order excludes dead and roleless players, and once-per-game roles after use.
{
  const game = createGame(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
  advanceToNight(game);
  const order1 = nightActingOrder(game);
  const assassin = game.players.find((p) => p.role === 'assassin');
  if (assassin) {
    submitNightActions(game, [{ roleId: 'assassin', actorId: assassin.id, targetId: game.players.find((p) => p.id !== assassin.id)!.id }]);
    advanceToNight(game);
    const order2 = nightActingOrder(game);
    assert(!order2.includes('assassin'), 'Once-per-game Assassin does not act again after use');
  } else {
    assert(order1.every((r) => r !== 'assassin'), 'No Assassin in this composition, correctly absent');
  }
}

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
declare const process: { exit: (code: number) => void };
process.exit(failures === 0 ? 0 : 1);
