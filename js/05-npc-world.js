// ============================================================
// 05-npc-world.js — NPC 資料 + 世界地圖註冊表 (WORLDS) + 場地技能
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

// 註冊至 WORLDS 物件 WORLDS.map5 = { name:'山莊山腳', tiles: MAP5, trainers: TRAINERS5 };
// 註冊至 WORLDS 物件 WORLDS.map4 = { name:'山莊山腳', tiles: MAP4, trainers: TRAINERS4 };
// =========================================================
// 🛠️ 改造區 J:非戰鬥NPC(交易/跨存檔交換/技能回憶/倉庫)🛠️
// kind:'tradeMonster' 是怪物商人(換金幣/經驗 或 換固定怪物)
// kind:'tradeCode' 是跨存檔密碼交換站(產生/輸入代碼)
// kind:'moveRecall' 是技能回憶師(把忘記的招式學回來)
// kind:'storage' 是倉庫管理員(從倉庫把怪物取出到隊伍——存入不用來這裡,在隊伍狀態畫面隨時可以做)
// mapId 指定這個NPC在哪一張地圖上
// =========================================================
const NPCS = [
  { id:'npc_trade', mapId:'map2', x:15, y:6, name:'怪物商人 老陳', color:'#e0a030', kind:'tradeMonster',
    offerSpecies:'65', offerLevel:10, offerColor:'#75592F' },
  { id:'npc_code',  mapId:'map2', x:19, y:7, name:'神秘旅人 阿凱', color:'#a030e0', kind:'tradeCode' },
  { id:'npc_recall', mapId:'map2', x:31, y:20, name:'技能回憶師 老魏', color:'#30c0a0', kind:'moveRecall' },
  { id:'npc_storage', mapId:'map2', x:5, y:13, name:'倉庫管理員 阿珍', color:'#5a8fd6', kind:'storage' },
  
  { id:'npc_trade', mapId:'map5', x:10, y:5, name:'怪物商人 老李', color:'#e0a030', kind:'tradeMonster',
    offerSpecies:'16', offerLevel:18, offerColor:'#452921' },
  { id:'npc_recall', mapId:'map5', x:12, y:5, name:'技能回憶師 志豪', color:'#30c0a0', kind:'moveRecall' },
  { id:'npc_code',  mapId:'map5', x:14, y:5, name:'神秘旅人 阿強', color:'#a030e0', kind:'tradeCode' },
  { id:'npc_storage', mapId:'map5', x:13, y:5, name:'倉庫管理員 阿寶', color:'#5a8fd6', kind:'storage' },
{ mapId: 'map16', x: 16, y: 2, kind: 'seaGodShrine', name: '黑暗盡頭', sprite: '🌊' // 故意用問號偽裝，暗示看不清楚
},
{ mapId: 'map10', 
x: 16, y: 3, // 這裡填入你打算放置聖壇的坐標
kind: 'fireGodShrine', 
name: '火神聖壇', 
color: '#e94560'
  },
  // ⚡ 雷暴聖殿主機關 (只有雨天才會出現)
  { mapId: 'map7', 
x: 5, y: 5,  // 這裡填入雷暴聖殿所在的坐標
kind: 'thunderGodShrine', 
name: '雷暴聖殿', 
color: '#ffcc00'
  },
  // 🌳 木神聖壇 (位於隱藏遺跡 map22)
  { mapId: 'map22', 
x: 4, y: 2, // 請依據 map22 實際的空地座標進行微調
kind: 'woodGodShrine', 
name: '枯萎聖壇', 
color: '#2e8b57'
  },
  // ⚙️ 虛空神機 (位於 map30 隱藏迷宮終點)
  { id:'boss_voidgear', 
mapId:'map30', 
x: 16, y: 10,
name:'虛空神機', 
color:'#E6E6FA', 
kind:'boss', 
species:'95', 
lvl: 50 
  },
  { id:'npc_storage_9', mapId:'map30', x:1, y:19, name:'倉庫管理員', color:'#5a8fd6', kind:'storage' },
  { id:'npc_originshrine', mapId:'map31', x:15, y:11, name:'始源祭壇', color:'#ffd700', kind:'originShrine' },
{ id:'npc_trade_1', mapId:'map2', x:15, y:6, name:'Mercader Diego', color:'#e0a030', kind:'tradeMonster', offerSpecies:'65', offerLevel:10, offerColor:'#75592F' }, // 西班牙文 (商人 迪亞哥)
  { id:'npc_trade_2', mapId:'map5', x:10, y:5, name:'Marchand Louis', color:'#e0a030', kind:'tradeMonster', offerSpecies:'16', offerLevel:12, offerColor:'#FEFFF2' }, // 法文 (商人 路易)

  // === ✈️ 神秘旅人 (Mystic Travelers) - 8 位散佈於各地 ===
  { id:'npc_code_1', mapId:'map2', x:19, y:7, name:'Viajero Mateo', color:'#a030e0', kind:'tradeCode' }, // 西班牙 (旅人 馬特奧)
  { id:'npc_code_2', mapId:'map5', x:14, y:5, name:'Msafiri Kofi', color:'#a030e0', kind:'tradeCode' }, // 斯瓦希里 (旅人 科菲)
  { id:'npc_code_3', mapId:'map4', x:18, y:12, name:'Strannik Ivan', color:'#a030e0', kind:'tradeCode' }, // 俄羅斯 (流浪者 伊凡)
  { id:'npc_code_4', mapId:'map6_1', x:16, y:18, name:'Fánaí Liam', color:'#a030e0', kind:'tradeCode' }, // 愛爾蘭 (流浪者 連恩)
  { id:'npc_code_5', mapId:'map8', x:12, y:10, name:'Rahal Amir', color:'#a030e0', kind:'tradeCode' }, // 阿拉伯 (遊牧民 阿米爾)
  { id:'npc_code_6', mapId:'map13', x:20, y:15, name:'Voyageur Leon', color:'#a030e0', kind:'tradeCode' }, // 法國 (旅人 里昂)
  { id:'npc_code_7', mapId:'map19', x:14, y:8, name:'Viaggiatore Luca', color:'#a030e0', kind:'tradeCode' }, // 義大利 (旅人 盧卡)
  { id:'npc_code_8', mapId:'map22', x:26, y:6, name:'Reiziger Bram', color:'#a030e0', kind:'tradeCode' }, // 荷蘭 (旅人 布拉姆)

  // === 📦 倉庫管理員 (Storage Managers) - 總共 8 位 ===
  { id:'npc_storage_1', mapId:'map2', x:3, y:9, name:'Wächter Hans', color:'#5a8fd6', kind:'storage' }, // 德國 (守衛 漢斯)
  { id:'npc_storage_2', mapId:'map1', x:14, y:5, name:'Custode Marco', color:'#5a8fd6', kind:'storage' }, // 義大利 (保管人 馬可)
  { id:'npc_storage_3', mapId:'map8', x:18, y:15, name:'Gardien Hugo', color:'#5a8fd6', kind:'storage' }, // 法國 (守衛 雨果)
  { id:'npc_storage_4', mapId:'map11', x:28, y:10, name:'Guardião Joao', color:'#5a8fd6', kind:'storage' }, // 葡萄牙/巴西 (守護者 若昂)
  { id:'npc_storage_5', mapId:'map14', x:14, y:14, name:'Fylakas Nikos', color:'#5a8fd6', kind:'storage' }, // 希臘 (守衛 尼克斯)
  { id:'npc_storage_6', mapId:'map17', x:10, y:10, name:'Bekci Can', color:'#5a8fd6', kind:'storage' }, // 土耳其 (看守者 詹)
  { id:'npc_storage_7', mapId:'map20', x:18, y:6, name:'Vartija Eero', color:'#5a8fd6', kind:'storage' }, // 芬蘭 (守衛 埃羅)
  { id:'npc_storage_8', mapId:'map24', x:10, y:15, name:'Stroz Jan', color:'#5a8fd6', kind:'storage' }, // 波蘭 (守衛 揚)
// === 🧠 多國語言：技能回憶師 (Move Recallers) ===
  // 1. 🇹🇭 泰國 (Thai) - Kru (老師) + Somchai (男名)
  { id:'npc_recall_th', mapId:'map11', x:20, y:15, name:'Kru Somchai', color:'#30c0a0', kind:'moveRecall' },
  // 2. 🇮🇳 印度 (Hindi) - Guru (導師) + Vikram (男名)
  { id:'npc_recall_in', mapId:'map4', x:12, y:8, name:'Guru Vikram', color:'#30c0a0', kind:'moveRecall' }, 
// 3. 🇧🇷 巴西/葡萄牙語 (Portuguese) - Mestre (大師) + Tiago (男名)
  { id:'npc_recall_br', mapId:'map7', x:14, y:12, name:'Mestre Tiago', color:'#30c0a0', kind:'moveRecall' },
    // 4. 🇸🇦 阿拉伯 (Arabic) - Ustad (大師/學者) + Tariq (男名)
  { id:'npc_recall_ar', mapId:'map9', x:22, y:10, name:'Ustad Tariq', color:'#30c0a0', kind:'moveRecall' },
    // 5. 🇰🇪 斯瓦希里語/東非 (Swahili) - Mwalimu (老師) + Jabari (男名)
  { id:'npc_recall_sw', mapId:'map10', x:15, y:18, name:'Mwalimu Jabari', color:'#30c0a0', kind:'moveRecall' },
    // 6. 🇹🇷 土耳其 (Turkish) - Ogretmen (老師) + Emre (男名)
  { id:'npc_recall_tr', mapId:'map12', x:25, y:6, name:'Ogretmen Emre', color:'#30c0a0', kind:'moveRecall' },
    // 7. 🇬🇷 希臘 (Greek) - Daskalos (老師) + Kostas (男名)
  { id:'npc_recall_gr', mapId:'map15', x:10, y:5, name:'Daskalos Kostas', color:'#30c0a0', kind:'moveRecall' },
    // 8. 🇷🇺 俄羅斯 (Russian) - Nastavnik (導師) + Pavel (男名)
  { id:'npc_recall_ru', mapId:'map18', x:16, y:12, name:'Nastavnik Pavel', color:'#30c0a0', kind:'moveRecall' },
    // 9. 🇳🇱 荷蘭 (Dutch) - Meister (大師) + Johan (男名)
  { id:'npc_recall_nl', mapId:'map21', x:8, y:14, name:'Meister Johan', color:'#30c0a0', kind:'moveRecall' },
    // 10. 🌺 夏威夷 (Hawaiian) - Kahuna (智者/祭司) + Kimo (男名)
  { id:'npc_recall_hw', mapId:'map23', x:28, y:15, name:'Kahuna Kimo', color:'#30c0a0', kind:'moveRecall' },
];
function npcAt(x,y){
  return NPCS.find(n=> n.mapId===GameState.player.mapId && n.x===x && n.y===y);
}

