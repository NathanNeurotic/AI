const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('clear search button', () => {
  let window, document, searchInput, clearBtn, noResults;

  beforeEach(() => {
    const html = `
      <div class="search-container">
        <input id="searchInput" type="text" />
        <button id="clearSearchBtn" onclick="clearSearch()" type="button">Clear</button>
      </div>
      <p id="noResults" hidden>No results found.</p>
      <section class="category" id="cat1">
        <h2>Cat1</h2>
        <div class="category-content">
          <a class="service-button">
            <span class="service-name">Alpha</span>
            <span class="service-url">http://alpha.com</span>
            <span class="service-tags"></span>
          </a>
        </div>
      </section>
      <section class="category" id="cat2">
        <h2>Cat2</h2>
        <div class="category-content">
          <a class="service-button">
            <span class="service-name">Beta</span>
            <span class="service-url">http://beta.com</span>
            <span class="service-tags"></span>
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
    clearBtn = document.getElementById('clearSearchBtn');
    noResults = document.getElementById('noResults');
  });

  afterEach(() => {
    window.close();
  });

  test('button clears search and restores categories', () => {
    const cat1 = document.getElementById('cat1');
    const cat2 = document.getElementById('cat2');
    const [btn1, btn2] = document.querySelectorAll('.service-button');

    searchInput.value = 'zzz';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(noResults.hidden).toBe(false);
    expect(cat1.style.display).toBe('none');
    expect(cat2.style.display).toBe('none');
    expect(btn1.style.display).toBe('none');
    expect(btn2.style.display).toBe('none');

    clearBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(searchInput.value).toBe('');
    expect(noResults.hidden).toBe(true);
    expect(cat1.style.display).toBe('');
    expect(cat2.style.display).toBe('');
    expect(btn1.style.display).toBe('flex');
    expect(btn2.style.display).toBe('flex');
  });
});
