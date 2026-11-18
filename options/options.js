document.addEventListener('DOMContentLoaded', function() {
    const mappingsContainer = document.getElementById('mappingsContainer');
    const howToButton = document.getElementById('howToButton');
    const howToContent = document.getElementById('howToContent');
    const newCategoryInput = document.getElementById('newCategory');
    const addCategoryButton = document.getElementById('addCategoryButton');
    const resetDefaultsButton = document.getElementById('resetDefaultsButton');
    const errorMessage = document.getElementById('errorMessage');
    let categoryMap = {};

    function saveCategoryMap() {
        categoryMap = normalizeCategoryMap(categoryMap);
        chrome.storage.sync.set({
            categoryMap,
            folderMap: categoryMapToExtensionMap(categoryMap)
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = message ? 'block' : 'none';
    }

    function showToast(message) {
        let toast = document.getElementById('categoryToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'categoryToast';
            toast.className = 'category-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast.hideTimer);
        toast.hideTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function removeExtension(category, extension) {
        categoryMap[category] = categoryMap[category].filter(value => value !== extension);
        saveCategoryMap();
        render();
    }

    function addExtensions(category, input) {
        const extensionsToAdd = parseExtensions(input);
        if (extensionsToAdd.length === 0) {
            showError('Enter at least one valid file extension.');
            return;
        }

        if (!categoryMap[category]) categoryMap[category] = [];
        const moves = [];
        extensionsToAdd.forEach(extension => {
            for (const [otherCategory, extensions] of Object.entries(categoryMap)) {
                if (otherCategory !== category && extensions.includes(extension)) {
                    moves.push({ extension, from: otherCategory });
                    categoryMap[otherCategory] = extensions.filter(value => value !== extension);
                }
            }
            if (!categoryMap[category].includes(extension)) {
                categoryMap[category].push(extension);
            }
        });
        showError('');
        saveCategoryMap();
        if (moves.length) {
            const message = moves.map(move =>
                `.${move.extension} moved from ${move.from} to ${category}`
            ).join('. ');
            showToast(message);
        }
        render();
    }

    function renameCategory(oldName, input) {
        const newName = input.value.trim();
        if (!newName || newName === oldName) {
            input.value = oldName;
            return;
        }
        if (!isValidFolderName(newName)) {
            showError('Category names may only use letters, numbers, spaces, dots, dashes and underscores.');
            input.value = oldName;
            return;
        }
        if (categoryMap[newName]) {
            showError('A category with that name already exists.');
            input.value = oldName;
            return;
        }

        const entries = Object.entries(categoryMap);
        categoryMap = Object.fromEntries(entries.map(([name, extensions]) =>
            [name === oldName ? newName : name, extensions]
        ));
        showError('');
        saveCategoryMap();
        render();
    }

    function createCategory() {
        const name = newCategoryInput.value.trim();
        if (!name) {
            showError('Enter a category name.');
            return;
        }
        if (!isValidFolderName(name)) {
            showError('Category names may only use letters, numbers, spaces, dots, dashes and underscores.');
            return;
        }
        if (categoryMap[name]) {
            showError('A category with that name already exists.');
            return;
        }
        categoryMap[name] = [];
        newCategoryInput.value = '';
        showError('');
        saveCategoryMap();
        render();
    }

    function removeCategory(category) {
        const extensions = categoryMap[category] || [];
        delete categoryMap[category];
        if (!categoryMap.General) categoryMap.General = [];
        categoryMap.General = [...new Set([...categoryMap.General, ...extensions])];
        saveCategoryMap();
        render();
    }

    function resetToDefaults() {
        categoryMap = cloneCategoryMap(defaultFolderMap);
        saveCategoryMap();
        showError('');
        showToast('Category settings reset to defaults');
        render();
    }

    function render() {
        mappingsContainer.innerHTML = '';

        for (const [category, extensions] of Object.entries(categoryMap)) {
            const card = document.createElement('section');
            card.className = 'category-card';

            const header = document.createElement('div');
            header.className = 'category-header';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'category-name';
            nameInput.value = category;
            nameInput.title = 'Edit category name';
            nameInput.addEventListener('change', () => renameCategory(category, nameInput));

            const removeCategoryButton = document.createElement('button');
            removeCategoryButton.type = 'button';
            removeCategoryButton.className = 'remove-category';
            removeCategoryButton.textContent = 'Remove';
            removeCategoryButton.addEventListener('click', () => removeCategory(category));

            header.appendChild(nameInput);
            header.appendChild(removeCategoryButton);
            card.appendChild(header);

            const location = document.createElement('div');
            location.className = 'category-location';
            const locationLabel = document.createElement('span');
            locationLabel.textContent = 'Location';
            const locationPath = document.createElement('code');
            locationPath.textContent = category === 'General'
                ? 'Downloads/'
                : `Downloads/${category}/`;
            location.appendChild(locationLabel);
            location.appendChild(locationPath);
            card.appendChild(location);

            const extensionList = document.createElement('div');
            extensionList.className = 'extension-list';
            extensions.forEach(extension => {
                const chip = document.createElement('span');
                chip.className = 'extension-chip';
                chip.appendChild(document.createTextNode(extension));

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.textContent = '\u00d7';
                removeButton.title = `Remove ${extension}`;
                removeButton.addEventListener('click', () => removeExtension(category, extension));

                chip.appendChild(removeButton);
                extensionList.appendChild(chip);
            });
            card.appendChild(extensionList);

            const addRow = document.createElement('div');
            addRow.className = 'extension-add';
            const extensionInput = document.createElement('input');
            extensionInput.type = 'text';
            extensionInput.placeholder = 'Add extensions (e.g. zip rar, .tar.gz)';
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.textContent = 'Add';
            addButton.addEventListener('click', () => addExtensions(category, extensionInput.value));
            extensionInput.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    addExtensions(category, extensionInput.value);
                }
            });

            addRow.appendChild(extensionInput);
            addRow.appendChild(addButton);
            card.appendChild(addRow);
            mappingsContainer.appendChild(card);
        }
    }

    howToButton.addEventListener('click', function() {
        howToContent.style.display = howToContent.style.display === 'block' ? 'none' : 'block';
    });
    addCategoryButton.addEventListener('click', createCategory);
    resetDefaultsButton.addEventListener('click', resetToDefaults);
    newCategoryInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            createCategory();
        }
    });

    chrome.storage.sync.get(['categoryMap', 'folderMap'], data => {
        if (data.categoryMap) {
            categoryMap = normalizeCategoryMap(data.categoryMap);
            saveCategoryMap();
        } else if (data.folderMap) {
            categoryMap = cloneCategoryMap(defaultFolderMap);
            Object.entries(categoryMap).forEach(([category]) => {
                categoryMap[category] = [];
            });
            Object.entries(data.folderMap).forEach(([extension, folder]) => {
                const category = folder ? folder.replace(/\/$/, '') : 'General';
                if (!categoryMap[category]) categoryMap[category] = [];
                categoryMap[category].push(extension);
            });
            saveCategoryMap();
        } else {
            categoryMap = cloneCategoryMap(defaultFolderMap);
            saveCategoryMap();
        }
        render();
    });
});
