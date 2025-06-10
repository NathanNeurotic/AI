const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('favorites clear button persists after reload', () => {
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

    const star = document.querySelector('.favorite-star');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const stored = window.localStorage.getItem('favorites');
    dom.window.close();

    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptEl2 = document.createElement('script');
    scriptEl2.textContent = scriptContent;
    document.body.appendChild(scriptEl2);
    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(services) }));
    window.localStorage.setItem('favorites', stored);

    await window.loadServices();
  });

  afterEach(() => {
    dom.window.close();
  });

  test('clear favorites button is present on reload', () => {
    const btn = document.getElementById('clearFavoritesBtn');
    expect(btn).not.toBeNull();
  });
});
