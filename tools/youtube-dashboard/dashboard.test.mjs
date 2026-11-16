import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const languageSource = readFileSync(new URL('../i18n.mjs', import.meta.url), 'utf8').replace('export function', 'function');
const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1]
  .replace(/import \{ initLanguage \} from '\.\.\/i18n\.mjs';/, '')
  .replace(/\}\)\(\);\s*$/, `
  globalThis.dashboard = { signIn, readToken, fetchChannel, render, load };
})();`);
const CHANNEL_A = 'UC' + 'a'.repeat(22);
const CHANNEL_B = 'UC' + 'b'.repeat(22);
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
const ok = (data) => ({ ok: true, status: 200, json: async () => data });

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

function setup({ route, local = {}, browserLanguage = 'vi-VN' } = {}) {
  const time = Date.parse('2026-11-15T13:45:00Z');
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [time])); }
    static now() { return time; }
  }
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set(['hidden']);
      elements.set(id, {
        value: '', innerHTML: '', textContent: '', disabled: false, files: [], listeners: {}, dataset: {}, attributes: {},
        focus() {},
        getAttribute(name) { return this.attributes[name] ?? null; },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(type, callback) { this.listeners[type] = callback; },
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
          contains: (name) => classes.has(name),
          toggle(name, force = !classes.has(name)) { force ? classes.add(name) : classes.delete(name); }
        }
      });
    }
    return elements.get(id);
  };
  const localStorage = storage(local), sessionStorage = storage();
  const requests = [], grants = [], revoked = [], authorizations = [];
  const oauth2 = {
    hasGrantedAllScopes: (response, ...scopes) => scopes.every((scope) => response.scope.split(' ').includes(scope)),
    initTokenClient: (options) => {
      authorizations.push(options);
      return { requestAccessToken: () => queueMicrotask(() => options.callback(grants.shift())) };
    },
    revoke: (token, callback) => { revoked.push(token); callback({ successful: true }); }
  };
  const google = { accounts: { oauth2 } };
  element('lang-vi').dataset.lang = 'vi';
  element('lang-en').dataset.lang = 'en';
  const context = vm.createContext({
    Date: ClockDate, Intl, URL, AbortSignal, console, localStorage, sessionStorage,
    location: { origin: 'http://127.0.0.1:8765' },
    navigator: { language: browserLanguage },
    document: {
      documentElement: { lang: 'vi' },
      querySelectorAll: (selector) => selector === '[data-lang]' ? [element('lang-vi'), element('lang-en')] : [],
      querySelector: () => element('language-toggle'),
      getElementById: element,
      createElement: () => ({}),
      head: { appendChild: (script) => queueMicrotask(() => script.onload()) }
    },
    window: { google }, google, setInterval: () => 1,
    fetch: async (url, options) => {
      const request = { url: new URL(url), token: options.headers.Authorization.slice(7) };
      requests.push(request);
      if (!route) throw new Error(`Unexpected request: ${url}`);
      return route(request);
    }
  });
  vm.runInContext(languageSource, context);
  vm.runInContext(source, context);
  const authenticate = (value = 'test-token') => {
    const record = { value, exp: time + 3600000, scope: SCOPE };
    sessionStorage.setItem('ytdash.token', JSON.stringify(record));
    return record;
  };
  return { ...context, element, requests, grants, revoked, authorizations, authenticate };
}

function channelResponse(id, subs = 10) {
  return {
    id, snippet: { title: id === CHANNEL_A ? 'Channel A' : 'Channel B', thumbnails: {} },
    statistics: { subscriberCount: String(subs), viewCount: '100', videoCount: '3' },
    brandingSettings: {}
  };
}

const channel = (id, title, subs) => ({ id, title, subs, views: 100, videos: 3 });