function trainerAt(x,y){ return TRAINERS.find(t=>t.x===x && t.y===y); }

// WORLDS:管理多張地圖,之後想再加地圖只要照格式在這裡新增一筆
const WORLDS = {
  map1: { name:'新手之路', tiles: MAP1, trainers: TRAINERS1,neighbors: {left:'map27' } },
  map2: { name:'幽暗森林', tiles: MAP2, trainers: TRAINERS2 },
  map3: { name:'地下洞窟', tiles: MAP3, trainers: TRAINERS3 },
  map4: { name:'洞窟北側', tiles: MAP4, trainers: TRAINERS4 },
  map5: { name:'山腳山莊', tiles: MAP5, trainers: TRAINERS5 },
  map6_1: { name:'雪山步道', tiles: MAP6_1, trainers: TRAINERS6_1 },
  map6_2: { name:'雪山北峰', tiles: MAP6_2, trainers: TRAINERS6_2 },
  map8: { name:'機械廣場', tiles: MAP8, trainers: TRAINERS7_1 },
  map7: { name:'雷暴聖殿', tiles: MAP7, trainers: TRAINERS7_2 },
  map9 :{ name: '中央廣場', tiles: MAP_PLAZA, trainers: TRAINERS_PLAZA },
  map10 : { name: '熾熱山谷', tiles: MAP10, trainers: TRAINERS10 },
  map11 : { name: '交界處', tiles: MAP11, trainers: TRAINERS11 },
  map12:{name:'閒適海灘',tiles:MAP12,neighbors: { down: 'map13' },trainers:TRAINERS12},
  map13: { name: '漩渦海峽', tiles: MAP13, trainers: TRAINERS13, neighbors: { up: 'map12', down: 'map14' , left:'map15'}},
  map14: { name: '珊瑚礁岩', tiles: MAP14, trainers: TRAINERS14, neighbors: { up: 'map13',left:'map16' }},
  map15: { name: '冰山海域', tiles: MAP15, trainers: TRAINERS15, neighbors: { down: 'map16'  ,right:'map13'}},
  map16: { name: '海神遺跡', tiles: MAP16, trainers: TRAINERS16, neighbors: { up: 'map15',right:'map14' } },
  map17: { name: '迷宮・北', tiles: MAP17, trainers: TRAINERS17 },
  map18: { name: '迷宮・東', tiles: MAP18, trainers: TRAINERS18 },
  map19: { name: '迷宮・西', tiles: MAP19, trainers: TRAINERS19 },
  map20: { name: '迷宮・南', tiles: MAP20, trainers: TRAINERS20 },
  map21: { name: '迷霧高地', tiles: MAP21, trainers: TRAINERS21 , neighbors: { down: 'map22'}},
  map22: { name: '隱藏遺跡', tiles: MAP22, trainers: TRAINERS22, neighbors: { up: 'map21',left:'map25'} },
  map23: { name: '草地・北', tiles: MAP23, trainers: TRAINERS23 , neighbors: { down: 'map24'}},
  map24: { name: '草地・南', tiles: MAP24, trainers: TRAINERS24, neighbors: { up: 'map23'} },
  map25:{name:'EXPRESSWAY 0K',tiles:MAP25,trainers:TRAINERS25,neighbors:{up:'map26'}},
  map26:{name:'EXPRESSWAY 10K',tiles:MAP26,trainers:TRAINERS26,neighbors:{up:'map27',down:'map25'}},
  map27:{name:'EXPRESSWAY 20K',tiles:MAP27,trainers:TRAINERS27,neighbors:{up:'map28',down:'map26'}},
  map28:{name:'EXPRESSWAY 30K',tiles:MAP28,trainers:TRAINERS28,neighbors:{up:'map29',down:'map27'}},
  map29:{name:'EXPRESSWAY 40K',tiles:MAP29,trainers:TRAINERS29,neighbors:{up:'map30',down:'map28'}},
  map30:{name:'寧靜島',tiles:MAP30,trainers:TRAINERS30,neighbors:{down:'map29'}},
  map31:{name:'天蜀之地',tiles:MAP31,trainers:TRAINERS31},
};
let MAP = WORLDS[GameState.player.mapId].tiles;
let TRAINERS = WORLDS[GameState.player.mapId].trainers;
let MAP_W = MAP[0].length, MAP_H = MAP.length;
const tileColors = { 
  0:'#8b7355', 1:'#2d5a2d', 2:'#1a3d1a', 3:'#1f4e8c', 4:'#e8b4c8', 
  5:'#5ad1ff', 6:'#ffb85a', 7:'#e0c454', 8:'#1a1a2e', 9:'#0d3d6b', 
  10:'#5a2a1a', 11:'#4a4a1a', 12:'#6a5a4a', 13:'rgba(200, 200, 200, 0.8)', 
  14:'#a8d8ff', 15:'#330033', // 15 是隱藏小徑的深紫色
  
 16:'#8b6508', 17:'#2e8b57', 18:'#483d3d', 19:'#191970', 20:'#6b8e23', 
 21:'#4169e1', 22:'#8b0000', 23:'#006400', 24:'#bc8f8f', 25:'#4682b4', 
 26:'#cd853f', 27:'#20b2aa', 28:'#9acd32', 29:'#48d1cc', 30:'#d2b48c', 
 31:'#008b8b', 32:'#deb887', 33:'#008080', 34:'#f4a460', 35:'#66cdaa', 
 36:'#daa520', 37:'#3cb371', 38:'#b8860b', 39:'#2e8b57', 40:'#cd6600',  
 45:'#6b8e23', 46:'#ffd700', 47:'#9acd32', 48:'#ffff00', 49:'#00ff00', 
 50:'#adff2f', 51:'#00fa9a', 52:'#7fff00', 53:'#00ff7f', 54:'#7fffd4', 
 55:'#40e0d0', 56:'#48d1cc', 57:'#00ffff', 58:'#00ced1', 59:'#1e90ff', 60:'#0000ff',
 66:'#006400', 67:'#ff8c00', 68:'#556b2f', 69:'#ffa500',
  // 41 ~ 44：自動輸送帶
  41:'#2c3e50', 42:'#2c3e50', 43:'#2c3e50', 44:'#2c3e50',
  
  
  // 🌸 61 ~ 65：大草原花朵系列
  61:'#e74c3c', // 紅花
  62:'#f1c40f', // 黃花
  63:'#3498db', // 藍花
  64:'#9b59b6', // 紫花
  65:'#ecf0f1'  // 白花
};
// =========================================================
// 🛠️ 改造區 H:非戰鬥技能(場地技能)🛠️
// 隊伍裡只要「有一隻」對應屬性的怪物(不用是先發、不用活著)就能通過對應地形。
// 這裡先建立系統與資料,尚未實際放到地圖上——地圖數字要對應到下面
// FIELD_TILES 的 key,才會套用這個地形的規則。
// water(衝浪)比較特殊:淺水(既有的3)和深水(9)都要水屬性才能過,
// 差別只在深水會有機率遇怪、淺水不會。wind(疾風)也比較特殊,
// 不是「通過地形」,而是主動按鍵瞬間移動到最近的怪物中心。
// =========================================================
const FIELD_TILES = {
  9:  { type:'water',   name:'深水潭',   desc:'水屬性可以衝浪通過,但可能遇到水中的野生怪物', encounter:0.16 },
  10: { type:'fire',    name:'焚燒林',   desc:'火屬性可以燒出一條路' },
  11: { type:'thunder', name:'充能閘門', desc:'雷屬性可以讓機關通電啟動' },
  12: { type:'earth',   name:'巨石路障', desc:'地屬性可以推開擋路的巨石' },
  13: { type:'light',   name:'濃霧',     desc:'光屬性可以驅散迷霧' },
  14: { type:'ice',     name:'薄冰水面', desc:'冰屬性可以凍結水面連接道路' },
  15: { type:'dark',    name:'隱藏小徑', desc:'暗屬性可以看見並走上隱藏的道路' },
};
const FIELD_SKILL_NAME = {
  water:'衝浪', fire:'燃燒', thunder:'充電', earth:'怪力', wind:'疾風', light:'淨化', ice:'冰凍', dark:'透視',
};

function partyHasType(t){
  return party.some(m => MonsterUtil.species(m).type === t);
}

function switchMap(targetId, entryX, entryY){
  GameState.player.mapId = targetId;
  visitedMaps.add(targetId);
  MAP = WORLDS[targetId].tiles;
  TRAINERS = WORLDS[targetId].trainers || []; 
  MAP_W = MAP[0].length; 
  MAP_H = MAP.length;
  player.x = entryX; 
  player.y = entryY;

  // 👁️ 迷霧提示
  if (targetId === 'map2' || targetId === 'map21') {
      if (partyHasType('light')) {
          toast('✨ 光屬性怪獸照亮了前方的濃霧！');
      } else {
          toast('🌫️ 這裡起大霧了，視線非常模糊...');
      }
  }

  // 👇 這邊只要留一組就好了，把重複的刪掉！
  drawMap();  
  document.getElementById('hudPos').textContent = `位置: (${player.x}, ${player.y}) ・ ${WORLDS[targetId].name}`;
  toast(`✦ 進入了「${WORLDS[targetId].name}」`);
}
const mapCanvas = document.getElementById('mapCanvas');
const mctx = mapCanvas.getContext('2d');
let player = GameState.player;
const playerColors = { body:'#e94560', hair:'#2b2b2b' };

