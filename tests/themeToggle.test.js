const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleTheme', () => {
  let window, document, dom;

  beforeEach(() => {
    dom = new JSDOM('<body></body>', { runScripts: 'dangerously', url: 'http://localhost' });
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

  test('toggles light-mode class and localStorage state', () => {
    expect(document.body.classList.contains('light-mode')).toBe(false);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
    expect(window.localStorage.getItem('theme')).toBe(null);

    window.toggleTheme();

    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    expect(window.localStorage.getItem('theme')).toBe('light');

    window.toggleTheme();

    expect(document.body.classList.contains('light-mode')).toBe(false);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});
