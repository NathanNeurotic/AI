let allServices = [];

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    // Typing Effect for Header
    const headerTextElement = document.querySelector('.typing-effect');
    const textToType = 'AI Services Dashboard';

    if (headerTextElement) {
        headerTextElement.textContent = '';
        let charIndex = 0;
        function typeEffect() {
            if (charIndex < textToType.length) {
                headerTextElement.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(typeEffect, 100);
            }
        }
        typeEffect();
    }

    // Load services and set up functionalities only if a <main> element exists
    if (document.querySelector('main')) {
        loadServices();
    }
});

async function loadServices() {
    try {
        const response = await fetch('./services.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const services = await response.json();
        allServices = services;
        const mainContainer = document.querySelector('main');

        // Clear existing static categories if any (optional, if HTML is pre-populated)
        const existingCategories = mainContainer.querySelectorAll('.category');
        existingCategories.forEach(cat => cat.remove());

        // Group services by category
        const categories = services.reduce((acc, service) => {
            const category = service.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {});

        // Generate HTML for categories and services in alphabetical order
        const normalize = (name) => name.replace(/^(\p{Emoji_Presentation}|\p{Emoji})\s*/u, '').trim().toLowerCase();
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

            categoryHeader.innerHTML = `${emojiSpan}${textContent} <span class="chevron">▼</span>`;


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
                content.style.maxHeight = content.scrollHeight + 'px';
                chevron.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
            }
        });

        // Re-initialize search functionality
        setupSearch();

    } catch (error) {
        console.error('Failed to load services:', error);
        const mainContainer = document.querySelector('main');
        mainContainer.innerHTML = '<p class="error-message">Failed to load services. Please try again later.</p>';
    }
}


function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return; // Guard clause if search input is not found

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.service-button').forEach(button => {
            const name = button.querySelector('.service-name').textContent.toLowerCase();
            const url = button.querySelector('.service-url').textContent.toLowerCase();
            const tagsSpan = button.querySelector('.service-tags');
            let tagsMatch = false;
            if (tagsSpan && tagsSpan.textContent) {
                const tagsArray = tagsSpan.textContent.toLowerCase().split(',').map(tag => tag.trim());
                tagsMatch = tagsArray.some(tag => tag.includes(query));
            }
            // Show button if query matches name, URL, or tags
            button.style.display = (name.includes(query) || url.includes(query) || tagsMatch) ? 'flex' : 'none';
        });

        // Optional: Hide categories if all services within them are hidden
        document.querySelectorAll('.category').forEach(category => {
            const services = category.querySelectorAll('.service-button');
            const allHidden = Array.from(services).every(service => service.style.display === 'none');
            const categoryHeader = category.querySelector('h2');
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
    });
}

function toggleCategory(header) {
    const content = header.nextElementSibling;
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
        content.style.maxHeight = content.scrollHeight + 'px';
        chevron.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
        localStorage.setItem(`category-${categoryId}`, 'open');
    }
}

function createServiceButton(service, favoritesSet, categoryName) {
    const serviceButton = document.createElement('a');
    serviceButton.className = 'service-button';
    serviceButton.href = service.url;
    serviceButton.target = '_blank';
    serviceButton.rel = 'noopener noreferrer';
    serviceButton.dataset.url = service.url;

    const favicon = document.createElement('img');
    favicon.alt = `${service.name} favicon`;
    favicon.className = 'service-favicon';
    favicon.src = service.favicon_url || './favicon.ico';
    favicon.onerror = () => { favicon.src = './favicon.ico'; };

    const serviceNameSpan = document.createElement('span');
    serviceNameSpan.className = 'service-name';
    serviceNameSpan.textContent = service.name;

    const serviceUrlSpan = document.createElement('span');
    serviceUrlSpan.className = 'service-url';
    serviceUrlSpan.textContent = service.url;

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
    star.className = 'favorite-star';
    star.tabIndex = 0;
    star.setAttribute('role', 'button');
    if (favoritesSet.has(service.url)) {
        star.textContent = '★';
        star.classList.add('favorited');
        star.setAttribute('aria-label', 'Remove from favorites');
    } else {
        star.textContent = '☆';
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

    serviceButton.appendChild(favicon);
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

function updateStars() {
    const favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
    document.querySelectorAll('.service-button').forEach(btn => {
        const url = btn.dataset.url;
        const star = btn.querySelector('.favorite-star');
        if (!star) return;
        if (favorites.has(url)) {
            star.textContent = '★';
            star.classList.add('favorited');
            star.setAttribute('aria-label', 'Remove from favorites');
        } else {
            star.textContent = '☆';
            star.classList.remove('favorited');
            star.setAttribute('aria-label', 'Add to favorites');
        }
    });
    renderFavoritesCategory();
}

function renderFavoritesCategory() {
    const mainContainer = document.querySelector('main');
    let favoritesSection = document.getElementById('favorites');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favoritesSet = new Set(favorites);
    const favoriteServices = allServices.filter(s => favoritesSet.has(s.url));

    if (favoriteServices.length === 0) {
        if (favoritesSection) {
            favoritesSection.remove();
        }
        return;
    }

    if (!favoritesSection) {
        favoritesSection = document.createElement('section');
        favoritesSection.className = 'category';
        favoritesSection.id = 'favorites';

        const header = document.createElement('h2');
        header.innerHTML = '★ Favorites <span class="chevron">▼</span>';
        header.setAttribute('aria-expanded', 'true');
        header.onclick = () => toggleCategory(header);
        header.tabIndex = 0;
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(header);
            }
        });

        const content = document.createElement('div');
        content.className = 'category-content open';
        favoritesSection.appendChild(header);
        favoritesSection.appendChild(content);

        mainContainer.prepend(favoritesSection);
    }

    const content = favoritesSection.querySelector('.category-content');
    content.innerHTML = '';
    favoriteServices.forEach(service => {
        const btn = createServiceButton(service, favoritesSet);
        content.appendChild(btn);
    });
}

function applySavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

window.toggleTheme = toggleTheme;

