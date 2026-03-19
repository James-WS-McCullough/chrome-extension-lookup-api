<script setup lang="ts">
import type { AuthorData } from "../../gateways/author-gateway";
import { toTitleCase } from "../../utils/title-case";
import BaseCard from "../atoms/BaseCard.vue";

defineProps<{
  data: AuthorData;
}>();

defineEmits<{
  refresh: [];
}>();
</script>

<template>
  <BaseCard>
    <div class="relative">
      <h2 class="text-base mb-3 text-grey-50">{{ toTitleCase(data.author) }}</h2>
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mb-2">
        <dt class="font-semibold text-sm text-grey-400">Category</dt>
        <dd class="text-sm text-grey-200">{{ data.profile.category }}</dd>
        <dt class="font-semibold text-sm text-grey-400">Difficulty</dt>
        <dd class="text-sm text-grey-200">{{ data.profile.difficulty }}</dd>
        <dt class="font-semibold text-sm text-grey-400">Rate Limit</dt>
        <dd class="text-sm text-grey-200">{{ data.integrationHints.rateLimitPerMinute }} req/min</dd>
      </dl>
      <button
        class="absolute bottom-0 right-0 w-8 h-8 p-0 bg-transparent border border-grey-700 rounded-md text-grey-400 text-lg cursor-pointer transition-colors flex items-center justify-center hover:bg-grey-700 hover:text-grey-50"
        type="button"
        aria-label="Refresh"
        @click="$emit('refresh')"
      >
        &#x21bb;
      </button>
    </div>
  </BaseCard>
</template>
