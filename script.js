const DEBUG = false; // Set to true to enable console debug logs
let allServices = [];
let deferredPrompt = null;
let sidebarObserver = null;

// Function to update install button visibility
function updateInstallButtonVisibility() {
    const installBtn = document.getElementById('installBtn');
    if (!installBtn) {
        console.warn('Install App button (installBtn) not found in the DOM during updateInstallButtonVisibility. Cannot update visibility.');
        return;
    }

    if (DEBUG) {
        console.log(`[InstallButton] updateInstallButtonVisibility called. deferredPrompt is ${deferredPrompt ? 'AVAILABLE' : 'NULL'}.`);
    }

    if (deferredPrompt) {
        installBtn.classList.add('install-btn-visible');
        installBtn.classList.remove('install-btn-hidden');
        if (DEBUG) {
            console.log('[InstallButton] Set to VISIBLE.');
        }
    } else {
        installBtn.classList.add('install-btn-hidden');
        installBtn.classList.remove('install-btn-visible');
        if (DEBUG) {
            console.log('[InstallButton] Set to HIDDEN.');
        }
    }
}

const MAX_CATEGORY_HEIGHT =
    parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
            '--category-max-height'
        )
    ) || 400; // px - limit for open category height

const STAR_FILLED_PATH = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.7881 3.21068C11.2364 2.13274 12.7635 2.13273 13.2118 3.21068L15.2938 8.2164L20.6979 8.64964C21.8616 8.74293 22.3335 10.1952 21.4469 10.9547L17.3295 14.4817L18.5874 19.7551C18.8583 20.8908 17.6229 21.7883 16.6266 21.1798L11.9999 18.3538L7.37329 21.1798C6.37697 21.7883 5.14158 20.8908 5.41246 19.7551L6.67038 14.4817L2.55303 10.9547C1.66639 10.1952 2.13826 8.74293 3.302 8.64964L8.70609 8.2164L10.7881 3.21068Z"/></svg>';
const STAR_OUTLINE_PATH = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4806 3.4987C11.6728 3.03673 12.3272 3.03673 12.5193 3.4987L14.6453 8.61016C14.7263 8.80492 14.9095 8.93799 15.1197 8.95485L20.638 9.39724C21.1367 9.43722 21.339 10.0596 20.959 10.3851L16.7546 13.9866C16.5945 14.1238 16.5245 14.3391 16.5734 14.5443L17.8579 19.9292C17.974 20.4159 17.4446 20.8005 17.0176 20.5397L12.2932 17.6541C12.1132 17.5441 11.8868 17.5441 11.7068 17.6541L6.98238 20.5397C6.55539 20.8005 6.02594 20.4159 6.14203 19.9292L7.42652 14.5443C7.47546 14.3391 7.4055 14.1238 7.24531 13.9866L3.04099 10.3851C2.661 10.0596 2.86323 9.43722 3.36197 9.39724L8.88022 8.95485C9.09048 8.93799 9.27363 8.80492 9.35464 8.61016L11.4806 3.4987Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON_SVG = '<svg class="chevron" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L3.96967 8.78033C3.67678 8.48744 3.67678 8.01256 3.96967 7.71967C4.26256 7.42678 4.73744 7.42678 5.03033 7.71967L12 14.6893L18.9697 7.71967C19.2626 7.42678 19.7374 7.42678 20.0303 7.71967C20.3232 8.01256 20.3232 8.48744 20.0303 8.78033L12.5303 16.2803Z"/></svg>';

// Register PWA install events immediately so we don't miss them
window.addEventListener('beforeinstallprompt', (e) => {
    if (DEBUG) {
        console.log('[InstallButton] beforeinstallprompt event FIRED. deferredPrompt stashed.');
    }
    e.preventDefault(); // Prevent automatic prompt
    deferredPrompt = e; // Stash for later use
    updateInstallButtonVisibility();
});

