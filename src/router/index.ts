import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/setup', name: 'setup', component: () => import('../views/PlayerSetupView.vue') },
  { path: '/reveal', name: 'reveal', component: () => import('../views/RoleRevealView.vue') },
  { path: '/night', name: 'night', component: () => import('../views/NarratorNightView.vue') },
  { path: '/day', name: 'day', component: () => import('../views/DayView.vue') },
  { path: '/vote', name: 'vote', component: () => import('../views/VotingView.vue') },
  { path: '/library', name: 'library', component: () => import('../views/RoleLibraryView.vue') },
  { path: '/how-to-play', name: 'how-to-play', component: () => import('../views/HowToPlayView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
];

export const router = createRouter({ history: createWebHashHistory(), routes });
