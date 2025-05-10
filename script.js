// script.js - Theme toggle and live search support

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const searchBox = document.getElementById('searchBox');

  // Restore saved theme
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  // Toggle theme
  toggleBtn?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // Live filter for tables
  searchBox?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const allTables = document.querySelectorAll('table');
    allTables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr, tr');
      rows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        const match = row.textContent.toLowerCase().includes(query);
        row.style.display = match ? '' : 'none';
      });
    });
  });
});