window.addEventListener('appinstalled', () => {
    if (DEBUG) {
        console.log('[InstallButton] appinstalled event FIRED.');
    }
    deferredPrompt = null; // Clear the deferred prompt
    updateInstallButtonVisibility();
});

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    applySavedView();
    applySavedMobileView();
    updateToggleButtons();

    buildSidebar();
    setupSidebarHighlighting();

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    const installBtn = document.getElementById('installBtn');

    if (installBtn) {
        if (DEBUG) {
            console.log('Install App button found in DOM.');
        }
        // Initial state set by updateInstallButtonVisibility
        updateInstallButtonVisibility();

        installBtn.addEventListener('click', async () => {
            if (DEBUG) {
                console.log('[InstallButton] installBtn CLICKED.');
            }
            if (!deferredPrompt) {
                if (DEBUG) {
                    console.log('[InstallButton] Deferred prompt not available, cannot show install dialog.');
                }
                return;
            }
            if (DEBUG) {
                console.log('[InstallButton] Showing install prompt (before deferredPrompt.prompt())...');
            }
            deferredPrompt.prompt();
            if (DEBUG) {
                console.log('[InstallButton] Showing install prompt (after deferredPrompt.prompt())...');
            }
            try {
                const { outcome } = await deferredPrompt.userChoice;
                if (DEBUG) {
                    console.log(`[InstallButton] User choice for installation: ${outcome}`);
                }
                if (outcome === 'accepted') {
                    if (DEBUG) {
                        console.log('[InstallButton] User accepted the A2HS prompt');
                    }
                } else {
                    if (DEBUG) {
                        console.log('[InstallButton] User dismissed the A2HS prompt');
                    }
                }
            } catch (error) {
                console.error('[InstallButton] Error during install prompt:', error);
            }
            deferredPrompt = null; // Consume the prompt
            updateInstallButtonVisibility(); // Update button state
            if (DEBUG) {
                console.log('[InstallButton] Install App button state updated after prompt interaction.');
            }
        });
    } else {
        console.warn('Install App button (installBtn) not found in the DOM.');
    }

    // Typing Effect for Header
    const headerTextElement = document.querySelector('.typing-effect');
    const textToType = 'AI Services Dashboard';

    if (headerTextElement) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            headerTextElement.textContent = textToType;
        } else {
            headerTextElement.textContent = '';
            let charIndex = 0;
            const typeEffect = () => {
                if (charIndex < textToType.length) {
                    headerTextElement.textContent += textToType.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeEffect, 100);
                }
            };
            typeEffect();
        }
    }

    // Load services and set up functionalities only if a <main> element exists
    if (document.querySelector('main')) {
        loadServices();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').then(reg => {
            function notify(worker) {
                const bar = document.getElementById('updateNotification');
                if (!bar) return;
                bar.hidden = false;
                const refresh = document.getElementById('refreshBtn');
                if (refresh) {
                    refresh.onclick = () => {
                        worker.postMessage({ type: 'SKIP_WAITING' });
                    };
                }
            }

            if (reg.waiting) {
                notify(reg.waiting);
            }

            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && reg.waiting) {
                            notify(reg.waiting);
                        }
                    });
                }
            });

            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        });
    }
});

