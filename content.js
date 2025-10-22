// Donation system - shows every 20 downloads
(function() {
    'use strict';
    
    // Check for donation reminder from background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showDonationReminder') {
            showDonationBanner(request.downloadCount);
        }
    });
    
    function showDonationBanner(downloadCount) {
        const bannerId = 'donation-banner-' + Date.now();
        const banner = document.createElement('div');
        banner.id = bannerId;
        banner.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                border-radius: 10px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 350px;
                font-family: Arial, sans-serif;
                border: 2px solid gold;
            ">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 20px; margin-right: 10px;">🚫</span>
                    <strong>Remove These Popups Forever!</strong>
                </div>
                <p style="margin: 8px 0; font-size: 14px; line-height: 1.4;">
                    You've downloaded ${downloadCount} files. <strong>Donate €1 to permanently remove all donation popups!</strong>
                </p>
                
                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; margin: 8px 0;">
                    <div style="font-size: 12px; margin: 4px 0;">⭐ No more interruptions</div>
                    <div style="font-size: 12px; margin: 4px 0;">⭐ Direct video/audio downloads (no tabs)</div>
                    <div style="font-size: 12px; margin: 4px 0;">⭐ Batch download all images</div>
                    <div style="font-size: 12px; margin: 4px 0;">⭐ Auto profile downloads</div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <a href="https://ko-fi.com/23lollo" 
                       target="_blank" 
                       style="
                           background: #29abe0;
                           color: white;
                           padding: 10px 16px;
                           border-radius: 5px;
                           text-decoration: none;
                           font-weight: bold;
                           font-size: 13px;
                           flex: 1;
                           text-align: center;
                       ">
                        🚀 Upgrade to Premium - €1
                    </a>
                    <button onclick="document.getElementById('${bannerId}').remove()" 
                            style="
                                background: rgba(255,255,255,0.2);
                                color: white;
                                border: 1px solid rgba(255,255,255,0.5);
                                padding: 10px 12px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-size: 12px;
                            ">
                        Close
                    </button>
                </div>
                <p style="margin: 10px 0 0 0; font-size: 11px; text-align: center; opacity: 0.8;">
                    FREE Version • ${downloadCount}/20 downloads • <a href="https://ko-fi.com/23lollo" target="_blank" style="color: gold; text-decoration: none;">Remove popups</a>
                </p>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (document.getElementById(bannerId)) {
                document.getElementById(bannerId).remove();
            }
        }, 30000);
    }
})();

// Simple button management
let buttons = {};
let videoAudioTimeout = null;

