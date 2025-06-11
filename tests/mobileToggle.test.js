const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleMobileView', () => {
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

  test('toggles mobile-view class and localStorage state', () => {
    expect(document.body.classList.contains('mobile-view')).toBe(false);
    expect(window.localStorage.getItem('mobileView')).toBe(null);

    window.toggleMobileView();

    expect(document.body.classList.contains('mobile-view')).toBe(true);
    expect(window.localStorage.getItem('mobileView')).toBe('on');

    window.toggleMobileView();

    expect(document.body.classList.contains('mobile-view')).toBe(false);
    expect(window.localStorage.getItem('mobileView')).toBe('off');
  });
});