async function loadServices() {
    const mainContainer = document.querySelector('main'); // Define and check mainContainer once at the top
    if (!mainContainer) {
        console.error('Fatal Error: <main> element not found in the DOM.');
        document.body.innerHTML = '<p class="error-message">Fatal Error: Application structure missing. Cannot load services.</p>';
        const style = document.createElement('style');
        style.textContent = '.error-message { color: red; font-size: 1.2em; text-align: center; padding: 20px; }';
        document.head.appendChild(style);
        return;
    }

    try {
        let services;
        try {
            const response = await fetch('./services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching services.json`);
            }
            services = await response.json();
            if (!services || (Array.isArray(services) && services.length === 0)) {
                 console.warn('services.json is empty or not a valid array.');
                 throw new Error('services.json is empty or invalid.');
            }
        } catch (fetchError) {
            console.error('Fetch or JSON parse error for services.json:', fetchError);
            mainContainer.innerHTML = `<p class="error-message">Error loading essential service data: ${fetchError.message}. Please check network or file access.</p>`;
            return;
        }

        allServices = services;
        const totalEl = document.getElementById('totalServices');
        if (totalEl) {
            totalEl.textContent = `${services.length} services`;
        }
        // mainContainer is already defined above

        // Clear existing static categories if any (optional, if HTML is pre-populated)
        const existingCategories = mainContainer.querySelectorAll('.category');
        existingCategories.forEach(cat => cat.remove());

        // Group services by category. Support `category` as a string or
        // `categories` as an array. When an array is provided, add the service
        // to each category listed.
        const categories = services.reduce((acc, service) => {
            let cats = service.categories || service.category;
            if (!cats) { // If no categories are defined for the service, skip it.
                console.warn(`Service "${service.name}" has no categories defined. Skipping.`);
                return acc;
            }
            if (!Array.isArray(cats)) {
                cats = [cats]; // Convert to array if it's a single string
            }

            const uniqueCategories = [...new Set(cats)]; // Ensure unique category names from the service's own list

            uniqueCategories.forEach(cat => {
                if (typeof cat !== 'string' || cat.trim() === '') {
                    console.warn(`Service "${service.name}" has an invalid category: "${cat}". Skipping this category entry.`);
                    return; // Skip invalid category names
                }

                const trimmedCat = cat.trim(); // Use trimmed category name for consistency

                if (!acc[trimmedCat]) {
                    acc[trimmedCat] = [];
                }

                // Check if this service (by URL) is already in this specific category's list
                if (!acc[trimmedCat].some(existingService => existingService.url === service.url)) {
                    acc[trimmedCat].push(service);
                } else {
                    // Optional: Log if a duplicate was prevented for the same category
                    // console.log(`Prevented duplicate: Service "${service.name}" (${service.url}) already in category "${trimmedCat}".`);
                }
            });
            return acc;
        }, {});

        // Generate HTML for categories and services in alphabetical order
        const normalize = (name) =>
            name
                .replace(/[\p{Emoji_Presentation}\p{Emoji}]/gu, '')
                .replace(/[^\p{L}\p{N}]+/gu, ' ')
                .trim()
                .toLowerCase();
        const sortedCategoryNames = Object.keys(categories).sort((a, b) => normalize(a).localeCompare(normalize(b)));
        for (const categoryName of sortedCategoryNames) {
            const servicesInCategory = categories[categoryName];
            servicesInCategory.sort((a, b) => a.name.localeCompare(b.name));
            const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const categorySection = document.createElement('section');
            categorySection.className = 'category';
            categorySection.id = categoryId;

            const categoryHeader = document.createElement('h2');
            categoryHeader.setAttribute('aria-expanded', 'false');
            categoryHeader.onclick = () => toggleCategory(categoryHeader); // Use arrow function to ensure 'this' context or pass element directly
            categoryHeader.tabIndex = 0;
            categoryHeader.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategory(categoryHeader);
                }
            });

            // Extract emoji and text for category title
            const emojiMatch = categoryName.match(/^(\p{Emoji_Presentation}|\p{Emoji})\s*/u);
            let emojiSpan = '';
            let textContent = categoryName;

            if (emojiMatch) {
                emojiSpan = `<span class="category-emoji">${emojiMatch[0].trim()}</span> `;
                textContent = categoryName.substring(emojiMatch[0].length).trim();
            }

            const count = servicesInCategory.length;
            categoryHeader.innerHTML = `${emojiSpan}<span class="category-title">${textContent}<span class="service-count">(${count})</span></span> ${CHEVRON_SVG}<span class="category-view-toggle" role="button" tabindex="0" aria-label="Grid view active" title="Grid view active">☰</span>`;
            const viewToggle = categoryHeader.querySelector('.category-view-toggle');
            viewToggle.title = 'Grid view active';
            viewToggle.setAttribute('aria-label', 'Grid view active');
            viewToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCategoryView(categoryId);
            });
            viewToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCategoryView(categoryId);
                }
            });


            const categoryContent = document.createElement('div');
            categoryContent.className = 'category-content';

            servicesInCategory.forEach(service => {
                const serviceButton = createServiceButton(
                    service,
                    new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
                    categoryName
                );
                categoryContent.appendChild(serviceButton);
            });

            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(categoryContent);
            mainContainer.appendChild(categorySection);
        }

        renderFavoritesCategory();

        // Restore Category States from localStorage after dynamic loading
        document.querySelectorAll('.category').forEach(category => {
            const id = category.id;
            const header = category.querySelector('h2');
            const content = category.querySelector('.category-content');
            const chevron = header.querySelector('.chevron');
            const isOpen = localStorage.getItem(`category-${id}`) === 'open';
            if (isOpen) {
                content.classList.add('open');
                const height = Math.min(content.scrollHeight, MAX_CATEGORY_HEIGHT);
                content.style.maxHeight = height + 'px';
                chevron.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
            }

            const view = localStorage.getItem(`view-${id}`);
            const toggle = header.querySelector('.category-view-toggle');
            if (view === 'list') {
                category.classList.add('list-view');
                if (toggle) {
                    toggle.classList.add('active');
                    toggle.title = 'List view active';
                    toggle.setAttribute('aria-label', 'List view active');
                }
            } else if (toggle) {
                toggle.title = 'Grid view active';
                toggle.setAttribute('aria-label', 'Grid view active');
            }
        });

        buildSidebar();
        setupSidebarHighlighting();

        // Re-initialize search functionality
        setupSearch();
        populateTagDropdown();

    } catch (error) { // This is the main outer catch

        console.error('Failed to load services:', error);
        // mainContainer is already defined and checked at the function start
        const errorMessage = '<p class="error-message">Failed to load services. Critical error during initialization. Please try again later.</p>';
        mainContainer.innerHTML = errorMessage;
    }
}


