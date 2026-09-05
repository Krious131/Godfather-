<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ROLES, ALL_ROLE_IDS } from '../engine/roles';
import type { RoleId } from '../engine/types';

const router = useRouter();
const open = ref<RoleId | null>(null);
const teams = ['evil', 'good', 'neutral'] as const;
</script>

<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <div class="flex items-center gap-3">
      <button class="btn-secondary" @click="router.back()">←</button>
      <h2 class="text-xl font-bold">ROLE LIBRARY</h2>
    </div>

    <div v-for="team in teams" :key="team">
      <p class="text-xs uppercase tracking-widest mb-2" :class="{
        'text-rose-400': team === 'evil', 'text-emerald-400': team === 'good', 'text-violet-400': team === 'neutral'
      }">{{ team }}</p>
      <div class="flex flex-col gap-2">
        <div v-for="id in ALL_ROLE_IDS.filter((r) => ROLES[r].team === team)" :key="id" class="card p-4">
          <button class="w-full text-left flex justify-between items-center" @click="open = open === id ? null : id">
            <span class="font-semibold">{{ ROLES[id].name }}</span>
            <span class="text-white/40">{{ open === id ? '−' : '+' }}</span>
          </button>
          <p class="text-sm text-white/50 mt-1">{{ ROLES[id].short }}</p>
          <div v-if="open === id" class="mt-3 flex flex-col gap-2 text-sm text-white/80 border-t border-white/10 pt-3">
            <p><b>Ability:</b> {{ ROLES[id].ability }}</p>
            <p><b>Objective:</b> {{ ROLES[id].objective }}</p>
            <p><b>Activates:</b> {{ ROLES[id].activates }}</p>
            <p><b>Limitations:</b> {{ ROLES[id].limitations }}</p>
            <p><b>Interactions:</b> {{ ROLES[id].interactions }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
