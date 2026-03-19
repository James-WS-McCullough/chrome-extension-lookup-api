<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button type="button" :disabled="loading" @click="$emit('click')">
    <span v-if="loading" class="spinner" />
    <template v-else>
      <span class="material-symbols-outlined">person_search</span>
      Get Author Data
    </template>
  </button>
</template>

<style scoped>
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  background: var(--blue-500);
  color: var(--grey-50);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button .material-symbols-outlined {
  font-size: 20px;
}

button:hover {
  background: var(--blue-600);
}

button:disabled {
  background: var(--grey-700);
  color: var(--grey-400);
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid var(--grey-400);
  border-top-color: var(--grey-50);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
