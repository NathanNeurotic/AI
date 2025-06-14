const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('loadServices error handling', () => {
  let window, document, dom;

  beforeEach(() => {
    const html = '<main></main>';
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    window.fetch = jest.fn(); // Mock fetch before script execution
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    dom.window.close();
  });

  test('displays error message when fetch rejects', async () => {
    window.fetch = jest.fn(() => Promise.reject(new Error('Network failed')));

    await window.loadServices();

    const main = document.querySelector('main');
    expect(main.textContent).toContain('Error loading essential service data: Network failed. Please check network or file access.');
  });

  test('displays error message when response is not ok', async () => {
    window.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }));

    await window.loadServices();

    const main = document.querySelector('main');
    expect(main.textContent).toContain('Error loading essential service data: HTTP error! status: 500 while fetching services.json. Please check network or file access.');
  });
});
