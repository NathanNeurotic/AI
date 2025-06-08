const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleView', () => {
  let window, document, dom;

  beforeEach(() => {
    dom = new JSDOM('<body></body>', { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    window.close();
  });

  test('toggles block-view class and localStorage state', () => {
    expect(document.body.classList.contains('block-view')).toBe(false);
    expect(window.localStorage.getItem('view')).toBe(null);

    window.toggleView();

    expect(document.body.classList.contains('block-view')).toBe(true);
    expect(window.localStorage.getItem('view')).toBe('block');

    window.toggleView();

    expect(document.body.classList.contains('block-view')).toBe(false);
    expect(window.localStorage.getItem('view')).toBe('list');
  });
});
