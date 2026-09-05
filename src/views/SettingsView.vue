<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import ConfirmModal from '../components/ConfirmModal.vue';

const router = useRouter();
const store = useGameStore();
const showReset = ref(false);

function doReset() {
  store.resetGame();
  showReset.value = false;
}
</script>
<template>
  <div class="py-8 flex flex-col gap-6 min-h-screen">
    <div class="flex items-center gap-3">
      <button class="btn-secondary" @click="router.back()">←</button>
      <h2 class="text-xl font-bold">SETTINGS</h2>
    </div>

    <div class="card p-4 flex justify-between items-center">
      <span>Sound</span>
      <input type="checkbox" v-model="store.settings.sound" class="w-5 h-5" />
    </div>
    <div class="card p-4 flex justify-between items-center">
      <span>Haptics</span>
      <input type="checkbox" v-model="store.settings.haptics" class="w-5 h-5" />
    </div>
    <div class="card p-4 flex justify-between items-center">
      <span>Animations</span>
      <input type="checkbox" v-model="store.settings.animations" class="w-5 h-5" />
    </div>
    <div class="card p-4 flex justify-between items-center">
      <span>Language</span>
      <select v-model="store.settings.language" class="bg-white/10 rounded-lg px-2 py-1">
        <option value="en">English</option>
        <option value="ta">தமிழ்</option>
      </select>
    </div>

    <button class="btn-secondary text-rose-400" @click="showReset = true">RESET SAVED GAME</button>
    <p class="text-center text-xs text-white/30">Godfather: Shadows of the Village v1.0.0</p>

    <ConfirmModal
      :open="showReset"
      title="Reset saved game?"
      message="This deletes the current game progress and cannot be undone."
      @confirm="doReset"
      @cancel="showReset = false"
    />
  </div>
</template>
