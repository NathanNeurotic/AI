const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

describe('typing effect respects prefers-reduced-motion', () => {
  test('disables animation when reduced motion preferred', () => {
    const html = '<h1 class="typing-effect"></h1>';
    const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    const { window } = dom;
    const { document } = window;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }));

    window.setTimeout = jest.fn();

    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    document.dispatchEvent(new window.Event('DOMContentLoaded'));

    const header = document.querySelector('.typing-effect');
    expect(header.textContent).toBe('AI Services Dashboard');
    expect(window.setTimeout).not.toHaveBeenCalled();
  });
});
