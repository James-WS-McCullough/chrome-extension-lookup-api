<script setup lang="ts">
defineProps<{
  loading: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 w-full py-2.5 text-sm bg-blue-500 text-grey-50 border-none rounded-md cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-grey-700 disabled:text-grey-400 disabled:cursor-not-allowed"
    :disabled="loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="inline-block w-5 h-5 border-2 border-grey-400 border-t-grey-50 rounded-full animate-spin align-middle" />
    <template v-else>
      <span class="material-symbols-outlined text-xl">person_search</span>
      Get Author Data
    </template>
  </button>
</template>
