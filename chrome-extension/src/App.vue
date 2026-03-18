<script setup lang="ts">
import { onMounted, ref } from "vue";
import AuthorCard from "./components/organisms/AuthorCard.vue";
import ErrorMessage from "./components/organisms/ErrorMessage.vue";
import UnsupportedPage from "./components/organisms/UnsupportedPage.vue";
import StatusCard from "./components/molecules/StatusCard.vue";
import LookupButton from "./components/atoms/LookupButton.vue";
import { extractFirstAuthor } from "./extractors/quote-extractor";
import { fetchAuthorData } from "./services/author-api";
import type { AuthorData } from "./services/author-api";
import { getActiveTab } from "./utils/active-tab";
import { toUserMessage } from "./utils/error-message";
import { isQuotesPage } from "./utils/url-matcher";

type Status = "idle" | "loading" | "success" | "error" | "unsupported";

const status = ref<Status>("idle");
const authorData = ref<AuthorData | null>(null);
const errorMessage = ref("");
const buttonVisible = ref(true);
const pendingStatus = ref<Status | null>(null);

const handleLookup = async (): Promise<void> => {
  status.value = "loading";
  buttonVisible.value = true;

  const tab = await getActiveTab();

  if (!tab?.id) {
    status.value = "error";
    errorMessage.value = "Could not access the active tab.";
    return;
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractFirstAuthor,
  });

  const authorName = result?.result as string | null;

  if (!authorName) {
    status.value = "error";
    errorMessage.value = "Could not find an author on this page.";
    return;
  }

  try {
    authorData.value = await fetchAuthorData(authorName);
    pendingStatus.value = "success";
    buttonVisible.value = false;
  } catch (error) {
    status.value = "error";
    errorMessage.value = toUserMessage(error, authorName);
  }
};

const onButtonLeave = (): void => {
  if (pendingStatus.value) {
    status.value = pendingStatus.value;
    pendingStatus.value = null;
  }
};

onMounted(async () => {
  const tab = await getActiveTab();
  const url = tab?.url ?? "";

  if (!isQuotesPage(url)) {
    status.value = "unsupported";
    buttonVisible.value = false;
    return;
  }
});
</script>

<template>
  <h1><img src="../icons/icon-48.png" alt="" width="24" height="24" />Author Lookup</h1>
  <div v-if="status === 'unsupported'" class="unsupported-layout">
    <UnsupportedPage />
  </div>
  <template v-else>
    <div class="card-area">
      <AuthorCard
        v-if="status === 'success' && authorData"
        :data="authorData"
        @refresh="handleLookup"
      />
      <ErrorMessage
        v-else-if="status === 'error'"
        :message="errorMessage"
      />
      <StatusCard
        v-else-if="status === 'idle'"
        icon="i"
        variant="info"
      >
        <p>Press the button to get info on the top author on this page.</p>
      </StatusCard>
    </div>
    <Transition name="fade" @after-leave="onButtonLeave">
      <LookupButton
        v-if="buttonVisible"
        :loading="status === 'loading'"
        @click="handleLookup"
      />
    </Transition>
  </template>
</template>

<style scoped>
.unsupported-layout {
  flex: 1;
  display: flex;
  align-items: center;
}

.card-area {
  flex: 1;
  display: flex;
  align-items: center;
}

.card-area > * {
  width: 100%;
}

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
