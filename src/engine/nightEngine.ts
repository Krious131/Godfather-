import type { GameState, NightActionSubmission, NightResult, Player, RoleId } from './types';
import { ROLES } from './roles';

function byRole(actions: NightActionSubmission[], roleId: RoleId) {
  return actions.find((a) => a.roleId === roleId);
}

function alive(state: GameState, id: string): Player | undefined {
  const p = state.players.find((pl) => pl.id === id);
  return p && p.status === 'alive' ? p : undefined;
}

function kill(state: GameState, id: string, cause: string, result: NightResult, seen: Set<string>) {
  if (seen.has(id)) return;
  const p = state.players.find((pl) => pl.id === id);
  if (!p || p.status === 'dead') return;
  p.status = 'dead';
  seen.add(id);
  result.deaths.push({ playerId: id, cause });
  result.log.push(`${p.name} died (${cause}).`);
  // Lover heartbreak chain
  if (p.loverId) {
    const lover = state.players.find((pl) => pl.id === p.loverId);
    if (lover && lover.status === 'alive') {
      kill(state, lover.id, 'heartbreak', result, seen);
    }
  }
}

/** Runs the full night pipeline: roleblocks -> control -> protection -> attacks -> armor
 *  -> deaths/chains -> information -> narrative. Mutates `state` in place. */
