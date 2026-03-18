const isBrowsableTab = (tab: chrome.tabs.Tab): boolean => {
  const url = tab.url ?? "";
  return url.startsWith("http://") || url.startsWith("https://");
};

export const getActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const browsableTabs = tabs.filter(isBrowsableTab);
  return browsableTabs.find((tab) => tab.active) ?? browsableTabs[0];
};