let animTime = 0;
// 各地圖的專屬色系(沒列出的地形沿用 tileColors 的預設顏色)
const MAP_THEMES = {
  map3: { 0:'#4a4a52', 1:'#3a3228', 2:'#232329' }, // 洞窟:灰石地板、暗礦脈遇怪區、深色岩壁
  map4: { 0:'#4a4a52', 1:'#3a3228', 2:'#232329' }, 
  map5:{ 0:'#edfafa', 1:'#d7e0e0', 2:'#618AAA'},
  map6_1: { 0:'#edfafa', 1:'#d7e0e0', 2:'#618AAA',3:'#000000' }, 
  map6_2: { 0:'#edfafa', 1:'#d7e0e0', 2:'#618AAA' },
  map9:{2:'#8F4D22',1: '#b84328',0:'#8F4F22' }, 
  map10 :{ 0: '#4a2e2b', 1: '#b84328', 2: '#261412' }, // 0:焦紅土路, 1:火紅草地/熔岩植物, 2:深黑火山岩壁
  map7_1: { 0:'#5a6978', 1:'#3b4958', 2:'#222b35' },
  map7_2: { 0:'#5a6978', 1:'#3b4958', 2:'#222b35' },
  map12:{2:'#D6D4D4',9:'#6494C4'},
  map13:{2:'#D6D4D4',9:'#6494C4'},
  map14:{2:'#D6D4D4',9:'#6494C4'},
  map15:{ 0:'#a8c4d8', 1:'#e2f1f8', 2:'#4b6d85' },
  map16:{ 0:'#a8c4d8', 1:'#e2f1f8', 2:'#4b6d85' },
  map17: { 0:'#384536', 1:'#2c5438', 2:'#18291a' },
  map18: { 0:'#d2b48c', 1:'#bc9a68', 2:'#7a623e' },
  map7:{ 0:'#5a6978', 1:'#3b4958', 2:'#B59C18' },
  map8:{ 0:'#5a6978', 1:'#3b4958', 2:'#E8C91E' },
  map30: { 0:'#1a1a2e', 1:'#16213e', 2:'#0f1530' },
  map31: { 0:'#1a1a2e', 1:'#16213e', 2:'#0f1530' },
  map21: { 0:'#3d3846', 1:'#2a2135', 2:'#1a1524' },
  map22: { 0:'#3d3846', 1:'#2a2135', 2:'#1a1524' },
  map23:{0:'#91C492'},
  map24:{0:'#91C492'},
};
function tileBaseColor(t){
  const theme = MAP_THEMES[GameState.player.mapId];
  return (theme && theme[t]!==undefined) ? theme[t] : tileColors[t];
}