function fuzzyScore(text, pattern) {
    if (!pattern) return 0;
    text = text.toLowerCase();
    pattern = pattern.toLowerCase();
    let score = 0;
    let ti = 0;
    for (let pi = 0; pi < pattern.length; pi++) {
        const ch = pattern[pi];
        const idx = text.indexOf(ch, ti);
        if (idx === -1) return -1;
        score += (idx === ti) ? 2 : 1;
        ti = idx + 1;
    }
    return score;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return; // Guard clause if search input is not found

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const tokens = query.split(',').map(t => t.trim()).filter(Boolean);

        document.querySelectorAll('.service-button').forEach(button => {
            if (query === '') {
                button.style.display = 'flex';
                button.dataset.score = 0;
                return;
            }

            const name = button.querySelector('.service-name').textContent.toLowerCase();
            const url = button.querySelector('.service-url').textContent.toLowerCase();
            const tagsSpan = button.querySelector('.service-tags');

            let score = 0;
            let matched = false;
            let tagsMatch = false;
            if (tagsSpan && tagsSpan.textContent) {
                const tagsArray = tagsSpan.textContent.toLowerCase().split(',').map(tag => tag.trim());
                if (tokens.length > 0) {
                    tagsMatch = tokens.every(token => tagsArray.some(tag => fuzzyScore(tag, token) > 0));
                    if (tagsMatch) {
                        score += tokens.reduce((acc, token) => {
                            return acc + Math.max(0, Math.max(...tagsArray.map(tag => fuzzyScore(tag, token))));
                        }, 0);
                    }
                } else {
                    const tagScore = Math.max(...tagsArray.map(tag => fuzzyScore(tag, query)));
                    if (tagScore > 0) {
                        tagsMatch = true;
                        score += tagScore;
                    }
                }
            }

            const nameScore = fuzzyScore(name, query);
            const urlScore = fuzzyScore(url, query);
            if (nameScore > 0) {
                matched = true;
                score += nameScore;
            }
            if (urlScore > 0) {
                matched = true;
                score += urlScore;
            }
            if (tagsMatch) matched = true;

            if (matched) {
                button.style.display = 'flex';
                button.dataset.score = score;
            } else {
                button.style.display = 'none';
                button.dataset.score = -1;
            }
        });

        const visibleButtons = Array.from(document.querySelectorAll('.service-button'))
            .filter(btn => btn.style.display !== 'none').length;
        const noResultsEl = document.getElementById('noResults');
        if (noResultsEl) {
            if (query !== '' && visibleButtons === 0) {
                noResultsEl.hidden = false;
            } else {
                noResultsEl.hidden = true;
            }
        }

        // Optional: Hide categories if all services within them are hidden
        document.querySelectorAll('.category').forEach(category => {
            const services = category.querySelectorAll('.service-button');
            const allHidden = Array.from(services).every(service => service.style.display === 'none');
            const categoryHeader = category.querySelector('h2');

            if (category.id === 'favorites') {
                category.style.display = ''; // Always show favorites category
                if (categoryHeader) categoryHeader.style.display = '';
            } else
            if (query === '') { // If search query is empty, show all categories normally
                category.style.display = '';
                if (categoryHeader) categoryHeader.style.display = '';
            } else {
                if (allHidden) {
                    category.style.display = 'none'; // Hide the whole category section
                } else {
                    category.style.display = ''; // Show category if some services are visible
                    if (categoryHeader) categoryHeader.style.display = '';
                }
            }
        });

        if (query !== '') {
            document.querySelectorAll('.category').forEach(category => {
                const container = category.querySelector('.category-content');
                const buttons = Array.from(container.querySelectorAll('.service-button'))
                    .filter(btn => btn.style.display !== 'none')
                    .sort((a, b) => parseFloat(b.dataset.score) - parseFloat(a.dataset.score));
                buttons.forEach(btn => container.appendChild(btn));
            });
        }
    });
}