test('one read-only Google sign-in loads all channel stats without video, schedule, or Analytics requests', async () => {
  const env = setup({
    route: ({ url, token }) => {
      assert.equal(url.origin, 'https://www.googleapis.com');
      assert.equal(url.pathname, '/youtube/v3/channels');
      assert.equal(url.searchParams.has('mine'), false);
      assert.deepEqual(url.searchParams.get('part').split(',').sort(), ['brandingSettings', 'snippet', 'statistics']);
      assert.equal(token, 'public-stats-token');
      const id = url.searchParams.get('id');
      return ok({ items: [channelResponse(id, id === CHANNEL_A ? 1200 : 3400)] });
    }
  });
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify([CHANNEL_A, CHANNEL_B]));
  env.grants.push({ access_token: 'public-stats-token', expires_in: 3600, scope: SCOPE });
  await env.dashboard.signIn();
  assert.equal(env.authorizations.length, 1);
  assert.equal(env.authorizations[0].scope, SCOPE);
  assert.equal(env.authorizations[0].include_granted_scopes, false);
  await env.dashboard.load(true);
  assert.equal(env.requests.length, 2);
  assert.equal(env.element('subscriber-total').textContent, '4.600');
  const list = env.element('subscriber-list').innerHTML;
  assert.ok(list.indexOf('Channel B') < list.indexOf('Channel A'));
  assert.match(list, />3\.400</);
  assert.match(list, />1\.200</);
  assert.doesNotMatch(env.element('grid').innerHTML, /Video mới nhất|View duration|class="videos"|data-connect-channel/);
  assert.doesNotMatch(html, /id="schedule"|value="recent"/);
  const cached = JSON.parse(env.localStorage.getItem('ytdash.cache'));
  assert.ok(cached.channels.every((c) => !('latest' in c) && !('scheduled' in c)));
});

