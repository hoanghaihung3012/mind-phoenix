import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAP_CONFIG,
  SCHOOL_PRESETS,
  CUSTOMIZATION_OPTIONS,
  PET_CONFIGS,
  POI_LOCATIONS,
  DEFAULT_NPCS,
  calculateLevel,
  createDefaultPlayer,
  isSpecialZoneUnlocked,
  checkProximityPOI,
  calculateDistance,
  clamp
} from './academy.mjs';
import { MINIGAME_DATA } from './minigames.mjs';

test('createDefaultPlayer initializes valid player data with coins, xp, level and follower pet', () => {
  const p1 = createDefaultPlayer();
  assert.equal(typeof p1.id, 'string');
  assert.equal(p1.school, 'TH Phú Thọ');
  assert.equal(p1.points, 0);
  assert.equal(p1.coins, 50);
  assert.equal(p1.level, 1);
  assert.equal(p1.pet, 'duck');
  assert.equal(p1.character, 'boy');
  assert.equal(p1.x, MAP_CONFIG.spawn.x);
  assert.equal(p1.y, MAP_CONFIG.spawn.y);

  const p2 = createDefaultPlayer({
    id: 'student_custom',
    name: 'Bảo Ngọc',
    school: 'TH Chu Văn An',
    character: 'girl',
    points: 80,
    coins: 120,
    xp: 150,
    pet: 'rabbit',
    outfit: 'scholar'
  });
  assert.equal(p2.id, 'student_custom');
  assert.equal(p2.name, 'Bảo Ngọc');
  assert.equal(p2.school, 'TH Chu Văn An');
  assert.equal(p2.character, 'girl');
  assert.equal(p2.pet, 'rabbit');
  assert.equal(p2.level, 3);
  assert.equal(p2.outfit, 'scholar');
});

test('calculateLevel properly advances level at 60 XP intervals', () => {
  assert.deepEqual(calculateLevel(0), { level: 1, currentLevelXP: 0, maxLevelXP: 60 });
  assert.deepEqual(calculateLevel(50), { level: 1, currentLevelXP: 50, maxLevelXP: 60 });
  assert.deepEqual(calculateLevel(60), { level: 2, currentLevelXP: 0, maxLevelXP: 60 });
  assert.deepEqual(calculateLevel(130), { level: 3, currentLevelXP: 10, maxLevelXP: 60 });
});

test('CUSTOMIZATION_OPTIONS has valid characters, skins, hairs, colors, outfits and bag colors', () => {
  assert.ok(CUSTOMIZATION_OPTIONS.characters.length >= 2);
  assert.ok(CUSTOMIZATION_OPTIONS.skins.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.hairs.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.hairColors.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.outfits.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.bagColors.length >= 4);
  assert.ok(CUSTOMIZATION_OPTIONS.accessories.length >= 3);

  // Check uniform outfit has red scarf for Phu Tho primary students
  const uniform = CUSTOMIZATION_OPTIONS.outfits.find(o => o.id === 'default-student');
  assert.ok(uniform);
  assert.equal(uniform.scarf, '#dc2626');

  // Check leader outfit exists
  const leader = CUSTOMIZATION_OPTIONS.outfits.find(o => o.id === 'leader');
  assert.ok(leader);
  assert.equal(leader.accessory, 'leader');
});

test('PET_CONFIGS defines follower pets including duck, dog, rabbit, cat', () => {
  assert.ok(PET_CONFIGS.length >= 4);
  for (const pet of PET_CONFIGS) {
    assert.ok(pet.id);
    assert.ok(pet.name);
    assert.ok(pet.icon);
    assert.ok(pet.desc);
    assert.ok(pet.price >= 0);
  }
});

test('POI_LOCATIONS defines campus points including Grand Hall and school stations', () => {
  assert.ok(POI_LOCATIONS.length >= 10);

  const grand = POI_LOCATIONS.find(p => p.id === 'grand');
  assert.ok(grand, 'Grand Hall (Đại Hội Tri Thức) must exist');
  assert.equal(grand.category, 'special_zone');
  assert.ok(grand.requiredPoints >= 50 || grand.requiredLevel >= 3);

  // Every POI must have valid coords and positive radius
  for (const poi of POI_LOCATIONS) {
    assert.ok(poi.x > 0 && poi.x < MAP_CONFIG.width, `${poi.id} x out of bounds`);
    assert.ok(poi.y > 0 && poi.y < MAP_CONFIG.height, `${poi.id} y out of bounds`);
    assert.ok(poi.radius > 0, `${poi.id} radius must be positive`);
    assert.ok(poi.name, `${poi.id} must have a name`);
  }
});

