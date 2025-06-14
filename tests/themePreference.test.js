const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

function setup(osLight) {
  const dom = new JSDOM('<body></body>', { runScripts: 'dangerously', url: 'http://localhost' });
  const { window } = dom;
  const { document } = window;
  document.documentElement.style.setProperty('--category-max-height', '400px');
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: osLight && query === '(prefers-color-scheme: light)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }));
  const scriptEl = document.createElement('script');
  scriptEl.textContent = scriptContent;
  document.body.appendChild(scriptEl);
  return { window, document, dom };
}

describe('applySavedTheme respects OS preference', () => {
  test('defaults to light mode if OS prefers light', () => {
    const { window, document, dom } = setup(true);
    window.applySavedTheme();
    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(document.documentElement.classList.contains('light-mode')).toBe(true);
    dom.window.close();
  });

  test('stays dark if OS prefers dark', () => {
    const { window, document, dom } = setup(false);
    window.applySavedTheme();
    expect(document.body.classList.contains('light-mode')).toBe(false);
    expect(document.documentElement.classList.contains('light-mode')).toBe(false);
    dom.window.close();
  });
});
