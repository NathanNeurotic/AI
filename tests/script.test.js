const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleCategory', () => {
  let window, document, header, content, chevron;

  beforeEach(() => {
    const html = `
      <section class="category" id="test">
        <h2 aria-expanded="false">Title <span class="chevron">▼</span></h2>
        <div class="category-content"></div>
      </section>
    `;
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');
    header = document.querySelector('h2');
    content = document.querySelector('.category-content');
    chevron = document.querySelector('.chevron');

    // Inject the script into the JSDOM context
    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    window.close();
  });

  test('toggles open class and localStorage state', () => {
    expect(content.classList.contains('open')).toBe(false);
    expect(chevron.classList.contains('open')).toBe(false);
    expect(window.localStorage.getItem('category-test')).toBe(null);

    window.toggleCategory(header);

    expect(content.classList.contains('open')).toBe(true);
    expect(chevron.classList.contains('open')).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(window.localStorage.getItem('category-test')).toBe('open');

    window.toggleCategory(header);

    expect(content.classList.contains('open')).toBe(false);
    expect(chevron.classList.contains('open')).toBe(false);
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(window.localStorage.getItem('category-test')).toBe('closed');
  });
});
