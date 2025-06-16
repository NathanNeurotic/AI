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
    fetch: jest.fn(url => {
      const absoluteUrl = toAbsolute(url.url || url); // Ensure absolute URL for comparison
      if (absoluteUrl.endsWith('services.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]), // Default empty services
          clone: function() { return this; }
        });
      }
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve('mock network response'), // Generic response
        clone: function() { return this; }
      });
    }),
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
    const { listeners, caches, CACHE_NAME, URLS_TO_CACHE, fetch } = ctx; // Destructure fetch
    let installPromise;
    const installEvent = { waitUntil: p => { installPromise = p; } };

    // This specific mockResolvedValueOnce for services.json during install
    // should still take precedence over the general mock in setupServiceWorker
    // if the timing is correct (i.e., this is the *next* call to fetch).
    // The general mock provides a fallback.
    // For the 'install' event, the service worker fetches './services.json'.
    // We ensure this specific mock is used for that fetch.
    if (fetch.mockResolvedValueOnce) { // Check if it's a Jest mock
        fetch.mockResolvedValueOnce({ // This mock is specific to the install phase fetch of services.json
            ok: true,
            json: () => Promise.resolve([]),
            clone: function() { return this; }
        });
    }

    listeners['install'](installEvent);
    await installPromise;

    const stored = caches._store.get(CACHE_NAME);
    expect(stored).toBeDefined();
    const cachedUrls = [...stored.keys()];
    const expected = URLS_TO_CACHE.map(toAbsolute);
    expected.forEach(url => expect(cachedUrls).toContain(url));

    // Check if services.json itself was cached as part of URLS_TO_CACHE
    expect(cachedUrls).toContain(toAbsolute('./services.json'));
  });

  test('fetch for script.js uses network-first strategy', async () => {
    const ctx = setupServiceWorker();
    const { listeners, caches, CACHE_NAME } = ctx;
    // populate cache via install
    let installPromise;
    const installEvent = { waitUntil: p => { installPromise = p; } };
    // The general fetch mock in setupServiceWorker handles services.json by default.
    // If a specific override for services.json is needed for this install, it should be here.
    // However, the default mock now returns a valid Response for services.json,
    // so a specific mockResolvedValueOnce for services.json here might be redundant
    // unless a different .json() payload is needed for this specific test.
    // For now, relying on the general mock. If tests fail, this might need adjustment.
    listeners['install'](installEvent);
    await installPromise;

    const fetchEvent = {
      request: { url: 'https://example.com/script.js' },
      respondWith: p => { fetchEvent.response = p; }
    };
    listeners['fetch'](fetchEvent);
    const result = await fetchEvent.response;
    expect(ctx.fetch).toHaveBeenCalledWith(fetchEvent.request);
    // Expect a Response object, not the string 'network'
    expect(result.ok).toBe(true);
    const text = await result.text();
    expect(text).toBe('mock network response');
    expect(caches.match).not.toHaveBeenCalled();

    // simulate network failure fallback to cache
    if (ctx.fetch.mockRejectedValueOnce) { // Check if it's a Jest mock
      ctx.fetch.mockRejectedValueOnce(new Error('fail'));
    }
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
    // Similar to the above test, relying on the general mock for services.json during install.
    listeners['install'](installEvent);
    await installPromise;

    // This mockResolvedValueOnce is for the specific fetch call in this test.
    // It should override the general fetch mock for this instance.
    if (ctx.fetch.mockResolvedValueOnce) { // Check if it's a Jest mock
      ctx.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'specific network services response' }),
        clone: function() { return this; }
      });
    }
    const fetchEvent = {
      request: { url: 'https://example.com/services.json' },
      respondWith: p => { fetchEvent.response = p; }
    };
    listeners['fetch'](fetchEvent);
    const result = await fetchEvent.response;
    expect(ctx.fetch).toHaveBeenCalledWith(fetchEvent.request);
    // Expect a Response object
    expect(result.ok).toBe(true);
    const json = await result.json();
    expect(json).toEqual({ data: 'specific network services response' });
    expect(caches.match).not.toHaveBeenCalled();

    // failure path
    if (ctx.fetch.mockRejectedValueOnce) { // Check if it's a Jest mock
      ctx.fetch.mockRejectedValueOnce(new Error('fail'));
    }
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

  test('message SKIP_WAITING triggers skipWaiting', () => {
    const ctx = setupServiceWorker();
    const { listeners, self } = ctx;
    const evt = { data: { type: 'SKIP_WAITING' } };
    listeners['message'](evt);
    expect(self.skipWaiting).toHaveBeenCalled();
  });
});
