const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('favorites collapse persistence', () => {
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

    const services = [
      { name: 'Alpha', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Test' }
    ];

    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(services) }));

    await window.loadServices();
  });

  afterEach(() => {
    dom.window.close();
  });

  test('favorites section persists with message after clearing and updates on re-add', () => {
    const star = document.querySelector('.favorite-star');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const header = document.querySelector('#favorites h2');
    window.toggleCategory(header);

    expect(window.localStorage.getItem('category-favorites')).toBe('closed');

    const clearBtn = document.getElementById('clearFavoritesBtn');
    clearBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    let favSection = document.getElementById('favorites');
    let msg = favSection.querySelector('#noFavoritesMsg');
    expect(msg).not.toBeNull();
    expect(clearBtn.disabled).toBe(true);

    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    favSection = document.getElementById('favorites');
    const content = favSection.querySelector('.category-content');
    const chevron = favSection.querySelector('.chevron');
    msg = favSection.querySelector('#noFavoritesMsg');

    expect(window.localStorage.getItem('category-favorites')).toBe(null);
    expect(content.classList.contains('open')).toBe(true);
    expect(chevron.classList.contains('open')).toBe(true);
    expect(msg).toBeNull();
    expect(clearBtn.disabled).toBe(false);
  });
});
