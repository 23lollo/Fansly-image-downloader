// Store the latest media URLs
let latestMedia = {
  image: null,
  video: null,
  audio: null
};

// Track download counts for donation reminders
let downloadCount = 0;

// Track processed URLs to avoid duplicates
let processedUrls = new Set();

// Listen for all network requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = details.url;
    
    // Skip if already processed this URL
    if (processedUrls.has(url)) {
      return;
    }

    // Check for images
    if (url.match(/\.(jpeg|jpg|png|gif|webp)(\?|$)/) && url.includes('fansly')) {
      console.log("✅ Found image:", url);
      latestMedia.image = url;
      processedUrls.add(url);
      
      // Notify content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'mediaFound',
            type: 'image',
            url: url
          });
        }
      });
    }
    
    // Check for video files and always use quality 1
    if (url.includes('media-video-avc1') && url.includes('.mp4') && url.includes('fansly')) {
      // Always use quality 1 for videos
      const videoUrl = url.replace(/media-video-avc1-\d+/, 'media-video-avc1-1');
      console.log("🎥 Found video - Original:", url, "Modified:", videoUrl);
      latestMedia.video = videoUrl;
      processedUrls.add(url);
      processedUrls.add(videoUrl);
      
      // Notify content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'mediaFound',
            type: 'video', 
            url: videoUrl
          });
        }
      });
    }
    
    // Check for audio files - keep original quality
    if (url.includes('media-audio-und-mp4a') && url.includes('.mp4') && url.includes('fansly')) {
      console.log("🎵 Found audio:", url);
      latestMedia.audio = url;
      processedUrls.add(url);
      
      // Notify content script
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'mediaFound',
            type: 'audio', 
            url: url
          });
        }
      });
    }
  },
  { urls: ["https://*.fansly.com/*"] }
);

// Reset processed URLs when page changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url && tab.url.includes('fansly.com')) {
    processedUrls.clear();
    latestMedia = { image: null, video: null, audio: null };
    console.log("🔄 Reset URLs for new page");
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLatestMedia') {
    sendResponse(latestMedia);
  }
  
  if (request.action === 'downloadImage') {
    if (latestMedia.image) {
      // Increment download count
      downloadCount++;
      chrome.storage.local.set({ downloadCount: downloadCount });
      
      // Show donation reminder every 20 downloads
      if (downloadCount % 20 === 0) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0] && tabs[0].url.includes('fansly.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'showDonationReminder',
              downloadCount: downloadCount
            });
          }
        });
      }
      
      chrome.downloads.download({
        url: latestMedia.image,
        filename: `fansly_image_${Date.now()}.jpg`
      });
    }
  }

  if (request.action === 'trackDownload') {
    // Increment download count for video/audio opens
    downloadCount++;
    chrome.storage.local.set({ downloadCount: downloadCount });
    
    // Show donation reminder every 20 downloads
    if (downloadCount % 20 === 0) {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url.includes('fansly.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'showDonationReminder',
            downloadCount: downloadCount
          });
        }
      });
    }
    sendResponse({ success: true });
  }

  if (request.action === 'getDownloadCount') {
    sendResponse({ downloadCount: downloadCount });
    return true;
  }
});

// Initialize download count on startup
chrome.storage.local.get(['downloadCount'], (result) => {
  downloadCount = result.downloadCount || 0;
  console.log('Loaded download count:', downloadCount);
});