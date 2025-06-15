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

  test('dropdown populated after init', () => {
    const customSelect = document.getElementById('languageSelect');
    expect(customSelect.options.length).toBe(0);

    window.googleTranslateElementInit();

    expect(customSelect.options.length).toBe(2);
    const googleSelect = document.querySelector('#google_translate_element .goog-te-combo');
    expect(googleSelect).not.toBeNull();
  });

  test('selecting language updates google widget', () => {
    window.googleTranslateElementInit();
    const customSelect = document.getElementById('languageSelect');
    const googleSelect = document.querySelector('#google_translate_element .goog-te-combo');

    customSelect.value = 'es';
    customSelect.dispatchEvent(new window.Event('change'));

    expect(googleSelect.value).toBe('es');
  });
});
