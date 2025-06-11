const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('search filtering', () => {
  let window, document, searchInput;

  beforeEach(() => {
    const html = `
      <div class="search-container">
        <input id="searchInput" type="text" />
      </div>
      <section class="category" id="cat1">
        <h2>Category 1</h2>
        <div class="category-content">
          <a class="service-button">
            <span class="service-name">Alpha</span>
            <span class="service-url">http://alpha.com</span>
            <span class="service-tags">news,cat1</span>
          </a>
          <a class="service-button">
            <span class="service-name">Beta</span>
            <span class="service-url">http://beta.com</span>
            <span class="service-tags">support</span>
          </a>
        </div>
      </section>
      <section class="category" id="cat2">
        <h2>Category 2</h2>
        <div class="category-content">
          <a class="service-button">
            <span class="service-name">Gamma</span>
            <span class="service-url">http://gamma.com</span>
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
  });

  afterEach(() => {
    window.close();
  });

  test('filters services and categories based on query', () => {
    const buttons = document.querySelectorAll('.service-button');
    const [alphaBtn, betaBtn, gammaBtn] = buttons;
    const cat1 = document.getElementById('cat1');
    const cat2 = document.getElementById('cat2');

    searchInput.value = 'alpha';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(alphaBtn.style.display).toBe('flex');
    expect(betaBtn.style.display).toBe('none');
    expect(gammaBtn.style.display).toBe('none');
    expect(cat1.style.display).toBe('');
    expect(cat2.style.display).toBe('none');

    // search by tag
    searchInput.value = 'news';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(alphaBtn.style.display).toBe('flex');
    expect(betaBtn.style.display).toBe('none');
    expect(gammaBtn.style.display).toBe('none');
    expect(cat1.style.display).toBe('');
    expect(cat2.style.display).toBe('none');

    searchInput.value = '';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    buttons.forEach(btn => expect(btn.style.display).toBe('flex'));
    expect(cat1.style.display).toBe('');
    expect(cat2.style.display).toBe('');
  });

  test('supports filtering by multiple tags', () => {
    const buttons = document.querySelectorAll('.service-button');
    const [alphaBtn, betaBtn] = buttons;
    const cat1 = document.getElementById('cat1');

    searchInput.value = 'news, cat1';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    expect(alphaBtn.style.display).toBe('flex');
    expect(betaBtn.style.display).toBe('none');
    expect(cat1.style.display).toBe('');

    searchInput.value = 'news, support';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    buttons.forEach(btn => expect(btn.style.display).toBe('none'));
  });
});
