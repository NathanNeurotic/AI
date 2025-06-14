const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('sidebar navigation', () => {
  let window, document, dom;

  beforeEach(async () => {
    const html = `<nav id="sidebar"></nav><button id="sidebarToggle"></button><main></main>`;
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;

    const services = [
      { name: 'One', url: 'http://one.com', category: 'Alpha' },
      { name: 'Two', url: 'http://two.com', category: 'Beta' }
    ];

    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(services) }));
    document.body.appendChild(scriptEl);

    await window.loadServices();
  });

  afterEach(() => {
    window.close();
  });

  test('buildSidebar lists categories and repo link', () => {
    const links = document.querySelectorAll('#sidebar a');
    expect(links.length).toBe(4);
    expect(links[0].getAttribute('href')).toBe('#favorites');
    expect(links[0].textContent).toBe('Favorites');
    expect(links[1].getAttribute('href')).toBe('#alpha');
    expect(links[1].textContent).toBe('Alpha(1)');
    expect(links[2].getAttribute('href')).toBe('#beta');
    expect(links[2].textContent).toBe('Beta(1)');
    expect(links[3].getAttribute('href')).toBe('https://www.github.com/NathanNeurotic/AI');
  });

  test('toggleSidebar toggles open class', () => {
    const sidebar = document.getElementById('sidebar');
    expect(sidebar.classList.contains('open')).toBe(false);
    window.toggleSidebar();
    expect(sidebar.classList.contains('open')).toBe(true);
    window.toggleSidebar();
    expect(sidebar.classList.contains('open')).toBe(false);
  });
});
