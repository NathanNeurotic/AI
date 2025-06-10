const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('favorites category view toggle', () => {
  let window, document, dom;

  beforeEach(async () => {
    const html = '<main></main>';
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    const sampleServices = [
      { name: 'Alpha', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Test' }
    ];

    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(sampleServices) }));

    await window.loadServices();

    const star = document.querySelector('.favorite-star');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  });

  afterEach(() => {
    dom.window.close();
  });

  test('toggleCategoryView toggles list view for favorites', () => {
    const favSection = document.getElementById('favorites');
    const toggle = favSection.querySelector('.category-view-toggle');

    expect(toggle).not.toBeNull();
    expect(favSection.classList.contains('list-view')).toBe(false);
    expect(window.localStorage.getItem('view-favorites')).toBe(null);

    window.toggleCategoryView('favorites');

    expect(favSection.classList.contains('list-view')).toBe(true);
    expect(window.localStorage.getItem('view-favorites')).toBe('list');
    expect(toggle.classList.contains('active')).toBe(true);

    window.toggleCategoryView('favorites');

    expect(favSection.classList.contains('list-view')).toBe(false);
    expect(window.localStorage.getItem('view-favorites')).toBe('grid');
    expect(toggle.classList.contains('active')).toBe(false);
  });
});
