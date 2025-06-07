const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('loadServices sorts services alphabetically', () => {
  test('services in each category are ordered by name', async () => {
    const html = '<main></main>';
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { window } = dom;
    const { document } = window;

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    const sampleServices = [
      { name: 'Beta', url: 'http://beta.com', category: 'Category 1' },
      { name: 'Alpha', url: 'http://alpha.com', category: 'Category 1' },
      { name: 'Gamma', url: 'http://gamma.com', category: 'Category 2' }
    ];

    window.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(sampleServices)
    }));

    await window.loadServices();

    const names = [...document.querySelectorAll('#category-1 .service-name')].map(el => el.textContent);
    expect(names).toEqual(['Alpha', 'Beta']);
  });
});
