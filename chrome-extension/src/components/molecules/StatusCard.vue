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
    <div class="flex items-center gap-3.5">
      <IconBadge :icon="icon" :variant="variant" />
      <div class="text-sm text-grey-100 leading-normal">
        <slot />
      </div>
    </div>
  </BaseCard>
</template>
