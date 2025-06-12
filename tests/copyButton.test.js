const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('createServiceButton copy link', () => {
  test('service button contains copy link button', async () => {
    const html = '<main></main>';
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    const { window } = dom;
    const { document } = window;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    const servicesData = [
      { name: 'Alpha', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Test' }
    ];

    window.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(servicesData) })
    );

    await window.loadServices();

    const copyBtn = document.querySelector('.service-button .copy-link');
    expect(copyBtn).not.toBeNull();
  });
});
