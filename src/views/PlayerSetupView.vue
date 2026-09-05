<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { buildComposition } from '../engine/balance';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();

const count = ref(8);
const names = ref<string[]>(Array.from({ length: 8 }, (_, i) => `Player ${i + 1}`));

function setCount(n: number) {
  count.value = n;
  const cur = names.value;
  names.value = Array.from({ length: n }, (_, i) => cur[i] ?? `Player ${i + 1}`);
}

const composition = computed(() => buildComposition(count.value));

function start() {
  store.startNewGame(names.value.map((n) => n.trim() || 'Player'));
  router.push('/reveal');
}
</script>

<template>
  <div class="py-8 flex flex-col gap-6">
    <h2 class="text-2xl font-bold">{{ count }} PLAYERS</h2>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="n in [8,9,10,11,12,13,14,15,16]" :key="n"
        class="btn-pill text-sm"
        :class="n === count ? 'bg-neon text-white' : 'bg-white/10'"
        @click="setCount(n)"
      >{{ n }}</button>
    </div>

    <div class="card p-4 flex justify-between text-sm">
      <span class="text-emerald-400">GOOD&nbsp;{{ composition.counts.good }}</span>
      <span class="text-rose-400">EVIL&nbsp;{{ composition.counts.evil }}</span>
      <span class="text-violet-400">NEUTRAL&nbsp;{{ composition.counts.neutral }}</span>
    </div>

    <div class="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
      <input
        v-for="(_, i) in names" :key="i"
        v-model="names[i]"
        class="card px-4 py-3 bg-transparent outline-none"
        :placeholder="`Player ${i + 1}`"
      />
    </div>

    <button class="btn-primary mt-auto" @click="start">START GAME</button>
  </div>
</template>