function drawMap(){
  mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  const isCave = GameState.player.mapId === 'map3';
  
  for(let y = 0; y < MAP_H; y++){
    for(let x = 0; x < MAP_W; x++){
        let t = MAP[y][x]; // 把 const 改成 let，讓我們可以變魔術

        // 🦇 暗屬性隱藏小徑邏輯：如果是 15，但沒帶暗屬性怪獸，就把它偽裝成牆壁 (2)
        if (t===15 && !partyHasType('dark')) {
            t = 2; 
        }
        if (t===68) {
            const ch10Unlocked = QUESTS.filter(q => q.chapter === 10).every(q => q.check());
            if (!ch10Unlocked) {
                t = 2; // 任務未完成前，強行把畫面偽裝成牆壁 (2)
            }
        }
      mctx.fillStyle = tileBaseColor(t);
      mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      
// 🌸 花朵處理：如果是 61~65 的花朵，底層地形視為草地 (1)
      let baseT = (t >= 61 && t <= 65) ? 1 : t;

      // 1. 畫出地形的底色
      mctx.fillStyle = tileBaseColor(baseT);
      mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      
      // 2. 草地的層次與葉片點綴 (花朵也會有這個底)
      if(baseT===1 && isCave){
        const shade = (x*31 + y*17) % 5;
        mctx.fillStyle = shade < 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.18)';
        mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        mctx.fillStyle = 'rgba(180,220,255,0.4)';
        mctx.beginPath(); mctx.arc(x * TILE + 6, y * TILE + 7, 1.4, 0, Math.PI * 2); mctx.fill();
        mctx.beginPath(); mctx.arc(x * TILE + TILE - 7, y * TILE + TILE - 6, 1.4, 0, Math.PI * 2); mctx.fill();
      } else if(baseT === 1){
        const shade = (x*31 + y*17) % 5;
        mctx.fillStyle = shade < 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
        mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        mctx.fillStyle = 'rgba(255,255,255,0.08)';
        mctx.fillRect(x * TILE + 3, y * TILE + 3, 3, TILE - 6);
        mctx.fillRect(x * TILE + TILE - 7, y * TILE + 5, 3, TILE - 8);
      }
      
      // 🌸 3. 在草地上疊加花朵圖案！
      if (t >= 61 && t <= 65) {
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        
        // 花瓣顏色
        mctx.fillStyle = tileColors[t];
        
        // 畫 4 片圓形花瓣
        mctx.beginPath();
        mctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2); // 左上
        mctx.arc(cx + 3, cy - 3, 2.5, 0, Math.PI * 2); // 右上
        mctx.arc(cx - 3, cy + 3, 2.5, 0, Math.PI * 2); // 左下
        mctx.arc(cx + 3, cy + 3, 2.5, 0, Math.PI * 2); // 右下
        mctx.fill();
        
        // 花蕊 (黃花配白心，其他配黃心)
        mctx.fillStyle = (t === 62) ? '#ffffff' : '#f1c40f';
        mctx.beginPath();
        mctx.arc(cx, cy, 2, 0, Math.PI * 2);
        mctx.fill();
      }
            if(t === 2 && isCave){
        // 洞窟岩壁:不規則岩塊剪影,取代樹木圓形
        mctx.fillStyle = 'rgba(0,0,0,0.3)';
        mctx.beginPath();
        mctx.moveTo(x * TILE + 3, y * TILE + TILE - 2);
        mctx.lineTo(x * TILE + 8, y * TILE + 4);
        mctx.lineTo(x * TILE + TILE - 4, y * TILE + 9);
        mctx.lineTo(x * TILE + TILE - 3, y * TILE + TILE - 3);
        mctx.closePath(); mctx.fill();
        mctx.strokeStyle = 'rgba(255,255,255,0.07)';
        mctx.lineWidth = 1;
        mctx.beginPath(); mctx.moveTo(x * TILE + 2, y * TILE + TILE / 2); mctx.lineTo(x * TILE + TILE - 2, y * TILE + TILE / 2 - 3); mctx.stroke();
      } else if(t === 2){
        mctx.fillStyle = '#0d260d';
        mctx.beginPath(); mctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE / 2 - 2, 0, Math.PI * 2); mctx.fill();
        mctx.fillStyle = 'rgba(255,255,255,0.10)';
        mctx.beginPath(); mctx.arc(x * TILE + TILE / 2 - 3, y * TILE + TILE / 2 - 3, TILE / 2 - 8, 0, Math.PI * 2); mctx.fill();
      }
      
      if(t === 3){
        // 流動的水波紋(隨 animTime 位移的斜向亮帶)
        mctx.save();
        mctx.beginPath(); mctx.rect(x * TILE, y * TILE, TILE, TILE); mctx.clip();
        mctx.strokeStyle = 'rgba(255,255,255,0.22)';
        mctx.lineWidth = 3;
        const off = (animTime * 0.5) % 20;
        for(let k = -1; k < 3; k++){
          mctx.beginPath();
          mctx.moveTo(x * TILE - TILE + k * 20 + off, y * TILE + TILE);
          mctx.lineTo(x * TILE + k * 20 + off, y * TILE);
          mctx.stroke();
        }
        mctx.restore();
      }
      
      if(t === 4){
        mctx.fillStyle = '#e94560';
        mctx.fillRect(x * TILE + TILE / 2 - 2, y * TILE + 4, 4, TILE - 8);
        mctx.fillRect(x * TILE + 4, y * TILE + TILE / 2 - 2, TILE - 8, 4);
      }
      
      if(t === 5 || t === 6 || (t >= 16 && t <= 40) ||(t >= 45 && t <= 54)){
        mctx.strokeStyle = 'rgba(255,255,255,0.85)';
        mctx.lineWidth = 2;
        const spin = (animTime * 0.1) % (Math.PI * 2);
        mctx.beginPath();
        mctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE / 2 - 4, spin, spin + Math.PI * 1.5);
        mctx.stroke();
      }
      
      if(t === 3){
        if(!partyHasType('water')){
          mctx.fillStyle = 'rgba(0,0,0,0.28)';
          mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
      
      if(t === 9){
        mctx.save();
        mctx.beginPath(); mctx.rect(x * TILE, y * TILE, TILE, TILE); mctx.clip();
        mctx.strokeStyle = 'rgba(15, 11, 126, 0.87)';
        mctx.lineWidth = 3;
        const off9 = (animTime * 0.8) % 20;
        for(let k = -1; k < 3; k++){
          mctx.beginPath();
          mctx.moveTo(x * TILE - TILE + k * 20 + off9, y * TILE + TILE);
          mctx.lineTo(x * TILE + k * 20 + off9, y * TILE);
          mctx.stroke();
        }
        mctx.restore();
        if(!partyHasType('water')){
          mctx.fillStyle = 'rgba(0,0,0,0.28)';
          mctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
  // 👇 這邊原本是畫你的 NPC 和玩家的程式碼
  // 假設你原本是呼叫 drawNPCs() 和 drawPlayer()，請把它們加在這裡：
  // (因為你貼上來的只有畫地形的迴圈，我怕覆蓋掉你原本畫玩家的邏輯，請務必把畫玩家跟 NPC 留著喔！)
  // ===============================================
  // 🌟 最後一步：蓋上迷霧遮罩！
  // 這樣迷霧就會覆蓋在地形、NPC 跟玩家之上，只留下玩家周圍的柔邊洞
  // ===============================================
        if(t>=41 && t<=54){
        // 畫底色 (深灰色金屬感)
        mctx.fillStyle = '#2c3e50';
        mctx.fillRect(x*TILE, y*TILE, TILE, TILE);
        
        // 畫亮黃色的箭頭，並利用 animTime 產生推播的動態效果
        mctx.fillStyle = '#f1c40f';
        mctx.textAlign = 'center';
        mctx.font = '14px monospace';
        
        // 根據 animTime 產生些微位移
        const offset = (animTime * 0.8) % 4 - 2; 
        
        let arrow = '';
        let ax = x*TILE + TILE/2;
        let ay = y*TILE + TILE/2 + 4;
        
        if(t===41) { arrow = '▲'; ay -= offset; }
        if(t===42) { arrow = '▼'; ay += offset; }
        if(t===43) { arrow = '◀'; ax -= offset; }
        if(t===44) { arrow = '▶'; ax += offset; }
        
        mctx.fillText(arrow, ax, ay);
      }
      if(FIELD_TILES[t]){
        const f = FIELD_TILES[t];
        const unlocked = partyHasType(f.type);
        mctx.strokeStyle = unlocked ? ELEMENT_META[f.type].color : '#555566';
        mctx.lineWidth = 2;
        mctx.strokeRect(x*TILE+3, y*TILE+3, TILE-6, TILE-6);
        mctx.fillStyle = unlocked ? ELEMENT_META[f.type].color : '#8888aa';
        mctx.font='10px monospace'; mctx.textAlign='center';
        mctx.fillText(unlocked?'✓':'✕', x*TILE+TILE/2, y*TILE+TILE/2+3);
      }
      if(t===7){
        mctx.fillStyle = '#7a5c1a';
        mctx.beginPath(); mctx.moveTo(x*TILE+2,y*TILE+TILE/2); mctx.lineTo(x*TILE+TILE/2,y*TILE+3); mctx.lineTo(x*TILE+TILE-2,y*TILE+TILE/2); mctx.closePath(); mctx.fill();
        mctx.fillStyle = '#fff3c9';
        mctx.fillRect(x*TILE+4, y*TILE+TILE/2, TILE-8, TILE/2-4);
      }
      if(t===8){
const requiredLegendaries = ['90', '91', '92', '93', '95', '96'];
        const unlocked = requiredLegendaries.every(id => dex.has(id));
        mctx.fillStyle = unlocked ? '#3a2a5a' : '#1a1a2e';
        mctx.fillRect(x*TILE, y*TILE, TILE, TILE);
        mctx.strokeStyle = unlocked ? '#ffd700' : '#665577';
        mctx.lineWidth = 2;
        mctx.strokeRect(x*TILE+3, y*TILE+3, TILE-6, TILE-6);
        mctx.fillStyle = unlocked ? '#ffd700' : '#887799';
        mctx.font='11px monospace'; mctx.textAlign='center';
        mctx.fillText(unlocked?'✦':'🔒', x*TILE+TILE/2, y*TILE+TILE/2+4);
      }
      if(t===68){
        mctx.fillStyle = '#3a2a5a'; 
        mctx.fillRect(x*TILE, y*TILE, TILE, TILE);
        mctx.strokeStyle = '#e94560'; // 紅色警示邊框
        mctx.lineWidth = 2;
        mctx.strokeRect(x*TILE+3, y*TILE+3, TILE-6, TILE-6);
        mctx.fillStyle = '#e94560';
        mctx.font='11px monospace'; mctx.textAlign='center';
        //mctx.fillText('🏆', x*TILE+TILE/2, y*TILE+TILE/2+4); // 解鎖後顯示王冠圖示
      }
    }
  }
  TRAINERS.forEach(t=>{
    const px=t.x*TILE, py=t.y*TILE;
    mctx.fillStyle = t.color;
    mctx.beginPath(); mctx.roundRect(px+3,py+3,TILE-6,TILE-6,4); mctx.fill();
    mctx.fillStyle = '#fff';
    mctx.font='9px monospace'; mctx.textAlign='center';
    mctx.fillText('!', px+TILE/2, py+TILE/2+3);
    if(!trainersDefeated.has(t.id)){
      // 還沒交手過的訓練家:右上角加一顆閃爍的黃色提示點
      const pulse = 0.6 + 0.4*Math.sin(animTime*0.15);
      mctx.fillStyle = `rgba(255,214,0,${pulse})`;
      mctx.beginPath(); mctx.arc(px+TILE-4, py+4, 3.5, 0, Math.PI*2); mctx.fill();
      mctx.strokeStyle = '#1a1a2e'; mctx.lineWidth = 1; mctx.stroke();
    }
  });
NPCS.filter(n => n.mapId === GameState.player.mapId).forEach(n => {
    // 🌟 海神聖壇 與 雷暴聖殿 的雨天隱形判定
    if ((n.kind === 'seaGodShrine' && !trainersDefeated.has('boss_seagod')) || 
        (n.kind === 'thunderGodShrine' && !trainersDefeated.has('boss_thundergod'))) {
        if (WeatherManager.getOverworldWeather(GameState.player.mapId) !== 'rain') {
            return; // 直接跳過，達成非雨天隱形的效果
        }
    }

    const px = n.x * TILE, py = n.y * TILE;
    
    mctx.fillStyle = n.color || '#1e3a8a'; 
    mctx.beginPath(); mctx.arc(px + TILE / 2, py + TILE / 2, TILE / 2 - 3, 0, Math.PI * 2); mctx.fill();
    mctx.strokeStyle = '#1a1a2e'; mctx.lineWidth = 2; mctx.stroke();
    mctx.fillStyle = '#fff';
    mctx.font = '9px monospace'; mctx.textAlign = 'center';
    
// 🌟 加入神獸專屬圖示
    const npcIcon = n.kind === 'boss' ? '⚛' : 
                    (n.kind === 'tradeCode' ? '⇄' : 
                    (n.kind === 'moveRecall' ? '★' : 
                    (n.kind === 'storage' ? '📦' : 
                    (n.kind === 'seaGodShrine' ? '?' : 
                    (n.kind === 'fireGodShrine' ? '🔥' : 
                    (n.kind === 'thunderGodShrine' ? '⚡' : 
                    (n.kind === 'iceGodShrine' ? '🧊' : 
                    (n.kind === 'woodGodShrine' ? '🌳' : '$'))))))))                    
    mctx.fillText(npcIcon, px + TILE / 2, py + TILE / 2 + 3);
  });
    // ... (前面畫玩家跟 NPC 的程式碼) end...
  const px = player.x*TILE, py = player.y*TILE;
  mctx.fillStyle = playerColors.body;
  mctx.beginPath(); mctx.roundRect(px+4, py+4, TILE-8, TILE-8, 4); mctx.fill();
  mctx.fillStyle = playerColors.hair;
  mctx.fillRect(px+5, py+3, TILE-10, 5);

  if (typeof VisionManager !== 'undefined') {
      VisionManager.drawFog(mctx, TILE);
  }

  // 👇 🌟 將天氣特效移進來這裡！確保每次畫地圖時一定會連天氣一起畫！
  const owWeatherId = WeatherManager.getOverworldWeather(GameState.player.mapId);
  if (owWeatherId) {
    mctx.save();
    
      if (owWeatherId === 'fog') {
        const fogAlpha = 0.3 + Math.sin(animTime * 0.1) * 0.1;
        mctx.fillStyle = `rgba(200, 200, 220, ${fogAlpha})`;
        mctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
      } 
    else if (owWeatherId === 'snow') {
      mctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 37 + Math.sin(animTime * 0.05 + i) * 20) % mapCanvas.width;
        const y = ((i * 53 + animTime * 3) % mapCanvas.height);
        mctx.beginPath();
        mctx.arc(Math.abs(x), Math.abs(y), (i % 3) + 1, 0, Math.PI * 2);
        mctx.fill();
      }
    }
    else if (owWeatherId === 'rain') {
      mctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
      mctx.lineWidth = 1.5;
      for (let i = 0; i < 50; i++) {
        const x = (i * 29 - animTime * 5) % (mapCanvas.width + 100);
        const y = ((i * 41 + animTime * 15) % mapCanvas.height);
        mctx.beginPath();
        mctx.moveTo(Math.abs(x), Math.abs(y));
        mctx.lineTo(Math.abs(x) - 10, Math.abs(y) + 20);
        mctx.stroke();
      }
    }
    else if (owWeatherId === 'sandstorm') {
      mctx.fillStyle = 'rgba(210, 180, 140, 0.6)'; // 黃沙色
      for (let i = 0; i < 60; i++) {
        const x = ((i * 47 - animTime * 12) % mapCanvas.width + mapCanvas.width) % mapCanvas.width;
        const y = ((i * 31 + animTime * 2) % mapCanvas.height);
        mctx.fillRect(x, y, (i % 4) + 2, 2);
      }
    }
    
    mctx.restore();
  }
} // 這是 drawMap() 函式end
// // 注意:這裡故意不在載入時就呼叫 drawMap(),因為畫地圖時會用到
// QUESTS(封印之門要不要顯示解鎖)等後面才宣告的資料,太早呼叫會讓整個
// <script> 因為錯誤而中斷執行。真正開始畫地圖的時機是:選好初始怪物、
// 讀取存檔、或匯入存檔的時候(見 匯入 / 起始怪物選擇 相關程式碼)。

// ==========================================
// ⏳ 全域動畫定時器
// ==========================================
setInterval(()=>{
  animTime++;

  if(started && !inBattle && !overlayOpen && !typeChartOpen){
      // 天氣特效已經移到 drawMap 裡面了，所以這裡只要呼叫 drawMap 就好！
      drawMap(); 
  }
}, 50); // (後面的延遲時間毫秒數如果有設定的話保留你的設定即可)

function isWalkable(x,y){
  if(x<0||y<0||x>=MAP_W||y>=MAP_H) return false;
  const t = MAP[y][x];
if(t===8) {
      const requiredLegendaries = ['90', '91', '92', '93', '95', '96'];
      return requiredLegendaries.every(id => dex.has(id));
  }
    if(t===68) return QUESTS.filter(q => q.chapter === 10).every(q => q.check());

  if(t===3) return partyHasType('water'); // 淺水:目前既有的水,需要水屬性衝浪,但不會遇怪
  if(FIELD_TILES[t]) return partyHasType(FIELD_TILES[t].type);
if(t>=41 && t<=44) return true;
  
  return t!==2
}

let inBattle=false, started=false, overlayOpen=null; // 'status' | 'dex' | null
let typeChartOpen=false;

let toastTimer=null;
function toast(msg, duration=2200){
  const el=document.getElementById('toast');
  el.textContent=msg; el.style.opacity='1';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=> el.style.opacity='0', duration);
}