function toggleCategory(header) {
    // Always target the category content element even if other elements
    // are inserted between the header and the content (e.g. clear button)
    const content = header.parentElement.querySelector('.category-content');
    const chevron = header.querySelector('.chevron');
    const isOpen = content.classList.contains('open');
    const categoryId = header.parentElement.id;

    if (isOpen) {
        content.style.maxHeight = '0px';
        content.classList.remove('open');
        chevron.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
        localStorage.setItem(`category-${categoryId}`, 'closed');
    } else {
        content.classList.add('open');
        const height = Math.min(content.scrollHeight, MAX_CATEGORY_HEIGHT);
        content.style.maxHeight = height + 'px';
        chevron.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
        localStorage.setItem(`category-${categoryId}`, 'open');
    }
}

function expandAllCategories() {
    document.querySelectorAll('.category h2').forEach(header => {
        const content = header.parentElement.querySelector('.category-content');
        if (content && !content.classList.contains('open')) {
            toggleCategory(header);
        }
    });
}

function collapseAllCategories() {
    document.querySelectorAll('.category h2').forEach(header => {
        const content = header.parentElement.querySelector('.category-content');
        if (content && content.classList.contains('open')) {
            toggleCategory(header);
        }
    });
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.hidden = true;
    }
}

function createServiceButton(service, favoritesSet, categoryName) {
    const serviceButton = document.createElement('a');
    serviceButton.className = 'service-button';
    serviceButton.href = service.url;
    serviceButton.target = '_blank';
    serviceButton.rel = 'noopener noreferrer';
    serviceButton.dataset.url = service.url;

    let thumbnail;
    if (service.thumbnail_url) {
        thumbnail = document.createElement('img');
        thumbnail.className = 'service-thumbnail';
        thumbnail.alt = `${service.name} thumbnail`;
        thumbnail.src = service.thumbnail_url;
        thumbnail.onerror = () => { thumbnail.style.display = 'none'; };
    }

    const serviceNameSpan = document.createElement('span');
    serviceNameSpan.className = 'service-name';

    const favicon = document.createElement('img');
    favicon.alt = `${service.name} favicon`;
    favicon.className = 'service-favicon';
    favicon.src = service.favicon_url || './public/favicon.ico';
    favicon.onerror = () => { favicon.src = './public/favicon.ico'; };

    serviceNameSpan.appendChild(favicon);
    serviceNameSpan.appendChild(document.createTextNode(service.name));

    const serviceUrlSpan = document.createElement('span');
    serviceUrlSpan.className = 'service-url';
    serviceUrlSpan.textContent = service.url;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-link';
    copyBtn.textContent = '📋';
    copyBtn.setAttribute('aria-label', `Copy ${service.name} URL`);
    copyBtn.title = `Copy ${service.name} URL`;
    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const original = copyBtn.textContent;
        const showMessage = (msg) => {
            copyBtn.textContent = msg;
            setTimeout(() => {
                copyBtn.textContent = original;
            }, 1000);
        };

        const fallbackCopy = () => {
            const textarea = document.createElement('textarea');
            textarea.value = service.url;
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                if (success) {
                    showMessage('Copied!');
                } else {
                    showMessage('Copy failed');
                }
            } catch (err) {
                document.body.removeChild(textarea);
                showMessage('Copy failed');
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(service.url)
                .then(() => {
                    showMessage('Copied!');
                })
                .catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    });
    serviceUrlSpan.appendChild(copyBtn);

    const serviceTagsSpan = document.createElement('span');
    serviceTagsSpan.className = 'service-tags';
    serviceTagsSpan.style.display = 'none';

    let tags = [];
    if (service.tags && Array.isArray(service.tags)) {
        tags = service.tags.slice();
    }

    if (categoryName) {
        const catText = categoryName.replace(/^(\p{Emoji_Presentation}|\p{Emoji})\s*/u, '').trim();
        if (!tags.includes(catText)) {
            tags.push(catText);
        }
    }
    serviceTagsSpan.textContent = tags.join(',');

    const star = document.createElement('span');
    star.classList.add('favorite-star');
    star.innerHTML = favoritesSet.has(service.url) ? STAR_FILLED_PATH : STAR_OUTLINE_PATH;
    star.tabIndex = 0;
    star.setAttribute('role', 'button');
    if (favoritesSet.has(service.url)) {
        star.classList.add('favorited');
        star.setAttribute('aria-label', 'Remove from favorites');
    } else {
        star.setAttribute('aria-label', 'Add to favorites');
    }
    star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(service.url);
        }
    });
    star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(service.url);
    });

    if (thumbnail) {
        serviceButton.appendChild(thumbnail);
    }
    serviceButton.appendChild(serviceNameSpan);
    serviceButton.appendChild(serviceUrlSpan);
    serviceButton.appendChild(serviceTagsSpan);
    serviceButton.appendChild(star);

    return serviceButton;
}