function createButtons() {
    // Remove existing buttons
    const existingButtons = document.querySelectorAll('.fansly-download-btn');
    existingButtons.forEach(btn => btn.remove());

    // Create image download button
    const imageBtn = document.createElement('button');
    imageBtn.className = 'fansly-download-btn';
    imageBtn.innerHTML = '⬇️ Download Image';
    imageBtn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10000;
        background: #44ff44;
        color: black;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    // Create video download button
    const videoBtn = document.createElement('button');
    videoBtn.className = 'fansly-download-btn';
    videoBtn.innerHTML = '🎥 Open Video (Quality 1)';
    videoBtn.style.cssText = `
        position: fixed;
        top: 60px;
        left: 20px;
        z-index: 10000;
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    // Create audio download button
    const audioBtn = document.createElement('button');
    audioBtn.className = 'fansly-download-btn';
    audioBtn.innerHTML = '🎵 Open Audio';
    audioBtn.style.cssText = `
        position: fixed;
        top: 100px;
        left: 20px;
        z-index: 10000;
        background: #4444ff;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    // Create combined download button
    const combinedBtn = document.createElement('button');
    combinedBtn.className = 'fansly-download-btn';
    combinedBtn.innerHTML = '📹 Open Video+Audio';
    combinedBtn.style.cssText = `
        position: fixed;
        top: 140px;
        left: 20px;
        z-index: 10000;
        background: #ff44ff;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    // Add click handlers
    imageBtn.onclick = () => {
        chrome.runtime.sendMessage({action: 'downloadImage'});
    };
    
    videoBtn.onclick = () => {
        chrome.runtime.sendMessage({action: 'getLatestMedia'}, (response) => {
            if (response && response.video) {
                window.open(response.video, '_blank');
                chrome.runtime.sendMessage({action: 'trackDownload'});
            } else {
                alert('No video URL found. Please play the video first.');
            }
        });
        hideVideoAudioButtons();
    };
    
    audioBtn.onclick = () => {
        chrome.runtime.sendMessage({action: 'getLatestMedia'}, (response) => {
            if (response && response.audio) {
                window.open(response.audio, '_blank');
                chrome.runtime.sendMessage({action: 'trackDownload'});
            } else {
                alert('No audio URL found. Please play the video first.');
            }
        });
        hideVideoAudioButtons();
    };
    
    combinedBtn.onclick = () => {
        chrome.runtime.sendMessage({action: 'getLatestMedia'}, (response) => {
            if (response && response.video && response.audio) {
                window.open(response.video, '_blank');
                setTimeout(() => {
                    window.open(response.audio, '_blank');
                    chrome.runtime.sendMessage({action: 'trackDownload'});
                }, 500);
            } else if (response && response.video) {
                window.open(response.video, '_blank');
                chrome.runtime.sendMessage({action: 'trackDownload'});
                alert('Video opened, but no separate audio track found.');
            } else {
                alert('No media URLs found. Please play the video first.');
            }
        });
        hideVideoAudioButtons();
    };
    
    // Add to page
    document.body.appendChild(imageBtn);
    document.body.appendChild(videoBtn);
    document.body.appendChild(audioBtn);
    document.body.appendChild(combinedBtn);
    
    buttons = { imageBtn, videoBtn, audioBtn, combinedBtn };
    return buttons;
}

function hideVideoAudioButtons() {
    if (buttons.videoBtn) buttons.videoBtn.style.display = 'none';
    if (buttons.audioBtn) buttons.audioBtn.style.display = 'none';
    if (buttons.combinedBtn) buttons.combinedBtn.style.display = 'none';
    
    // Clear any existing timeout
    if (videoAudioTimeout) {
        clearTimeout(videoAudioTimeout);
        videoAudioTimeout = null;
    }
}

function showVideoAudioButtons() {
    if (buttons.videoBtn) buttons.videoBtn.style.display = 'block';
    if (buttons.audioBtn) buttons.audioBtn.style.display = 'block';
    if (buttons.combinedBtn) buttons.combinedBtn.style.display = 'block';
    
    // Clear any existing timeout
    if (videoAudioTimeout) {
        clearTimeout(videoAudioTimeout);
    }
    
    // Set timeout to hide after 5 seconds
    videoAudioTimeout = setTimeout(() => {
        hideVideoAudioButtons();
    }, 5000);
}

// Initialize buttons
createButtons();

// Listen for media found messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'mediaFound') {
        if (request.type === 'image') {
            buttons.imageBtn.style.display = 'block';
        } else if (request.type === 'video') {
            showVideoAudioButtons();
        } else if (request.type === 'audio') {
            showVideoAudioButtons();
        }
    }

    if (request.action === 'trackDownload') {
        return true;
    }
});

// Simple media check - only for images
function checkForImages() {
    const images = document.querySelectorAll('img[src*="fansly"]');
    if (images.length > 0) {
        buttons.imageBtn.style.display = 'block';
    } else {
        buttons.imageBtn.style.display = 'none';
    }
}

// Video/audio detection is now handled entirely by background script
// through network requests, so we don't need to check DOM for videos

// Set up basic event listeners
document.addEventListener('click', checkForImages);
window.addEventListener('load', checkForImages);

// Initial check
setTimeout(checkForImages, 1000);

// Check current download count on startup
setTimeout(() => {
    chrome.runtime.sendMessage({action: 'getDownloadCount'}, (response) => {
        console.log('Current download count:', response.downloadCount);
    });
}, 2000);