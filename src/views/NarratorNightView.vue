<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { ROLES } from '../engine/roles';
import type { NightActionSubmission, RoleId } from '../engine/types';

const store = useGameStore();
const router = useRouter();

if (store.game && store.game.phase !== 'night') store.beginNight();

const order = computed<RoleId[]>(() => store.nightOrder);
const stepIndex = ref(0);
const currentRole = computed<RoleId | undefined>(() => order.value[stepIndex.value]);
const currentDef = computed(() => (currentRole.value ? ROLES[currentRole.value] : null));
const currentActor = computed(() => store.livingPlayers.find((p) => p.role === currentRole.value));

const target = ref('');
const secondTarget = ref('');
const submissions = ref<NightActionSubmission[]>([]);
const done = ref(false);
const result = ref<{ publicSummary: string } | null>(null);

const targetable = computed(() => store.livingPlayers.filter((p) => p.id !== currentActor.value?.id));

function confirm() {
  if (!currentActor.value || !currentRole.value) return;
  submissions.value.push({
    roleId: currentRole.value,
    actorId: currentActor.value.id,
    targetId: target.value || undefined,
    secondTargetId: secondTarget.value || undefined,
  });
  target.value = '';
  secondTarget.value = '';
  if (stepIndex.value + 1 >= order.value.length) {
    done.value = true;
  } else {
    stepIndex.value += 1;
  }
}

function skip() {
  target.value = '';
  secondTarget.value = '';
  if (stepIndex.value + 1 >= order.value.length) done.value = true;
  else stepIndex.value += 1;
}

function resolve() {
  const r = store.resolveNight(submissions.value);
  result.value = store.lastNightResult;
  void r;
}

function toMorning() {
  store.beginDay();
  router.push('/day');
}

const needsSecondTarget = computed(
  () => currentRole.value === 'gossip' || currentRole.value === 'cupid' || currentRole.value === 'puppeteer',
);
</script>

<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <h2 class="text-xl font-bold text-center">🌙 NIGHT {{ store.game?.night }}</h2>

    <template v-if="result">
      <div class="card p-6 text-center flex flex-col gap-3">
        <p class="text-lg">☀️ DAWN</p>
        <p class="text-white/70">{{ result.publicSummary }}</p>
      </div>
      <button class="btn-primary" @click="toMorning">CONTINUE TO DAY</button>
    </template>

    <template v-else-if="!done && currentDef && currentActor">
      <p class="text-center text-white/50 text-sm">Step {{ stepIndex + 1 }} of {{ order.length }}</p>
      <div class="card p-5 flex flex-col gap-3">
        <p class="text-xs uppercase tracking-widest text-white/50">Pass the phone to</p>
        <h3 class="text-2xl font-bold">{{ currentActor.name }} — {{ currentDef.name }}</h3>
        <p class="text-white/70 text-sm">{{ currentDef.ability }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <button
          v-for="p in targetable" :key="p.id"
          class="btn-secondary text-left"
          :class="target === p.id ? 'ring-2 ring-neon' : ''"
          @click="target = p.id"
        >{{ p.name }}</button>
      </div>

      <div v-if="needsSecondTarget" class="flex flex-col gap-2">
        <p class="text-xs text-white/50">Second target</p>
        <button
          v-for="p in targetable.filter((p) => p.id !== target)" :key="p.id"
          class="btn-secondary text-left"
          :class="secondTarget === p.id ? 'ring-2 ring-uv' : ''"
          @click="secondTarget = p.id"
        >{{ p.name }}</button>
      </div>

      <div class="flex gap-3 mt-auto">
        <button class="btn-secondary flex-1" @click="skip">SKIP</button>
        <button class="btn-primary flex-1" :disabled="!target" @click="confirm">CONFIRM</button>
      </div>
    </template>

    <template v-else-if="!done && order.length === 0">
      <p class="text-center text-white/60 py-12">No one can act tonight.</p>
      <button class="btn-primary" @click="resolve">RESOLVE NIGHT</button>
    </template>

    <template v-else>
      <div class="flex flex-col gap-2">
        <p class="text-white/70 text-sm">✓ All actions collected:</p>
        <p v-for="s in submissions" :key="s.roleId" class="text-sm text-white/50">
          ✓ {{ ROLES[s.roleId].name }} acted
        </p>
      </div>
      <button class="btn-primary mt-auto" @click="resolve">RESOLVE NIGHT</button>
    </template>
  </div>
</template>
