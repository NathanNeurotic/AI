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
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;

    const servicesData = [
      {
        name: 'One',
        url: 'http://one.com',
        favicon_url: 'one.ico',
        category: 'Banana',
        thumbnail_url: 'thumb-one.png'
      },
      { name: 'Two', url: 'http://two.com', favicon_url: 'two.ico', category: 'Apple' }
    ];

    window.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(servicesData) })
    );
    document.body.appendChild(scriptEl);

    await window.loadServices();
  });

  afterEach(() => {
    dom.window.close();
  });

  test('renders categories alphabetically', () => {
    const sections = document.querySelectorAll('.category');
    expect(sections[0].id).toBe('favorites');
    expect(sections[1].id).toBe('apple');
    expect(sections[2].id).toBe('banana');
  });

  test('localStorage key uses category id', () => {
    const appleHeader = document.querySelectorAll('.category h2')[1];
    window.toggleCategory(appleHeader);
    expect(window.localStorage.getItem('category-apple')).toBe('open');
  });

  test('pressing Enter toggles the category', () => {
    const appleHeader = document.querySelectorAll('.category h2')[1];
    const content = appleHeader.parentElement.querySelector('.category-content');

    expect(content.classList.contains('open')).toBe(false);

    const event = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    appleHeader.dispatchEvent(event);

    expect(content.classList.contains('open')).toBe(true);
  });

  test('service button includes thumbnail image when provided', () => {
    const buttons = Array.from(document.querySelectorAll('.service-button'));
    const target = buttons.find(btn =>
      btn.querySelector('.service-name').textContent === 'One'
    );
    expect(target).toBeDefined();
    const thumb = target.querySelector('img.service-thumbnail');
    expect(thumb).not.toBeNull();
    expect(thumb.getAttribute('src')).toBe('thumb-one.png');
  });
});
