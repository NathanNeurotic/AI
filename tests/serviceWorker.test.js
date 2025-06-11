const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Helper to convert URLs to absolute form
const toAbsolute = (url) => new URL(url, 'https://example.com/').toString();

function createCachesMock() {
  const store = new Map();
  return {
    _store: store,
    open: jest.fn(name => {
      if (!store.has(name)) store.set(name, new Map());
      const cacheMap = store.get(name);
      return Promise.resolve({
        addAll: jest.fn(urls => {
          urls.forEach(u => cacheMap.set(toAbsolute(u), u));
          return Promise.resolve();
        }),
        add: jest.fn(url => {
          cacheMap.set(toAbsolute(url), url);
          return Promise.resolve();
        }),
        match: jest.fn(req => {
          const url = typeof req === 'string' ? req : req.url;
          return Promise.resolve(cacheMap.get(toAbsolute(url)));
        })
      });
    }),
    keys: jest.fn(() => Promise.resolve([...store.keys()])),
    delete: jest.fn(key => { store.delete(key); return Promise.resolve(); }),
    match: jest.fn(req => {
      const url = typeof req === 'string' ? req : req.url;
      for (const cacheMap of store.values()) {
        if (cacheMap.has(toAbsolute(url))) {
          return Promise.resolve(cacheMap.get(toAbsolute(url)));
        }
      }
      return Promise.resolve(undefined);
    })
  };
}

function setupServiceWorker() {
  const listeners = {};
  const caches = createCachesMock();
  const context = {
    self: {
      addEventListener: (type, cb) => { listeners[type] = cb; },
      skipWaiting: jest.fn(),
      clients: { claim: jest.fn() },
      location: new URL('https://example.com/')
    },
    caches,
    fetch: jest.fn(() => Promise.resolve('network')), // will be overridden per test
    console
  };
  const swCode = fs.readFileSync(path.join(__dirname, '../service-worker.js'), 'utf8');
  vm.runInNewContext(swCode, context);
  context.listeners = listeners;
  return context;
}

describe('service worker', () => {
  test('caches URLS_TO_CACHE on install', async () => {
    const ctx = setupServiceWorker();
    const { listeners, caches, CACHE_NAME, URLS_TO_CACHE } = ctx;
    let installPromise;
    const installEvent = { waitUntil: p => { installPromise = p; } };
    listeners['install'](installEvent);
    await installPromise;
    const stored = caches._store.get(CACHE_NAME);
    expect(stored).toBeDefined();
    const cachedUrls = [...stored.keys()];
    const expected = URLS_TO_CACHE.map(toAbsolute);
    expected.forEach(url => expect(cachedUrls).toContain(url));
  });

  test('fetch for script.js uses network-first strategy', async () => {
    const ctx = setupServiceWorker();
    const { listeners, caches, CACHE_NAME } = ctx;
    // populate cache via install
    let installPromise;
    const installEvent = { waitUntil: p => { installPromise = p; } };
    ctx.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    listeners['install'](installEvent);
    await installPromise;
    ctx.fetch.mockClear();

    const fetchEvent = {
      request: { url: 'https://example.com/script.js' },
      respondWith: p => { fetchEvent.response = p; }
    };
    listeners['fetch'](fetchEvent);
    const result = await fetchEvent.response;
    expect(ctx.fetch).toHaveBeenCalledWith(fetchEvent.request);
    expect(result).toBe('network');
    expect(caches.match).not.toHaveBeenCalled();

    // simulate network failure fallback to cache
    ctx.fetch.mockRejectedValueOnce(new Error('fail'));
    const fetchEventFail = {
      request: { url: 'https://example.com/script.js' },
      respondWith: p => { fetchEventFail.response = p; }
    };
    listeners['fetch'](fetchEventFail);
    const fallback = await fetchEventFail.response;
    const cacheStore = caches._store.get(CACHE_NAME);
    expect(caches.match).toHaveBeenCalledWith(fetchEventFail.request);
    expect(fallback).toBe(cacheStore.get(toAbsolute('./script.js')));
  });

  test('fetch for services.json uses network-first strategy', async () => {
    const ctx = setupServiceWorker();
    const { listeners, caches, CACHE_NAME } = ctx;
    let installPromise;
    const installEvent = { waitUntil: p => { installPromise = p; } };
    ctx.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    listeners['install'](installEvent);
    await installPromise;
    ctx.fetch.mockClear();

    ctx.fetch.mockResolvedValueOnce('network-services');
    const fetchEvent = {
      request: { url: 'https://example.com/services.json' },
      respondWith: p => { fetchEvent.response = p; }
    };
    listeners['fetch'](fetchEvent);
    const result = await fetchEvent.response;
    expect(ctx.fetch).toHaveBeenCalledWith(fetchEvent.request);
    expect(result).toBe('network-services');
    expect(caches.match).not.toHaveBeenCalled();

    // failure path
    ctx.fetch.mockRejectedValueOnce(new Error('fail'));
    const fetchEventFail = {
      request: { url: 'https://example.com/services.json' },
      respondWith: p => { fetchEventFail.response = p; }
    };
    listeners['fetch'](fetchEventFail);
    const fallback = await fetchEventFail.response;
    const cacheStore = caches._store.get(CACHE_NAME);
    expect(caches.match).toHaveBeenCalledWith(fetchEventFail.request);
    expect(fallback).toBe(cacheStore.get(toAbsolute('./services.json')));
  });
});
