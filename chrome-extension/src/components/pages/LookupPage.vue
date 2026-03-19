<script setup lang="ts">
import { onMounted } from "vue";
import AuthorCard from "../organisms/AuthorCard.vue";
import ErrorMessage from "../organisms/ErrorMessage.vue";
import UnsupportedPage from "../organisms/UnsupportedPage.vue";
import StatusCard from "../molecules/StatusCard.vue";
import LookupButton from "../atoms/LookupButton.vue";
import PopupLayout from "../templates/PopupLayout.vue";
import { LookupStatus, useLookupStore } from "../../stores/lookup-store";

const { status, authorData, errorMessage, buttonVisible, lookup, onButtonLeave, detectPage } =
  useLookupStore();

onMounted(detectPage);
</script>

<template>
  <PopupLayout v-if="status === LookupStatus.Unsupported">
    <template #content>
      <UnsupportedPage />
    </template>
  </PopupLayout>
  <PopupLayout v-else>
    <template #content>
      <AuthorCard
        v-if="status === LookupStatus.Success && authorData"
        :data="authorData"
        @refresh="lookup"
      />
      <ErrorMessage
        v-else-if="status === LookupStatus.Error"
        :message="errorMessage"
      />
      <StatusCard
        v-else-if="status === LookupStatus.Idle"
        icon="i"
        variant="info"
      >
        <p>Press the button to get info on the top author on this page.</p>
      </StatusCard>
    </template>
    <template #action>
      <Transition name="fade" @after-leave="onButtonLeave">
        <LookupButton
          v-if="buttonVisible"
          :loading="status === LookupStatus.Loading"
          @click="lookup"
        />
      </Transition>
    </template>
  </PopupLayout>
</template>

<style scoped>
.fade-leave-active {
  animation: fade-out 0.4s ease-out forwards;
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