test('isSpecialZoneUnlocked accurately evaluates unlocking conditions', () => {
  const p = createDefaultPlayer({ points: 20, level: 1, clearedGames: {} });
  assert.equal(isSpecialZoneUnlocked(p), false, 'Under 60 points and level 1 should be locked');

  p.points = 65;
  assert.equal(isSpecialZoneUnlocked(p), true, '>= 60 points unlocks Grand Hall');

  const pLevel = createDefaultPlayer({ points: 10, xp: 140, clearedGames: {} });
  assert.equal(isSpecialZoneUnlocked(pLevel), true, 'Level >= 3 unlocks Grand Hall');

  const pGames = createDefaultPlayer({ points: 10, level: 1, clearedGames: { vocabulary: true, spelling: true, math: true } });
  assert.equal(isSpecialZoneUnlocked(pGames), true, '3 cleared stations unlocks Grand Hall');

  const pFlag = createDefaultPlayer({ points: 0, level: 1, specialUnlocked: true });
  assert.equal(isSpecialZoneUnlocked(pFlag), true, 'Explicit specialUnlocked flag opens zone');
});

test('checkProximityPOI detects locations when near and ignores when far', () => {
  // Near the flagpole (535, 650)
  const hit = checkProximityPOI(535, 650);
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

test('MINIGAME_DATA contains comprehensive questions from Phu Tho educational curriculum', () => {
  const categories = ['vocabulary', 'spelling', 'literature', 'idiom', 'math', 'arena', 'grand'];
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

test('DEFAULT_NPCS contains welcoming students with pets and speech messages', () => {
  assert.ok(DEFAULT_NPCS.length >= 3);
  for (const npc of DEFAULT_NPCS) {
    assert.ok(npc.id.startsWith('npc_'));
    assert.ok(npc.name);
    assert.ok(npc.school);
    assert.ok(npc.pet, `${npc.id} must have a follower pet`);
    assert.ok(Array.isArray(npc.messages) && npc.messages.length > 0);
  }
});

test('Phu Tho procedural textures and character/pet art render flawlessly', async () => {
  class MockContext {
    fillStyle = ''; strokeStyle = ''; lineWidth = 1; lineCap = ''; lineJoin = '';
    beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {}
    fillRect() {} strokeRect() {} arc() {} ellipse() {} roundRect() {}
    clearRect() {} save() {} restore() {} translate() {} rotate() {} scale() {}
    drawImage() {}
  }
  global.document = {
    createElement: () => ({ width: 100, height: 100, getContext: () => new MockContext() })
  };

  const { buildAllTextures, drawCharacter, drawPet, CanvasGraphics, TEXTURES, PLATE_INFO } = await import('./art/index.js');
  const textures = buildAllTextures();
  assert.ok(Object.keys(textures).length >= 50, 'Must generate full set of procedural textures');
  assert.ok(textures['map-bg'], 'map-bg must be generated');
  assert.ok(textures['bld-grand'], 'bld-grand must be generated');
  assert.ok(textures['prop-gate'], 'prop-gate must be generated');
  assert.ok(PLATE_INFO['bld-grand'], 'PLATE_INFO for bld-grand must be present');

  const g = new CanvasGraphics(new MockContext());

  // Test character drawing across multiple configurations
  const testCases = [
    { avatar: { character: 'boy', hairStyle: 0, hairColor: 0, bagColor: 'blue', shoeColor: 'white' }, style: { shirt: '#8fd3ff', bottom: '#2f4b9b', accessory: 'none' }, dir: 'down', pose: 'idle' },
    { avatar: { character: 'girl', hairStyle: 2, hairColor: 1, bagColor: 'red', shoeColor: 'pink' }, style: { shirt: '#fff1a8', bottom: '#b3261e', accessory: 'leader' }, dir: 'side', pose: 'walk' },
    { avatar: { character: 'boy', hairStyle: 1, hairColor: 2, bagColor: 'green', shoeColor: 'black' }, style: { shirt: '#c9b27a', bottom: '#6b5b3a', accessory: 'explorer' }, dir: 'up', pose: 'cheer' },
  ];

  for (const tc of testCases) {
    drawCharacter(g, tc);
  }

  // Test all pets
  for (const pet of ['duck', 'dog', 'chicken', 'rabbit']) {
    drawPet(g, pet);
  }
});
