<script setup lang="ts">
import type { AuthorData } from "../../services/author-api";
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
    <div class="author-card">
      <h2>{{ toTitleCase(data.author) }}</h2>
      <dl>
        <dt>Category</dt>
        <dd>{{ data.profile.category }}</dd>
        <dt>Difficulty</dt>
        <dd>{{ data.profile.difficulty }}</dd>
        <dt>Rate Limit</dt>
        <dd>{{ data.integrationHints.rateLimitPerMinute }} req/min</dd>
      </dl>
      <button class="refresh-btn" type="button" aria-label="Refresh" @click="$emit('refresh')">&#x21bb;</button>
    </div>
  </BaseCard>
</template>

<style scoped>
.author-card {
  position: relative;
}

.author-card h2 {
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--grey-50);
}

.author-card dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 16px;
  margin-bottom: 8px;
}

.author-card dt {
  font-weight: 600;
  font-size: 13px;
  color: var(--grey-400);
}

.author-card dd {
  font-size: 13px;
  color: var(--grey-200);
}

.refresh-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  background: none;
  border: 1px solid var(--grey-700);
  border-radius: 6px;
  color: var(--grey-400);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: var(--grey-700);
  color: var(--grey-50);
}
</style>
