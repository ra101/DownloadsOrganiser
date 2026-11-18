# DownloadsOrganiser

Automatically organizes downloaded files into category folders based on file type.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Description

DownloadsOrganiser is a Chrome extension that routes downloads into category subfolders based on their file extensions. Paths are resolved relative to the browser's Downloads folder, so no Windows username or absolute path is required.

## Features

- Automatically organizes downloads into category subfolders.
- Category-based options UI with one editable card per category.
- Multiple extensions per category.
- Add extensions using spaces or commas, with or without dots, such as `zip rar`, `zap, rar`, or `.tar.gz .tar`.
- An extension belongs to only one category; moving it shows where it was removed from.
- Multi-dot extensions such as `tar.gz` are supported.
- Reset all categories and extensions to the built-in defaults.
- Built-in categories include Compressed, Documents, Music, Programs, Video, Torrents, 3D Objects, and General.

## Installation

1. Clone this repository to your local machine or download the ZIP file.
2. Open your browser and navigate to the extensions management page. For example, in Google Chrome, you can go to `chrome://extensions/`.
3. Enable "Developer mode."
4. Click "Load unpacked" and select the directory where you cloned or extracted the extension files.

## Usage

1. Click on the DownloadsOrganiser icon in your browser's toolbar.
2. Open **Go to Settings Page** to manage categories.
3. Downloads are now organized beneath the browser's Downloads folder, for example `Downloads/Documents/` or `Downloads/Compressed/`.

## Configuration

Manage categories and extensions from the extension's Options page:

1. Right-click the DownloadsOrganiser icon and choose **Options**, or open it from the popup.
2. Edit a category name or use its **Add** field to add one or more extensions.
3. Remove individual extensions with the `x` control on an extension chip.
4. Add a category using the category name field and **Add Category** button.
5. Remove a category to move its extensions to General.
6. Use **Reset to Defaults** to restore the built-in category configuration.

Examples of valid extension input:
- `.tar.gz, .tar .gz 7z`

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue on GitHub or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
