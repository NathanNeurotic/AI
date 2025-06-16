const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('google translate dropdown', () => {
  let dom, window, document;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    // Remove external scripts that aren't needed for the test
    const sanitized = rawHtml
      .replace(/\s*<script src="\.\/script.js"><\/script>\s*/, '')
      .replace(/\s*<script src="https:\/\/translate\.google\.com\/translate_a\/element.js\?cb=googleTranslateElementInit"><\/script>\s*/, '');

    dom = new JSDOM(sanitized, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;

    // Stub the google translate element
    function TranslateElement(opts, id) {
      const container = document.getElementById(id);
      const select = document.createElement('select');
      select.className = 'goog-te-combo';
      select.innerHTML = '<option value="en">English</option><option value="es">Spanish</option>';
      container.appendChild(select);
    }
    TranslateElement.InlineLayout = { SIMPLE: 'SIMPLE' };
    window.google = { translate: { TranslateElement } };
  });

  afterEach(() => {
    dom.window.close();
  });

  test('google widget populated after init', () => {
    const container = document.getElementById('google_translate_element');
    expect(container.querySelector('.goog-te-combo')).toBeNull();

    window.googleTranslateElementInit();

    const googleSelect = container.querySelector('.goog-te-combo');
    expect(googleSelect).not.toBeNull();
    expect(googleSelect.options.length).toBe(2);
  });

  test('selecting language updates value', () => {
    window.googleTranslateElementInit();
    const googleSelect = document.querySelector('#google_translate_element .goog-te-combo');

    googleSelect.value = 'es';
    googleSelect.dispatchEvent(new window.Event('change'));

    expect(googleSelect.value).toBe('es');
  });

  test('adds class when toolbar appears', done => {
    window.googleTranslateElementInit();
    const frame = document.createElement('iframe');
    frame.className = 'goog-te-banner-frame';
    document.documentElement.appendChild(frame);

    setTimeout(() => {
      expect(document.body.classList.contains('translate-bar-active')).toBe(true);
      frame.remove();
      setTimeout(() => {
        expect(document.body.classList.contains('translate-bar-active')).toBe(false);
        done();
      }, 0);
    }, 0);
  });

});