function toggleFavorite(url) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(url)) {
        favorites = favorites.filter(u => u !== url);
    } else {
        favorites.push(url);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateStars();
}

function setStarState(star, filled) {
    star.innerHTML = filled ? STAR_FILLED_PATH : STAR_OUTLINE_PATH;
    star.classList.toggle('favorited', filled);
    star.setAttribute('aria-label', filled ? 'Remove from favorites' : 'Add to favorites');
    star.title = filled ? 'Remove from favorites' : 'Add to favorites';
}

function updateStars() {
    const favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
    document.querySelectorAll('.service-button').forEach(btn => {
        const url = btn.dataset.url;
        const star = btn.querySelector('.favorite-star');
        if (!star) return;
        setStarState(star, favorites.has(url));
    });
    renderFavoritesCategory();
}

function clearFavorites() {
    localStorage.removeItem('favorites');
    localStorage.removeItem('category-favorites');
    localStorage.removeItem('view-favorites');
    updateStars();
}

window.clearFavorites = clearFavorites;

function ensureClearFavoritesButton(header) {
    let btn = header.querySelector('#clearFavoritesBtn');
    if (!btn) {
        btn = document.createElement('button');
        btn.classList.add('btn-small');
        btn.id = 'clearFavoritesBtn';
        btn.textContent = 'Clear Favorites';
        btn.title = 'Clear all favorites';
        btn.type = 'button';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearFavorites();
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                clearFavorites();
            }
        });
        header.appendChild(btn);
    }
}

