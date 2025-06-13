const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleDesktopView', () => {
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

  test('toggles view classes', () => {
    expect(document.body.classList.contains('desktop-view')).toBe(true);
    expect(document.body.classList.contains('mobile-view')).toBe(false);
    expect(window.localStorage.getItem('mobileView')).toBe(null);

    window.toggleDesktopView();

    expect(document.body.classList.contains('desktop-view')).toBe(false);
    expect(document.body.classList.contains('mobile-view')).toBe(true);
    expect(window.localStorage.getItem('mobileView')).toBe(null);

    window.toggleDesktopView();

    expect(document.body.classList.contains('desktop-view')).toBe(true);
    expect(document.body.classList.contains('mobile-view')).toBe(false);
    expect(window.localStorage.getItem('mobileView')).toBe(null);
  });
});
