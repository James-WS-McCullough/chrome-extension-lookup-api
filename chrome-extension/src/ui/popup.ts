import { extractFirstAuthor } from "../extractors/quote-extractor";
import { fetchAuthorData } from "../services/author-api";
import { isQuotesPage } from "../utils/url-matcher";
import { showAuthorData, showError, showUnsupportedPage } from "./renderer";

const container = document.getElementById("results") as HTMLElement;
const button = document.getElementById("lookup-btn") as HTMLButtonElement;
const buttonDefault = '<span class="material-symbols-outlined">person_search</span>Get Author Data';

const setButtonLoading = (loading: boolean): void => {
  button.disabled = loading;
  if (loading) {
    button.innerHTML = '<span class="spinner"></span>';
  } else {
    button.innerHTML = buttonDefault;
  }
};

const toUserMessage = (error: unknown, authorName: string): string => {
  if (!(error instanceof Error)) {
    return "An unexpected error occurred.";
  }

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Could not connect to the local API.<br>Is the local API running?";
  }

  if (error.message === "Author not found") {
    return `The author name "${authorName}" was not found in the database.`;
  }

  return `Something went wrong: ${error.message}`;
};

const handleLookup = async (): Promise<void> => {
  container.innerHTML = "";
  button.hidden = false;
  setButtonLoading(true);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    setButtonLoading(false);
    showError(container, "Could not access the active tab.");
    return;
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractFirstAuthor,
  });

  const authorName = result?.result as string | null;

  if (!authorName) {
    setButtonLoading(false);
    showError(container, "Could not find an author on this page.");
    return;
  }

  try {
    const data = await fetchAuthorData(authorName);
    button.classList.add("fade-out");
    button.addEventListener(
      "animationend",
      () => {
        button.hidden = true;
        button.classList.remove("fade-out");
        showAuthorData(container, data, handleLookup);
      },
      { once: true },
    );
  } catch (error) {
    setButtonLoading(false);
    showError(container, toUserMessage(error, authorName));
  }
};

const initialize = async (): Promise<void> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? "";

  if (!isQuotesPage(url)) {
    showUnsupportedPage(container);
    button.hidden = true;
    return;
  }

  button.addEventListener("click", handleLookup);
};

initialize();
