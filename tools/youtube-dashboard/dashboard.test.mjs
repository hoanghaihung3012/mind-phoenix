import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\}\)\(\);\s*$/, `
  globalThis.dashboard = { signIn, readToken, clearToken, fetchChannel, fetchVideoAnalytics, render, load };
})();`);
const CHANNEL_A = 'UC' + 'a'.repeat(22);
const CHANNEL_B = 'UC' + 'b'.repeat(22);
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';
const ok = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
}

function setup({ route, now = '2026-11-15T13:45:00Z' } = {}) {
  let time = Date.parse(now);
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [time])); }
    static now() { return time; }
  }
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set(['hidden']);
      elements.set(id, {
        value: '', innerHTML: '', textContent: '', disabled: false, files: [], listeners: {},
        focus() {},
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
  const localStorage = storage(), sessionStorage = storage();
  const requests = [], grants = [], revoked = [], prompts = [];
  let tick;
  const oauth2 = {
    hasGrantedAllScopes: (response, ...scopes) => scopes.every((scope) => response.scope.split(' ').includes(scope)),
    initTokenClient: (options) => ({
      requestAccessToken: (config) => {
        prompts.push(config.prompt);
        queueMicrotask(() => options.callback(grants.shift()));
      }
    }),
    revoke: (token, callback) => { revoked.push(token); callback({ successful: true }); }
  };
  const google = { accounts: { oauth2 } };
  const context = vm.createContext({
    Date: ClockDate, Intl, URL, AbortSignal, console, localStorage, sessionStorage,
    location: { origin: 'http://127.0.0.1:8765' },
    document: {
      getElementById: element,
      createElement: () => ({}),
      head: { appendChild: (script) => queueMicrotask(() => script.onload()) }
    },
    window: { google }, google,
    setInterval: (callback) => { tick = callback; return 1; },
    fetch: async (url, options) => {
      const request = { url: new URL(url), token: options.headers.Authorization.slice(7) };
      requests.push(request);
      if (!route) throw new Error(`Unexpected request: ${url}`);
      return route(request);
    }
  });
  vm.runInContext(source, context);
  const connect = (id, value = `token-${id}`) => {
    const record = { value, exp: time + 3600000, scope: SCOPES };
    const channels = JSON.parse(sessionStorage.getItem('ytdash.channelTokens')) || {};
    channels[id] = record;
    sessionStorage.setItem('ytdash.channelTokens', JSON.stringify(channels));
    sessionStorage.setItem('ytdash.token', JSON.stringify(record));
    return record;
  };
  return {
    ...context, element, requests, grants, revoked, prompts, connect,
    tick: () => tick(),
    advanceTo: (iso) => { time = Date.parse(iso); }
  };
}

function channel(id = CHANNEL_A, videoCount = 3) {
  return {
    id, snippet: { title: id === CHANNEL_A ? 'Channel A' : 'Channel B', thumbnails: {} },
    statistics: { subscriberCount: '10', viewCount: '100', videoCount: String(videoCount) },
    contentDetails: { relatedPlaylists: { uploads: `uploads-${id}` } }, brandingSettings: {}
  };
}

function video(id, { privacy = 'public', publishedAt = '2026-11-14T10:00:00Z', publishAt, title = id, upcoming = false } = {}) {
  return {
    id, snippet: { title, publishedAt, liveBroadcastContent: upcoming ? 'upcoming' : 'none', thumbnails: {} },
    status: { privacyStatus: privacy, ...(publishAt ? { publishAt } : {}) },
    statistics: { viewCount: '12', likeCount: '3' }
  };
}

function videoApi({ videos, pages, videoCount = 3, failPage = false }) {
  return ({ url }) => {
    const path = url.pathname.split('/').at(-1);
    if (path === 'channels') return ok({ items: [channel(CHANNEL_A, videoCount)] });
    if (path === 'playlistItems') {
      const page = Number(url.searchParams.get('pageToken') || 0);
      if (failPage && page > 0) return ok({ error: { message: 'Page unavailable' } }, 503);
      return ok({
        items: pages[page].map((id) => ({ contentDetails: { videoId: id } })),
        ...(page < pages.length - 1 ? { nextPageToken: String(page + 1) } : {})
      });
    }
    if (path === 'videos') return ok({ items: url.searchParams.get('id').split(',').map((id) => videos.find((v) => v.id === id)) });
    if (path === 'reports') return ok({ columnHeaders: [{ name: 'averageViewDuration' }], rows: [[45]] });
    throw new Error(`Unexpected request: ${url}`);
  };
}

test('channel grants stay separate, reject the wrong Brand Account, and expire independently', async () => {
  let expireA = false;
  const env = setup({
    route: ({ url, token }) => {
      if (url.searchParams.has('mine')) return ok({ items: [channel(token === 'token-a' ? CHANNEL_A : CHANNEL_B)] });
      if (url.pathname.endsWith('/reports')) {
        assert.equal(token, 'token-a');
        return expireA ? ok({ error: { message: 'Expired' } }, 401)
          : ok({ columnHeaders: [{ name: 'averageViewDuration' }], rows: [[12]] });
      }
      throw new Error(`Unexpected request: ${url}`);
    }
  });
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  const grant = (value) => env.grants.push({ access_token: value, expires_in: 3600, scope: SCOPES });
  grant('token-a');
  await env.dashboard.signIn(CHANNEL_A);
  grant('token-b');
  await env.dashboard.signIn(CHANNEL_B);
  assert.ok(env.prompts.every((prompt) => prompt.includes('consent') && prompt.includes('select_account')));
  assert.equal(env.dashboard.readToken(true, CHANNEL_A), 'token-a');
  assert.equal(env.dashboard.readToken(true, CHANNEL_B), 'token-b');
  const videos = [{ id: 'public-a', publishedAt: '2026-11-14T10:00:00Z' }];
  assert.equal((await env.dashboard.fetchVideoAnalytics(CHANNEL_A, videos)).get('public-a').averageViewDuration, 12);

  grant('token-b');
  await assert.rejects(env.dashboard.signIn(CHANNEL_A), /không phải kênh cần kết nối/);
  assert.equal(env.dashboard.readToken(true, CHANNEL_A), 'token-a');
  expireA = true;
  assert.equal((await env.dashboard.fetchVideoAnalytics(CHANNEL_A, videos)).get('public-a').analyticsState, 'error');
  assert.equal(env.dashboard.readToken(true, CHANNEL_A), null);
  assert.equal(env.dashboard.readToken(true, CHANNEL_B), 'token-b');
  assert.deepEqual(env.revoked, [], 'an expired token must not revoke another channel grant');

  env.localStorage.setItem('ytdash.cache', 'cached private reports');
  env.dashboard.clearToken();
  assert.equal(env.dashboard.readToken(), null);
  assert.equal(env.localStorage.getItem('ytdash.cache'), null);
  assert.deepEqual(env.revoked, ['token-b']);
});

test('owned uploads are fully paginated and scheduled or draft videos never replace public latest videos', async () => {
  const drafts = Array.from({ length: 47 }, (_, i) => video(`draft-${i}`, { privacy: 'private' }));
  const publicVideos = [1, 2, 3].map((i) => video(`public-${i}`));
  const videos = [
    ...drafts, ...publicVideos,
    video('old-upload-scheduled', { privacy: 'private', publishedAt: '2026-01-01T00:00:00Z', publishAt: '2026-11-15T14:00:00Z' }),
    video('recently-published', { publishedAt: '2026-11-15T12:00:00Z' }),
    video('unlisted', { privacy: 'unlisted' }), video('upcoming', { upcoming: true })
  ];
  const env = setup({ route: videoApi({ videos, pages: [videos.slice(0, 50).map((v) => v.id), videos.slice(50).map((v) => v.id)], videoCount: 5 }) });
  env.connect(CHANNEL_A);
  const result = await env.dashboard.fetchChannel({ id: CHANNEL_A });
  assert.equal(result.latest.length, 3);
  assert.equal(result.latest[0].id, 'recently-published');
  assert.ok(result.latest.every((v) => v.id.startsWith('public-') || v.id === 'recently-published'));
  assert.deepEqual(Array.from(result.scheduled, (v) => v.id), ['old-upload-scheduled']);
  assert.ok(result.latest.every((v) => v.averageViewDuration === 45));
  assert.equal(env.requests.filter(({ url }) => url.pathname.endsWith('/playlistItems')).length, 2);
});

test('analytics distinguishes missing rows from failures and preserves successful video results', async () => {
  const env = setup({
    now: '2026-11-15T00:30:00Z',
    route: ({ url }) => {
      assert.equal(url.searchParams.has('dimensions'), false);
      assert.equal(url.searchParams.get('endDate'), '2026-11-14');
      const filter = url.searchParams.get('filters');
      if (filter === 'video==ready') {
        assert.equal(url.searchParams.get('startDate'), '2026-11-13');
        return ok({ columnHeaders: [{ name: 'averageViewDuration' }], rows: [[0]] });
      }
      if (filter === 'video==pending') return ok({ columnHeaders: [{ name: 'averageViewDuration' }] });
      if (filter === 'video==failed') return ok({ error: { message: 'Analytics disabled' } }, 403);
      throw new Error(`Unexpected filter: ${filter}`);
    }
  });
  env.connect(CHANNEL_A);
  const result = await env.dashboard.fetchVideoAnalytics(CHANNEL_A, [
    { id: 'ready', publishedAt: '2026-11-14T01:00:00Z' },
    { id: 'pending', publishedAt: '2026-11-15T00:00:00Z' },
    { id: 'failed', publishedAt: '2026-11-14T01:00:00Z' }
  ]);
  assert.equal(result.get('ready').averageViewDuration, 0);
  assert.equal(result.get('ready').analyticsState, 'ready');
  assert.equal(result.get('pending').analyticsState, 'pending');
  assert.equal(result.get('failed').analyticsState, 'error');
  assert.equal(result.get('failed').analyticsError, 'Analytics disabled');
  env.dashboard.render({ at: env.Date.now(), channels: [{ ...channel(), latest: Array.from(result, ([id, metrics]) => ({ id, title: id, publishedAt: '2026-11-14T01:00:00Z', ...metrics })) }] });
  const rendered = env.element('grid').innerHTML;
  assert.match(rendered, />0:00</);
  assert.match(rendered, /Chưa có dữ liệu Analytics/);
  assert.match(rendered, /Lỗi Analytics: Analytics disabled/);
});

test('cached schedules use Vietnam midnight, sort times, expire automatically, and hide unconnected private data', async () => {
  const env = setup({ now: '2026-11-15T16:30:00Z' });
  env.connect(CHANNEL_A);
  const schedules = [
    { id: 'tomorrow-late', title: 'Tomorrow late', publishAt: '2026-11-16T16:59:00Z' },
    { id: 'tomorrow-midnight', title: 'Tomorrow midnight', publishAt: '2026-11-15T17:00:00Z' },
    { id: 'today', title: '<Today & pending>', publishAt: '2026-11-15T16:45:00Z' },
    { id: 'outside', title: 'Day after tomorrow', publishAt: '2026-11-16T17:00:00Z' },
    { id: 'past', title: 'Already due', publishAt: '2026-11-15T16:00:00Z' }
  ];
  const cachedChannel = (id, scheduled) => ({ ...channel(id), latest: [], scheduled, scheduleLoaded: true });
  const data = {
    version: 2, at: env.Date.now(), refs: [CHANNEL_A, CHANNEL_B],
    channels: [cachedChannel(CHANNEL_A, schedules), cachedChannel(CHANNEL_B, [{ id: 'secret', title: 'PRIVATE SECRET', publishAt: '2026-11-15T16:50:00Z' }])]
  };
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify(data.refs));
  env.localStorage.setItem('ytdash.cache', JSON.stringify(data));
  await env.dashboard.load();
  let rendered = env.element('schedule-grid').innerHTML;
  assert.match(rendered, /Hôm nay · 1[\s\S]*23:45[\s\S]*&lt;Today &amp; pending&gt;[\s\S]*Ngày mai · 2/);
  assert.ok(rendered.indexOf('Tomorrow midnight') < rendered.indexOf('Tomorrow late'));
  assert.doesNotMatch(rendered, /Already due|Day after tomorrow|PRIVATE SECRET/);
  assert.match(rendered, /Chưa kết nối kênh/);
  assert.match(env.element('schedule-meta').textContent, /15\/11\/2026/);

  env.advanceTo('2026-11-15T16:46:00Z');
  env.tick();
  assert.doesNotMatch(env.element('schedule-grid').innerHTML, /Today &amp; pending/);
  env.advanceTo('2026-11-15T17:01:00Z');
  env.tick();
  rendered = env.element('schedule-grid').innerHTML;
  assert.match(env.element('schedule-meta').textContent, /Hôm nay \(16\/11\/2026\).*Ngày mai \(17\/11\/2026\)/);
  assert.doesNotMatch(rendered, /Tomorrow midnight/);
  assert.match(rendered, /Hôm nay · 1[\s\S]*Tomorrow late[\s\S]*Ngày mai · 1[\s\S]*Day after tomorrow/);
});

