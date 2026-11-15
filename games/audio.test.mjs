import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio } from './audio.mjs';

function setup(t, { suspended = false } = {}) {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const contexts = [];
  const errors = [];
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  class Param {
    constructor() { this.events = []; }
    setValueAtTime(...values) { this.events.push(['set', ...values]); }
    exponentialRampToValueAtTime(...values) { this.events.push(['ramp', ...values]); }
    setTargetAtTime(...values) { this.events.push(['target', ...values]); }
    cancelScheduledValues(...values) { this.events.push(['cancel', ...values]); }
  }
  class Node {
    connect(node) { this.connection = node; return node; }
    disconnect() { this.disconnected = true; }
  }
  class Oscillator extends Node {
    constructor() { super(); this.frequency = new Param(); this.stops = []; }
    start(time) { this.startTime = time; }
    stop(time) { this.stops.push(time); }
  }
  class AudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = suspended ? 'suspended' : 'running';
      this.destination = new Node();
      this.oscillators = [];
      this.gains = [];
      this.filters = [];
      contexts.push(this);
    }
    createGain() {
      const gain = Object.assign(new Node(), { gain: new Param() });
      this.gains.push(gain);
      return gain;
    }
    createOscillator() {
      const oscillator = new Oscillator();
      this.oscillators.push(oscillator);
      return oscillator;
    }
    createBiquadFilter() {
      const filter = Object.assign(new Node(), { frequency: {}, Q: {} });
      this.filters.push(filter);
      return filter;
    }
    resume() { this.state = 'running'; return Promise.resolve(); }
  }
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: AudioContext });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'AudioContext', descriptor);
    else delete globalThis.AudioContext;
  });
  const create = (theme = 'duck') => new GameAudio({ theme, onError: (...args) => errors.push(args) });
  const advance = (seconds) => {
    contexts.forEach((context) => { context.currentTime += seconds; });
    t.mock.timers.tick(seconds * 1000);
  };
  return { contexts, errors, create, advance };
}

test('all games unlock lazily and play distinct quiet music that keeps looping', async (t) => {
  const { contexts, create, advance } = setup(t);
  const tracks = ['duck', 'puzzle', 'sky'].map((theme) => create(theme));
  tracks.forEach((audio) => audio.setMusicPlaying(true));
  assert.equal(contexts.length, 0, 'loading a game must not attempt autoplay');
  await Promise.all(tracks.map((audio) => audio.activate()));
  assert.equal(contexts.length, 3);
  const openings = contexts.map((context) => context.oscillators[0].frequency.events[0][1]);
  assert.equal(new Set(openings).size, 3, 'each game has its own audible theme');
  for (const context of contexts) {
    const voices = context.oscillators.length;
    advance(.8);
    assert.ok(context.oscillators.length > voices, 'music continues beyond its opening');
    assert.ok(context.gains.slice(1).every((node) => node.gain.events.find(([event]) => event === 'ramp')[1] <= .035));
  }
  tracks.forEach((audio) => audio.setMusicPlaying(false));
});

test('mute cancels music and queued effects immediately, and repeated unlocks never stack loops', async (t) => {
  const { create, advance, contexts } = setup(t);
  const audio = create();
  audio.setMusicPlaying(true);
  await audio.activate();
  audio.chime();
  audio.quack();
  const context = contexts[0];
  const count = context.oscillators.length;
  audio.setEnabled(false);
  assert.ok(context.oscillators.every((oscillator) => oscillator.stops.at(-1) === .02));
  assert.equal(context.gains[0].gain.events.at(-1)[1], 0);
  advance(2);
  audio.chime();
  assert.equal(context.oscillators.length, count);
  audio.setEnabled(true);
  const resumed = context.oscillators.length;
  await Promise.all([audio.activate(), audio.activate()]);
  audio.setMusicPlaying(true);
  assert.equal(context.oscillators.length, resumed, 'toggling and unlock gestures share one scheduler');
  advance(.6);
  assert.ok(context.oscillators.length > resumed);
  audio.setMusicPlaying(false);
});

