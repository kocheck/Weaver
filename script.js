// Fetch the latest release from GitHub
async function fetchLatestRelease() {
    const repoOwner = 'kocheck';
    const repoName = 'Weaver';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorMessage = `Failed to fetch release data: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.message) {
                    errorMessage += ` - ${errorBody.message}`;
                }
            } catch (parseError) {
                // Ignore JSON parse errors and use the basic status message
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const version = data.tag_name || data.name;

        // Validate that assets array exists
        if (!Array.isArray(data.assets)) {
            throw new Error('Release assets are missing or not in the expected format');
        }

        // Find the plugin asset (typically distributed as a .sketchplugin.zip or .zip file)
        const assets = data.assets;
        let asset = assets.find(item => item.name.endsWith('.sketchplugin.zip') || item.name.endsWith('.sketchplugin'));

        // Fallback: look for any .zip asset if no specific .sketchplugin archive was found
        if (!asset) {
            asset = assets.find(item => item.name.endsWith('.zip'));
        }

        if (!asset) {
            throw new Error('No suitable plugin asset found in latest release');
        }

        const downloadUrl = asset.browser_download_url;
        const fileName = asset.name.replace(/\.zip$/i, '');

        // Update both download buttons
        updateDownloadButton('download-btn', downloadUrl, fileName, version);
        updateDownloadButton('download-btn-2', downloadUrl, fileName, version);

        // Update version info
        const versionInfo = document.getElementById('version-info');
        if (versionInfo) {
            versionInfo.textContent = `Latest version: ${version}`;
        }

    } catch (error) {
        console.error('Error fetching release:', error);

        // Provide helpful error message for rate limiting
        const isRateLimited = error.message && error.message.includes('403');
        const fallbackUrl = `https://github.com/${repoOwner}/${repoName}/releases/latest`;
        
        if (isRateLimited) {
            console.warn('GitHub API rate limit may have been exceeded. Falling back to releases page.');
        }
        
        // Fallback: Enable buttons with link to releases page
        updateDownloadButton('download-btn', fallbackUrl, 'Download Latest Release', null, true);
        updateDownloadButton('download-btn-2', fallbackUrl, 'Download Latest Release', null, true);
    }
}

function updateDownloadButton(buttonId, url, fileName, version, isFallback = false) {
    let element = document.getElementById(buttonId);
    if (!element) return;

    // If the element is a <button>, replace it with an <a> to use proper link semantics.
    if (element.tagName && element.tagName.toLowerCase() === 'button') {
        const link = document.createElement('a');
        link.id = element.id;
        link.className = element.className;
        link.innerHTML = element.innerHTML;
        element.replaceWith(link);
        element = link;
    }

    // Configure the element as a link that opens in a new tab/window.
    element.setAttribute('href', url);
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');

    // Ensure the element is not disabled (in case initial markup had a disabled button).
    element.removeAttribute('disabled');

    const textSpan = element.querySelector('.cta-button__text') || element;

    if (isFallback) {
        textSpan.textContent = 'Download Latest Release';
    } else {
        textSpan.textContent = `Download ${fileName}`;
    }
}

// Fetch on page load
fetchLatestRelease();
