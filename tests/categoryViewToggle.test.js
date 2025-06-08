const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('toggleCategoryView', () => {
  let window, document, dom;

  beforeEach(() => {
    const html = `
      <section class="category" id="test">
        <h2 aria-expanded="false">Title <span class="chevron">▼</span><span class="category-view-toggle"></span></h2>
        <div class="category-content"></div>
      </section>
    `;
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);
  });

  afterEach(() => {
    window.close();
  });

  test('toggles list-view class and localStorage state', () => {
    const section = document.getElementById('test');

    expect(section.classList.contains('list-view')).toBe(false);
    expect(window.localStorage.getItem('view-test')).toBe(null);

    window.toggleCategoryView('test');

    expect(section.classList.contains('list-view')).toBe(true);
    expect(window.localStorage.getItem('view-test')).toBe('list');

    window.toggleCategoryView('test');

    expect(section.classList.contains('list-view')).toBe(false);
    expect(window.localStorage.getItem('view-test')).toBe('grid');
  });
});