test('an incomplete uploads scan keeps public statistics and reports an incomplete schedule instead of a false empty state', async () => {
  const videos = [1, 2, 3].map((i) => video(`public-${i}`));
  const env = setup({ route: videoApi({ videos, pages: [videos.map((v) => v.id), []], failPage: true }) });
  env.connect(CHANNEL_A);
  const result = await env.dashboard.fetchChannel({ id: CHANNEL_A });
  assert.equal(result.views, 100);
  assert.equal(result.latest.length, 3);
  assert.equal(result.scheduleError, 'Page unavailable');
  env.dashboard.render({ at: env.Date.now(), channels: [result] });
  assert.match(env.element('schedule-grid').innerHTML, /Kết quả chưa đầy đủ[\s\S]*Chưa tải hết lịch đăng: Page unavailable/);
  assert.doesNotMatch(env.element('schedule-grid').innerHTML, /Không còn video hẹn giờ/);
});

test('old sessions and cache migrate, and a channel without public videos still loads its schedule', async () => {
  const videos = [video('first-scheduled', { privacy: 'private', publishAt: '2026-11-15T14:00:00Z' })];
  const env = setup({ route: videoApi({ videos, pages: [['first-scheduled']], videoCount: 0 }) });
  env.sessionStorage.setItem('ytdash.token', JSON.stringify({ value: 'legacy-token', exp: env.Date.now() + 3600000, scope: SCOPES }));
  env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
  env.localStorage.setItem('ytdash.channels', JSON.stringify([CHANNEL_A]));
  env.localStorage.setItem('ytdash.cache', JSON.stringify({ at: env.Date.now(), refs: [CHANNEL_A], channels: [{ title: 'STALE CACHE' }] }));
  await env.dashboard.load();
  assert.equal(env.dashboard.readToken(true, CHANNEL_A), 'legacy-token');
  assert.match(env.element('schedule-grid').innerHTML, /first-scheduled/);
  assert.match(env.element('grid').innerHTML, /Chưa có video công khai/);
  assert.doesNotMatch(env.element('grid').innerHTML, /STALE CACHE/);
  assert.equal(JSON.parse(env.localStorage.getItem('ytdash.cache')).channels[0].scheduled.length, 1);
});

