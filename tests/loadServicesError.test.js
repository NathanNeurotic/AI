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

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    dom.window.close();
  });

  test('displays error message when fetch rejects', async () => {
    window.fetch = jest.fn(() => Promise.reject(new Error('Network failed')));

    await window.loadServices();

    const main = document.querySelector('main');
    expect(main.textContent).toContain('Failed to load services');
  });

  test('displays error message when response is not ok', async () => {
    window.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }));

    await window.loadServices();

    const main = document.querySelector('main');
    expect(main.textContent).toContain('Failed to load services');
  });
});
