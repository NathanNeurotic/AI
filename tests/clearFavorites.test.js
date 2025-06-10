const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('clearFavorites button', () => {
  let window, document, dom;

  beforeEach(async () => {
    const html = '<main></main>';
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;

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

  test('clearing favorites removes section and resets star', () => {
    let favSection = document.getElementById('favorites');
    const star = document.querySelector('.favorite-star');
    const btn = document.getElementById('clearFavoritesBtn');

    expect(btn).not.toBeNull();
    expect(favSection).not.toBeNull();
    expect(star.textContent).toBe('★');

    btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(window.localStorage.getItem('favorites')).toBe(null);
    favSection = document.getElementById('favorites');
    expect(favSection).toBeNull();
    expect(star.textContent).toBe('☆');
  });
});
