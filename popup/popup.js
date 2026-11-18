document.addEventListener('DOMContentLoaded', function() {
    const addMappingForm = document.getElementById('addMappingForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    addMappingForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const extensions = parseExtensions(document.getElementById('newExtension').value);
        const newFolder = document.getElementById('newFolder').value.trim().replace(/\/+$/, '');

        // Reset the error message
        errorMessage.textContent = '';

        // Validate the input
        if (!extensions.length || !newFolder) {
            errorMessage.textContent = 'Please enter valid extensions and a folder.';
            return;
        }
        if (!isValidFolderName(newFolder)) {
            errorMessage.textContent = 'Folder names may only use letters, numbers, spaces, dots, dashes and underscores.';
            return;
        }

        // Save the new mapping
        chrome.storage.sync.get('folderMap', function(data) {
            data.folderMap = data.folderMap ? { ...data.folderMap } : { ...defaultExtensionMap };
            const moves = [];
            extensions.forEach(extension => {
                const previousFolder = data.folderMap[extension];
                if (previousFolder && previousFolder !== newFolder) {
                    const previousCategory = previousFolder.replace(/\/$/, '') || 'General';
                    moves.push(`.${extension} moved from ${previousCategory} to ${newFolder.replace(/\/$/, '') || 'General'}`);
                }
                data.folderMap[extension] = `${newFolder}/`;
            });
            let categoryMap = {};
            Object.entries(data.folderMap).forEach(([extension, folder]) => {
                const category = folder ? folder.replace(/\/$/, '') : 'General';
                if (!categoryMap[category]) categoryMap[category] = [];
                categoryMap[category].push(extension);
            });
            categoryMap = normalizeCategoryMap(categoryMap);
            chrome.storage.sync.set({ categoryMap, folderMap: data.folderMap }, function() {
                // Clear the form
                addMappingForm.reset();
                showSuccessMessage(moves);
            });
        });
    });

    function showSuccessMessage(moves) {
        successMessage.textContent = moves && moves.length
            ? moves.join('. ')
            : 'Mapping added successfully!';
        successMessage.style.display = 'block';
        setTimeout(() => { successMessage.style.display = 'none'; }, 3000);
    }
});
