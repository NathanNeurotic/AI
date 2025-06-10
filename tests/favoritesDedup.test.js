const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('favorites deduplication', () => {
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
      { name: 'Alpha', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Test' },
      { name: 'Alpha Duplicate', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Other' }
    ];

    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(sampleServices) }));

    await window.loadServices();
  });

  afterEach(() => {
    dom.window.close();
  });

  test('only one favorite entry is shown when service appears multiple times', () => {
    const star = document.querySelector('.favorite-star');
    star.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const favButtons = document.querySelectorAll('#favorites .service-button');
    expect(favButtons.length).toBe(1);
  });
});