// ---------- 鍵盤焦點導覽(WASD 選取 + F 確認) ----------
// 用於戰鬥選單與隊伍狀態畫面:setFocusList() 註冊目前可選的按鈕陣列,
// moveFocus() 依方向移動高亮,activateFocus() 觸發目前高亮的按鈕。
let focusList = [];
let focusCols = 1;
let focusIdx = 0;
// 🌟 加入 defaultIdx 參數來記憶上次位置
function setFocusList(elements, cols, defaultIdx = 0){
  focusList = elements.filter(el=>el && !el.disabled);
  focusCols = cols||1;
  // 確保記憶的索引不會超出目前的按鈕數量
  focusIdx = Math.min(defaultIdx, Math.max(0, focusList.length - 1));
  updateFocusVisual();
}
function updateFocusVisual(){
  focusList.forEach((el,i)=> el.classList.toggle('kbFocus', i===focusIdx));
}
function moveFocus(dx,dy){
  if(focusList.length===0) return;
  const cols = focusCols;
  const rows = Math.ceil(focusList.length/cols);
  let row = Math.floor(focusIdx/cols), col = focusIdx%cols;
  row = (row+dy+rows)%rows;
  col = (col+dx+cols)%cols;
  let newIdx = row*cols+col;
  if(newIdx>=focusList.length) newIdx = focusList.length-1;
  focusIdx = newIdx;
  updateFocusVisual();
}
function activateFocus(){
  if(focusList[focusIdx]) focusList[focusIdx].click();
}