test('the top subscriber overview includes every channel, exact displayed counts, and explicit unavailable states', () => {
  const env = setup();
  env.dashboard.render({
    at: env.Date.now(),
    channels: [
      channel(CHANNEL_A, '<Alpha & friends>', 123456),
      channel(CHANNEL_B, 'Beta', 890123),
      channel('zero', 'No subscribers yet', 0),
      channel('hidden', 'Hidden channel', null),
      { ref: '@failed & channel', error: 'Quota exceeded' }
    ]
  });
  assert.equal(env.element('subscriber-total').textContent, '1.013.579');
  assert.match(env.element('subscriber-note').textContent, /3\/5 kênh có số sub.*1 kênh ẩn sub.*1 kênh lỗi.*Tổng chỉ gồm/);
  const rendered = env.element('subscriber-list').innerHTML;
  assert.equal((rendered.match(/class="subscriber-item/g) || []).length, 5);
  assert.match(rendered, /&lt;Alpha &amp; friends&gt;/);
  assert.match(rendered, /subscriber-count">123\.456</);
  assert.match(rendered, /subscriber-count">890\.123</);
  assert.match(rendered, /subscriber-count">0</);
  assert.match(rendered, /subscriber-count">Ẩn</);
  assert.match(rendered, /subscriber-count">Không tải được</);
  assert.match(rendered, /@failed &amp; channel/);
  assert.doesNotMatch(rendered, /<Alpha & friends>/);
  assert.equal(env.element('subscribers').classList.contains('hidden'), false);
  assert.ok(html.indexOf('id="subscribers"') < html.indexOf('id="summary"'));
});

test('an unknown subscriber total is not shown as zero, while a genuine zero is preserved', () => {
  const env = setup();
  env.dashboard.render({
    at: env.Date.now(),
    channels: [channel(CHANNEL_A, 'Hidden', null), { ref: '@failed', error: 'Unavailable' }]
  });
  assert.equal(env.element('subscriber-total').textContent, '—');
  env.dashboard.render({ at: env.Date.now(), channels: [channel(CHANNEL_A, 'New channel', 0)] });
  assert.equal(env.element('subscriber-total').textContent, '0');
});

test('old video caches are purged and the removed recent sort and per-channel sessions still migrate', async () => {
  const env = setup({
    local: {
      'ytdash.sort': 'recent',
      'ytdash.cache': JSON.stringify({ version: 2, channels: [{ latest: ['OLD VIDEO'], scheduled: ['PRIVATE SCHEDULE'] }] })
    },
    route: ({ url, token }) => {
      assert.equal(url.pathname, '/youtube/v3/channels');
      assert.equal(url.searchParams.has('mine'), false);
      assert.equal(token, 'legacy-channel-token');
      return ok({ items: [channelResponse(CHANNEL_A, 1500)] });
    }
  });
  assert.equal(env.localStorage.getItem('ytdash.cache'), null);
  assert.equal(env.element('sort').value, 'subs');
  const record = { value: 'legacy-channel-token', exp: env.Date.now() + 3600000, scope: SCOPE };
  env.sessionStorage.setItem('ytdash.channelTokens', JSON.stringify({ [CHANNEL_A]: record }));
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify([CHANNEL_A]));
  await env.dashboard.load();
  assert.equal(env.element('subscriber-total').textContent, '1.500');
  assert.equal(env.requests.length, 1);
  assert.doesNotMatch(env.localStorage.getItem('ytdash.cache'), /latest|scheduled|PRIVATE SCHEDULE|OLD VIDEO/);
  env.element('auth').listeners.click();
  assert.equal(env.sessionStorage.getItem('ytdash.channelTokens'), null);
  assert.equal(env.localStorage.getItem('ytdash.cache'), null);
  assert.deepEqual(env.revoked, ['legacy-channel-token']);
});

test('fresh public stats cache shows the subscriber overview without requiring another sign-in', async () => {
  const env = setup();
  const refs = [CHANNEL_A];
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify(refs));
  env.localStorage.setItem('ytdash.cache', JSON.stringify({
    version: 3, at: env.Date.now(), refs, channels: [channel(CHANNEL_A, 'Cached channel', 5200)]
  }));
  await env.dashboard.load();
  assert.equal(env.element('subscriber-total').textContent, '5.200');
  assert.match(env.element('subscriber-list').innerHTML, /Cached channel/);
  assert.match(env.element('notice').textContent, /Đang xem dữ liệu lưu đệm/);
  assert.equal(env.requests.length, 0);
});

test('signing out while channel stats load does not restore the cache or leave loading placeholders', async () => {
  let release, notify;
  const blocked = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { notify = resolve; });
  const env = setup({ route: () => { notify(); return blocked; } });
  env.authenticate();
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify([CHANNEL_A]));
  const loading = env.dashboard.load(true);
  await started;
  env.element('auth').listeners.click();
  release(ok({ items: [channelResponse(CHANNEL_A)] }));
  await loading;
  assert.equal(env.dashboard.readToken(), null);
  assert.equal(env.localStorage.getItem('ytdash.cache'), null);
  assert.equal(env.element('grid').innerHTML, '');
  assert.equal(env.element('subscriber-list').innerHTML, '');
  assert.equal(env.element('subscribers').classList.contains('hidden'), true);
  assert.match(env.element('notice').textContent, /Đã đăng xuất/);
});

test('English preference localizes cached stats and switching preserves settings without API requests', () => {
  const refs = [CHANNEL_A, CHANNEL_B, '@missing'];
  const env = setup({
    local: {
      'mp-lang': 'en',
      'ytdash.clientId': 'test.apps.googleusercontent.com',
      'ytdash.channels': JSON.stringify(refs),
      'ytdash.cache': JSON.stringify({
        version: 3, at: Date.parse('2026-11-15T13:45:00Z'), refs,
        channels: [channel(CHANNEL_A, 'Alpha', 123456), channel(CHANNEL_B, 'Hidden', null),
          { ref: '@missing', error: 'Không tìm thấy kênh', errorVi: 'Không tìm thấy kênh', errorEn: 'Channel not found' }]
      })
    }
  });
  env.element('channels').value = '@unsaved-edit';
  assert.equal(env.element('subscriber-total').textContent, '123,456');
  assert.match(env.element('subscriber-note').textContent, /1\/3 channels.*1 hidden count.*1 failed channel/);
  assert.match(env.element('subscriber-list').innerHTML, /Hidden|Could not load/);
  assert.match(env.element('summary').innerHTML, /Total views/);
  assert.match(env.element('grid').innerHTML, /Error: Channel not found/);
  assert.match(env.element('updated').textContent, /Updated 11\/15\/2026/);
  assert.match(env.element('notice').textContent, /Viewing cached data/);
  env.element('lang-vi').listeners.click();
  assert.equal(env.localStorage.getItem('mp-lang'), 'vi');
  assert.equal(env.element('subscriber-total').textContent, '123.456');
  assert.match(env.element('notice').textContent, /Đang xem dữ liệu lưu đệm/);
  assert.match(env.element('grid').innerHTML, /Lỗi: Không tìm thấy kênh/);
  assert.equal(env.element('channels').value, '@unsaved-edit');
  assert.equal(env.requests.length, 0);
});

test('English browser language applies on first visit, and visible setup notices switch back to Vietnamese', () => {
  const env = setup({ browserLanguage: 'en-US' });
  assert.equal(env.document.documentElement.lang, 'en');
  assert.match(env.element('notice').textContent, /Select an OAuth client file/);
  env.element('lang-vi').listeners.click();
  assert.match(env.element('notice').textContent, /Chọn file OAuth client/);
});
