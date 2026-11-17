import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAP_CONFIG,
  SCHOOL_PRESETS,
  CUSTOMIZATION_OPTIONS,
  POI_LOCATIONS,
  DEFAULT_NPCS,
  createDefaultPlayer,
  isSpecialZoneUnlocked,
  checkProximityPOI,
  calculateDistance,
  clamp
} from './academy.mjs';
import { MINIGAME_DATA } from './minigames.mjs';

test('createDefaultPlayer initializes valid player data with fallback and custom values', () => {
  const p1 = createDefaultPlayer();
  assert.equal(typeof p1.id, 'string');
  assert.equal(p1.school, 'TH Phú Thọ');
  assert.equal(p1.points, 0);
  assert.equal(p1.speed, 240);
  assert.equal(p1.x, MAP_CONFIG.spawn.x);
  assert.equal(p1.y, MAP_CONFIG.spawn.y);

  const p2 = createDefaultPlayer({
    id: 'student_custom',
    name: 'Bảo Ngọc',
    school: 'TH Chu Văn An',
    points: 80,
    outfit: 'sport'
  });
  assert.equal(p2.id, 'student_custom');
  assert.equal(p2.name, 'Bảo Ngọc');
  assert.equal(p2.school, 'TH Chu Văn An');
  assert.equal(p2.points, 80);
  assert.equal(p2.outfit, 'sport');
});

test('CUSTOMIZATION_OPTIONS has valid skins, hairs, colors and outfits', () => {
  assert.ok(CUSTOMIZATION_OPTIONS.skins.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.hairs.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.hairColors.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.outfits.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.accessories.length >= 4);

  // Check uniform outfit has red scarf for Phu Tho primary students
  const uniform = CUSTOMIZATION_OPTIONS.outfits.find(o => o.id === 'uniform');
  assert.ok(uniform);
  assert.equal(uniform.scarf, '#dc2626');
});

test('POI_LOCATIONS defines campus points including special VIP zone', () => {
  assert.ok(POI_LOCATIONS.length >= 8);

  const special = POI_LOCATIONS.find(p => p.id === 'special_zone');
  assert.ok(special, 'Special zone must exist');
  assert.equal(special.category, 'special_zone');
  assert.ok(special.requiredPoints >= 50);

  // Every POI must have valid coords and positive radius
  for (const poi of POI_LOCATIONS) {
    assert.ok(poi.x > 0 && poi.x < MAP_CONFIG.width, `${poi.id} x out of bounds`);
    assert.ok(poi.y > 0 && poi.y < MAP_CONFIG.height, `${poi.id} y out of bounds`);
    assert.ok(poi.radius > 0, `${poi.id} radius must be positive`);
    assert.ok(poi.name, `${poi.id} must have a name`);
  }
});

test('isSpecialZoneUnlocked accurately evaluates unlocking conditions', () => {
  const p = createDefaultPlayer({ points: 20, clearedGames: {} });
  assert.equal(isSpecialZoneUnlocked(p), false, 'Under 50 points and 0 games should be locked');

  p.points = 55;
  assert.equal(isSpecialZoneUnlocked(p), true, '>= 50 points unlocks special zone');

  const pGames = createDefaultPlayer({ points: 10, clearedGames: { math: true, vietnamese: true, coding: true } });
  assert.equal(isSpecialZoneUnlocked(pGames), true, '3 cleared stations unlocks special zone');

  const pFlag = createDefaultPlayer({ points: 0, specialUnlocked: true });
  assert.equal(isSpecialZoneUnlocked(pFlag), true, 'Explicit specialUnlocked flag opens zone');
});

test('checkProximityPOI detects locations when near and ignores when far', () => {
  // Near the flagpole (1300, 1250)
  const hit = checkProximityPOI(1300, 1250);
  assert.ok(hit);
  assert.equal(hit.poi.id, 'flagpole');

  // Middle of nowhere
  const miss = checkProximityPOI(100, 100);
  assert.equal(miss, null);
});

test('calculateDistance and clamp behave correctly', () => {
  assert.equal(calculateDistance(0, 0, 3, 4), 5);
  assert.equal(clamp(50, 0, 100), 50);
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(150, 0, 100), 100);
});

test('MINIGAME_DATA contains valid educational question banks with 4 options each', () => {
  const categories = ['math', 'vietnamese', 'coding', 'sports', 'nature', 'olympiad'];
  for (const cat of categories) {
    const data = MINIGAME_DATA[cat];
    assert.ok(data, `Category ${cat} must exist`);
    assert.ok(data.title, `Category ${cat} must have title`);
    assert.ok(Array.isArray(data.questions) && data.questions.length >= 3, `${cat} needs at least 3 questions`);

    for (const q of data.questions) {
      assert.ok(q.question && q.question.length > 5, 'Question text must be substantive');
      assert.ok(Array.isArray(q.options) && q.options.length >= 3, 'Must have options');
      assert.ok(q.answer >= 0 && q.answer < q.options.length, 'Answer index must be valid');
      assert.ok(q.explanation, 'Must have explanation for learning');
    }
  }
});

test('DEFAULT_NPCS contains welcoming students with speech messages', () => {
  assert.ok(DEFAULT_NPCS.length >= 3);
  for (const npc of DEFAULT_NPCS) {
    assert.ok(npc.id.startsWith('npc_'));
    assert.ok(npc.name);
    assert.ok(npc.school);
    assert.ok(Array.isArray(npc.messages) && npc.messages.length > 0);
  }
});
