import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatManager } from './chat.mjs';

test('ChatManager initializes guest ID and thread ID correctly', () => {
  const manager = new ChatManager();
  assert.ok(manager.guestId);
  assert.ok(manager.threadId);
  assert.ok(manager.threadId.startsWith('thread_'));
});

test('ChatManager provides localization strings', () => {
  const manager = new ChatManager();
  assert.ok(manager.t.title);
  assert.ok(manager.t.placeholder);
  assert.ok(Array.isArray(manager.t.pills));
  assert.ok(manager.t.pills.length > 0);
});
