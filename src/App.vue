<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './stores/game';

const store = useGameStore();
onMounted(() => store.loadSaved());
</script>

<template>
  <div class="min-h-screen w-full max-w-md mx-auto px-4 pb-8 pt-safe">
    <router-view />
  </div>
</template>