export function resolveNight(state: GameState, submitted: NightActionSubmission[]): NightResult {
  const result: NightResult = { night: state.night, deaths: [], info: [], log: [], publicSummary: '' };
  const seenDeaths = new Set<string>();

  // 1. Roleblocks (Bartender resolves before everyone else via priority ordering upstream,
  //    but we compute the roleblock set up front regardless of submission order).
  const roleblocked = new Set<string>();
  const bartender = byRole(submitted, 'bartender');
  if (bartender?.targetId && alive(state, bartender.actorId)) {
    roleblocked.add(bartender.targetId);
    result.log.push(`Bartender distracted ${state.players.find((p) => p.id === bartender.targetId)?.name}.`);
  }

  // 2. Control effects (Puppeteer redirects another actor's target).
  const controlled: Record<string, string> = {};
  const puppeteer = byRole(submitted, 'puppeteer');
  if (puppeteer?.targetId && puppeteer.secondTargetId && alive(state, puppeteer.actorId) && !roleblocked.has(puppeteer.actorId)) {
    controlled[puppeteer.targetId] = puppeteer.secondTargetId;
    result.log.push('The Puppeteer pulled a hidden string.');
  }

  const effectiveTarget = (a: NightActionSubmission): string | undefined =>
    controlled[a.actorId] ?? a.targetId;

  // 3. Protection.
  let protectedId: string | undefined;
  const doctor = byRole(submitted, 'doctor');
  if (doctor && alive(state, doctor.actorId) && !roleblocked.has(doctor.actorId)) {
    protectedId = effectiveTarget(doctor);
  }

  // 4. Armor (Blacksmith). Consumed on the first attack it blocks.
  const blacksmith = byRole(submitted, 'blacksmith');
  if (blacksmith && alive(state, blacksmith.actorId) && !roleblocked.has(blacksmith.actorId)) {
    const target = state.players.find((p) => p.id === effectiveTarget(blacksmith));
    if (target && target.status === 'alive') target.hasArmor = true;
  }

  // 5. Poison resolution from a *previous* night's Alchemist action.
  for (const p of state.players) {
    if (p.status === 'alive' && p.poisonedUntilNight === state.night) {
      kill(state, p.id, 'poison', result, seenDeaths);
      p.poisonedUntilNight = null;
    }
  }

  // 6. Resolve lethal attacks: Killer, Assassin.
  const killerAction = byRole(submitted, 'killer');
  const assassinAction = byRole(submitted, 'assassin');

  const applyAttack = (a: NightActionSubmission | undefined, forced: boolean) => {
    if (!a || !alive(state, a.actorId) || roleblocked.has(a.actorId)) return;
    const targetId = effectiveTarget(a);
    if (!targetId) return;
    const target = state.players.find((p) => p.id === targetId);
    if (!target || target.status === 'dead') return;

    // Grandma passive revenge.
    if (target.role === 'grandma') {
      const wasSaved = !forced && (protectedId === target.id || target.hasArmor);
      if (target.hasArmor && !forced) target.hasArmor = false;
      kill(state, a.actorId, 'Grandma\'s revenge', result, seenDeaths);
      if (!wasSaved) kill(state, target.id, 'attacked', result, seenDeaths);
      return;
    }

    if (!forced) {
      if (protectedId === target.id) {
        result.log.push(`${target.name} was protected from an attack.`);
        return;
      }
      if (target.hasArmor) {
        target.hasArmor = false;
        result.log.push(`${target.name}'s armor absorbed an attack.`);
        return;
      }
    }
    kill(state, target.id, forced ? 'assassinated' : 'attacked', result, seenDeaths);
  };

  applyAttack(killerAction, false);
  applyAttack(assassinAction, true); // Assassin ignores protection/armor.

  // 7. Alchemist poisons a new target for the *next* night.
  const alchemist = byRole(submitted, 'alchemist');
  if (alchemist && alive(state, alchemist.actorId) && !roleblocked.has(alchemist.actorId)) {
    const targetId = effectiveTarget(alchemist);
    const target = state.players.find((p) => p.id === targetId);
    if (target && target.status === 'alive') {
      target.poisonedUntilNight = state.night + 1;
      result.log.push('The Alchemist mixed something into a drink.');
    }
  }

  // 8. Information roles (private results, withheld if blocked).
  const addInfo = (roleId: RoleId, message: (a: NightActionSubmission) => string) => {
    const a = byRole(submitted, roleId);
    if (!a || !alive(state, a.actorId) || roleblocked.has(a.actorId)) return;
    result.info.push({ toPlayerId: a.actorId, message: message(a) });
  };

  addInfo('sheriff', (a) => {
    const t = state.players.find((p) => p.id === a.targetId);
    if (!t) return 'No result.';
    const isEvil = t.role ? ROLES[t.role].team === 'evil' : false;
    return `${t.name} is ${isEvil ? 'EVIL' : 'GOOD'}.`;
  });
  addInfo('prophet', (a) => {
    const t = state.players.find((p) => p.id === a.targetId);
    if (!t || !t.role) return 'No result.';
    return `${t.name} is the ${ROLES[t.role].name}.`;
  });
  addInfo('gossip', (a) => {
    const t1 = state.players.find((p) => p.id === a.targetId);
    const t2 = state.players.find((p) => p.id === a.secondTargetId);
    if (!t1 || !t2 || !t1.role || !t2.role) return 'No result.';
    const same = ROLES[t1.role].team === ROLES[t2.role].team;
    return `${t1.name} and ${t2.name} are ${same ? 'on the same team' : 'on different teams'}.`;
  });
  // Medium is gated to one use per game by the store before it ever submits an action.
  addInfo('medium', (a) => {
    const t = state.players.find((p) => p.id === a.targetId);
    if (!t || !t.role) return 'The spirits are silent.';
    return `${t.name} was the ${ROLES[t.role].name}.`;
  });

  // 9. Cupid (Night 1 only) links lovers.
  const cupid = byRole(submitted, 'cupid');
  if (state.night === 1 && cupid && cupid.targetId && cupid.secondTargetId) {
    const a = state.players.find((p) => p.id === cupid.targetId);
    const b = state.players.find((p) => p.id === cupid.secondTargetId);
    if (a && b) {
      a.loverId = b.id;
      b.loverId = a.id;
      result.info.push({ toPlayerId: a.id, message: `You are in love with ${b.name}.` });
      result.info.push({ toPlayerId: b.id, message: `You are in love with ${a.name}.` });
    }
  }

  state.roleblocked = roleblocked;
  state.controlled = controlled;
  result.publicSummary = result.deaths.length === 0
    ? 'Against all odds, everyone survived the night.'
    : `The village has lost ${result.deaths.map((d) => state.players.find((p) => p.id === d.playerId)?.name).join(' and ')}.`;
  state.eventLog.push(...result.log.map((l) => `Night ${state.night} — ${l}`));
  return result;
}
