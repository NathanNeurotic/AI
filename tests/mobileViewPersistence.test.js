const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('mobile/desktop view persists after reload', () => {
  let window, document, dom, scriptContent;

  beforeAll(() => {
    scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
  });

  afterEach(() => {
    if (dom) dom.window.close();
  });

  test('saved mobile class applied on reload', () => {
    dom = new JSDOM('<body></body>', { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    window.toggleMobileView();
    const stored = window.localStorage.getItem('mobileView');
    dom.window.close();

    dom = new JSDOM('<body></body>', { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');
    const scriptEl2 = document.createElement('script');
    scriptEl2.textContent = scriptContent;
    document.body.appendChild(scriptEl2);
    window.localStorage.setItem('mobileView', stored);

    // allow DOMContentLoaded to fire
    return new Promise(resolve => {
      window.addEventListener('DOMContentLoaded', () => {
        expect(document.body.classList.contains('mobile-view')).toBe(true);
        expect(document.body.classList.contains('desktop-view')).toBe(false);
        resolve();
      });
    });
  });
});
