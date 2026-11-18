importScripts('defaults.js');

let folderMap = defaultExtensionMap;
let categoryMap = cloneCategoryMap(defaultFolderMap);

function loadFolderMap() {
    chrome.storage.sync.get(['categoryMap', 'folderMap'], (data) => {
        if (data.categoryMap) {
            categoryMap = normalizeCategoryMap(data.categoryMap);
            folderMap = categoryMapToExtensionMap(categoryMap);
        } else if (data.folderMap) {
            folderMap = data.folderMap;
            categoryMap = cloneCategoryMap(defaultFolderMap);
            for (const category of Object.keys(categoryMap)) {
                categoryMap[category] = [];
            }
            Object.entries(folderMap).forEach(([extension, folder]) => {
                const category = folder ? folder.replace(/\/$/, '') : 'General';
                if (!categoryMap[category]) categoryMap[category] = [];
                categoryMap[category].push(extension);
            });
            chrome.storage.sync.set({ categoryMap, folderMap });
        } else {
            folderMap = defaultExtensionMap;
            categoryMap = cloneCategoryMap(defaultFolderMap);
            chrome.storage.sync.set({ categoryMap, folderMap: defaultExtensionMap });
        }
    });
}

chrome.runtime.onInstalled.addListener(loadFolderMap);
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        if (changes.categoryMap) {
            categoryMap = normalizeCategoryMap(changes.categoryMap.newValue || cloneCategoryMap(defaultFolderMap));
            folderMap = categoryMapToExtensionMap(categoryMap);
        } else if (changes.folderMap) {
            folderMap = changes.folderMap.newValue || defaultExtensionMap;
        }
    }
});
loadFolderMap();

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    try {
        const filename = downloadItem.filename.toLowerCase();
        const matchingExtension = Object.keys(folderMap)
            .sort((a, b) => b.length - a.length)
            .find(extension => filename.endsWith(`.${extension}`));

        if (matchingExtension) {
            const newFilename = folderMap[matchingExtension] + downloadItem.filename;
            suggest({filename: newFilename});
        } else {
            suggest();
        }
    } catch (error) {
        console.error('Error in redirecting download:', error);
        suggest();
    }
});

chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.error) {
        console.error('Download error:', downloadDelta.error.current);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'updateFolderMap' && request.newFolderMap) {
        // Update the folderMap with the new mappings provided in the request
        folderMap = request.newFolderMap;
        sendResponse({status: 'Folder map updated successfully'});
    }
    
});



