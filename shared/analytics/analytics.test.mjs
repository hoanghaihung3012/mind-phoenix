import test from 'node:test';
import assert from 'node:assert/strict';
import { AnalyticsTracker } from './analytics.mjs';

test('AnalyticsTracker initializes session ID correctly', () => {
  const tracker = new AnalyticsTracker();
  assert.ok(tracker.sessionId);
  assert.ok(tracker.sessionId.startsWith('sess_'));
});

test('AnalyticsTracker detects context based on URL', () => {
  const tracker = new AnalyticsTracker();
  const context = tracker.detectContext();
  assert.ok(context.type);
  assert.ok(context.id);
  assert.ok(context.title);
});
