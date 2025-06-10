const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('search no results message', () => {
  let window, document, searchInput, noResults;

  beforeEach(() => {
    const html = `
      <div class="search-container">
        <input id="searchInput" type="text" />
      </div>
      <p id="noResults" hidden>No results found.</p>
      <section class="category" id="cat1">
        <h2>Category 1</h2>
        <div class="category-content">
          <a class="service-button">
            <span class="service-name">Alpha</span>
            <span class="service-url">http://alpha.com</span>
            <span class="service-tags">news</span>
          </a>
        </div>
      </section>
    `;
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    window.setupSearch();
    searchInput = document.getElementById('searchInput');
    noResults = document.getElementById('noResults');
  });

  afterEach(() => {
    window.close();
  });

  test('displays and hides no results message', () => {
    searchInput.value = 'zzz';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(noResults.hidden).toBe(false);

    searchInput.value = '';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(noResults.hidden).toBe(true);
  });
});
