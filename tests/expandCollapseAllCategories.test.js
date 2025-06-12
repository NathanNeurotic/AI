const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('expandAllCategories and collapseAllCategories', () => {
  let window, document, dom;

  beforeEach(() => {
    const html = `
      <section class="category" id="one">
        <h2 aria-expanded="false">One <span class="chevron">▼</span></h2>
        <div class="category-content"></div>
      </section>
      <section class="category" id="two">
        <h2 aria-expanded="false">Two <span class="chevron">▼</span></h2>
        <div class="category-content"></div>
      </section>
    `;
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    window.close();
  });

  test('expandAllCategories opens all categories', () => {
    window.expandAllCategories();
    const headers = document.querySelectorAll('.category h2');
    headers.forEach(header => {
      const content = header.parentElement.querySelector('.category-content');
      expect(content.classList.contains('open')).toBe(true);
      expect(header.getAttribute('aria-expanded')).toBe('true');
      const id = header.parentElement.id;
      expect(window.localStorage.getItem(`category-${id}`)).toBe('open');
    });
  });

  test('collapseAllCategories closes all categories', () => {
    // first open them so we can test collapse
    const headers = document.querySelectorAll('.category h2');
    headers.forEach(header => window.toggleCategory(header));

    window.collapseAllCategories();

    headers.forEach(header => {
      const content = header.parentElement.querySelector('.category-content');
      expect(content.classList.contains('open')).toBe(false);
      expect(header.getAttribute('aria-expanded')).toBe('false');
      const id = header.parentElement.id;
      expect(window.localStorage.getItem(`category-${id}`)).toBe('closed');
    });
  });
});
