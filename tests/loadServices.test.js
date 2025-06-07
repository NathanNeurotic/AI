const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('loadServices', () => {
  let window, document, dom;

  beforeEach(async () => {
    const html = `<main></main>`;
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    const servicesData = [
      { name: 'One', url: 'http://one.com', favicon_url: 'one.ico', category: 'Banana' },
      { name: 'Two', url: 'http://two.com', favicon_url: 'two.ico', category: 'Apple' }
    ];

    window.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(servicesData) })
    );

    await window.loadServices();
  });

  afterEach(() => {
    dom.window.close();
  });

  test('renders categories alphabetically', () => {
    const sections = document.querySelectorAll('.category');
    expect(sections[0].id).toBe('apple');
    expect(sections[1].id).toBe('banana');
  });

  test('localStorage key uses category id', () => {
    const firstHeader = document.querySelector('.category h2');
    window.toggleCategory(firstHeader);
    expect(window.localStorage.getItem('category-apple')).toBe('open');
  });

  test('pressing Enter toggles the category', () => {
    const firstHeader = document.querySelector('.category h2');
    const content = firstHeader.nextElementSibling;

    expect(content.classList.contains('open')).toBe(false);

    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    firstHeader.dispatchEvent(event);

    expect(content.classList.contains('open')).toBe(true);
  });
});
