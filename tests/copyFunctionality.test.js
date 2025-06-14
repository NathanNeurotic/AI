const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('copy button functionality', () => {
  const servicesData = [
    { name: 'Alpha', url: 'http://alpha.com', favicon_url: 'alpha.ico', category: 'Test' }
  ];
  let dom, window, document;

  beforeEach(() => {
    const html = '<main></main>';
    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    document.documentElement.style.setProperty('--category-max-height', '400px');

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    window.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(servicesData) }));
  });

  afterEach(() => {
    dom.window.close();
    jest.useRealTimers();
  });

  test('uses navigator.clipboard when available', async () => {
    const writeMock = jest.fn(() => Promise.resolve());
    window.navigator.clipboard = { writeText: writeMock };

    await window.loadServices();

    const copyBtn = document.querySelector('.copy-link');
    jest.useFakeTimers();
    copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    expect(writeMock).toHaveBeenCalledWith('http://alpha.com');
    expect(copyBtn.textContent).toBe('Copied!');
    jest.advanceTimersByTime(1000);
    expect(copyBtn.textContent).toBe('📋');
  });

  test('falls back to execCommand when clipboard API unavailable', async () => {
    delete window.navigator.clipboard;
    const execMock = jest.fn(() => true);
    document.execCommand = execMock;

    await window.loadServices();

    const copyBtn = document.querySelector('.copy-link');
    jest.useFakeTimers();
    copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    expect(execMock).toHaveBeenCalledWith('copy');
    expect(copyBtn.textContent).toBe('Copied!');
    jest.advanceTimersByTime(1000);
    expect(copyBtn.textContent).toBe('📋');
  });

  test('shows error message when copy fails', async () => {
    delete window.navigator.clipboard;
    const execMock = jest.fn(() => false);
    document.execCommand = execMock;

    await window.loadServices();

    const copyBtn = document.querySelector('.copy-link');
    jest.useFakeTimers();
    copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    expect(execMock).toHaveBeenCalledWith('copy');
    expect(copyBtn.textContent).toBe('Copy failed');
    jest.advanceTimersByTime(1000);
    expect(copyBtn.textContent).toBe('📋');
  });
});
