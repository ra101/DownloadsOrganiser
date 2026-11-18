const defaultFolderMap = {
    'Compressed': ['zip', 'rar', 'r0', 'r1', 'arj', 'gz', 'tar', 'tar.gz', 'sit', 'sitx', 'sea', 'ace', 'bz2', '7z'],
    'Documents': ['doc', 'pdf', 'ppt', 'pps', 'docx', 'pptx', 'md'],
    'Music': ['mp3', 'wav', 'wma', 'mpa', 'ram', 'ra', 'aac', 'aif', 'm4a', 'tsa'],
    'Programs': ['exe', 'msi'],
    'Video': ['avi', 'mpg', 'mpe', 'mpeg', 'asf', 'wmv', 'mov', 'qt', 'rm', 'mp4', 'flv', 'm4v', 'webm', 'ogv', 'ogg', 'mkv', 'ts', 'tsv'],
    'Torrents': ['torrent'],
    '3D Objects': ['3dm', '3ds', '3dxml', '3mf', 'amf', 'asm', 'bim', 'brep', 'brp', 'catpart', 'catproduct', 'cgr', 'dgn', 'dlv', 'dwf', 'dwfx', 'dwg', 'dxf', 'f3d', 'f3z', 'fcstd', 'glb', 'gltf', 'iam', 'idw', 'ifc', 'iges', 'igs', 'ipt', 'jt', 'model', 'neu', 'par', 'prt', 'psm', 'rfa', 'rvt', 'sab', 'sat', 'session', 'sldasm', 'slddrw', 'sldprt', 'step', 'stp', 'stpz', 'stl', 'obj', 'off', 'ply', 'wrl', 'x_b', 'x_t', 'xas', 'xpr'],
    'General': []
};

const defaultExtensionMap = Object.fromEntries(
    Object.entries(defaultFolderMap).flatMap(([category, extensions]) =>
        extensions.map(extension => [extension, category === 'General' ? '' : `${category}/`])
    )
);

function cloneCategoryMap(categoryMap) {
    return Object.fromEntries(
        Object.entries(categoryMap).map(([category, extensions]) => [category, [...extensions]])
    );
}

function normalizeCategoryMap(categoryMap) {
    const normalized = {};
    const winners = {};

    Object.entries(categoryMap).forEach(([category, extensions]) => {
        extensions.forEach(extension => {
            const normalizedExtension = parseExtensions(extension)[0];
            if (normalizedExtension) winners[normalizedExtension] = category;
        });
    });

    Object.entries(categoryMap).forEach(([category]) => {
        normalized[category] = [];
    });
    Object.entries(winners).forEach(([extension, category]) => {
        normalized[category].push(extension);
    });

    return normalized;
}

function categoryMapToExtensionMap(categoryMap) {
    categoryMap = normalizeCategoryMap(categoryMap);
    return Object.fromEntries(
        Object.entries(categoryMap).flatMap(([category, extensions]) =>
            extensions.map(extension => [extension, category === 'General' ? '' : `${category}/`])
        )
    );
}

function isValidFolderName(name) {
    return /^[\w .-]+$/.test(name)
        && !/^\.+$/.test(name)
        && !/[. ]$/.test(name)
        && !/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(name);
}

function parseExtensions(input) {
    const extensions = String(input)
        .split(/[\s,;]+/)
        .map(extension => extension.trim().toLowerCase().replace(/^\.+/, ''))
        .filter(extension => /^[a-z0-9_*+-]+(?:\.[a-z0-9_*+-]+)*$/.test(extension));

    return [...new Set(extensions)];
}
