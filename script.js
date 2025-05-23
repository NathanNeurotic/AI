document.addEventListener('DOMContentLoaded', () => {
    // Typing Effect for Header
    const header = document.querySelector('.typing-effect');
    const text = 'AI Services Dashboard';
    header.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            header.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100);
        }
    }
    type();

    // Restore Category States from localStorage
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

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll('.service-button').forEach(button => {
            const name = button.querySelector('.service-name').textContent.toLowerCase();
            const url = button.querySelector('.service-url').textContent.toLowerCase();
            button.style.display = (name.includes(query) || url.includes(query)) ? 'flex' : 'none';
        });
    });
});

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