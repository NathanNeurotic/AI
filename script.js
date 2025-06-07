document.addEventListener('DOMContentLoaded', () => {
    // Typing Effect for Header
    const headerTextElement = document.querySelector('.typing-effect');
    const textToType = 'AI Services Dashboard';
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

    // Load services and set up functionalities
    loadServices();
});

async function loadServices() {
    try {
        const response = await fetch('./services.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const services = await response.json();
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
        const sortedCategoryNames = Object.keys(categories).sort();
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
                const serviceButton = document.createElement('a');
                serviceButton.className = 'service-button';
                serviceButton.href = service.url;
                serviceButton.target = '_blank';

                const favicon = document.createElement('img');
                favicon.alt = `${service.name} favicon`;
                favicon.className = 'service-favicon';
                favicon.src = service.favicon_url || './favicon.ico'; // Fallback favicon
                favicon.onerror = () => { favicon.src = './favicon.ico'; }; // Handle broken favicons

                const serviceNameSpan = document.createElement('span');
                serviceNameSpan.className = 'service-name';
                serviceNameSpan.textContent = service.name;

                const serviceUrlSpan = document.createElement('span');
                serviceUrlSpan.className = 'service-url';
                serviceUrlSpan.textContent = service.url;

                // Add service tags if they exist in your services.json (assuming they might be added later)
                // For now, service.tags is not in services.json, so this will be hidden or empty
                const serviceTagsSpan = document.createElement('span');
                serviceTagsSpan.className = 'service-tags';
                serviceTagsSpan.style.display = 'none'; // Hidden as per original structure
                if (service.tags && Array.isArray(service.tags)) {
                     serviceTagsSpan.textContent = service.tags.join(',');
                }


                serviceButton.appendChild(favicon);
                serviceButton.appendChild(serviceNameSpan);
                serviceButton.appendChild(serviceUrlSpan);
                serviceButton.appendChild(serviceTagsSpan);
                categoryContent.appendChild(serviceButton);
            });

            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(categoryContent);
            mainContainer.appendChild(categorySection);
        }

        // Restore Category States from localStorage after dynamic loading
        document.querySelectorAll('.category').forEach(category => {
            const id = category.id;
            const header = category.querySelector('h2');
            const content = category.querySelector('.category-content');
            const chevron = header.querySelector('.chevron');
            const isOpen = localStorage.getItem(`category-${id}`) === 'open';
            if (isOpen) {
                content.classList.add('open');
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
        content.classList.remove('open');
        chevron.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
        localStorage.setItem(`category-${categoryId}`, 'closed');
    } else {
        content.classList.add('open');
        chevron.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
        localStorage.setItem(`category-${categoryId}`, 'open');
    }
}

