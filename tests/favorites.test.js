const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('favorites management', () => {
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
  });

  afterEach(() => {
    dom.window.close();
  });

  test('initially shows empty favorites section', () => {
    const favSection = document.getElementById('favorites');
    expect(favSection).not.toBeNull();
    const msg = favSection.querySelector('#noFavoritesMsg');
    expect(msg).not.toBeNull();
    const clearBtn = document.getElementById('clearFavoritesBtn');
    expect(clearBtn.disabled).toBe(true);
    expect(favSection.querySelectorAll('.service-button').length).toBe(0);
  });

  test('adding and removing favorites updates storage and UI', () => {
    const star = document.querySelector('.favorite-star');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(window.localStorage.getItem('favorites')).toBe(JSON.stringify(['http://alpha.com']));
    let favSection = document.querySelector('#favorites');
    expect(favSection).not.toBeNull();
    expect(favSection.querySelectorAll('.service-button').length).toBe(1);
    expect(star.textContent).toBe('★');

    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(window.localStorage.getItem('favorites')).toBe(JSON.stringify([]));
    favSection = document.querySelector('#favorites');
    expect(favSection).not.toBeNull();
    expect(favSection.querySelectorAll('.service-button').length).toBe(0);
    const msg = favSection.querySelector('#noFavoritesMsg');
    expect(msg).not.toBeNull();
    const clearBtn = document.getElementById('clearFavoritesBtn');
    expect(clearBtn.disabled).toBe(true);
  });

  test('toggling favorites via keyboard events', () => {
    const star = document.querySelector('.favorite-star');

    star.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(window.localStorage.getItem('favorites')).toBe(JSON.stringify(['http://alpha.com']));
    let favSection = document.querySelector('#favorites');
    expect(favSection).not.toBeNull();
    expect(star.textContent).toBe('★');

    star.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(window.localStorage.getItem('favorites')).toBe(JSON.stringify([]));
    favSection = document.querySelector('#favorites');
    expect(favSection).not.toBeNull();
    const msg = favSection.querySelector('#noFavoritesMsg');
    expect(msg).not.toBeNull();
    expect(star.textContent).toBe('☆');
  });
});
