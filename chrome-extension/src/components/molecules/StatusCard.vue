<script setup lang="ts">
import BaseCard from "../atoms/BaseCard.vue";
import IconBadge from "../atoms/IconBadge.vue";

defineProps<{
  icon: string;
  variant: "error" | "info";
}>();
</script>

<template>
  <BaseCard>
    <div class="status-card">
      <IconBadge :icon="icon" :variant="variant" />
      <div class="status-card__message">
        <slot />
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.status-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-card__message {
  font-size: 13px;
  color: var(--grey-100);
  line-height: 1.5;
}
</style>