// ---------- 屬性剋制圖 (按 N,任何時候都能看) ----------
function toggleTypeChart(){
  typeChartOpen = !typeChartOpen;
  document.getElementById('typeChartOverlay').style.display = typeChartOpen ? 'flex':'none';
  if(typeChartOpen) renderTypeChart();
}
function renderTypeChart(){
  const c = document.getElementById('typeChartCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  const cx=170, cy=140, r=95;
  const pts = CYCLE.map((el,i)=>{
    const a = -Math.PI/2 + i*(2*Math.PI/7);
    return { el, x:cx+Math.cos(a)*r, y:cy+Math.sin(a)*r };
  });
  // 剋制箭頭(每個元素剋制下一個)
  for(let i=0;i<7;i++){
    const a = pts[i], b = pts[(i+1)%7];
    const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
    const ux=dx/len, uy=dy/len;
    const startX=a.x+ux*26, startY=a.y+uy*26;
    const endX=b.x-ux*26, endY=b.y-uy*26;
    ctx.strokeStyle='rgba(224,178,90,0.75)';
    ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(startX,startY); ctx.lineTo(endX,endY); ctx.stroke();
    const ang = Math.atan2(endY-startY, endX-startX);
    ctx.fillStyle='rgba(224,178,90,0.9)';
    ctx.beginPath();
    ctx.moveTo(endX,endY);
    ctx.lineTo(endX-8*Math.cos(ang-0.4), endY-8*Math.sin(ang-0.4));
    ctx.lineTo(endX-8*Math.cos(ang+0.4), endY-8*Math.sin(ang+0.4));
    ctx.closePath(); ctx.fill();
  }
  // 元素節點
  pts.forEach(p=>{
    ctx.fillStyle = ELEMENT_META[p.el].color;
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(p.x,p.y,20,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#111'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(ELEMENT_META[p.el].name, p.x, p.y);
  });
  // 光暗(左右兩側) + 無(中心)
  const lightPt={x:cx-r-45,y:cy}, darkPt={x:cx+r+45,y:cy};
  [ {pt:lightPt, el:'light'}, {pt:darkPt, el:'dark'} ].forEach(o=>{
    ctx.fillStyle = ELEMENT_META[o.el].color;
    ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(o.pt.x,o.pt.y,20,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#111'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(ELEMENT_META[o.el].name, o.pt.x, o.pt.y);
  });
  ctx.strokeStyle='rgba(138,92,255,0.75)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(lightPt.x+20,lightPt.y); ctx.lineTo(darkPt.x-20,darkPt.y); ctx.stroke();
  ctx.fillStyle=ELEMENT_META.none.color; ctx.strokeStyle='#1a1a2e';
  ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#111'; ctx.font='bold 12px monospace';
  ctx.fillText(ELEMENT_META.none.name, cx, cy);
}

document.addEventListener('keydown', (e)=>{
  if(!started) return;
  const k = e.key;

  if(isSaving){ e.preventDefault(); return; } // 存檔中:封鎖所有操作,等存檔完成
  if(k==='r'||k==='R'){
    if(inBattle) return;
    debugNoEncounters = !debugNoEncounters;
    toast(debugNoEncounters ? '🛠️ 測試模式：已關閉隨機遇敵！' : '🛠️ 測試模式：已恢復正常遇敵！');
    e.preventDefault(); return;
  }
  // N 鍵:任何時候都能開關屬性圖(包含戰鬥中)
  if(k==='n'||k==='N'){ toggleTypeChart(); e.preventDefault(); return; }
  if(typeChartOpen){
    if(k==='Escape' || k==='Esc'){ toggleTypeChart(); }
    return; // 屬性圖開著時,其他按鍵先不處理
  }

  if(k==='b'||k==='B'){
    if(inBattle) return;
    toggleOverlay('status'); e.preventDefault(); return;
  }
  if(k==='c'||k==='C'){
    if(inBattle) return;
    toggleOverlay('dex'); e.preventDefault(); return;
  }
  if(k==='q'||k==='Q'){
    if(inBattle) return;
    toggleOverlay('quest'); e.preventDefault(); return;
  }
  if(k==='e'||k==='E'){
    if(inBattle) return;
    toggleOverlay('bag'); e.preventDefault(); return;
  }
  if(k==='t'||k==='T'){
    useTeleport(); e.preventDefault(); return;
  }
  if(k==='v'||k==='V'){
    if(inBattle) return;
    openHelpScreen(); e.preventDefault(); return;
  }
  if(k==='m'||k==='M'){
    if(inBattle){ toast('戰鬥中無法手動存檔'); e.preventDefault(); return; }
    toast('💾 手動存檔中…');
    SaveManager.save(true);
    e.preventDefault(); return;
  }
// 👇 🌟 加入 G 鍵切換跑步
  if(k==='g'||k==='G'){
    toggleRun();
    e.preventDefault(); return;
  }
  // 👇 🌟 這裡是被替換的新版 ESC 邏輯 (支援戰鬥中返回選單)
  if(k==='Escape' || k==='Esc'){ 
      if (inBattle) {
          const moveListObj = document.getElementById('moveList');
          const swapListObj = document.getElementById('swapList');
          if ((moveListObj && moveListObj.style.display !== 'none') || 
              (swapListObj && swapListObj.style.display !== 'none')) {
              showBattleControls();
              e.preventDefault();
              return;
          }
      }
      closeOverlays(); 
      return; 
  }

  if(['w','W','ArrowUp'].includes(k)){ handleDirectionInput(0,-1); e.preventDefault(); return; }
  if(['s','S','ArrowDown'].includes(k)){ handleDirectionInput(0,1); e.preventDefault(); return; }
  if(['a','A','ArrowLeft'].includes(k)){ handleDirectionInput(-1,0); e.preventDefault(); return; }
  if(['d','D','ArrowRight'].includes(k)){ handleDirectionInput(1,0); e.preventDefault(); return; }
  if(['f','F','Enter'].includes(k)){ handleConfirmInput(); e.preventDefault(); return; }
});
// 方向輸入的共用入口:戰鬥/隊伍狀態畫面時是移動選單焦點,平時是在地圖上走路。
// 鍵盤與下方的觸控方向鍵都呼叫這個函式,邏輯只寫一份。
// ==========================================
// 🗺️ 地圖與移動管理器 (Map Manager)
// ==========================================

// 📍 地圖事件座標設定檔 (資料驅動，以後新增機關只要加在這裡)
// ==========================================
// 📍 地圖事件座標設定檔 (資料驅動閘門系統)
// ==========================================
const MAP_EVENTS = {
    // 雷暴聖殿 (主線關卡)
    map7: {
        thunderGate: [[1, 22], [20, 7], [6, 14], [5, 14]]
    },
    // 充能閘門 B
    map8: {
        thunderGate: [[2, 3], [4, 31], [10, 31], [11, 18], [18, 22], [15, 11], [8, 2], [8, 3]]
    },
    // 充能閘門 C
    map11: {
        thunderGate: [[13, 2]]
    },
    // 充能閘門 D
    map17: {
        thunderGate: [[16, 21]]
    }
};
// 🏃 控制跑步狀態的全域變數
let isRunning = false;

function toggleRun() {
    if (inBattle) return;
    isRunning = !isRunning;
    const btn = document.getElementById('quickG');
    if (btn) btn.textContent = isRunning ? '🏃 跑(G)' : '🚶 走(G)';
    toast(isRunning ? '🏃 跑步模式開啟 (一次移動兩格)' : '🚶 走路模式開啟 (一次移動一格)');
}
const MapManager = {
  
// 處理方向輸入
    handleDirectionInput: function(dx, dy) {
        if(isSaving || typeChartOpen) return;
        if(inBattle || overlayOpen==='status'){ moveFocus(dx,dy); return; }
        if(overlayOpen) return;
        
        // 🌟 就是這裡漏掉了！必須記錄移動前的位置與地圖，才能判斷第一步有沒有撞牆
        const oldX = player.x;
        const oldY = player.y;
        const oldMap = GameState.player.mapId;
        
        // 🐾 嘗試第一步移動
        this.attemptMove(dx, dy);
        
        // 🏃 跑步機制：如果第一步成功移動 (沒有被牆擋住)，且沒有切換地圖、沒有進入戰鬥、沒開對話框
        if (isRunning && (player.x !== oldX || player.y !== oldY)) {
            if (GameState.player.mapId === oldMap && !inBattle && !overlayOpen) {
                // 再次嘗試移動第二步 (撞牆的話 attemptMove 內部會自動被擋下，變成只走一格)
                this.attemptMove(dx, dy);
            }
        }
    },
        // 處理確認輸入
    handleConfirmInput: function() {
        if(isSaving || typeChartOpen) return;
        if(inBattle || overlayOpen==='status'){ activateFocus(); }
    },

    // 核心移動邏輯
    attemptMove: function(dx, dy) {
        const nx = player.x + dx, ny = player.y + dy;
        const trainer = trainerAt(nx, ny);
        if(trainer){ startTrainerBattle(trainer); return; }
        const npc = npcAt(nx, ny);
        if(npc){ openNPC(npc); return; }
        
        // 🌍 1. 無縫地圖邊界切換邏輯
        const currentWorld = WORLDS[GameState.player.mapId];
        if (nx < 0) {
            if (currentWorld.neighbors && currentWorld.neighbors.left) {
                const targetId = currentWorld.neighbors.left;
                switchMap(targetId, WORLDS[targetId].tiles[0].length - 1, ny);
            }
            return;
        }
        if (nx >= MAP_W) {
            if (currentWorld.neighbors && currentWorld.neighbors.right) {
                const targetId = currentWorld.neighbors.right;
                switchMap(targetId, 0, ny);
            }
            return;
        }
        if (ny < 0) {
            if (currentWorld.neighbors && currentWorld.neighbors.up) {
                const targetId = currentWorld.neighbors.up;
                switchMap(targetId, nx, WORLDS[targetId].tiles.length - 1);
            }
            return;
        }
        if (ny >= MAP_H) {
            if (currentWorld.neighbors && currentWorld.neighbors.down) {
                const targetId = currentWorld.neighbors.down;
                switchMap(targetId, nx, 0);
            }
            return;
        }
        if(nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) return;
        
        const targetTile = MAP[ny][nx];
        
// 🛡️ 2. 地形與技能阻擋判定
        if(targetTile===8) {
            const requiredLegendaries = ['90', '91', '92', '93', '95', '96'];
            const hasAllLegendaries = requiredLegendaries.every(id => dex.has(id));
            if (!hasAllLegendaries) {
                toast('🔒 封印之門緊閉——必須集齊世界上另外 6 隻神獸的認可才能開啟。');
                return;
            }
        }        // ... 水屬性衝浪判定 ...
        if(targetTile===3 && !partyHasType('water')){
            toast(`🌊 這裡是水域,需要水屬性的怪物才能衝浪過去`);
            return;
        }

        // 🦇 新增暗屬性隱藏小徑判定
        if(targetTile===15 && !partyHasType('dark')){
            toast(`🦇 這裡似乎有條隱藏的小徑...但需要暗屬性的力量才能看清道路。`);
            return;
        }
        if(FIELD_TILES[targetTile] && !partyHasType(FIELD_TILES[targetTile].type)){
            const f = FIELD_TILES[targetTile];
            toast(`需要${ELEMENT_META[f.type].name}屬性的怪物(${FIELD_SKILL_NAME[f.type]})才能通過「${f.name}」`);
            return;
        }

        // 🚶 3. 執行移動與地圖傳送點
// 🚶 3. 執行移動與地圖傳送點
        if(isWalkable(nx,ny)){
            player.x = nx; player.y = ny;
            
            // 👇 新增：累積步數記錄
            GameState.player.totalSteps = (GameState.player.totalSteps || 0) + 1;
            
            const tile = MAP[ny][nx];            
            // 傳送點邏輯 (未來也可以像 MAP_EVENTS 一樣抽出來)
            const portals = {
                5: ['map2', 1, ny], 6: ['map1', 32, ny], 16: ['map3', 1, ny], 17: ['map2', 32, ny],
                18: ['map4', 24, 20], 19: ['map3', 24, 1], 20: ['map5', 32, 8], 21: ['map4', 1, 8],
                22: ['map6_1', 32, 16], 23: ['map5', 1, 19], 24: ['map6_2', 27, 12], 25: ['map6_1', 27, 13],
                26: ['map4', 6, 1], 27: ['map7', 26, 1], 28: ['map8', 26, 20], 29: ['map7', 6, 20],
                30: ['map10', 6, 19], 31: ['map9', 6, 1], 32: ['map11', 1, 6], 33: ['map4', 32, 6],
                34: ['map11', 16, 1], 35: ['map9', 16, 20], 36: ['map12', 18, 1], 37: ['map11', 18, 20],
                38: ['map20', 6, 20], 39: ['map5', 8, 1], 40: ['map8', 1, 4], 70: ['map18', 32, 4],
                45: ['map18', 1, ny], 46: ['map17', 32, ny], 47: ['map19', nx, 1], 48: ['map17', nx, 20],
                49: ['map20', nx, 1], 50: ['map18', nx, 20], 51: ['map20', 1, ny], 52: ['map19', 32, ny],
                53: ['map20', 1, ny], 54: ['map19', 32, ny], 55:['map23',1,5],56:['map22',32,10],57:['map21',32,5],
                58:['map24',1,10],59:['map23',32,11],60:['map15',1,11],66:['map24',32,11],67:['map16',1,11],69:['map1',1,7],

            };
            if(portals[tile]) {
                switchMap(portals[tile][0], portals[tile][1], portals[tile][2]);
                return;
            }

            drawMap();
            document.getElementById('hudPos').textContent = `位置: (${nx}, ${ny}) ・ ${WORLDS[GameState.player.mapId].name}`;
            
            // 🎯 4. 特殊事件方塊觸發
            if(tile===4){
                party.forEach(m=> {
                    m.hp = m.maxHp;
                    m.status = null; // 🌟 新增：解除所有異常狀態
                });
                toast('✚ 怪物中心:全隊HP已恢復!');
                updateHud(); SaveManager.save();
            } else if(tile===7){
                openShop();
            } else if(tile===8){
                switchMap('map31', 2, 20);
} else if (tile === 11) {
                // ⚡ 雷屬性充能閘門 (能走到這裡代表隊伍已經有雷屬性怪物,前面的地形判定已經確認過了)
                const mapId = GameState.player.mapId;

                if (!MAP_EVENTS[mapId] || !MAP_EVENTS[mapId].thunderGate) {
                    toast('⚡ 這裡沒有需要開啟的雷電閘門');
                    return;
                }

                if (!mapGatesOpened[mapId]) {
                    const opened = openThunderGates(mapId);

                    if (opened) {
                        let msg = '⚡ 雷屬性充能成功！前方的閘門開啟了！';

                        // 👇 🌟 結合神獸充能核心收集邏輯
                        if (mapId === 'map8' && !GameState.inventory.tb) {
                            GameState.inventory.tb = 1;
                            msg += '\n\n並在機關深處發現了【充能核心B】！';
                        } else if (mapId === 'map11' && !GameState.inventory.tc) {
                            GameState.inventory.tc = 1;
                            msg += '\n\n並在機關深處發現了【充能核心C】！';
                        } else if (mapId === 'map17' && !GameState.inventory.td) {
                            GameState.inventory.td = 1;
                            msg += '\n\n並在機關深處發現了【充能核心D】！';
                        }

                        toast(msg, 4000);
                        SaveManager.save();
                        drawMap(); // 確保畫面立刻更新，障礙物消失！
                    }
                } else {
                    toast('⚡ 充能閘門已處於開啟狀態');
                }
            }            
            // ⚔️ 5. 隨機遇敵判定
            if (!debugNoEncounters) {
                if(tile===9 && Math.random() < (FIELD_TILES[9].encounter||0.16)) startWildBattle();
                else if(tile===1 && Math.random() < 0.16) startWildBattle();
                else if((GameState.player.mapId==='map3' || GameState.player.mapId==='map4') && tile===0 && Math.random() < 0.12) startWildBattle();
            }
            
            // ⏩ 6. 輸送帶自動移動
            if(tile >= 41 && tile <= 44){
                setTimeout(() => {
                    if(MAP[player.y][player.x] >= 41 && MAP[player.y][player.x] <= 44) {
                        if(tile === 41) this.attemptMove(0, -1);
                        else if(tile === 42) this.attemptMove(0, 1);
                        else if(tile === 43) this.attemptMove(-1, 0);
                        else if(tile === 44) this.attemptMove(1, 0);
                    }
                }, 150);
            }
        }
    },
    
    // 風屬性傳送技能
// 風屬性傳送技能
    useTeleport: function() {
        if(!started || isSaving || inBattle || overlayOpen || typeChartOpen) return;
        
        // 🌟 1. 檢查任務進度 (未解鎖時跳出明顯彈窗)
        const ch1Completed = QUESTS.filter(q => q.chapter === 1).every(q => q.check());
        if (!ch1Completed) {    
            alert('🔒 【尚未解鎖疾風傳送】\n\n你需要先完成「第一章」的所有任務，才能解鎖這個便利的傳送能力喔！');    
            return;
        }
        
        // 🌟 2. 檢查隊伍屬性 (沒帶風系怪物時跳出明顯彈窗)
        if(!partyHasType('wind')){ 
            alert(`🌀 【無法使用疾風傳送】\n\n你的隊伍中需要攜帶至少一隻「風屬性」的怪獸，才能引導風的力量進行傳送！`); 
            return; 
        }
        
        let nearest=null, bestDist=Infinity;
        for(let y=0; y<MAP_H; y++){
            for(let x=0; x<MAP_W; x++){
                if(MAP[y][x]===4){
                    const d = Math.abs(x-player.x) + Math.abs(y-player.y);
                    if(d < bestDist){ bestDist=d; nearest={x,y}; }
                }
            }
        }
        if(!nearest){ toast('這張地圖上沒有怪物中心可以傳送過去'); return; }
        if(bestDist===0){ toast('已經在怪物中心了'); return; }
        
        player.x=nearest.x; player.y=nearest.y;

        // 🌟 疾風傳送直接抵達怪物中心,補上跟走路過去一樣的全隊治療效果
        party.forEach(m=> {
            m.hp = m.maxHp;
            m.status = null;
        });
        updateHud();
        SaveManager.save();

        drawMap();
        document.getElementById('hudPos').textContent = `位置: (${player.x}, ${player.y}) ・ ${WORLDS[GameState.player.mapId].name}`;
        toast(`🌀 ${FIELD_SKILL_NAME.wind}：瞬間移動到了最近的怪物中心！✚ 全隊HP已恢復!`);
    }
  };
// ==========================================
// 綁定 UI 事件與鍵盤輸入，將工作交給 MapManager
// ==========================================
document.getElementById('dpadUp').onclick = ()=> MapManager.handleDirectionInput(0,-1);
document.getElementById('dpadDown').onclick = ()=> MapManager.handleDirectionInput(0,1);
document.getElementById('dpadLeft').onclick = ()=> MapManager.handleDirectionInput(-1,0);
document.getElementById('dpadRight').onclick = ()=> MapManager.handleDirectionInput(1,0);
document.getElementById('dpadF').onclick = ()=> closeOverlays();
document.getElementById('quickT').onclick = ()=> MapManager.useTeleport();
// ==========================================
// 📤 綁定主畫面：匯出目前進度 (Live Export)
// ==========================================
document.getElementById('exportLiveBtn').onclick = () => {
    if (inBattle) { 
        toast('戰鬥中無法匯出進度！'); 
        return; 
    }
    
    // 確保當下最新狀態
    SaveManager.save(false); 
    
    // 取得當下進度代碼
    const code = 'MQSAVE-' + SaveManager.export();
    
    // 開啟專屬介面
    closeOverlays();
    document.getElementById('eiTitle').textContent = `▌ 匯出目前進度 ▌`;
    const ta = document.getElementById('eiTextarea');
    ta.value = code;
    ta.readOnly = true;
    
    document.getElementById('eiCopyBtn').style.display = 'block';
    document.getElementById('eiImportBtn').style.display = 'none';
    
    // 複製功能
    document.getElementById('eiCopyBtn').onclick = async () => {
        ta.select();
        try {
            await navigator.clipboard.writeText(code);
            toast('✅ 代碼已成功複製到剪貼簿！');
        } catch(e) {
            toast('複製失敗，請在文字框內手動全選並複製');
        }
    };
    
    // 關閉功能 (因為是匯出目前進度，關閉時不需要重新整理網頁)
    document.getElementById('eiCloseBtn').onclick = () => {
        closeOverlays();
    };
    
    document.getElementById('exportImportOverlay').style.display = 'flex';
    overlayOpen = 'exportImport';
};
// 其他 UI 快捷鍵維持不變
document.getElementById('quickB').onclick = ()=> { if(!inBattle) toggleOverlay('status'); };
document.getElementById('quickI').onclick = ()=> { if(!inBattle) toggleOverlay('bag'); };
document.getElementById('quickC').onclick = ()=> { if(!inBattle) toggleOverlay('dex'); };
document.getElementById('quickQ').onclick = ()=> { if(!inBattle) toggleOverlay('quest'); };
document.getElementById('quickN').onclick = ()=> toggleTypeChart();
document.getElementById('quickG').onclick = ()=> toggleRun();
document.getElementById('quickV').onclick = ()=> openHelpScreen();

// 假設你原本鍵盤事件區塊 (keydown) 是長這樣，記得也要把它轉接給 MapManager：
function handleDirectionInput(dx, dy) { MapManager.handleDirectionInput(dx, dy); }
function handleConfirmInput() { MapManager.handleConfirmInput(); }
function useTeleport() { MapManager.useTeleport(); }
function toggleOverlay(name){
  if(isSaving) return;
  if(overlayOpen===name){ closeOverlays(); return; }
  closeOverlays();
  overlayOpen=name;
  if(name==='status'){ renderStatusScreen(); document.getElementById('statusOverlay').style.display='flex'; }
  if(name==='dex'){ renderDexScreen(); document.getElementById('dexOverlay').style.display='flex'; }
  if(name==='quest'){ renderQuestScreen(); document.getElementById('questOverlay').style.display='flex'; }
  if(name==='bag'){ renderBagScreen(); document.getElementById('bagOverlay').style.display='flex'; }
}
function closeOverlays(){
  document.getElementById('statusOverlay').style.display='none';
  document.getElementById('dexOverlay').style.display='none';
  document.getElementById('questOverlay').style.display='none';
  document.getElementById('shopOverlay').style.display='none';
  document.getElementById('bagOverlay').style.display='none';
  document.getElementById('tradeOverlay').style.display='none';
  document.getElementById('codeOverlay').style.display='none';
  document.getElementById('recallOverlay').style.display='none';
  document.getElementById('storageOverlay').style.display='none';
  document.getElementById('minigameOverlay').style.display='none';
  document.getElementById('fusionOverlay').style.display='none';
  document.getElementById('helpOverlay').style.display='none';
  document.getElementById('exportImportOverlay').style.display='none';
document.getElementById('worldMapOverlay').style.display = 'none';
  overlayOpen=null;
  focusList=[];
}

function openShop(){
  closeOverlays();
  overlayOpen='shop';
  ensureDailyFresh();
  dailyProgress.shopVisits++;
  renderShopScreen();
  document.getElementById('shopOverlay').style.display='flex';
}

function openNPC(npc){
  if(npc.kind==='tradeMonster') openTradeMonsterScreen(npc);
  if(npc.kind==='tradeCode') openTradeCodeScreen(npc);   // 🌟 修正：接回正確的代碼交換畫面
  if(npc.kind==='moveRecall') openMoveRecallScreen(npc);
  if(npc.kind==='storage') openStorageScreen(npc);
  if(npc.kind==='boss') startBossBattle(npc);
  // 👇 🌟 新增：神獸海神專屬機關
  if(npc.kind==='seaGodShrine') handleSeaGodShrine(npc);
  if(npc.kind==='fireGodShrine') handleFireGodShrine(npc); // 🌟 新增火神路線
  if(npc.kind==='thunderGodShrine') handleThunderGodShrine(npc); // 🌟 雷神聖壇
  // 🌟 神獸聖壇路線 (整合為單一判斷區塊)
  else if(npc.kind.endsWith('GodShrine')) {
      if (npc.kind === 'seaGodShrine') handleSeaGodShrine(npc);
      else if (npc.kind === 'fireGodShrine') handleFireGodShrine(npc);
      else if (npc.kind === 'thunderGodShrine') handleThunderGodShrine(npc);
      else if (npc.kind === 'iceGodShrine') handleIceGodShrine(npc);
  }
  // 🌟 神獸聖壇路線 (整合為單一判斷區塊)
  else if(npc.kind.endsWith('GodShrine')) {
      if (npc.kind === 'seaGodShrine') handleSeaGodShrine(npc);
      else if (npc.kind === 'fireGodShrine') handleFireGodShrine(npc);
      else if (npc.kind === 'thunderGodShrine') handleThunderGodShrine(npc);
      else if (npc.kind === 'iceGodShrine') handleIceGodShrine(npc);
      else if (npc.kind === 'woodGodShrine') handleWoodGodShrine(npc); // 🌟 新增木神聖壇
  }
  if(npc.kind==='originShrine') handleOriginShrine(npc); // 👑 終極機關：始源祭壇
}
// ==========================================
// 🌊 神獸機關：海神聖壇 (位於 map16)
// ==========================================
function handleSeaGodShrine(npc) {
    // 1. 檢查是否已經打敗過海神
    if (trainersDefeated.has('boss_seagod')) {
        toast('🌊 聖壇已失去光芒，海神的力量與你同在。');
        return;
    }

    // 2. 檢查天氣是否為雨天 (如果不是，聖壇其實是隱形的，但以防萬一加個保護)
    const isRaining = WeatherManager.getOverworldWeather(GameState.player.mapId) === 'rain';
    if (!isRaining) {
        toast('🌊 這裡是一片深水區...水面下似乎隱約有個巨大的石基。', 3500);
        return;
    }

    // 3. 檢查隊伍：水系 且 (Lv >= 30 或是 親密度 >= 200)
    const qualifiedWaterMon = party.find(m => 
        effectiveType(m) === 'water' && (m.level >= 30 || (m.bond || 0) >= 200)
    );

    if (qualifiedWaterMon) {
        const spName = MonsterUtil.species(qualifiedWaterMon).name;
        toast(`🌧️ 狂風驟雨中，${spName} 釋放出了極其強大的水之共鳴！\n【海神聖壇】的大門敞開，深淵的守護者甦醒了！`, 4500);
        
        // 🎯 觸發海神 Boss 戰
        let seaGod = makeMonster('92', 40); // 假設圖鑑 ID 為 92
        seaGod.maxHp = Math.round(seaGod.maxHp * 1.5); 
        seaGod.hp = seaGod.maxHp;

        startBossBattle({
            id: 'boss_seagod',
            name: '深淵海神',
            sprite: '🌊',
            team: [seaGod],
            winMsg: '深淵的怒濤平息了...海神認可了你的實力！'
        });
    } else {
        toast('🌧️ 大雨滂沱，海神聖壇浮出了水面！但聖壇毫無反應...似乎需要一隻「身經百戰(Lv.30+)」或「與你心靈相通(親密度200滿值)」的【水屬性】怪獸來引發共鳴。', 5000);
    }
}
// ==========================================
// 🔥 神獸機關：火神聖壇 (位於 map10)
// ==========================================
function handleFireGodShrine(npc) {
    // 檢查是否已經打敗過日珥神龍
    if (trainersDefeated.has('boss_firegod')) {
        toast('🔥 聖壇的火焰已漸漸平息，神龍的力量與你同在。');
        return;
    }

    // 條件 1：打過 map9, map10 全部的 Trainers
    // (抓取全遊戲的 TRAINERS 陣列，篩出 map9 和 map10 的，檢查是否 every 都被打敗)
    const localTrainers = typeof TRAINERS !== 'undefined' ? TRAINERS.filter(t => t.mapId === 'map9' || t.mapId === 'map10') : [];
    const clearedTrainers = localTrainers.length > 0 && localTrainers.every(t => trainersDefeated.has(t.id));

    // 條件 2：隊伍中有一隻火系，且友好度 >= 60
    const qualifiedFireMon = party.find(m => effectiveType(m) === 'fire' && (m.bond || 0) >= 60);

    // 條件 4 (任務領取)：檢查背包是否有不滅聖火 A, B, C, D
    const hasAllFires = GameState.inventory.fa && GameState.inventory.fb && GameState.inventory.fc && GameState.inventory.fd;

    if (!clearedTrainers) {
        toast('🔥 聖壇散發著微弱的熱氣...似乎需要先擊敗「中央廣場(map9)」與「熾熱山谷(map10)」的所有訓練家，向聖壇證明你的武勇。', 4000);
        return;
    }

    if (!hasAllFires) {
        toast('🔥 聖壇四周有四個空蕩蕩的火盆...需要透過完成任務，找齊四把「不滅聖火(A,B,C,D)」才能點燃它們。', 4000);
        return;
    }

    if (!qualifiedFireMon) {
        toast('🔥 四把不滅聖火已經就位，但火焰無法融合...你需要一隻與你「關係良好(友好度60+)」的【火屬性】怪獸來引導這股龐大的能量！', 4500);
        return;
    }
    // 所有條件達成！觸發戰鬥
    const spName = MonsterUtil.species(qualifiedFireMon).name;
    toast(`🔥 ${spName} 將四把不滅聖火的能量引導至聖壇中央！岩漿劇烈翻騰，日珥神龍從熾熱的深淵中甦醒了！`, 4500);
    
    // 🎯 觸發火神 Boss 戰 (假設日珥神龍圖鑑 ID 為 '90')
    let fireGod = makeMonster('90', 35); 
    fireGod.maxHp = Math.round(fireGod.maxHp * 1.5); 
    fireGod.hp = fireGod.maxHp;

    startBossBattle({
        id: 'boss_firegod',
        name: '日珥神龍',
        sprite: '🐉',
        team: [fireGod],
        winMsg: '熾熱的烈焰臣服於你...神龍認可了你的實力！'
    });
}

// ==========================================
// ⚡ 神獸機關：雷暴聖殿 (位於 map7)
// ==========================================
function handleThunderGodShrine(npc) {
    if (trainersDefeated.has('boss_thundergod')) {
        toast('⚡ 雷暴已歇，聖鳥的力量與你同在。');
        return;
    }

    const isRaining = WeatherManager.getOverworldWeather(GameState.player.mapId) === 'rain';
    if (!isRaining) {
        toast('⚡ 這裡只是一片空地，但空氣中殘留著微弱的靜電...', 3000);
        return;
    }

    // 檢查背包是否有 4 個充能核心
    const hasAllCores = GameState.inventory.ta && GameState.inventory.tb && GameState.inventory.tc && GameState.inventory.td;

    if (!hasAllCores) {
        toast('⚡ 雷雨交加中，隱藏的【雷暴聖殿】顯現了！但聖殿大門緊閉...上面有四個凹槽，似乎需要啟動世界各地的「充能閘門」並收集四個【充能核心(A,B,C,D)】。', 4500);
        return;
    }

    // 所有條件達成！觸發戰鬥
    toast(`⚡ 你將四個充能核心嵌入聖殿大門！轟隆！一道巨大的落雷劈下，天雷聖鳥從雷雲中降臨了！`, 4500);
    
    // 🎯 觸發雷神 Boss 戰 (假設天雷聖鳥圖鑑 ID 為 '94')
    let thunderGod = makeMonster('93', 40); 
    thunderGod.maxHp = Math.round(thunderGod.maxHp * 1.5); 
    thunderGod.hp = thunderGod.maxHp;

    startBossBattle({
        id: 'boss_thundergod',
        name: '天雷聖鳥',
        sprite: '🦅',
        team: [thunderGod],
        winMsg: '震耳欲聾的雷聲停止了...聖鳥認可了你的實力！'
    });
}
// ==========================================
// ⚡ 通用雷系閘門開啟系統
// ==========================================
function openThunderGates(mapId) {
    const event = MAP_EVENTS[mapId];

    if (!event || !event.thunderGate) {
        return false;
    }

    if (mapGatesOpened[mapId]) {
        return false;
    }

    mapGatesOpened[mapId] = true;

    // 依照你確定的 [row, col] (也就是 [y, x]) 順序來修改全域 MAP
    for (const [row, col] of event.thunderGate) {
        if (MAP[row] && MAP[row][col] !== undefined) {
            MAP[row][col] = 0; // 0 代表平地
        }
    }

    return true;
}
// ==========================================
// ❄️ 神獸機關：冰神聖壇 (位於 map6_2)
// ==========================================
function handleIceGodShrine(npc) {
    if (trainersDefeated.has('boss_icegod')) {
        toast('❄️ 寒氣已散，冰河猛瑪的力量與你同在。');
        return;
    }

    // 1. 抓取圖鑑中所有「一般冰系怪獸」的 ID (排除神獸本身)
    const iceSpecies = SPECIES.filter(s => s.type === 'ice' && !s.legendary).map(s => s.id);
    
    // 🌟 解鎖路線 1：捕捉過圖鑑中所有的冰系怪物
    const method1_caughtAllIce = iceSpecies.every(id => dex.has(id));
    
    // 🌟 解鎖路線 2：見過所有冰系 + 戰鬥外天氣為下雪 + 隊伍中有一隻友好度 > 120 的怪獸
    const seenAllIce = iceSpecies.every(id => seenDex.has(id));
    const isSnowing = WeatherManager.getOverworldWeather(GameState.player.mapId) === 'snow';
    const highBondMon = party.find(m => (m.bond || 0) > 120);
    const method2_weatherAndBond = seenAllIce && isSnowing && highBondMon;

    // 只要滿足其中一條路線即可開啟！
    if (method1_caughtAllIce || method2_weatherAndBond) {
        
        if (method1_caughtAllIce) {
            toast(`❄️ 你對冰系怪獸透徹的了解，引發了強大的屬性共鳴！萬年玄冰碎裂，冰河猛瑪甦醒了！`, 4500);
        } else {
            const spName = MonsterUtil.species(highBondMon).name;
            toast(`❄️ 漫天飛雪中，${spName} 身上散發出的強大羈絆融化了萬年玄冰！冰河猛瑪甦醒了！`, 4500);
        }
        
        // 🎯 觸發冰神 Boss 戰 (假設冰河猛瑪圖鑑 ID 為 '96')
        let iceGod = makeMonster('96', 50); 
        iceGod.maxHp = Math.round(iceGod.maxHp * 1.5); 
        iceGod.hp = iceGod.maxHp;

        startBossBattle({
            id: 'boss_icegod',
            name: '冰河猛瑪',
            sprite: '🐘',
            team: [iceGod],
            winMsg: '暴風雪平息了...猛瑪認可了你的實力！'
        });

    } else {
        // 條件皆未滿足時的精準提示
        toast('❄️ 巨大的萬年玄冰中封印著某種龐然大物...要喚醒牠有兩種途徑:①成為冰系大師(捕捉過所有冰系怪獸) ②天時地利(下雪天+友好度120+的夥伴+見過所有冰系怪獸)', 5500);
    }
}
// ==========================================
// 🌳 神獸機關：木神聖壇 (位於 map22)
// ==========================================
function handleWoodGodShrine(npc) {
    if (trainersDefeated.has('boss_woodgod')) {
        toast('🌳 聖壇生機盎然，創世巨樹的力量與你同在。');
        return;
    }

    // 條件 1A：隊伍中有一隻會 'flash' 的怪物 (檢查現在裝備的與歷史學過的)
    const hasFlash = party.some(m => m.moves.includes('flash') || (m.moveHistory && m.moveHistory.includes('flash')));
    
    // 條件 1B：隊伍中有一隻 Lv.20 以上，且友好度 >= 160 的木系怪物
    const highBondWood = party.find(m => effectiveType(m) === 'wood' && m.level >= 20 && (m.bond || 0) >= 160);

    // 🌟 解鎖路線 1：直接滿足嚴苛條件
    if (hasFlash && highBondWood) {
        const spName = MonsterUtil.species(highBondWood).name;
        toast(`🌳 ${spName} 將溫暖的羈絆之力注入聖壇，同時閃耀出奪目的光芒！創世巨樹降臨了！`, 4500);
        
        triggerWoodGodBattle();
    } 
    // 🌟 解鎖路線 2：進入戰鬥，等待彩虹奇蹟
    else {
        toast('🍂 枯萎的聖壇沒有反應...(突然間，周圍的樹叢傳來了沙沙聲，似乎有野生怪物被驚動了！)', 3500);
        
        // 標記這是一場「聖壇驚動的野生戰鬥」，等待戰後結算天氣
        GameState.world.woodGodTrial = true; 
        startWildBattle(); // 強制觸發野怪戰鬥
    }
}

// 獨立出來的木神 Boss 戰觸發器 (給路線 1 和 2 共用)
function triggerWoodGodBattle() {
    let woodGod = makeMonster('91', 50); // 假設創世巨樹圖鑑 ID 為 91
    woodGod.maxHp = Math.round(woodGod.maxHp * 1.5); 
    woodGod.hp = woodGod.maxHp;

    startBossBattle({
        id: 'boss_woodgod',
        name: '創世巨樹',
        sprite: '🌳',
        team: [woodGod],
        winMsg: '無盡的生命力溫和了下來...巨樹認可了你的實力！'
    });
}

// ==========================================
// 👑 終極機關：始源祭壇 (位於 map31)
// ==========================================
function handleOriginShrine(npc) {
    if (trainersDefeated.has('boss_origindra')) {
        toast('👑 始源的王座已空，傳說的力量與你同在。');
        return;
    }

    // 檢查倉庫是否有這六隻神獸 (以種族 ID 為準)
    const requiredLegendaries = ['90', '91', '92', '93', '95', '96'];
    const legendsInStorage = storageBox.filter(m => requiredLegendaries.includes(m.speciesId));

    // 排除重複的 ID，確認是否剛好集齊 6 種
    const uniqueLegendsInStorage = new Set(legendsInStorage.map(m => m.speciesId));

    if (uniqueLegendsInStorage.size === 6) {
        toast('✨ 祭壇爆發出七彩的光芒！倉庫中的六隻神獸與你隊伍中的七大元素產生了強烈的共鳴...空間被撕裂，【始源龍】從虛空中現身了！', 4500);

        let origindra = makeMonster('94', 70, generateIV()); // 超高滿等 70 級
        origindra.maxHp = Math.round(origindra.maxHp * 2.0); // 終極 Boss 血量翻倍
        origindra.hp = origindra.maxHp;

        startBossBattle({
            id: 'boss_origindra',
            name: '始源龍',
            sprite: '👑',
            team: [origindra],
            winMsg: '萬物歸一...始源龍認可了你作為最強大師的資格！'
        });
    } else {
        toast(`🏛️ 始源祭壇的碑文:「當七彩的元素為你鋪路，請將六根創世之柱安放於靈魂的深處(倉庫)。」(目前倉庫中的神獸數量:${uniqueLegendsInStorage.size}/6)`, 5000);
    }
}

// ---------- 隊伍與圖鑑資料 ----------
const PARTY_LIMIT = 8; // 隊伍上限,超過的怪物要放進倉庫

// 新怪物要加進隊伍時共用這個函式:隊伍滿了就自動放進倉庫,不會卡住捕捉/獲得的流程
function addToPartyOrStorage(mon){
  if(party.length < PARTY_LIMIT){ party.push(mon); return 'party'; }
  storageBox.push(mon); return 'storage';
}
function depositToStorage(index){
  if(party.length<=1) return false; // 隊伍至少要留一隻
  const [mon] = party.splice(index,1);
  storageBox.push(mon);
  return true;
}
function withdrawFromStorage(index){
  if(party.length>=PARTY_LIMIT) return false;
  const [mon] = storageBox.splice(index,1);
  party.push(mon);
  return true;
}
