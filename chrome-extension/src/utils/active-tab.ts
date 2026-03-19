const isBrowsableTab = (tab: chrome.tabs.Tab): boolean => {
  const url = tab.url ?? "";
  return url.startsWith("http://") || url.startsWith("https://");
};

export const getActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  return tab && isBrowsableTab(tab) ? tab : undefined;
};