test('pause stops background music; hiding the page silences every effect until visible again', async (t) => {
  const { create, contexts, advance } = setup(t);
  const audio = create('sky');
  audio.setMusicPlaying(true);
  await audio.activate();
  audio.tone(700, .6);
  const context = contexts[0];
  const effect = context.oscillators.at(-1);
  audio.setMusicPlaying(false);
  assert.ok(context.oscillators.slice(0, -1).every((oscillator) => oscillator.stops.at(-1) === .02));
  assert.equal(effect.stops.length, 1, 'finish effects can still play without background music');
  audio.setVisible(false);
  assert.equal(effect.stops.at(-1), .02);
  const count = context.oscillators.length;
  audio.setMusicPlaying(true);
  advance(3);
  audio.tone(880);
  assert.equal(context.oscillators.length, count);
  audio.setVisible(true);
  assert.ok(context.oscillators.length > count);
  audio.setMusicPlaying(false);
});

test('an interrupted audio context stops scheduling and resumes with no stale backlog', async (t) => {
  const { create, contexts, advance } = setup(t);
  const audio = create('puzzle');
  audio.setMusicPlaying(true);
  await audio.activate();
  const context = contexts[0];
  context.state = 'suspended';
  context.onstatechange();
  const count = context.oscillators.length;
  advance(30);
  assert.equal(context.oscillators.length, count);
  const resumedAt = context.currentTime;
  await audio.activate();
  advance(.8);
  assert.ok(context.oscillators.length > count);
  assert.ok(context.oscillators.slice(count).every((oscillator) => oscillator.startTime >= resumedAt));
  audio.setMusicPlaying(false);
});

test('concurrent unlocks report a rejected resume once without rejected fire-and-forget promises', async (t) => {
  const { create, contexts, errors } = setup(t, { suspended: true });
  const audio = create();
  let reject;
  // Create the context first, then emulate a later browser permission rejection.
  await audio.activate();
  const context = contexts[0];
  context.state = 'suspended';
  context.resume = () => new Promise((resolve, rejectResume) => { reject = rejectResume; });
  const first = audio.activate();
  const second = audio.activate();
  reject(new Error('Permission denied'));
  await Promise.all([first, second]);
  assert.equal(errors.length, 1);
  assert.match(errors[0][0], /Không thể phát âm thanh/);
  assert.equal(audio.enabled, false);
  assert.equal(audio.timer, null);
});

test('a pending unlock cannot restart audio after muting or leaving the page', async (t) => {
  const { create, contexts } = setup(t);
  const audio = create();
  await audio.activate();
  const context = contexts[0];
  context.state = 'suspended';
  let resume;
  context.resume = () => new Promise((resolve) => { resume = () => { context.state = 'running'; resolve(); }; });
  audio.setMusicPlaying(true);
  const pending = audio.activate();
  audio.setVisible(false);
  audio.setEnabled(false);
  resume();
  await pending;
  assert.equal(context.oscillators.length, 0);
  assert.equal(audio.timer, null);
  assert.equal(context.gains[0].gain.events.at(-1)[1], 0);
});

test('quacks are short filtered bursts and all finished audio nodes are disconnected', async (t) => {
  const { create, contexts } = setup(t);
  const audio = create();
  await audio.activate();
  audio.quack();
  const context = contexts[0];
  assert.ok(context.oscillators.length >= 2 && context.oscillators.length <= 3);
  assert.equal(context.filters.length, context.oscillators.length);
  for (const oscillator of context.oscillators) {
    assert.equal(oscillator.type, 'sawtooth');
    assert.ok(oscillator.stops[0] - oscillator.startTime < .3);
    oscillator.onended();
    assert.ok(oscillator.disconnected && oscillator.connection.disconnected);
  }
  assert.ok(context.gains.slice(1).every((gain) => gain.disconnected));
  assert.equal(audio.voices.size, 0);
});

test('switching theme mid-song swaps the melody without stacking old notes', async (t) => {
  const { create, contexts, advance } = setup(t);
  const audio = create('orchard');
  audio.setMusicPlaying(true);
  await audio.activate();
  const context = contexts[0];
  const before = context.oscillators.length;
  audio.setTheme('night');
  assert.ok(context.oscillators.slice(0, before).every((oscillator) => oscillator.stops.at(-1) === .02), 'old music is cut');
  advance(.2);
  const fresh = context.oscillators.slice(before).map((oscillator) => oscillator.frequency.events[0][1]);
  assert.ok(fresh.some((freq) => Math.abs(freq - 440) < .01), 'night theme starts on its own first note (A4)');
  assert.throws(() => audio.setTheme('nope'), RangeError);
  audio.setMusicPlaying(false);
});
