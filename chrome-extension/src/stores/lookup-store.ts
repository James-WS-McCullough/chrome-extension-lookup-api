import { ref } from "vue";
import { extractFirstAuthor } from "../extractors/quote-extractor";
import type { AuthorData } from "../gateways/author-gateway";
import { fetchAuthorData } from "../gateways/author-gateway";
import { getActiveTab } from "../utils/active-tab";
import { toUserMessage } from "../utils/error-message";
import { isQuotesPage } from "../utils/url-matcher";

export enum LookupStatus {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
  Unsupported = "unsupported",
}

const status = ref<LookupStatus>(LookupStatus.Idle);
const authorData = ref<AuthorData | null>(null);
const errorMessage = ref("");
const buttonVisible = ref(true);
const pendingStatus = ref<LookupStatus | null>(null);

const setError = (message: string): void => {
  status.value = LookupStatus.Error;
  errorMessage.value = message;
};

const lookup = async (): Promise<void> => {
  status.value = LookupStatus.Loading;
  buttonVisible.value = true;

  const tab = await getActiveTab();

  if (!tab?.id) {
    setError("Could not access the active tab.");
    return;
  }

  let authorName: string | null;

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractFirstAuthor,
    });
    authorName = result?.result as string | null;
  } catch {
    setError("Could not read the page content.");
    return;
  }

  if (!authorName) {
    setError("Could not find an author on this page.");
    return;
  }

  try {
    authorData.value = await fetchAuthorData(authorName);
    pendingStatus.value = LookupStatus.Success;
    buttonVisible.value = false;
  } catch (error) {
    setError(toUserMessage(error, authorName));
  }
};

const onButtonLeave = (): void => {
  if (pendingStatus.value) {
    status.value = pendingStatus.value;
    pendingStatus.value = null;
  }
};

const detectPage = async (): Promise<void> => {
  const tab = await getActiveTab();
  const url = tab?.url ?? "";

  if (!isQuotesPage(url)) {
    status.value = LookupStatus.Unsupported;
    buttonVisible.value = false;
  }
};

const RESET = (): void => {
  status.value = LookupStatus.Idle;
  authorData.value = null;
  errorMessage.value = "";
  buttonVisible.value = true;
  pendingStatus.value = null;
};

export const useLookupStore = () => ({
  status,
  authorData,
  errorMessage,
  buttonVisible,
  lookup,
  onButtonLeave,
  detectPage,
  $reset: RESET,
});
