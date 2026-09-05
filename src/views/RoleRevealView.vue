<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { ROLES } from '../engine/roles';
import HoldToReveal from '../components/HoldToReveal.vue';

const store = useGameStore();
const router = useRouter();
const revealed = ref(false);

const player = computed(() => store.game?.players[store.revealIndex]);
const role = computed(() => (player.value?.role ? ROLES[player.value.role] : null));

function onReveal() { revealed.value = true; }

function next() {
  store.revealNext();
  revealed.value = false;
  if (!store.game || store.game.phase === 'night') router.push('/night');
}
</script>

<template>
  <div v-if="player" class="min-h-screen flex flex-col justify-center gap-6 py-8">
    <template v-if="!revealed">
      <p class="text-center text-white/60">Pass the phone to</p>
      <h2 class="text-3xl font-bold text-center">{{ player.name }}</h2>
      <p class="text-center text-sm text-amber-400">Make sure nobody else can see your screen.</p>
      <HoldToReveal @revealed="onReveal" />
    </template>

    <template v-else>
      <div class="card p-6 text-center flex flex-col gap-3">
        <p class="uppercase tracking-widest text-xs" :class="{
          'text-rose-400': role?.team === 'evil', 'text-emerald-400': role?.team === 'good', 'text-violet-400': role?.team === 'neutral'
        }">{{ role?.team }}</p>
        <h2 class="text-3xl font-black">{{ role?.name }}</h2>
        <p class="text-white/80">{{ role?.ability }}</p>
        <p class="text-white/50 text-sm">Objective: {{ role?.objective }}</p>
      </div>
      <button class="btn-primary" @click="next">HIDE ROLE &amp; CONTINUE</button>
    </template>
  </div>
</template>
