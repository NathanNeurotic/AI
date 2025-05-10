// script.js - Adds interactivity for search and theme toggle

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const searchBox = document.getElementById('searchBox');
  const tools = document.querySelectorAll('.tool');

  // Restore theme preference
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Filter tools based on input
  searchBox.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    tools.forEach(tool => {
      const match = tool.textContent.toLowerCase().includes(term);
      tool.style.display = match ? '' : 'none';
    });
  });
});
