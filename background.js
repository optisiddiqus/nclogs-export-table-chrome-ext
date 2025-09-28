// Listen for tab updates and inject script.js when the URL matches.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  const url = tab.url || '';
  if (!url.includes('logs.newscred.com')) return;

  chrome.scripting.executeScript({
    target: { tabId },
    files: ['script.js']
  }).catch(err => {
    console.warn('Injection failed:', err);
  });
});
