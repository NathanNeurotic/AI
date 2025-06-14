const fs = require('fs');
const path = require('path');

describe('manifest.json', () => {
  let manifest;

  beforeAll(() => {
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(content);
  });

  test('start_url and scope are correct', () => {
    expect(manifest.start_url).toBe('../index.html');
    expect(manifest.scope).toBe('../');
  });

  test('icons use relative src paths', () => {
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/')).toBe(false);
    }
  });
});
