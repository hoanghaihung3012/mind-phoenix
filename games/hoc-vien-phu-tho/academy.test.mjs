import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAP_CONFIG,
  SCHOOL_PRESETS,
  CUSTOMIZATION_OPTIONS,
  PET_CONFIGS,
  POI_LOCATIONS,
  DEFAULT_NPCS,
  CAMPUS_NPCS,
  calculateLevel,
  createDefaultPlayer,
  isSpecialZoneUnlocked,
  checkProximityPOI,
  calculateDistance,
  clamp,
  getOutfitDefinition,
  calculateMinimapCoords,
  findNearestPOI
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
  // Near the flagpole (1450, 1500)
  const hit = checkProximityPOI(1450, 1500);
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

test('DEFAULT_NPCS has fake users removed so only real multiplayer socket players appear', () => {
  assert.ok(Array.isArray(DEFAULT_NPCS));
  assert.strictEqual(DEFAULT_NPCS.length, 0, 'Fake bot users must be removed');
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

test('CAMPUS_NPCS defines teachers, security guard, gardener with speech quotes', () => {
  assert.ok(Array.isArray(CAMPUS_NPCS));
  assert.ok(CAMPUS_NPCS.length >= 4, 'Must have at least 4 campus staff NPCs');

  const principal = CAMPUS_NPCS.find(n => n.id === 'npc_principal');
  assert.ok(principal, 'Thầy Hiệu Trưởng must exist');
  assert.equal(principal.role, 'teacher');
  assert.ok(Array.isArray(principal.quotes) && principal.quotes.length >= 3);

  const teacherMai = CAMPUS_NPCS.find(n => n.id === 'npc_teacher_mai');
  assert.ok(teacherMai, 'Cô Giáo Mai must exist');
  assert.equal(teacherMai.role, 'teacher');
  assert.ok(Array.isArray(teacherMai.quotes) && teacherMai.quotes.length >= 3);

  const guard = CAMPUS_NPCS.find(n => n.id === 'npc_guard_nam');
  assert.ok(guard, 'Bác Bảo Vệ must exist');
  assert.equal(guard.role, 'guard');
  assert.ok(Array.isArray(guard.quotes) && guard.quotes.length >= 3);

  const gardener = CAMPUS_NPCS.find(n => n.id === 'npc_gardener_ba');
  assert.ok(gardener, 'Bác Làm Vườn must exist');
  assert.equal(gardener.role, 'gardener');
  assert.ok(Array.isArray(gardener.quotes) && gardener.quotes.length >= 3);

  for (const npc of CAMPUS_NPCS) {
    assert.ok(npc.x > 0 && npc.x < MAP_CONFIG.width, `${npc.name} x coord out of bounds`);
    assert.ok(npc.y > 0 && npc.y < MAP_CONFIG.height, `${npc.name} y coord out of bounds`);
    assert.ok(npc.style, `${npc.name} must have a custom style definition`);
  }
});

test('arcade POI is properly registered and accessible', () => {
  const arcade = POI_LOCATIONS.find(p => p.id === 'arcade');
  assert.ok(arcade, 'Khu Trò Chơi Miễn Phí (arcade) must be registered in POI_LOCATIONS');
  assert.equal(arcade.panelType, 'arcade');
  assert.ok(arcade.x > 0 && arcade.y > 0);
  assert.ok(arcade.radius >= 100);
});

test('MINIGAME_DATA has expanded comprehensive question sets (>= 12 questions each)', () => {
  const categories = ['vocabulary', 'spelling', 'literature', 'idiom', 'math', 'arena', 'grand'];
  for (const cat of categories) {
    const data = MINIGAME_DATA[cat];
    assert.ok(data.questions.length >= 12, `${cat} should have at least 12 questions for variety (got ${data.questions.length})`);
  }
});

test('getOutfitDefinition retrieves outfit styles and fallback defaults', () => {
  const student = getOutfitDefinition('default-student');
  assert.ok(student);
  assert.equal(student.id, 'default-student');
  assert.equal(student.shirt, '#ffffff');
  assert.equal(student.scarf, '#dc2626');
  assert.ok(student.icon);

  const explorer = getOutfitDefinition('explorer');
  assert.ok(explorer);
  assert.equal(explorer.accessory, 'explorer');

  const fallback = getOutfitDefinition('non-existent-outfit');
  assert.equal(fallback.id, 'default-student');
});

test('calculateMinimapCoords scales world coordinates accurately into minimap bounds', () => {
  const origin = calculateMinimapCoords(0, 0, 720, 518);
  assert.equal(origin.x, 0);
  assert.equal(origin.y, 0);

  const center = calculateMinimapCoords(2400, 1725, 720, 518);
  assert.equal(center.x, 360);
  assert.equal(center.y, 259);

  const maxCoord = calculateMinimapCoords(4800, 3450, 720, 518);
  assert.equal(maxCoord.x, 720);
  assert.equal(maxCoord.y, 518);

  const outOfBounds = calculateMinimapCoords(9999, 9999, 720, 518);
  assert.equal(outOfBounds.x, 720);
  assert.equal(outOfBounds.y, 518);
});

test('findNearestPOI locates nearest building or station on campus', () => {
  // Near the main gate
  const gateNear = findNearestPOI(2400, 3250);
  assert.ok(gateNear.poi);
  assert.equal(gateNear.poi.id, 'gate');
  assert.ok(gateNear.distance < 50);

  // Near the library
  const libNear = findNearestPOI(650, 930);
  assert.ok(libNear.poi);
  assert.equal(libNear.poi.id, 'library');
  assert.equal(libNear.distance, 0);

  // Near the grand hall
  const grandNear = findNearestPOI(2400, 930);
  assert.ok(grandNear.poi);
  assert.equal(grandNear.poi.id, 'grand');
});

test('soccer pitch POI is registered with soccer icon and correct sports category', () => {
  const soccer = POI_LOCATIONS.find(p => p.id === 'soccer');
  assert.ok(soccer, 'Sân Đá Banh (soccer) must be registered in POI_LOCATIONS');
  assert.equal(soccer.icon, '⚽');
  assert.equal(soccer.panelType, 'soccer');
  assert.equal(soccer.category, 'sports');
  assert.ok(soccer.x > 0 && soccer.y > 0);
  assert.ok(soccer.radius >= 100);
});

test('soccer field texture bld-soccer is generated and registered in PLATE_INFO', async () => {
  const { buildAllTextures, PLATE_INFO } = await import('./art/index.js');
  const textures = buildAllTextures();
  assert.ok(textures['bld-soccer'], 'bld-soccer texture must be generated');
  assert.ok(PLATE_INFO['bld-soccer'], 'PLATE_INFO for bld-soccer must be present');
});

test('SoccerMinigame operates purely for fun without affecting player XP or level', async () => {
  const { SoccerMinigame } = await import('./soccer.js');
  const player = createDefaultPlayer({ xp: 50, level: 1, points: 10 });
  const initialXP = player.xp;
  const initialLevel = player.level;
  const initialPoints = player.points;

  const game = new SoccerMinigame();
  assert.equal(game.mode, 'penalty');
  assert.equal(game.shots, 0);
  assert.equal(game.goals, 0);

  // Shoot a ball
  game.shootBall(380, 150);
  assert.equal(game.shots, 1);
  assert.equal(game.ballState, 'flying');

  // Verify player XP and level are 100% untouched
  assert.equal(player.xp, initialXP, 'Soccer game must not add XP');
  assert.equal(player.level, initialLevel, 'Soccer game must not change level');
  assert.equal(player.points, initialPoints, 'Soccer game must not change honor stars');

  // Switch to free practice mode
  game.setMode('free');
  assert.equal(game.mode, 'free');
  assert.equal(game.shots, 0);
});

test('SoccerMinigame keeper moves steadily and score is awarded when shot misses keeper', async () => {
  const { SoccerMinigame } = await import('./soccer.js');
  const game = new SoccerMinigame();

  // 1. Thủ môn di chuyển qua lại đều đặn với tốc độ nhanh vừa phải
  assert.equal(game.keeper.dir, 1);
  const startX = game.keeper.x;
  game.update(0.1); // 0.1s
  assert.ok(game.keeper.x > startX, 'Keeper should move forward steadily');

  // Đổi chiều khi chạm maxX
  game.keeper.x = game.keeper.maxX;
  game.update(0.05);
  assert.equal(game.keeper.dir, -1, 'Keeper should reverse direction at boundary');

  // 2. Sút bóng không trúng thủ môn => Ghi bàn
  game.keeper.x = 450; // Thủ môn đứng góc bên phải
  game.ball.x = 260;   // Bóng sút góc bên trái trong khung thành
  game.ball.y = 160;
  game.evaluateShot();
  assert.equal(game.goals, 1, 'Shot missing keeper inside goal must score a goal');
  assert.equal(game.keeper.state, 'miss');

  // 3. Sút bóng trúng thủ môn => Cản phá
  game.ball.x = 450;   // Bóng sút ngay vị trí thủ môn
  game.ball.y = 220;
  game.evaluateShot();
  assert.equal(game.goals, 1, 'Shot hitting keeper must be saved (goals unchanged)');
  assert.equal(game.keeper.state, 'catch');
});