test('signing out during identity lookup or uploads loading never restores private data', async (t) => {
  for (const stage of ['identity', 'uploads']) {
    await t.test(stage, async () => {
      let release, notify;
      const blocked = new Promise((resolve) => { release = resolve; });
      const started = new Promise((resolve) => { notify = resolve; });
      const env = setup({
        route: ({ url }) => {
          if ((stage === 'identity' && url.searchParams.has('mine')) || (stage === 'uploads' && url.pathname.endsWith('/playlistItems'))) {
            notify();
            return blocked;
          }
          if (url.pathname.endsWith('/channels')) return ok({ items: [channel(CHANNEL_A, 0)] });
          if (url.pathname.endsWith('/videos')) return ok({ items: [video('PRIVATE AFTER SIGNOUT', { privacy: 'private', publishAt: '2026-11-15T14:00:00Z' })] });
          throw new Error(`Unexpected request: ${url}`);
        }
      });
      const record = env.connect(CHANNEL_A);
      if (stage === 'identity') {
        env.sessionStorage.removeItem('ytdash.channelTokens');
        env.sessionStorage.setItem('ytdash.token', JSON.stringify(record));
      }
      env.localStorage.setItem('ytdash.clientId', 'test.apps.googleusercontent.com');
      env.localStorage.setItem('ytdash.channels', JSON.stringify([CHANNEL_A]));
      const loading = env.dashboard.load(true);
      await started;
      env.element('auth').listeners.click();
      release(stage === 'identity' ? ok({ items: [channel()] }) : ok({ items: [{ contentDetails: { videoId: 'PRIVATE AFTER SIGNOUT' } }] }));
      await loading;
      assert.equal(env.dashboard.readToken(), null);
      assert.equal(env.localStorage.getItem('ytdash.cache'), null);
      assert.equal(env.element('grid').innerHTML, '');
      assert.equal(env.element('schedule-grid').innerHTML, '');
      assert.match(env.element('notice').textContent, /Đã đăng xuất tất cả kênh/);
    });
  }
});