function renderFavoritesCategory() {
    const mainContainer = document.querySelector('main');
    let favoritesSection = document.getElementById('favorites');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoritesSet = new Set(favorites);
    const favoriteServices = [];
    const seen = new Set();
    for (const service of allServices) {
        if (favoritesSet.has(service.url) && !seen.has(service.url)) {
            favoriteServices.push(service);
            seen.add(service.url);
        }
    }

    let header;
    if (!favoritesSection) {
        favoritesSection = document.createElement('section');
        favoritesSection.className = 'category';
        favoritesSection.id = 'favorites';

        header = document.createElement('h2');
        header.innerHTML =
            `<span class="category-emoji">⭐</span>
             <span class="category-title">Favorites</span>
             ${CHEVRON_SVG}
             <span class="category-view-toggle" role="button" tabindex="0" aria-label="Grid view active" title="Grid view active">☰</span>`;
        header.setAttribute('aria-expanded', 'true');
        header.onclick = () => toggleCategory(header);
        header.tabIndex = 0;
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(header);
            }
        });

        const viewToggle = header.querySelector('.category-view-toggle');
        viewToggle.title = 'Grid view active';
        viewToggle.setAttribute('aria-label', 'Grid view active');
        viewToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCategoryView('favorites');
        });
        viewToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                toggleCategoryView('favorites');
            }
        });

        const content = document.createElement('div');
        content.className = 'category-content open';

        favoritesSection.appendChild(header);
        ensureClearFavoritesButton(header);
        favoritesSection.appendChild(content);

        const searchContainer = mainContainer.querySelector('.search-container');
        if (searchContainer) {
            mainContainer.insertBefore(favoritesSection, searchContainer.nextSibling);
        } else {
            mainContainer.prepend(favoritesSection);
        }
    } else {
        header = favoritesSection.querySelector('h2');
        if (header) {
            ensureClearFavoritesButton(header);
        }
    }

    const content = favoritesSection.querySelector('.category-content');
    content.innerHTML = '';

    if (favoriteServices.length === 0) {
        const msg = document.createElement('p');
        msg.id = 'noFavoritesMsg';
        msg.textContent = 'No favorites saved.';
        content.appendChild(msg);
    } else {
        favoriteServices.forEach(service => {
            const btn = createServiceButton(service, favoritesSet);
            content.appendChild(btn);
        });
    }

    ensureClearFavoritesButton(header);
    const btn = header.querySelector('#clearFavoritesBtn');
    if (btn) {
        btn.disabled = favoriteServices.length === 0;
    }

    // Determine and apply the collapsed or expanded state for the Favorites category
    const storedState = localStorage.getItem('category-favorites');
    const chevron = header.querySelector('.chevron');
    // Note: 'content' is favoritesSection.querySelector('.category-content')
    //       'header' is favoritesSection.querySelector('h2')
    //       'favoriteServices' is an array of favorite service objects
    //       'MAX_CATEGORY_HEIGHT' is a globally available constant

    let shouldBeOpen = false;
    // Determine if the category should be open:
    // 1. If it's empty.
    // 2. If no state is stored (first time).
    // 3. If the stored state is 'open'.
    if (favoriteServices.length === 0 || storedState === null || storedState === 'open') {
        shouldBeOpen = true;
    }
    // Otherwise, it remains closed (i.e., it's not empty AND storedState is 'closed')

    if (shouldBeOpen) {
        content.classList.add('open');
        if (chevron) {
            chevron.classList.add('open');
        }
        header.setAttribute('aria-expanded', 'true');

        // Calculate and set maxHeight. This code runs after content.innerHTML is populated.
        const height = Math.min(content.scrollHeight, MAX_CATEGORY_HEIGHT);
        content.style.maxHeight = height + 'px';

        // If the section is empty and it was previously closed, or if it's the first time loading (no state stored),
        // default to open and save this state.
        if ((favoriteServices.length === 0 && storedState === 'closed') || storedState === null) {
            localStorage.setItem('category-favorites', 'open');
        }
    } else {
        // This case means: favoriteServices.length > 0 AND storedState === 'closed'
        content.classList.remove('open');
        if (chevron) {
            chevron.classList.remove('open');
        }
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0px';
    }

    const view = localStorage.getItem('view-favorites');
    if (view === 'list') {
        favoritesSection.classList.add('list-view');
        const toggle = favoritesSection.querySelector('.category-view-toggle');
        if (toggle) {
            toggle.classList.add('active');
            toggle.title = 'List view active';
            toggle.setAttribute('aria-label', 'List view active');
        }
    } else {
        favoritesSection.classList.remove('list-view');
        const toggle = favoritesSection.querySelector('.category-view-toggle');
        if (toggle) {
            toggle.classList.remove('active');
            toggle.title = 'Grid view active';
            toggle.setAttribute('aria-label', 'Grid view active');
        }
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem('theme');
    let osPrefersLight = false; // Default to not preferring light if detection fails
    if (typeof window.matchMedia === 'function') {
        osPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    } else {
        console.warn('window.matchMedia is not available. OS theme preference detection skipped.');
    }

    if (saved === 'light' || (saved === null && osPrefersLight)) {
        document.body.classList.add('light-mode');
        document.documentElement.classList.add('light-mode');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    document.documentElement.classList.toggle('light-mode', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateToggleButtons();
}

window.toggleTheme = toggleTheme;

function applySavedView() {
    const saved = localStorage.getItem('view');
    if (saved === 'block') {
        document.body.classList.add('block-view');
    }
}

function applySavedMobileView() {
    const saved = localStorage.getItem('mobileView');
    let isMobile;

    if (saved) { // If a preference is saved, use it
        isMobile = saved === 'mobile';
    } else { // No saved preference, so auto-detect
        if (navigator.userAgentData && typeof navigator.userAgentData.mobile !== 'undefined') {
            isMobile = navigator.userAgentData.mobile;
            if (DEBUG) {
                console.log('Detected view via userAgentData.mobile:', isMobile ? 'mobile' : 'desktop');
            }
        } else {
            if (typeof window.matchMedia === 'function') {
                isMobile = window.matchMedia("(max-width: 768px)").matches;
                if (DEBUG) {
                    console.log('Detected view via matchMedia (max-width: 768px):', isMobile ? 'mobile' : 'desktop');
                }
            } else {
                isMobile = false; // Default to desktop if matchMedia is not available
                console.warn('window.matchMedia is not available. Defaulting to desktop view for initial detection.');
            }
        }
        // Do NOT save this auto-detected preference to localStorage here.
    }

    document.body.classList.toggle('mobile-view', isMobile);
    document.body.classList.toggle('desktop-view', !isMobile);
    // updateToggleButtons(); // This will be called by DOMContentLoaded or if needed, can be called here too.
                           // The original call in DOMContentLoaded after applySavedMobileView should be sufficient.
}

function toggleView() {
    const isBlock = document.body.classList.toggle('block-view');
    localStorage.setItem('view', isBlock ? 'block' : 'list');
    updateToggleButtons();
    updateInstallButtonVisibility(); // Update button state
}

window.toggleView = toggleView;

function toggleDeviceView() {
    const isMobile = document.body.classList.contains('mobile-view');
    document.body.classList.toggle('mobile-view', !isMobile);
    document.body.classList.toggle('desktop-view', isMobile);
    localStorage.setItem('mobileView', !isMobile ? 'mobile' : 'desktop');
    updateToggleButtons();
    updateInstallButtonVisibility(); // Update button state
}

window.toggleDeviceView = toggleDeviceView;

function toggleCategoryView(categoryId) {
    const section = document.getElementById(categoryId);
    if (!section) return;
    const isList = section.classList.toggle('list-view');
    localStorage.setItem(`view-${categoryId}`, isList ? 'list' : 'grid');
    const toggle = section.querySelector('.category-view-toggle');
    if (toggle) {
        toggle.classList.toggle('active', isList);
        toggle.title = isList ? 'List view active' : 'Grid view active';
        toggle.setAttribute('aria-label', toggle.title);
    }
}

window.toggleCategoryView = toggleCategoryView;

function updateToggleButtons() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        const isLight = document.body.classList.contains('light-mode');
        themeBtn.classList.toggle('active', isLight);
        themeBtn.innerHTML = isLight ?
            '<svg id="themeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' :
            '<svg id="themeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        themeBtn.title = isLight ? 'Light theme active' : 'Dark theme active';
        themeBtn.setAttribute('aria-label', themeBtn.title);
    }
    const viewBtn = document.getElementById('viewToggle');
    if (viewBtn) {
        const isBlock = document.body.classList.contains('block-view');
        viewBtn.classList.toggle('active', isBlock);
        viewBtn.innerHTML = isBlock ?
            '<svg id="viewIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' :
            '<svg id="viewIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
        viewBtn.title = isBlock ? 'Grid view active' : 'List view active';
        viewBtn.setAttribute('aria-label', viewBtn.title);
    }
    const deviceBtn = document.getElementById('deviceToggle');
    if (deviceBtn) {
        const isMobile = document.body.classList.contains('mobile-view');
        deviceBtn.classList.toggle('active', isMobile);
        deviceBtn.title = isMobile ? 'Mobile view active' : 'Desktop view active';
        deviceBtn.setAttribute('aria-label', deviceBtn.title);
        deviceBtn.innerHTML = isMobile
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
    }
}

function buildSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = '';
    const sections = document.querySelectorAll('.category');
    sections.forEach(section => {
        const titleEl = section.querySelector('.category-title');
        if (!titleEl) return;
        const link = document.createElement('a');
        link.href = `#${section.id}`;
        // Include the service count in the sidebar link text
        link.textContent = titleEl.textContent.trim();
        link.addEventListener('click', () => {
            toggleSidebar();
        });
        sidebar.appendChild(link);
    });
    const repoLink = document.createElement('a');
    repoLink.href = 'https://www.github.com/NathanNeurotic/AI';
    repoLink.textContent = 'GitHub Repository';
    repoLink.target = '_blank';
    repoLink.rel = 'noopener noreferrer';
    sidebar.appendChild(repoLink);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
    document.body.classList.toggle('sidebar-open', sidebar.classList.contains('open'));
}

window.toggleSidebar = toggleSidebar;
window.buildSidebar = buildSidebar;

function setupSidebarHighlighting() {
    if (sidebarObserver) {
        sidebarObserver.disconnect();
    }
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !('IntersectionObserver' in window)) return;
    const links = sidebar.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('.category');
    if (!links.length || !sections.length) return;

    sidebarObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.intersectionRatio >= 0.5) {
                const id = entry.target.id;
                links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => sidebarObserver.observe(section));
}

function populateTagDropdown() {
    const datalist = document.getElementById('tagOptions');
    if (!datalist) return;
    const tagSet = new Set();
    for (const service of allServices) {
        if (Array.isArray(service.tags)) {
            service.tags.forEach(tag => tagSet.add(tag));
        }
    }
    datalist.innerHTML = '';
    Array.from(tagSet).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        datalist.appendChild(option);
    });
}

window.populateTagDropdown = populateTagDropdown;
window.expandAllCategories = expandAllCategories;
window.collapseAllCategories = collapseAllCategories;
window.clearSearch = clearSearch;
window.setupSidebarHighlighting = setupSidebarHighlighting;

