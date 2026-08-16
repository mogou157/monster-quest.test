// ============================================================
// 03-species-data.js — 怪物圖鑑資料 (SPECIES) + 怪物圖示繪製
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

// =========================================================
// 🛠️ 改造區 A:新增怪物 🛠️
// 想加新怪物,直接複製下面任何一行,貼在陣列最後一個 } 後面,
// 改掉裡面的文字/數字就好,記得每一行結尾要有逗號 ","
//
// 範本(複製這行,改內容就能用):
// { id:'唯一英文代號',   name:'中文名稱 English',    type:'元素(從下面10選1)', color:'#顏色碼', accent:'#顏色碼', shape:'外型(從下面11選1)', baseHp:40, baseAtk:10, baseDef:10, passive:'特性(從下面5選1)' },
//
// type 可選: fire(火) water(水) ice(冰) wood(木) wind(風) earth(地) thunder(雷) light(光) dark(暗) none(無)
// shape 可選: round(圓) drop(水滴) leaf(葉) square(方) zap(閃電) shell(貝殼) crystal(晶體) wing(翅膀) star(星形) dragon(龍形) board(機板) chair(椅子) spider(蜘蛛) mushroom(蘑菇) bike(單車) vase(花瓶) blocks(積木) refrigerator(冰箱) ice_cream(冰淇淋) dandelion(蒲公英) snowflake(雪花)
// passive 可選: guts(拚命) regen(自癒) thick_skin(厚皮) swift(敏捷) hypnoticTouch(催眠觸覺) friendly(友好) pitchDarkGuard(暗夜守護) poisonImmune(排毒體質) statusExploit(趁虛而入) expBoost(好學) sandstormCure(沙暴淨化) waterAbsorbDef(蓄水裝甲) statusResilience(帶病抗性) snowSummon(雪之呼喚)
// color / accent 是顏色碼,可以到 https://htmlcolorcodes.com 選顏色複製過來
// =========================================================
const SPECIES = [
  { id:'embit',   name:'焰鼠 Embit',    type:'fire',    color:'#ff6b4a', accent:'#ffb347', shape:'round',   baseHp:38, baseAtk:16, baseDef:8,  passive:'guts',       evolvesTo:'80',  evolveLevel:12 },
  { id:'aquiv',   name:'滴靈 Aquiv',    type:'water',   color:'#4aa3ff', accent:'#9be3ff', shape:'drop',    baseHp:50, baseAtk:10, baseDef:10, passive:'waterAbsorbDef',      evolvesTo:'81',  evolveLevel:12 },
  { id:'sprigl',  name:'葉芽 Sprigl',   type:'wood',    color:'#5cd65c', accent:'#c8ffb0', shape:'leaf',    baseHp:40, baseAtk:11, baseDef:13,  passive:'hypnoticTouch', evolvesTo:'82', evolveLevel:12 },
  { id:'58',   name:'岩仔 Rokid',    type:'earth',   color:'#a89068', accent:'#d8c49a', shape:'square',  baseHp:46, baseAtk:9,  baseDef:14, passive:'thick_skin' },
  { id:'59',  name:'電鼬 Sparuk',   type:'thunder', color:'#ffd23f', accent:'#fff3b0', shape:'zap',     baseHp:34, baseAtk:14, baseDef:6,  passive:'swift',      evolvesTo:'83', evolveLevel:14 },
  { id:'60', name:'殼波 Shellop',  type:'water',   color:'#2749F5', accent:'#c9b8ff', shape:'shell',   baseHp:44, baseAtk:9,  baseDef:12, passive:'thick_skin' },
  { id:'61',  name:'冰晶 Glacig',   type:'ice',     color:'#8fdcff', accent:'#e8faff', shape:'crystal', baseHp:36, baseAtk:11, baseDef:11, passive:'keenEye' },
  { id:'62',  name:'羽風 Windra',   type:'wind',    color:'#b8f2c9', accent:'#eafff2', shape:'wing',    baseHp:33, baseAtk:13, baseDef:7,  passive:'swift' },
  { id:'63', name:'光珞 Luminel',  type:'light',   color:'#ffe98a', accent:'#fffbe0', shape:'star',    baseHp:37, baseAtk:12, baseDef:9,  passive:'regen' },
  { id:'64',  name:'影狐 Umbrix',   type:'dark',    color:'#6a4a9e', accent:'#b39ddb', shape:'round',   baseHp:35, baseAtk:13, baseDef:8,  passive:'guts' },
  { id:'65',  name:'土靈 Terran',   type:'earth',   color:'#8a6a4a', accent:'#c9a878', shape:'round',  baseHp:48, baseAtk:8,  baseDef:15, passive:'regen' },
  { id:'66',  name:'雷角 Voltan',   type:'thunder', color:'#f0c020', accent:'#fff0a0', shape:'zap',     baseHp:39, baseAtk:13, baseDef:9,  passive:'guts' },
  // ↓全新原創怪物(一般野生就會遇到)
  { id:'68', name:'鰭光 Luminfin', type:'light', color:'#ffdf7a', accent:'#fffde0', shape:'crystal',   baseHp:36, baseAtk:12, baseDef:9,  passive:'friendly' },
  { id:'71',   name:'蛛靈 Spidra',    type:'dark',  color:'#200000', accent:'#492366', outlineColor:'#E3F9FC', shape:'spider',   baseHp:34, baseAtk:13, baseDef:8,  passive:'poisonImmune' },
  { id:'72', name:'妖菇 Mystroom',  type:'dark',  color:'#EAA4EB', accent:'#EBD4A4', shape:'mushroom2', baseHp:36, baseAtk:12, baseDef:10, passive:'statusExploit' },
  { id:'74',  name:'陶甕獸 Urnling', type:'earth', color:'#D6A754', accent:'#f0d9a0', shape:'vase',     baseHp:33, baseAtk:12, baseDef:11, passive:'guts' },
  { id:'75',  name:'疊塊獸 Blockon', type:'earth', color:'#705119', accent:'#915D37', shape:'blocks',   baseHp:44, baseAtk:9,  baseDef:14, passive:'sandstormCure', evolutions:[{level:32, reqWeather:'sandstorm', to:'114'}] },
  { id:'76',   name:'Gerator',  type:'ice', color:'#99F2E2', accent:'#b39ddb', outlineColor:'#ecf0f1', shape:'refrigerator', baseHp:42, baseAtk:9,  baseDef:14, passive:'waterAbsorbDef' },
  { id:'77',     name:'Sweetce',  type:'ice', color:'#5678C7', accent:'#C7FBFC', outlineColor:'#F1EFEC', shape:'ice_cream',    baseHp:34, baseAtk:11, baseDef:8,  passive:'friendly', evolutions:[{level:28, reqItem:'leftovers', consumeItem:true, to:'115'}] },
  { id:'78', name:'dandeice', type:'ice', color:'#C4843B', accent:'#C7FBFC', outlineColor:'#C7F9FC', shape:'dandelion',    baseHp:33, baseAtk:10, baseDef:9,  passive:'statusResilience', evolutions:[{level:40, to:'136'}] },
  { id:'79',     name:'iflake',   type:'ice', color:'#4F92F7', accent:'#C7FBFC', outlineColor:'#C7F9FC', shape:'snowflake',    baseHp:32, baseAtk:11, baseDef:8,  passive:'snowSummon' },
  
  { id:'01',   name:'Ba-01',           type:'thunder', color:'#FFFE4D', accent:'#fff0a0', outlineColor:'#E3F9FC', shape:'battery',      baseHp:50, baseAtk:10, baseDef:10, passive:'martyr' },
  { id:'02',   name:'Semile',          type:'thunder', color:'#ffe98a', accent:'#fff0a0', outlineColor:'#ffffff', shape:'led_light',    baseHp:35, baseAtk:15, baseDef:7,  passive:'chargeUp', evolutions:[{level:28, reqMap:['map7'], to:'111'}] },
  { id:'03',   name:'T-way',           type:'thunder', color:'#FFFE14', accent:'#fff0a0', outlineColor:'#ecf0f1', shape:'subway_head',  baseHp:45, baseAtk:12, baseDef:14, passive:'firstStrike', evolutions:[{level:40, to:'135'}] },
  { id:'04',   name:'Fuyuka',          type:'thunder', color:'#ffe98a', accent:'#fff0a0', outlineColor:'#ecf0f1', shape:'floor_lamp',   baseHp:40, baseAtk:13, baseDef:9,  passive:'lightShield', evolutions:[{level:35, reqResonance:true, to:'137'}] },
  { id:'05',   name:'Ranper',          type:'thunder', color:'#ffe98a', accent:'#fff0a0', outlineColor:'#ffffff', shape:'head_lamp',    baseHp:34, baseAtk:14, baseDef:8,  passive:'dazzling' },
  { id:'06',   name:'Doutain',         type:'thunder', color:'#FCE490', accent:'#FFFE14', outlineColor:'#ecf0f1', shape:'lighthouse',   baseHp:48, baseAtk:10, baseDef:15, passive:'illuminate' },
  { id:'07',   name:'提灯chouchin',    type:'fire',    color:'#FFFE0A', accent:'#FFFE4D', outlineColor:'#ff6b4a', shape:'lantern_2',    baseHp:36, baseAtk:14, baseDef:7,  passive:'steady', evolutions:[{level:40, to:'139'}] },
  { id:'08',   name:'Fuusen',          type:'fire',    color:'#FF7E1A', accent:'#ffb347', outlineColor:'#F7D499', shape:'air_balloon',  baseHp:55, baseAtk:10, baseDef:5,  passive:'levitate', evolutions:[{level:30, reqStatus:'burn', to:'109'}] },
  { id:'09',   name:'Rousoku',         type:'fire',    color:'#ff6b4a', accent:'#ffb347', outlineColor:'#ecf0f1', shape:'candle',       baseHp:28, baseAtk:17, baseDef:6,  passive:'firelight' },
  { id:'10',   name:'Kacyo',           type:'fire',    color:'#ff6b4a', accent:'#ffb347', outlineColor:'#F0A932', shape:'butterfly_3',  baseHp:32, baseAtk:15, baseDef:7,  passive:'guts' },
  { id:'11',   name:'Wimi',            type:'wind',    color:'#C1FA98', accent:'#6B3C18', outlineColor:'#CFB180', shape:'windmill',     baseHp:40, baseAtk:11, baseDef:12, passive:'wheelAtk' },
  { id:'12',   name:'Jyu2',            type:'water',   color:'#A1D5E6', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'fish',         baseHp:36, baseAtk:13, baseDef:9,  passive:'moisture', evolutions:[{level:26, reqStatus:'poison', to:'118'}] },
  { id:'13',   name:'Haa',             type:'water',   color:'#BAC9D4', accent:'#6B3C18', outlineColor:'#CFB180', shape:'shrimp',       baseHp:30, baseAtk:16, baseDef:7,  passive:'firstStrike' },
  { id:'14',   name:'Turizao',         type:'water',   color:'#C1FA98', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'fishing_rod',  baseHp:35, baseAtk:14, baseDef:8,  passive:'sunnyPower' },
  { id:'15',   name:'Hakuchyo',        type:'water',   color:'#F7FDFF', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'swan',         baseHp:42, baseAtk:11, baseDef:10, passive:'rainSummon', evolutions:[{level:26, reqWeather:'rain', to:'108'}] },
  { id:'17',   name:'Funsui',          type:'water',   color:'#5FC5F5', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'fountain',     baseHp:46, baseAtk:9,  baseDef:13, passive:'purity' },
  { id:'18',   name:'珊瑚 Sango',      type:'water',   color:'#65D2F7', accent:'#92F793', outlineColor:'#ecf0f1', shape:'coral',        baseHp:38, baseAtk:8,  baseDef:18, passive:'waterAbsorbDef' },
  { id:'19',   name:'Seoi bam',        type:'water',   color:'#A8A8A8', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'water_pump',   baseHp:42, baseAtk:13, baseDef:11, passive:'wheelAtk' },
  { id:'20',   name:'Ankou',           type:'water',   color:'#C1FA98', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'anglerfish',   baseHp:44, baseAtk:15, baseDef:8,  passive:'nightWalker' },
  { id:'21',   name:'Unagi',           type:'water',   color:'#A1D5E6', accent:'#6B3C18', outlineColor:'#ecf0f1', shape:'slender_fish', baseHp:38, baseAtk:14, baseDef:10, passive:'thick_skin' },
  { id:'22',   name:'Hinagiku',        type:'wood',    color:'#FA73CD', accent:'#F24E68', outlineColor:'#ecf0f1', shape:'daisy_top',    baseHp:36, baseAtk:12, baseDef:9,  passive:'wakeUp' },
  { id:'23',   name:'蓮華Renge',       type:'wood',    color:'#FC1E1E', accent:'#FF8F82', outlineColor:'#000000', shape:'lotus',        baseHp:40, baseAtk:14, baseDef:10, passive:'guts' },
  { id:'24',   name:'Saboten',         type:'wood',    color:'#75D45D', accent:'#6F8C68', outlineColor:'#ecf0f1', shape:'cactus',       baseHp:42, baseAtk:11, baseDef:14, passive:'sunnyPower' },
  { id:'25',   name:'Onpu',            type:'wind',    color:'#555457', accent:'#6F8C68', outlineColor:'#D18CFF', shape:'musical_note', baseHp:34, baseAtk:15, baseDef:8,  passive:'windResist' },
  // ⚡ 17 隻全新雷屬性怪物清單

  { id:'26', name:'Thundercrown', type:'light', color:'#FFD700', accent:'#FFF68F', outlineColor:'#B8860B', shape:'crown',        baseHp:45, baseAtk:12, baseDef:12, passive:'intimidate' },
  { id:'27', name:'Voltgem',      type:'light', color:'#00E5FF', accent:'#E0FFFF', outlineColor:'#008B8B', shape:'diamond',      baseHp:35, baseAtk:16, baseDef:8,  passive:'shineCure' },
  { id:'28', name:'Pulseheart',   type:'light', color:'#FF1493', accent:'#FFB6C1', outlineColor:'#8B008B', shape:'heart',        baseHp:44, baseAtk:10, baseDef:14, passive:'wheelDef' },
  { id:'29', name:'Synthekey',    type:'wind', color:'#F8F8FF', accent:'#000000', outlineColor:'#1E90FF', shape:'piano_keys',   baseHp:38, baseAtk:14, baseDef:9,  passive:'windResist' },
  { id:'30', name:'Flashlamp',    type:'light', color:'#F0E68C', accent:'#FFFFE0', outlineColor:'#8B4513', shape:'floor_lamp',   baseHp:42, baseAtk:11, baseDef:13, passive:'paralysisImmune', evolutions:[{level:35, reqResonance:true, to:'138'}] },
  { id:'31', name:'Sparkdesk',    type:'light', color:'#C0C0C0', accent:'#FFFFFF', outlineColor:'#8A4545', shape:'desk_lamp',    baseHp:36, baseAtk:13, baseDef:9,  passive:'expBoost' },
  { id:'32', name:'Voltlantern',  type:'light', color:'#FFA500', accent:'#FFD700', outlineColor:'#8B0000', shape:'lantern_1',    baseHp:39, baseAtk:12, baseDef:10, passive:'nightWalker' },
  { id:'33', name:'Beaconvolt',   type:'light', color:'#F5F5F5', accent:'#FFFAFA', outlineColor:'#2F4F4F', shape:'lighthouse',   baseHp:50, baseAtk:9,  baseDef:15, passive:'illuminate' },
  { id:'34', name:'Thundercrow',  type:'light', color:'#4B0082', accent:'#8A2BE2', outlineColor:'#000000', shape:'crow',         baseHp:32, baseAtk:16, baseDef:7,  passive:'keenEye' },
  { id:'35', name:'Cleavolt',     type:'earth', color:'#A9A9A9', accent:'#E6E6FA', outlineColor:'#4682B4', shape:'cleaver', baseHp:38, baseAtk:18, baseDef:6,  passive:'underdogAtk', evolutions:[{level:35, reqItem:'glassSword', consumeItem:true, to:'110'}] },
  { id:'36', name:'Zapbit',       type:'dark', color:'#FFFACD', accent:'#FFFFFF', outlineColor:'#DAA520', shape:'rabbit',       baseHp:34, baseAtk:14, baseDef:8,  passive:'swift' },
  { id:'37', name:'Maskspark',   type:'dark', color:'#8B0000', accent:'#FFD700', outlineColor:'#000000', shape:'mask',         baseHp:41, baseAtk:13, baseDef:12, passive:'copycat' },
  { id:'38', name:'Voltbat',       type:'dark', color:'#191970', accent:'#7B68EE', outlineColor:'#6300FF', shape:'bat',          baseHp:35, baseAtk:15, baseDef:8,  passive:'dreamEater' },
  { id:'39', name:'Sparkbook',     type:'dark', color:'#8B4513', accent:'#DEB887', outlineColor:'#FFD700', shape:'tilted_book',  baseHp:44, baseAtk:11, baseDef:10, passive:'statusDefBoost' },
  { id:'40', name:'Arcbridge',    type:'earth', color:'#708090', accent:'#B0C4DE', outlineColor:'#2F4F4F', shape:'bridge',       baseHp:48, baseAtk:10, baseDef:14, passive:'shieldBash' },
  { id:'41', name:'Zaptower',     type:'earth', color:'#2F4F4F', accent:'#00FFFF', outlineColor:'#000000', shape:'tower',        baseHp:46, baseAtk:14, baseDef:11, passive:'desperateDef' },
  { id:'42', name:'Thunderhat',   type:'none', color:'#9370DB', accent:'#DDA0DD', outlineColor:'#4B0082', shape:'hat',          baseHp:38, baseAtk:12, baseDef:10, passive:'scavenger' },
  { id:'120', name:'Wadestar',  type:'water', color:'#65D2F7', accent:'#92F793', shape:'star',    baseHp:37, baseAtk:12, baseDef:9,  passive:'regen' },
// 🌪️🌿⚪ 15 隻全新風系、木系與無屬性怪物清單
  // === 🌪️ 風系 (Wind) ===
  { id:'43', name:'狂風捲 Torvortex',      type:'wind', color:'#D3D3D3', accent:'#F8F8FF', outlineColor:'#696969', shape:'tornado',             baseHp:38, baseAtk:16, baseDef:8,  passive:'missBuffAtk' },
  { id:'44', name:'疾風蜓 Drafly',         type:'wind', color:'#98FB98', accent:'#00FA9A', outlineColor:'#228B22', shape:'dragonfly',           baseHp:35, baseAtk:17, baseDef:7,  passive:'swift' },
  { id:'45', name:'飄風旗 Fluterag',       type:'wind', color:'#FFF099', accent:'#FFA500', outlineColor:'#D1FFFF', shape:'drifting_flag',       baseHp:40, baseAtk:12, baseDef:10, passive:'ironWall' },
  { id:'46', name:'幻風蝶 Windwing',       type:'wind', color:'#87CEFA', accent:'#E0FFFF', outlineColor:'#4682B4', shape:'butterfly_1',         baseHp:36, baseAtk:15, baseDef:8,  passive:'statusAccBoost' },
  { id:'47', name:'迴音鈴 Chimebell',      type:'wind', color:'#FFD700', accent:'#FFF8DC', outlineColor:'#B8860B', shape:'bell',                baseHp:42, baseAtk:11, baseDef:14, passive:'wakeUp', evolutions:[{level:30, reqSteps:8000, to:'119'}] },

  // === 🌿 木系 (Wood) ===
  { id:'48', name:'巨木靈 Treant',         type:'wood', color:'#228B22', accent:'#8B4513', outlineColor:'#006400', shape:'tree',                baseHp:50, baseAtk:12, baseDef:15, passive:'strongRegen' },
  { id:'49', name:'斥毒菇 Shroomish',      type:'wood', color:'#342714', accent:'#DA70D6', outlineColor:'#CFB180', shape:'mushroom',            baseHp:45, baseAtk:10, baseDef:13, passive:'poisonImmune' },
  { id:'50', name:'枯木妖 Deadwood',       type:'wood', color:'#696969', accent:'#8B4513', outlineColor:'#2F4F4F', shape:'dead_tree',           baseHp:40, baseAtk:16, baseDef:9,  passive:'desperateDef' },
  { id:'51', name:'翠竹節 Bamblade',       type:'wood', color:'#3CB371', accent:'#98FB98', outlineColor:'#006400', shape:'bamboo',              baseHp:38, baseAtk:15, baseDef:10, passive:'underdogAtk' },
  { id:'52', name:'喇叭花 Trumpetal',      type:'wood', color:'#FF69B4', accent:'#FFB6C1', outlineColor:'#C71585', shape:'trumpet_flower_side', baseHp:42, baseAtk:14, baseDef:8,  passive:'firstStrike' },
  { id:'53', name:'清淨蓮 Lotusoul',       type:'wood', color:'#FFC0CB', accent:'#FFFFFF', outlineColor:'#DB7093', shape:'lotus_top',           baseHp:44, baseAtk:9,  baseDef:14, passive:'purity' },
  { id:'54', name:'艷鬱金 Tuliper',        type:'wood', color:'#FF0000', accent:'#FFD700', outlineColor:'#8B0000', shape:'tulip_side',          baseHp:39, baseAtk:13, baseDef:11, passive:'berryHeal' },

  // === ⚪ 無屬性 (None) ===
  { id:'55', name:'沉思椅 Chairmind',      type:'none', color:'#D2B48C', accent:'#F5DEB3', outlineColor:'#8B4513', shape:'chair',               baseHp:48, baseAtk:8,  baseDef:16, passive:'wheelDef' },
  { id:'56', name:'守護盾 Aegishield',     type:'none', color:'#C0C0C0', accent:'#E6E6FA', outlineColor:'#708090', shape:'shield',              baseHp:45, baseAtk:9,  baseDef:18, passive:'shieldBash' },
  // === 新增形狀怪獸 (ID 84 ~ 89) ===
  { id:'84', name:'爆炎糖 Bonfire', type:'fire', color:'#FF4500', accent:'#FFD700', shape:'candy', baseHp:35, baseAtk:16, baseDef:8, passive:'guts' },
  { id:'85', name:'幻夢糖 Mystcandy', type:'light', color:'#FF69B4', accent:'#FFE4E1', outlineColor:'#8B008B', shape:'candy', baseHp:42, baseAtk:10, baseDef:12, passive:'friendly' },
  { id:'86', name:'翠葉刃 Leafblade', type:'wood', color:'#32CD32', accent:'#98FB98', shape:'leaf2', baseHp:38, baseAtk:15, baseDef:9, passive:'guts' },
  { id:'87', name:'露水葉 Dewleaf', type:'water', color:'#00BFFF', accent:'#E0FFFF', shape:'leaf2', baseHp:45, baseAtk:11, baseDef:14, passive:'regen', evolutions:[{level:25, reqBond:150, to:'117'}] },
  { id:'88', name:'石卒 Pawnrock', type:'earth', color:'#8B4513', accent:'#DEB887', shape:'chess', baseHp:48, baseAtk:12, baseDef:16, passive:'thick_skin' },
  { id:'89', name:'影騎 Darknight', type:'dark', color:'#2F4F4F', accent:'#8B008B', outlineColor:'#E6E6FA', shape:'chess', baseHp:40, baseAtk:14, baseDef:10, passive:'intimidate', evolutions:[{level:30, reqMove:'absoluteGuard', to:'116'}] },
  // ↓進化型(不會野生出現,只能靠既有怪物升級變成)
  { id:'80',  name:'焰狼 Emberex',   type:'fire',    color:'#e8401a', accent:'#ff9d4d', shape:'round',   baseHp:56, baseAtk:19, baseDef:13, passive:'guts',       evolved:true },
  { id:'81',  name:'潮靈 Aquarus',   type:'water',   color:'#2a6fd6', accent:'#a8d8ff', shape:'drop',    baseHp:60, baseAtk:16, baseDef:16, passive:'waterAbsorbDef',      evolved:true },
  { id:'82', name:'巨木靈 Sprigant',type:'wood',    color:'#2f9e2f', accent:'#d4ffb8', shape:'leaf',    baseHp:58, baseAtk:17, baseDef:15, passive:'hypnoticTouch', evolved:true },
  { id:'83', name:'雷霸 Sparkong',  type:'thunder', color:'#ff9d00', accent:'#ffe28a', shape:'zap',     baseHp:50, baseAtk:22, baseDef:10, passive:'chargeUp',      evolved:true },

  // ↓神獸(需完成所有任務、開啟封印之門才能取得)
  { id:'94',name:'始源龍 Origindra', type:'none', color:'#ffd700', accent:'#fffbe6', shape:'dragon', baseHp:90, baseAtk:24, baseDef:20, passive:'regen', legendary:true },
  {id:'90', name:'日珥神龍 Solflare', type:'fire', color:'#FF2400', accent:'#FFDF00', outlineColor:'#8B0000', shape:'sun_dragon',baseHp:55, baseAtk:22, baseDef:12, passive:'firelight', legendary:true  },
  {id:'91', name:'創世巨樹 Yggdrasil', type:'wood',color:'#2E8B57', accent:'#ADFF2F', outlineColor:'#006400', shape:'world_tree', baseHp:75, baseAtk:12, baseDef:16, passive:'strongRegen' , legendary:true},
  {id:'92', name:'深淵海神 Leviathan', type:'water',color:'#000080', accent:'#00FFFF', outlineColor:'#000000', shape:'abyssal_whale', baseHp:60, baseAtk:15, baseDef:18, passive:'rainRegen', legendary:true },
  {id:'93', name:'天雷聖鳥 Thunderbird', type:'thunder',color:'#FFD700', accent:'#FFFFFF', outlineColor:'#DAA520', shape:'thunder_bird',baseHp:50, baseAtk:20, baseDef:15, passive:'chargeUp', legendary:true },
  {id:'95', name:'虛空神機 Voidgear', type:'none',color:'#E6E6FA', accent:'#FFFFFF', outlineColor:'#4B0082', shape:'sacred_gear',baseHp:60, baseAtk:14, baseDef:20, passive:'purity' , legendary:true },
  { id:'96', name:'冰河猛瑪 Glacioth', type:'ice', color:'#E0FFFF', accent:'#00FFFF', outlineColor:'#4682B4', shape:'ice_mammoth', baseHp:88, baseAtk:16, baseDef:22, passive:'snowSummon', legendary:true },
// 替換這 6 隻怪獸的設定 (加入了 evolutions 陣列)
  { id:'69', name:'機板獸 Bordroid', type:'fire', color:'#DE3222', accent:'#ffb347', shape:'board', baseHp:38, baseAtk:13, baseDef:11, passive:'thick_skin', evolutions:[{level:30, reqItem:'ta', consumeItem:true, to:'101'},{level:30, reqItem:'tb', consumeItem:true, to:'101'},{level:30, reqItem:'tc', consumeItem:true, to:'101'},{level:30, reqItem:'td', consumeItem:true, to:'101'}] },
  { id:'67', name:'塵怪 Dustling', type:'earth', color:'#c9a878', accent:'#efe0c0', shape:'square', baseHp:43, baseAtk:10, baseDef:13, passive:'thick_skin', evolutions:[{level:28, reqMap:['map10'], to:'102'}] },
  { id:'57', name:'幾何角 Rhombite', type:'none', color:'#48D1CC', accent:'#AFEEEE', outlineColor:'#008B8B', shape:'3rhombic_120degrees', baseHp:40, baseAtk:14, baseDef:12, passive:'copycat', evolutions:[{level:30, reqStat:'atk>def', to:'103'},{level:30, reqStat:'def>=atk', to:'104'}] },
  { id:'70', name:'黑箱獸 Blackbox', type:'dark', color:'#200000', accent:'#441169', shape:'square', outlineColor:'#ffffff', eyeColor:'#ffffff', baseHp:37, baseAtk:12, baseDef:10, passive:'pitchDarkGuard', evolutions:[{level:30, reqStatus:'paralysis', to:'105'}] },
  { id:'16', name:'雛鶏 Suukei', type:'wind', color:'#FCFC9F', accent:'#6B3C18', outlineColor:'#FFB575', shape:'chick', baseHp:32, baseAtk:12, baseDef:6, passive:'wakeUp', noEyes:true, evolutions:[{level:25, reqMove:'mercyStrike', to:'106'}] },
  { id:'73', name:'飛輪獸 Cyclon', type:'earth', color:'#F2EAA2', accent:'#fff8d9', outlineColor:'#E3F9FC', shape:'bike', baseHp:35, baseAtk:11, baseDef:9, passive:'expBoost', evolutions:[{level:35, reqSteps:5000, to:'100'}] },
      // ↓ 全新多條件進化型 (不會野生出現)
  { id:'101', name:'核心戰機 Coreborg', type:'fire', color:'#DE3222', accent:'#00E5FF', shape:'blocks', baseHp:55, baseAtk:20, baseDef:18, passive:'chargeUp', evolved:true },
  { id:'102', name:'熔岩巨像 Magmalith', type:'fire', color:'#e8401a', accent:'#d8c49a', shape:'square', baseHp:65, baseAtk:16, baseDef:22, passive:'ironWall', evolved:true },
  { id:'103', name:'銳鋒角', type:'none', color:'#48D1CC', accent:'#ff4500', shape:'crystal', baseHp:45, baseAtk:26, baseDef:11, passive:'firstStrike', evolved:true },
  { id:'104', name:'巨神碑', type:'none', color:'#48D1CC', accent:'#8B4513', shape:'square', baseHp:60, baseAtk:12, baseDef:25, passive:'shieldBash', evolved:true },
  { id:'105', name:'過載魔盒 Overload', type:'dark', color:'#111111', accent:'#ff00ff', outlineColor:'#ff00ff', shape:'square', baseHp:50, baseAtk:24, baseDef:14, passive:'intimidate', evolved:true },
  { id:'106', name:'仁義武禽', type:'wind', color:'#FCFC9F', accent:'#e94560', outlineColor:'#e94560', shape:'crow', baseHp:55, baseAtk:18, baseDef:15, passive:'steady', evolved:true },
  { id:'100', name:'狂飆重機 Motorock', type:'earth', color:'#A0522D', accent:'#ff0000', shape:'bike', baseHp:55, baseAtk:18, baseDef:17, passive:'missBuffAtk', evolved:true },
{ id:'107', name:'網域魔蛛 Cyberarach', type:'dark', color:'#111111', accent:'#00FF00', outlineColor:'#00FF00', shape:'spider', baseHp:55, baseAtk:22, baseDef:12, passive:'statusExploit', evolved:true },
// ↓ 更多全新多條件進化型
  // 108 暴雨嵐鳥 (水天鵝的雨中狂暴型態)
  { id:'108', name:'暴雨嵐鳥 Stormswan', type:'water', color:'#1e3a8a', accent:'#00ffff', outlineColor:'#00ffff', shape:'swan', baseHp:60, baseAtk:25, baseDef:12, passive:'rainPower', evolved:true },
  // 109 爆燃飛船 (熱氣球在灼傷時爆發的型態)
  { id:'109', name:'爆燃飛船 Zeppelin', type:'fire', color:'#8b0000', accent:'#ff4500', outlineColor:'#ff0000', shape:'air_balloon', baseHp:75, baseAtk:22, baseDef:10, passive:'firelight', evolved:true },
  // 110 琉璃斬破刃 (吸收玻璃劍後化作極致攻擊的大劍)
  { id:'110', name:'琉璃斬破刃 Glasscleaver', type:'earth', color:'#e0ffff', accent:'#ffffff', outlineColor:'#ffffff', shape:'cleaver', baseHp:50, baseAtk:32, baseDef:5, passive:'keenEye', evolved:true },
  // 111 霓虹巨塔 (LED燈在雷暴聖殿吸收能量變成的發電塔)
  { id:'111', name:'霓虹巨塔 Neontower', type:'thunder', color:'#000000', accent:'#00ff00', outlineColor:'#00ff00', shape:'tower', baseHp:65, baseAtk:18, baseDef:24, passive:'dazzling', evolved:true },
// 112 電馭駭兔 (由 36 Zapbit 變異)
  { id:'112', name:'電馭駭兔 Cyberabbit', type:'thunder', color:'#111111', accent:'#00FFFF', outlineColor:'#00FFFF', shape:'rabbit', baseHp:50, baseAtk:28, baseDef:12, passive:'keenEye', evolved:true },
  // 113 全知網椅 (由 55 沉思椅 變異)
  { id:'113', name:'全知網椅 ThroneNet', type:'none', color:'#111111', accent:'#FF00FF', outlineColor:'#FF00FF', shape:'chair', baseHp:70, baseAtk:15, baseDef:25, passive:'ironWall', evolved:true },
// ↓ 全新多條件機制進化型 (ID 114 ~ 119)
  // 114 沙暴巨城 (疊塊獸的沙暴天氣型態)
  { id:'114', name:'沙暴巨城 Sandcastle', type:'earth', color:'#D2B48C', accent:'#8B4513', outlineColor:'#000000', shape:'tower', baseHp:75, baseAtk:18, baseDef:28, passive:'sandstormCure', evolved:true },
  // 115 永凍聖代 (Sweetce 吸收吃剩的蘋果後的型態)
  { id:'115', name:'永凍聖代 Frostsundae', type:'ice', color:'#5678C7', accent:'#FF69B4', outlineColor:'#FFFFFF', shape:'ice_cream', baseHp:60, baseAtk:24, baseDef:15, passive:'regen', evolved:true },
  // 116 黯影領主 (影騎學會全面防禦後的晉升型態)
  { id:'116', name:'黯影領主 Shadowking', type:'dark', color:'#1a1a2e', accent:'#e94560', outlineColor:'#ff0000', shape:'chess', baseHp:65, baseAtk:30, baseDef:18, passive:'intimidate', evolved:true },
  // 117 淨泉仙子 (露水葉滿友好度的進化型態)
  { id:'117', name:'淨泉仙子 Springnymph', type:'water', color:'#00BFFF', accent:'#00FF7F', outlineColor:'#FFFFFF', shape:'leaf2', baseHp:55, baseAtk:22, baseDef:20, passive:'purity', evolved:true },
  // 118 猛毒沼魚 (Jyu2 中毒變異後的型態，轉為暗屬性)
  { id:'118', name:'猛毒沼魚 Toxifish', type:'dark', color:'#4B0082', accent:'#32CD32', outlineColor:'#00FF00', shape:'fish', baseHp:50, baseAtk:28, baseDef:14, passive:'statusExploit', evolved:true },
  // 119 悠遠風鈴 (迴音鈴達成8000步的歷戰型態)
  { id:'119', name:'悠遠風鈴 Echotoll', type:'wind', color:'#FFD700', accent:'#00FFFF', outlineColor:'#FFFFFF', shape:'bell', baseHp:58, baseAtk:20, baseDef:24, passive:'windCure', evolved:true },

  // ↓↓↓ 🧬 融合機限定型態 (34+66 ~ 01+73)：只能透過融合機取得，野外不會出現 ↓↓↓
  // 121 風雷鴉 (Thundercrow + 雷角 融合，雨天融合)
  { id:'121', name:'風雷鴉 Stormwing', type:'thunder', color:'#4B0082', accent:'#f0c020', outlineColor:'#000000', shape:'crow', baseHp:58, baseAtk:27, baseDef:16, passive:'keenEye', evolved:true, fused:true },
  // 122 冰霜盾 (守護盾 + iflake 融合，高HP/防禦)
  { id:'122', name:'冰霜盾 Iceshield', type:'ice', color:'#C0C0C0', accent:'#4F92F7', outlineColor:'#708090', shape:'shield', baseHp:70, baseAtk:10, baseDef:28, passive:'shieldBash', evolved:true, fused:true },
  // 123 巨木守衛 (巨木靈 + 露水葉 融合，晴天融合)
  { id:'123', name:'巨木守衛 Guardian', type:'wood', color:'#228B22', accent:'#00BFFF', outlineColor:'#006400', shape:'tree', baseHp:62, baseAtk:16, baseDef:22, passive:'regen', evolved:true, fused:true },
  // 124 三帶鳥 (電鼬 + 爆炎糖 融合)
  { id:'124', name:'三帶鳥 Sandai52', type:'fire', color:'#FF4500', accent:'#ffd23f', outlineColor:'#FFD700', shape:'wing', baseHp:54, baseAtk:28, baseDef:14, passive:'firstStrike', evolved:true, fused:true },
  // 125 光星聖典 (Sparkbook + 光珞 融合，會自動學會恢復技能「光合作用」)
  { id:'125', name:'光星聖典 Oracle', type:'light', color:'#ffe98a', accent:'#8B4513', outlineColor:'#FFD700', shape:'tilted_book', baseHp:60, baseAtk:19, baseDef:19, passive:'regen', evolved:true, fused:true },
  // 126/127 雙生蝶 (幻風蝶 + Kacyo 融合，等級較高的一方決定屬性，較低的一方決定外型)
  { id:'126', name:'雙生蝶 Duality', type:'wind', color:'#87CEFA', accent:'#ff6b4a', outlineColor:'#4682B4', shape:'butterfly_3', baseHp:52, baseAtk:24, baseDef:15, passive:'statusAccBoost', evolved:true, fused:true },
  { id:'127', name:'雙生蝶 Duality', type:'fire', color:'#ff6b4a', accent:'#87CEFA', outlineColor:'#F0A932', shape:'butterfly_1', baseHp:52, baseAtk:24, baseDef:15, passive:'statusAccBoost', evolved:true, fused:true },
  // 128 菌傘精 (斥毒菇 + Wimi 融合，需在map23或map24融合)
  { id:'128', name:'菌傘精 Mycofly', type:'wood', color:'#342714', accent:'#C1FA98', outlineColor:'#CFB180', shape:'mushroom', baseHp:60, baseAtk:16, baseDef:23, passive:'poisonImmune', evolved:true, fused:true },
  // 129 焰蜻蜓 (疾風蜓 + 蓮華 融合，需在map9或map10融合)
  { id:'129', name:'焰蜻蜓 Blazefly', type:'fire', color:'#FC1E1E', accent:'#98FB98', outlineColor:'#228B22', shape:'dragonfly', baseHp:52, baseAtk:30, baseDef:13, passive:'vampiric', evolved:true, fused:true },
  // 130 幻術師 (Thunderhat + Maskspark 融合，濃霧融合，登場時會暫時變成對方的屬性)
  { id:'130', name:'幻術師 Illusionist', type:'dark', color:'#8B0000', accent:'#9370DB', outlineColor:'#000000', shape:'mask', baseHp:54, baseAtk:24, baseDef:17, passive:'mimic', evolved:true, fused:true },
  // 131/132 燈塔守 (Beaconvolt + Doutain 融合，兩者外型都是燈塔，等級較高的一方決定屬性)
  { id:'131', name:'燈塔守 Lumintower', type:'light', color:'#F5F5F5', accent:'#FCE490', outlineColor:'#2F4F4F', shape:'lighthouse', baseHp:63, baseAtk:14, baseDef:24, passive:'illuminate', evolved:true, fused:true },
  { id:'132', name:'燈塔守 Lumintower', type:'thunder', color:'#FCE490', accent:'#F5F5F5', outlineColor:'#ecf0f1', shape:'lighthouse', baseHp:63, baseAtk:14, baseDef:24, passive:'illuminate', evolved:true, fused:true },
  // 133 極速輪 (狂風捲 + 飛輪獸 融合，濃霧融合，轉速可達每秒千轉，30%機率完全迴避攻擊)
  { id:'133', name:'極速輪 Velocycle', type:'wind', color:'#D3D3D3', accent:'#F2EAA2', outlineColor:'#696969', shape:'bike', baseHp:54, baseAtk:23, baseDef:18, passive:'evasive', evolved:true, fused:true },
  // 134 電瓶車 (Ba-01 + 飛輪獸 融合)
  { id:'134', name:'電瓶車 BatteryCart', type:'thunder', color:'#FFFE4D', accent:'#F2EAA2', outlineColor:'#E3F9FC', shape:'bike', baseHp:62, baseAtk:20, baseDef:21, passive:'martyr', evolved:true, fused:true },

  // ↓↓↓ 新增普通進化型態 (135~139) ↓↓↓
  // 135 磁浮列車 (T-way 的進化型)
  { id:'135', name:'磁浮列車 MagLev', type:'thunder', color:'#FFFE14', accent:'#00FFFF', outlineColor:'#ecf0f1', shape:'subway_head', baseHp:56, baseAtk:20, baseDef:19, passive:'firstStrike', evolved:true },
  // 136 雪羽蒲公英 (dandeice 的進化型)
  { id:'136', name:'雪羽蒲公英 Snowdown', type:'ice', color:'#EAF6FF', accent:'#C7FBFC', outlineColor:'#8fdcff', shape:'dandelion', baseHp:52, baseAtk:17, baseDef:16, passive:'statusResilience', evolved:true },
  // 137 雷光立燈 (Fuyuka 的進化型,需要「電器機械共鳴」發動時才能進化)
  { id:'137', name:'雷光立燈 Voltstand', type:'thunder', color:'#ffe98a', accent:'#00FFFF', outlineColor:'#ecf0f1', shape:'floor_lamp', baseHp:50, baseAtk:22, baseDef:15, passive:'lightShield', evolved:true },
  // 138 探照聚光燈 (Flashlamp 的進化型,需要「電器機械共鳴」發動時才能進化)
  { id:'138', name:'探照聚光燈 Searchlume', type:'light', color:'#FFFFE0', accent:'#F0E68C', outlineColor:'#8B4513', shape:'floor_lamp', baseHp:52, baseAtk:19, baseDef:19, passive:'paralysisImmune', evolved:true },
  // 139 業火提灯 (提灯chouchin 的進化型)
  { id:'139', name:'業火提灯 Blazechouchin', type:'fire', color:'#FF4500', accent:'#FFFE0A', outlineColor:'#ff6b4a', shape:'lantern_2', baseHp:48, baseAtk:24, baseDef:12, passive:'steady', evolved:true },
];

// 取得當前生效的特性（支援基因複製）
// ==========================================
// 🧰 2. 特性系統工具箱 (集中管理所有讀取特性的函式)
// ==========================================
// ==========================================




// ==========================================
// 🌟 3. 特性事件分發中心與調度器 
// (PassiveEvents 字典 以及 runPassiveEvent 函式)
// ==========================================
//const PassiveEvents = { ... };
//function runPassiveEvent(...) { ... }
// 戰鬥中「目前生效」的屬性:優先用技能暫時改變的 currentType,沒有的話用種族原本的屬性。
// currentType 只在單場戰鬥中有效,戰鬥結束會重置(見 endBattle)。
function effectiveType(mon){ return mon.currentType || MonsterUtil.species(mon).type; }

// ---------- 繪製(原創簡易圖形,非任何既有角色美術) ----------
function drawMonster(ctx, species, w, h, overrideColor) {
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2, h/2);

  // 進化型/神獸背後加一圈光環
  if (species.evolved || species.legendary) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = species.accent;
    ctx.beginPath(); ctx.arc(0, 0, Math.min(w,h)*0.46, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // 異色個體背後加上小星星
  if (overrideColor) {
    ctx.save();
    ctx.fillStyle = '#fff8c9';
    ctx.font = `${Math.round(Math.min(w,h)*0.22)}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✨', Math.min(w,h)*0.34, -Math.min(w,h)*0.34);
    ctx.restore();
  }

  // 共用繪圖設定
  ctx.fillStyle = overrideColor || species.color;
  ctx.strokeStyle = species.outlineColor || '#1a1a2e';
  ctx.lineWidth = 2;
  const s = Math.min(w,h)*0.32;

  // 🌟 呼叫圖形繪製兵工廠
  const drawShape = SHAPE_DRAWERS[species.shape];
  if (drawShape) {
      drawShape(ctx, s, species, overrideColor);
  } else {
      // 🛡️ 缺少形狀時的安全防護：畫一個灰色的「?」問號圖示
      ctx.fillStyle = '#666';
      ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(s*1.2)}px monospace`; 
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 2);
  }
// 👇 🌟 新增判斷：如果怪獸沒有設定 noEyes: true，才畫預設的雙眼
  if (!species.noEyes) {
      ctx.fillStyle = species.eyeColor || '#111';
      ctx.beginPath(); ctx.arc(-s*0.32, -s*0.05, s*0.14, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.32, -s*0.05, s*0.14, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}
// ==========================================
// ❓ 繪製圖鑑未解鎖的黑影
// ==========================================
function drawSilhouette(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w/2, h/2);
  
  // 畫一個深灰色的圓形底底
  ctx.fillStyle = '#2a2a4a';
  ctx.beginPath(); 
  ctx.arc(0, 0, Math.min(w,h)*0.35, 0, Math.PI*2); 
  ctx.fill();
  
  // 畫一個問號
  ctx.fillStyle = '#666f9e';
  ctx.font = `bold ${Math.round(Math.min(w,h)*0.5)}px monospace`; 
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 2);
  
  ctx.restore();
}
// ==========================================
// 🎨 圖形繪製兵工廠 (Shape Registry)
// ==========================================
const SHAPE_DRAWERS = {
    round(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0,4,s,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.7,-s*0.6); ctx.lineTo(-s*0.3,-s*1.4); ctx.lineTo(0,-s*0.6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*0.7,-s*0.6); ctx.lineTo(s*0.3,-s*1.4); ctx.lineTo(0,-s*0.6); ctx.fill();
    },
    drop(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0,-s*1.3);
      ctx.quadraticCurveTo(s*1.1, s*0.4, 0, s*1.1);
      ctx.quadraticCurveTo(-s*1.1, s*0.4, 0, -s*1.3);
      ctx.fill(); ctx.stroke();
    },
    chess(ctx, s, species, overrideColor) {
      ctx.beginPath();
      ctx.moveTo(0, -s*0.7); ctx.lineTo(s*0.7, s*1.0); ctx.lineTo(-s*0.7, s*1.0); 
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -s*0.5, s*0.35, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -s*0.4, s*0.7, 0, Math.PI*2); ctx.fill(); // big round
      ctx.stroke();
    },
    leaf(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0,0,s*1.1,s*0.8,Math.PI/4,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0,0,s*1.1,s*0.8,-Math.PI/4,0,Math.PI*2); ctx.fill(); ctx.stroke();
    },
    square(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.roundRect(-s,-s*0.8,s*2,s*1.8,6); ctx.fill(); ctx.stroke();
    },
    zap(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0,4,s*0.9,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent;
      ctx.beginPath();
      ctx.moveTo(-s*0.2,-s*1.2); ctx.lineTo(s*0.15,-s*0.1); ctx.lineTo(-s*0.1,-s*0.1);
      ctx.lineTo(s*0.2, s*1.1); ctx.lineTo(-s*0.2, s*0.05); ctx.lineTo(s*0.05, s*0.05);
      ctx.closePath(); ctx.fill();
    },
    shell(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0,s*0.2,s,Math.PI,0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0,s*0.5,s*0.9,s*0.5,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    },
    crystal(ctx, s, species, overrideColor) {
      ctx.beginPath();
      ctx.moveTo(0,-s*1.3); ctx.lineTo(s*0.8,-s*0.1); ctx.lineTo(s*0.4,s*1.1);
      ctx.lineTo(-s*0.4,s*1.1); ctx.lineTo(-s*0.8,-s*0.1); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(0,-s*1.3); ctx.lineTo(0,s*1.1); ctx.stroke();
    },
    wing(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0,0,s*0.6,s*0.9,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-s*0.9,-s*0.2,s*0.6,s*0.35,-0.5,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s*0.9,-s*0.2,s*0.6,s*0.35,0.5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    },
    star(ctx, s, species, overrideColor) {
      ctx.beginPath();
      for(let i=0;i<5;i++){
        const a1 = -Math.PI/2 + i*(2*Math.PI/5);
        const a2 = a1 + Math.PI/5;
        const p1x = Math.cos(a1)*s*1.15, p1y = Math.sin(a1)*s*1.15;
        const p2x = Math.cos(a2)*s*0.45, p2y = Math.sin(a2)*s*0.45;
        if(i===0) ctx.moveTo(p1x,p1y); else ctx.lineTo(p1x,p1y);
        ctx.lineTo(p2x,p2y);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    candy(ctx, s, species, overrideColor) {
  ctx.beginPath(); ctx.moveTo(-s*0.7, -s*0.75); ctx.lineTo(s*0.7, -s*0.75); ctx.lineTo(0, -s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, s*0.3); ctx.lineTo(s*0.7, s*1.15); ctx.lineTo(-s*0.7, s*1.15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, s*0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
},
      leaf2(ctx, s, species, overrideColor) {
          ctx.beginPath();
          ctx.moveTo(0, -s*1.2); ctx.quadraticCurveTo(s*0.8, -s*0.2, 0, s*1.0);
          ctx.quadraticCurveTo(-s*0.8, -s*0.2, 0, -s*1.2); ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.strokeStyle='rgba(255,255,255,.5)';
          ctx.beginPath(); ctx.moveTo(0, -s*1.2); ctx.lineTo(0, s*1.4); ctx.stroke();
},
mushroom2(ctx, s, species, overrideColor) {
  ctx.beginPath(); ctx.rect(-s*0.25, 0, s*0.5, s*0.8); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, s*0.8, Math.PI, 0); ctx.lineTo(s*0.8, s*0.1); ctx.lineTo(-s*0.8, s*0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-s*0.4, -s*0.3, s*0.15, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(s*0.3, -s*0.4, s*0.1, 0, Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -s*0.6, s*0.12, 0, Math.PI*2); ctx.stroke();
},
    ice_mammoth(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(-s*0.9, -s*0.2, s*0.4, s*0.8, -0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s*0.9, -s*0.2, s*0.4, s*0.8, 0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s*0.95, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.25, s*0.2); ctx.quadraticCurveTo(-s*0.2, s*1.3, -s*0.1, s*1.5);
      ctx.lineTo(s*0.1, s*1.5); ctx.quadraticCurveTo(s*0.2, s*1.3, s*0.25, s*0.2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = species.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-s*0.3, s*0.7); ctx.quadraticCurveTo(-s*1.4, s*0.9, -s*1.3, -s*0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.3, s*0.7); ctx.quadraticCurveTo(s*1.4, s*0.9, s*1.3, -s*0.4); ctx.stroke();
      ctx.lineWidth = 2;
    },
    fish(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(0, -s*0.5); ctx.lineTo(-s*0.7, 0);
      ctx.lineTo(-s*1.2, -s*0.6); ctx.lineTo(-s*1.2, s*0.6); ctx.lineTo(-s*0.7, 0);
      ctx.lineTo(0, s*0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(s*0.5, -s*0.15, s*0.1, 0, Math.PI*2); ctx.fill();
    },
    shrimp(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*0.5); 
      ctx.bezierCurveTo(s*0.8, -s*0.8, s*1.0, s*0.8, -s*0.5, s*0.8); 
      ctx.bezierCurveTo(s*0.3, s*0.5, 0, -s*0.1, -s*0.6, -s*0.5); 
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*0.5); ctx.lineTo(-s*1.1, -s*0.2);
      ctx.moveTo(-s*0.6, -s*0.5); ctx.lineTo(-s*0.8, s*0.2); ctx.stroke();
    },
    fishing_rod(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*0.8); ctx.lineTo(s*0.6, -s*0.6);
      ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.6, -s*0.6); ctx.lineTo(s*0.6, s*0.4);
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.45, s*0.4, s*0.15, 0, Math.PI); ctx.stroke();
      ctx.lineWidth = 2;
    },
    coral(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.2, s*1.0);
      ctx.bezierCurveTo(-s*0.6, s*0.5, -s*1.0, 0, -s*0.7, -s*0.5);
      ctx.quadraticCurveTo(-s*0.5, -s*0.8, -s*0.4, -s*0.4); ctx.quadraticCurveTo(-s*0.3, -s*0.1, -s*0.1, s*0.1);
      ctx.quadraticCurveTo(-s*0.2, -s*0.5, 0, -s*1.0); ctx.quadraticCurveTo(s*0.3, -s*1.2, s*0.3, -s*0.7);
      ctx.quadraticCurveTo(s*0.3, -s*0.3, s*0.1, s*0.1); ctx.quadraticCurveTo(s*0.4, -s*0.2, s*0.8, -s*0.4);
      ctx.quadraticCurveTo(s*1.0, -s*0.1, s*0.7, s*0.3); ctx.bezierCurveTo(s*0.5, s*0.6, s*0.4, s*1.0, s*0.2, s*1.0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.5, -s*0.1, s*0.06, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0.1, -s*0.4, s*0.08, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.5, 0.1, s*0.05, 0, Math.PI*2); ctx.stroke();
    },
    water_pump(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.25, -s*0.5, s*0.5, s*1.5); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.5, s*1.0, s*1.0, s*0.2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.5, s*0.25, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.25, 0); ctx.lineTo(-s*0.7, 0); ctx.lineTo(-s*0.7, s*0.3); ctx.lineTo(-s*0.5, s*0.3);
      ctx.lineTo(-s*0.5, s*0.2); ctx.lineTo(-s*0.25, s*0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.6, s*0.6, s*0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.25, -s*0.3); ctx.lineTo(s*0.8, -s*0.8); ctx.lineWidth = 6; ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s*0.8, -s*0.8, s*0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    anglerfish(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0, 0, s*0.7, Math.PI*0.1, Math.PI*1.7); ctx.lineTo(s*0.1, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.3, -s*0.2); ctx.lineTo(s*0.4, -s*0.05);
      ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.3, s*0.2); ctx.lineTo(s*0.4, s*0.05); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(-s*0.1, -s*0.25, s*0.1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.6); ctx.quadraticCurveTo(-s*0.2, -s*1.2, s*0.6, -s*0.9); ctx.stroke();
      ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(s*0.6, -s*0.9, s*0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.7, 0); ctx.lineTo(-s*1.1, -s*0.3); ctx.lineTo(-s*1.1, s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    slender_fish(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.0, s*0.2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.0, 0); ctx.lineTo(-s*1.4, -s*0.3); ctx.lineTo(-s*1.3, 0); ctx.lineTo(-s*1.4, s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s*0.2); ctx.quadraticCurveTo(-s*0.2, -s*0.5, -s*0.4, -s*0.2); ctx.moveTo(0, s*0.2); ctx.quadraticCurveTo(-s*0.2, s*0.5, -s*0.4, s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.4, 0, s*0.15, -Math.PI/3, Math.PI/3); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(s*0.7, -s*0.05, s*0.04, 0, Math.PI*2); ctx.fill();
    },
    butterfly_3(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(-s*1.0, -s*0.8); ctx.lineTo(-s*1.2, -s*0.2); ctx.lineTo(-s*0.5, s*0.2);
      ctx.lineTo(-s*0.9, s*1.0); ctx.lineTo(-s*0.6, s*0.8); ctx.lineTo(-s*0.3, s*1.2); ctx.lineTo(0, s*0.5);
      ctx.lineTo(s*0.3, s*1.2); ctx.lineTo(s*0.6, s*0.8); ctx.lineTo(s*0.9, s*1.0); ctx.lineTo(s*0.5, s*0.2); 
      ctx.lineTo(s*1.2, -s*0.2); ctx.lineTo(s*1.0, -s*0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(-s*0.8, -s*0.4); ctx.lineTo(0, 0); ctx.lineTo(s*0.8, -s*0.4);
      ctx.moveTo(-s*0.6, s*0.6); ctx.lineTo(0, s*0.3); ctx.lineTo(s*0.6, s*0.6); ctx.stroke();
      ctx.strokeStyle = '#ecf0f1';
      ctx.beginPath(); ctx.moveTo(0, -s*0.5); ctx.lineTo(0, s*0.6); ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 2;
    },
    lotus(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.9,s*0.4); ctx.quadraticCurveTo(-s*0.6,-s*0.5,0,0);
      ctx.quadraticCurveTo(s*0.6,-s*0.5,s*0.9,s*0.4); ctx.quadraticCurveTo(0,s*0.9,-s*0.9,s*0.4);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(-s*0.3,-s*0.8,0,-s*1.0); ctx.quadraticCurveTo(s*0.3,-s*0.8,0,0); ctx.fill(); ctx.stroke();
    },
    cactus(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.roundRect(-s*0.3,-s*0.9,s*0.6,s*1.8,s*0.25);
      ctx.moveTo(-s*0.3,s*0.2); ctx.lineTo(-s*0.8,s*0.2); ctx.lineTo(-s*0.8,-s*0.2);
      ctx.moveTo(s*0.3,-s*0.1); ctx.lineTo(s*0.8,-s*0.1); ctx.lineTo(s*0.8,-s*0.5); ctx.fill(); ctx.stroke();
    },
    daisy_top(ctx, s, species, overrideColor) {
      for(let i=0; i<6; i++) {
          ctx.beginPath(); ctx.ellipse(0, 0, s*0.9, s*0.2, i*Math.PI/6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, s*0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(-s*0.2, -s*0.2); ctx.lineTo(s*0.2, s*0.2); ctx.moveTo(s*0.2, -s*0.2); ctx.lineTo(-s*0.2, s*0.2); ctx.stroke();
    },
    musical_note(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(-s*0.4, s*0.6, s*0.3, s*0.2, -Math.PI/6, 0, Math.PI*2); ctx.ellipse(s*0.6, s*0.4, s*0.3, s*0.2, -Math.PI/6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.13, s*0.6); ctx.lineTo(-s*0.13, -s*0.5); ctx.moveTo(s*0.87, s*0.4); ctx.lineTo(s*0.87, -s*0.7);
      ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-s*0.13, -s*0.5); ctx.lineTo(s*0.87, -s*0.7); ctx.lineTo(s*0.87, -s*0.4); ctx.lineTo(-s*0.13, -s*0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    crown(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*1.0,s*0.7); ctx.lineTo(-s*1.5,-s*0.5); ctx.lineTo(-s*0.6,s*0.1);
      ctx.lineTo(0,-s*0.8); ctx.lineTo(s*0.6,s*0.1); ctx.lineTo(s*1.5,-s*0.5); ctx.lineTo(s*1.0,s*0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.9,s*0.7); ctx.lineTo(s*0.9,s*0.7); ctx.stroke();
    },
    diamond(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*0.5); ctx.lineTo(s*0.6, -s*0.5); ctx.lineTo(s*0.9, 0); ctx.lineTo(0, s*1.0); ctx.lineTo(-s*0.9, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*0.5); ctx.lineTo(0, s*1.0); ctx.lineTo(s*0.6, -s*0.5); ctx.moveTo(-s*0.9, 0); ctx.lineTo(s*0.9, 0); ctx.stroke();
    },
    piano_keys(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*1.05, -s*0.8, s*0.7, s*1.6); ctx.rect(-s*0.35, -s*0.8, s*0.7, s*1.6); ctx.rect(s*0.35, -s*0.8, s*0.7, s*1.6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; 
      ctx.beginPath(); ctx.rect(-s*0.55, -s*0.8, s*0.4, s*1.0); ctx.rect(s*0.15, -s*0.8, s*0.4, s*1.0); ctx.fill(); ctx.stroke();
    },
    heart(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, -s*0.2); ctx.bezierCurveTo(s*0.8, -s*1.2, s*1.4, s*0.1, 0, s*1.1); ctx.bezierCurveTo(-s*1.4, s*0.1, -s*0.8, -s*1.2, 0, -s*0.2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(-s*0.7, -s*0.2); ctx.quadraticCurveTo(-s*0.8, -s*0.5, -s*0.4, -s*0.7); ctx.stroke();
    },
    desk_lamp(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(-s*0.5, s*0.8, s*0.4, s*0.15, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5, s*0.7); ctx.lineTo(0, -s*0.2); ctx.lineTo(s*0.5, -s*0.5); ctx.lineWidth = 6; ctx.stroke(); ctx.lineWidth = 2; 
      ctx.beginPath(); ctx.arc(0, -s*0.2, s*0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(s*0.5, -s*0.5); ctx.rotate(Math.PI / 4); 
      ctx.beginPath(); ctx.arc(0, 0, s*0.4, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s*0.2, 0, Math.PI); ctx.stroke(); ctx.restore();
    },
    floor_lamp(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, s*1.2, s*0.5, s*0.1, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, s*1.2); ctx.lineTo(0, -s*0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*1.2); ctx.lineTo(s*0.3, -s*1.2); ctx.lineTo(s*0.6, -s*0.4); ctx.lineTo(-s*0.6, -s*0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -s*0.4, s*0.6, s*0.1, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.3, -s*0.4); ctx.lineTo(s*0.3, s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.3, s*0.25, s*0.05, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    lantern_1(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, -s*0.9); ctx.lineTo(s*0.7, -s*0.4); ctx.lineTo(-s*0.7, -s*0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.15, -s*1.1, s*0.3, s*0.3); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.55, -s*0.4, s*1.0, s*1.2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-s*0.5, 0); ctx.lineTo(s*0.5, 0); ctx.moveTo(-s*0.5, s*0.4); ctx.lineTo(s*0.5, s*0.4); ctx.stroke();
    },
    lighthouse(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.4, s*1.2); ctx.lineTo(s*0.4, s*1.2); ctx.lineTo(s*0.2, -s*0.4); ctx.lineTo(-s*0.2, -s*0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.35, s*0.7); ctx.lineTo(s*0.35, s*0.7); ctx.moveTo(-s*0.3, s*0.2); ctx.lineTo(s*0.3, s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.3, -s*0.5, s*0.6, s*0.1); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.15, -s*0.8, s*0.3, s*0.3); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.8, s*0.15, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(-s*0.15, -s*0.65); ctx.lineTo(-s*1.2, -s*0.4); ctx.lineTo(-s*1.2, -s*0.9); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.15, -s*0.65); ctx.lineTo(s*1.2, -s*0.4); ctx.lineTo(s*1.2, -s*0.9); ctx.closePath(); ctx.stroke();
    },
    cleaver(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, -s*0.5); ctx.lineTo(s*0.2, -s*0.5); ctx.lineTo(s*0.2, s*0.6); ctx.quadraticCurveTo(-s*0.3, s*0.7, -s*0.8, s*0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(-s*0.6, -s*0.3, s*0.08, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.rect(s*0.2, -s*0.4, s*0.7, s*0.25); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.arc(s*0.4, -s*0.27, s*0.04, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s*0.7, -s*0.27, s*0.04, 0, Math.PI*2); ctx.fill();
    },
    crow(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(s*0.7, -s*0.4); ctx.lineTo(s*0.3, -s*0.3); ctx.lineTo(s*0.7, -s*0.2); ctx.lineTo(s*0.4, -s*0.1); 
      ctx.quadraticCurveTo(s*0.3, s*0.5, -s*0.2, s*0.5); ctx.lineTo(-s*0.9, s*0.7); ctx.lineTo(-s*0.6, s*0.2); 
      ctx.quadraticCurveTo(-s*0.5, -s*0.6, 0, -s*0.6); ctx.quadraticCurveTo(s*0.2, -s*0.6, s*0.3, -s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(s*0.15, -s*0.35, s*0.06, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*0.1, -s*0.1); ctx.quadraticCurveTo(s*0.2, 0, s*0.1, s*0.3); ctx.quadraticCurveTo(-s*0.4, s*0.4, -s*0.6, 0.1); ctx.quadraticCurveTo(-s*0.3, -s*0.1, -s*0.1, -s*0.1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.1, s*0.5); ctx.lineTo(-s*0.1, s*0.9); ctx.lineTo(s*0.1, s*0.9); ctx.moveTo(-s*0.3, s*0.45); ctx.lineTo(-s*0.3, s*0.85); ctx.lineTo(-s*0.1, s*0.85); ctx.stroke();
    },
    rabbit(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(-s*0.1, s*0.3, s*0.5, s*0.4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.4, -s*0.1, s*0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s*0.2, -s*0.7, s*0.1, s*0.4, -Math.PI/6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s*0.5, -s*0.6, s*0.1, s*0.3, Math.PI/6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.6, s*0.4, s*0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(s*0.5, -s*0.15, s*0.05, 0, Math.PI*2); ctx.fill();
    },
    mask(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.7, s*0.9, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; 
      ctx.beginPath(); ctx.ellipse(-s*0.3, -s*0.2, s*0.2, s*0.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s*0.3, -s*0.2, s*0.2, s*0.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*0.2, s*0.4); ctx.quadraticCurveTo(0, s*0.6, s*0.2, s*0.4); ctx.stroke();
    },
    bat(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s*0.5, -s*0.8, -s*1.2, -s*0.4); ctx.quadraticCurveTo(-s*0.8, 0, -s*1.0, s*0.5); ctx.quadraticCurveTo(-s*0.5, s*0.2, 0, s*0.7);
      ctx.quadraticCurveTo(s*0.5, s*0.2, s*1.0, s*0.5); ctx.quadraticCurveTo(s*0.8, 0, s*1.2, -s*0.4); ctx.quadraticCurveTo(s*0.5, -s*0.8, 0, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.2, 0); ctx.lineTo(-s*0.3, -s*0.6); ctx.lineTo(0, -s*0.3); ctx.lineTo(s*0.3, -s*0.6); ctx.lineTo(s*0.2, 0); ctx.fill(); ctx.stroke();
    },
    tilted_book(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.4, -s*0.7); ctx.lineTo(s*0.7, -s*0.5); ctx.lineTo(s*0.5, s*0.7); ctx.lineTo(-s*0.6, s*0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.7, -s*0.5); ctx.lineTo(s*0.8, -s*0.3); ctx.lineTo(s*0.6, s*0.9); ctx.lineTo(s*0.5, s*0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.6, s*0.9); ctx.lineTo(-s*0.5, s*0.7); ctx.lineTo(-s*0.6, s*0.5); ctx.lineTo(s*0.5, s*0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(s*0.75, -s*0.4); ctx.lineTo(s*0.55, s*0.8); ctx.moveTo(-s*0.55, s*0.6); ctx.lineTo(s*0.55, s*0.8); ctx.stroke();
    },
    bridge(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*1.2, -s*0.2); ctx.quadraticCurveTo(0, -s*0.4, s*1.2, -s*0.2); ctx.lineTo(s*1.2, 0); ctx.quadraticCurveTo(0, -s*0.2, -s*1.2, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*1.0, 0); ctx.lineTo(-s*1.0, s*1.0); ctx.lineTo(-s*0.6, s*1.0); ctx.quadraticCurveTo(0, -s*0.2, s*0.6, s*1.0); ctx.lineTo(s*1.0, s*1.0); ctx.lineTo(s*1.0, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.8, -s*0.25); ctx.lineTo(-s*0.8, -s*0.6); ctx.moveTo(-s*0.4, -s*0.32); ctx.lineTo(-s*0.4, -s*0.65); ctx.moveTo(0, -s*0.35); ctx.lineTo(0, -s*0.7); ctx.moveTo(s*0.4, -s*0.32); ctx.lineTo(s*0.4, -s*0.65); ctx.moveTo(s*0.8, -s*0.25); ctx.lineTo(s*0.8, -s*0.6); ctx.stroke();
    },
    tower(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*1.2); ctx.quadraticCurveTo(-s*0.3, s*0.2, -s*0.1, -s*0.8); ctx.lineTo(s*0.1, -s*0.8); ctx.quadraticCurveTo(s*0.3, s*0.2, s*0.8, s*1.2); ctx.lineTo(s*0.4, s*1.2); ctx.quadraticCurveTo(s*0.1, s*0.5, 0, s*0.5); ctx.quadraticCurveTo(-s*0.1, s*0.5, -s*0.4, s*1.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.4, s*0.2, s*0.8, s*0.15); ctx.rect(-s*0.25, -s*0.4, s*0.5, s*0.15); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s*0.8); ctx.lineTo(0, -s*1.4); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-s*0.4, s*0.35); ctx.lineTo(s*0.35, s*1.2); ctx.moveTo(s*0.4, s*0.35); ctx.lineTo(-s*0.35, s*1.2); ctx.stroke();
    },
    hat(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, s*0.5, s*1.2, s*0.3, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.6, -s*0.5, s*1.2, s*1.0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.5, s*0.6, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.rect(-s*0.6, s*0.2, s*1.2, s*0.3); ctx.fill(); ctx.stroke();
    },
    tornado(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, -s*0.7, s*0.9, s*0.2, 0, 0, Math.PI*2); ctx.ellipse(0, -s*0.3, s*0.7, s*0.15, 0, 0, Math.PI*2); ctx.ellipse(0, 0.1, s*0.5, s*0.1, 0, 0, Math.PI*2); ctx.ellipse(0, s*0.4, s*0.3, s*0.08, 0, 0, Math.PI*2); ctx.ellipse(0, s*0.7, s*0.15, s*0.05, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.9, -s*0.7); ctx.lineTo(-s*0.15, s*0.7); ctx.moveTo(s*0.9, -s*0.7); ctx.lineTo(s*0.15, s*0.7); ctx.stroke();
    },
    dragonfly(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*0.8); ctx.lineTo(s*0.6, -s*0.6); ctx.lineWidth = 5; ctx.stroke(); ctx.lineWidth = 2; 
      ctx.beginPath(); ctx.arc(s*0.7, -s*0.7, s*0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-s*0.2, -s*0.6, s*0.6, s*0.12, Math.PI/4, 0, Math.PI*2); ctx.ellipse(-s*0.4, -s*0.4, s*0.5, s*0.12, Math.PI/4, 0, Math.PI*2); ctx.ellipse(s*0.6, s*0.3, s*0.6, s*0.12, Math.PI/4, 0, Math.PI*2); ctx.ellipse(s*0.3, s*0.4, s*0.5, s*0.12, Math.PI/4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    drifting_flag(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*1.2); ctx.lineTo(-s*0.6, s*1.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*1.1); ctx.bezierCurveTo(0, -s*1.5, s*0.5, -s*0.7, s*1.1, -s*1.1); ctx.lineTo(s*1.1, 0); ctx.bezierCurveTo(s*0.5, s*0.4, 0, -s*0.4, -s*0.6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    butterfly_1(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(-s*0.4, -s*0.3, s*0.6, s*0.4, -Math.PI/6, 0, Math.PI*2); ctx.ellipse(s*0.4, -s*0.3, s*0.6, s*0.4, Math.PI/6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-s*0.3, s*0.4, s*0.4, s*0.4, Math.PI/4, 0, Math.PI*2); ctx.ellipse(s*0.3, s*0.4, s*0.4, s*0.4, -Math.PI/4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.12, s*0.6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.05, -s*0.5); ctx.quadraticCurveTo(-s*0.2, -s*1.2, -s*0.4, -s*0.9); ctx.moveTo(s*0.05, -s*0.5); ctx.quadraticCurveTo(s*0.2, -s*1.2, s*0.4, -s*0.9); ctx.stroke();
    },
    tree(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0,-s*1.3); ctx.lineTo(s*0.7,-s*0.4); ctx.lineTo(s*0.4,-s*0.4); ctx.lineTo(s*0.8,s*0.3); ctx.lineTo(s*0.3,s*0.2); ctx.lineTo(s*0.5,s*0.9); ctx.lineTo(-s*0.5,s*0.9); ctx.lineTo(-s*0.3,s*0.2); ctx.lineTo(-s*0.8,s*0.3); ctx.lineTo(-s*0.4,-s*0.4); ctx.lineTo(-s*0.7,-s*0.4); ctx.closePath(); ctx.fillStyle = 'green'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'brown'; ctx.fillRect(-s*0.2, -s*0.4, s*0.4, s*1.3); 
    },
    mushroom(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.25, 0, s*0.5, s*0.8); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, s*0.8, Math.PI, 0); ctx.lineTo(s*0.8, s*0.1); ctx.lineTo(-s*0.8, s*0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.4, -s*0.3, s*0.15, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.3, -s*0.4, s*0.1, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.6, s*0.12, 0, Math.PI*2); ctx.stroke();
    },
    dead_tree(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.3, s*1.2); ctx.lineTo(-s*0.1, s*0.2); ctx.lineTo(-s*0.7, -s*0.5); ctx.lineTo(-s*0.5, -s*0.7); ctx.lineTo(-s*0.1, -s*0.1); ctx.lineTo(-s*0.2, -s*0.8); ctx.lineTo(0, -s*1.0); ctx.lineTo(0.1, -s*0.2); ctx.lineTo(s*0.7, -s*0.6); ctx.lineTo(s*0.8, -s*0.4); ctx.lineTo(s*0.2, s*0.2); ctx.lineTo(s*0.3, s*1.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, s*1.0); ctx.lineTo(-s*0.1, s*0.5); ctx.lineTo(0.1, s*0.3); ctx.stroke();
    },
    bamboo(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.2, -s*1.2, s*0.4, s*0.7); ctx.rect(-s*0.2, -s*0.4, s*0.4, s*0.7); ctx.rect(-s*0.2, s*0.4, s*0.4, s*0.8); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.45); ctx.lineTo(s*0.3, -s*0.45); ctx.moveTo(-s*0.3, s*0.35); ctx.lineTo(s*0.3, s*0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.2, -s*0.6); ctx.quadraticCurveTo(s*0.8, -s*0.8, s*1.0, -s*0.3); ctx.quadraticCurveTo(s*0.6, -s*0.3, s*0.2, -s*0.4); ctx.moveTo(-s*0.2, s*0.1); ctx.quadraticCurveTo(-s*0.7, -s*0.2, -s*0.9, s*0.3); ctx.quadraticCurveTo(-s*0.5, s*0.4, -s*0.2, s*0.3); ctx.fill(); ctx.stroke();
    },
    lotus_top(ctx, s, species, overrideColor) {
      for(let i=0; i<8; i++){ ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s*0.4, -s*0.5, 0, -s*1.1); ctx.quadraticCurveTo(-s*0.4, -s*0.5, 0, 0); ctx.fill(); ctx.stroke(); ctx.restore(); }
      for(let i=0; i<8; i++){ ctx.save(); ctx.rotate((i + 0.5) * Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s*0.2, -s*0.3, 0, -s*0.6); ctx.quadraticCurveTo(-s*0.2, -s*0.3, 0, 0); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0, 0, s*0.15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    tulip_side(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, s*0.4); ctx.lineTo(0, s*1.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, s*1.2); ctx.quadraticCurveTo(s*0.6, s*0.8, s*0.5, 0); ctx.quadraticCurveTo(s*0.2, s*0.6, 0, s*0.8); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5, -s*0.5); ctx.bezierCurveTo(-s*0.5, s*0.6, s*0.5, s*0.6, s*0.5, -s*0.5); ctx.lineTo(s*0.2, -s*0.1); ctx.lineTo(0, -s*0.6); ctx.lineTo(-s*0.2, -s*0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    trumpet_flower_side(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*0.8); ctx.quadraticCurveTo(-s*0.6, s*0.4, -s*0.6, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.6, 0); ctx.bezierCurveTo(-s*0.2, -s*0.1, s*0.3, -s*0.7, s*0.8, -s*0.9); ctx.lineTo(s*0.8, s*0.9); ctx.bezierCurveTo(s*0.3, s*0.7, -s*0.2, s*0.1, -s*0.6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(s*0.8, 0, s*0.25, s*0.9, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.4, 0); ctx.lineTo(s*1.2, -s*0.2); ctx.moveTo(-s*0.4, 0); ctx.lineTo(s*1.1, s*0.1); ctx.stroke();
    },
    chair(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0, -s*0.2, s*0.6, Math.PI, 0); ctx.lineTo(s*0.6, s*0.2); ctx.lineTo(-s*0.6, s*0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.2, s*0.4, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.7, s*0.2, s*1.4, s*0.2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5, s*0.4); ctx.lineTo(-s*0.6, s*1.1); ctx.moveTo(s*0.5, s*0.4); ctx.lineTo(s*0.6, s*1.1); ctx.stroke();
    },
    shield(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, -s*0.8); ctx.lineTo(s*0.8, -s*0.8); ctx.lineTo(s*0.7, s*0.3); ctx.lineTo(0, s*1.2); ctx.lineTo(-s*0.7, s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(0, -s*0.8); ctx.lineTo(0, s*1.2); ctx.stroke();
    },
    '3rhombic_120degrees'(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s*0.8, -s*0.45); ctx.lineTo(0, -s*0.9); ctx.lineTo(s*0.8, -s*0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s*0.8, -s*0.45); ctx.lineTo(-s*0.8, s*0.45); ctx.lineTo(0, s*0.9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s*0.8, -s*0.45); ctx.lineTo(s*0.8, s*0.45); ctx.lineTo(0, s*0.9); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    bell(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0, -s*0.8, s*0.2, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, s*0.8, s*0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s*0.7); ctx.bezierCurveTo(s*0.5, -s*0.7, s*0.4, s*0.2, s*0.8, s*0.6); ctx.lineTo(-s*0.8, s*0.6); ctx.bezierCurveTo(-s*0.4, s*0.2, -s*0.5, -s*0.7, 0, -s*0.7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, s*0.6, s*0.8, s*0.2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-s*0.6, s*0.3); ctx.lineTo(s*0.6, s*0.3); ctx.moveTo(-s*0.5, s*0.1); ctx.lineTo(s*0.5, s*0.1); ctx.stroke();
    },
    sun_dragon(ctx, s, species, overrideColor) {
      ctx.fillStyle = species.accent; ctx.beginPath();
      for(let i=0; i<8; i++){ let a = i * Math.PI/4; ctx.moveTo(Math.cos(a-0.15)*s*0.8, Math.sin(a-0.15)*s*0.8); ctx.lineTo(Math.cos(a)*s*1.6, Math.sin(a)*s*1.6); ctx.lineTo(Math.cos(a+0.15)*s*0.8, Math.sin(a+0.15)*s*0.8); }
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = overrideColor || species.color; ctx.beginPath(); ctx.arc(0, s*0.2, s*0.9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.5); ctx.lineTo(-s*0.8, -s*1.3); ctx.lineTo(0, -s*0.7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.3, -s*0.5); ctx.lineTo(s*0.8, -s*1.3); ctx.lineTo(0, -s*0.7); ctx.fill(); ctx.stroke();
    },
    world_tree(ctx, s, species, overrideColor) {
      ctx.fillStyle = species.accent;
      ctx.beginPath(); ctx.arc(0, -s*0.6, s*1.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.8, -s*0.1, s*0.9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.8, -s*0.1, s*0.9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = overrideColor || species.color; ctx.beginPath(); ctx.moveTo(-s*0.4, s*0.2); ctx.quadraticCurveTo(-s*0.6, s*1.2, -s*1.0, s*1.5); ctx.lineTo(s*1.0, s*1.5); ctx.quadraticCurveTo(s*0.6, s*1.2, s*0.4, s*0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    abyssal_whale(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*1.2, 0); ctx.lineTo(-s*2.0, -s*0.8); ctx.lineTo(-s*1.5, s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, s*1.4, s*0.8, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent; ctx.beginPath(); ctx.ellipse(0, s*0.4, s*1.0, s*0.3, 0, 0, Math.PI); ctx.fill(); ctx.stroke();
      ctx.fillStyle = overrideColor || species.color; ctx.beginPath(); ctx.moveTo(s*0.2, s*0.5); ctx.lineTo(s*0.8, s*1.2); ctx.lineTo(s*0.5, s*0.5); ctx.fill(); ctx.stroke();
    },
    thunder_bird(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.3, 0); ctx.lineTo(-s*1.6, -s*1.2); ctx.lineTo(-s*1.0, -s*0.4); ctx.lineTo(-s*1.8, -s*0.2); ctx.lineTo(-s*0.5, s*0.2);
      ctx.moveTo(s*0.3, 0); ctx.lineTo(s*1.6, -s*1.2); ctx.lineTo(s*1.0, -s*0.4); ctx.lineTo(s*1.8, -s*0.2); ctx.lineTo(s*0.5, s*0.2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent; ctx.beginPath(); ctx.moveTo(0, -s*1.0); ctx.lineTo(s*0.4, 0); ctx.lineTo(0, s*1.2); ctx.lineTo(-s*0.4, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    sacred_gear(ctx, s, species, overrideColor) {
      ctx.strokeStyle = species.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, s*1.4, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.9, -s*0.9, s*1.8, s*1.8); ctx.stroke();
      ctx.fillStyle = overrideColor || species.color; ctx.lineWidth = 2;
      ctx.beginPath(); for(let i=0; i<6; i++){ let a = i * Math.PI/3; ctx.lineTo(Math.cos(a)*s*0.8, Math.sin(a)*s*0.8); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent; ctx.beginPath(); ctx.arc(0, 0, s*0.3, 0, Math.PI*2); ctx.fill();
    },
    lantern_2(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.5, -s*0.6, s*1.0, s*1.2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.24, s*0.6, 0, 0, Math.PI*2); ctx.ellipse(0, 0, s*0.48, s*0.6, 0, 0, Math.PI*2); ctx.ellipse(0, 0, s*0.72, s*0.6, 0, 0, Math.PI*2); ctx.fill(); 
      ctx.moveTo(-s*0.3, 0); ctx.lineTo(s*0.3, 0);ctx.stroke();
    },
    battery(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.roundRect(-s*0.5, -s*0.7, s*1.0, s*1.4, s*0.1); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.2, -s*0.9, s*0.4, s*0.2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.1, -s*0.4); ctx.lineTo(-s*0.2, 0); ctx.lineTo(s*0.1, 0); ctx.lineTo(-s*0.1, s*0.5); ctx.stroke();
    },
    led_light(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0, -s*0.3, s*0.6, Math.PI, 0); ctx.lineTo(s*0.6, s*0.4); ctx.lineTo(-s*0.6, s*0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.7, s*0.4, s*1.4, s*0.2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, s*0.6); ctx.lineTo(-s*0.3, s*1.2); ctx.moveTo(s*0.3, s*0.6); ctx.lineTo(s*0.3, s*1.5); ctx.stroke();
    },
    subway_head(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*1.0); ctx.lineTo(-s*0.8, -s*0.2); ctx.quadraticCurveTo(-s*0.8, -s*1.0, 0, -s*1.0); ctx.quadraticCurveTo(s*0.8, -s*1.0, s*0.8, -s*0.2); ctx.lineTo(s*0.8, s*1.0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.rect(-s*0.6, -s*0.6, s*1.2, s*0.6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(-s*0.5, s*0.5, s*0.15, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(s*0.5, s*0.5, s*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s*0.8, s*0.8); ctx.lineTo(s*0.8, s*0.8); ctx.stroke();
    },
    dragon(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0,s*0.1,s*0.75,s*1.0,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5,-s*0.1); ctx.lineTo(-s*1.5,-s*0.9); ctx.lineTo(-s*0.9,s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.5,-s*0.1); ctx.lineTo(s*1.5,-s*0.9); ctx.lineTo(s*0.9,s*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent; ctx.beginPath(); ctx.moveTo(-s*0.3,-s*0.9); ctx.lineTo(-s*0.5,-s*1.5); ctx.lineTo(-s*0.1,-s*0.9); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s*0.3,-s*0.9); ctx.lineTo(s*0.5,-s*1.5); ctx.lineTo(s*0.1,-s*0.9); ctx.fill();
    },
    board(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*1.2,-s*0.9,s*2.4,s*1.8); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.9,-s*0.6); ctx.lineTo(s*0.9,-s*0.6); ctx.stroke();
      ctx.fillStyle = species.accent; ctx.beginPath(); ctx.arc(0,s*0.2,s*0.4,0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5,s*0.9); ctx.lineTo(-s*1.0,s*1.5); ctx.moveTo(s*0.5,s*0.9); ctx.lineTo(s*1.0,s*1.5); ctx.stroke();
    },
    spider(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.6, -s*0.6); ctx.lineTo(-s*0.9, -s*0.2); ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.7, -s*0.2); ctx.lineTo(-s*1.0, s*0.1);
      ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.7, s*0.2); ctx.lineTo(-s*0.9, s*0.6); ctx.moveTo(-s*0.1, 0); ctx.lineTo(-s*0.5, s*0.6); ctx.lineTo(-s*0.6, s*1.0);
      ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.6, -s*0.6); ctx.lineTo(s*0.9, -s*0.2); ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.7, -s*0.2); ctx.lineTo(s*1.0, s*0.1);
      ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.7, s*0.2); ctx.lineTo(s*0.9, s*0.6); ctx.moveTo(s*0.1, 0); ctx.lineTo(s*0.5, s*0.6); ctx.lineTo(s*0.6, s*1.0); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, s*0.3, s*0.3, s*0.4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.2, s*0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    bike(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(-s*0.7, s*0.5, s*0.35, 0, Math.PI*2); ctx.arc(s*0.7, s*0.5, s*0.35, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.7, s*0.5); ctx.lineTo(-s*0.2, -s*0.1); ctx.lineTo(0, s*0.5); ctx.closePath();
      ctx.moveTo(0, s*0.5); ctx.lineTo(-s*0.2, -s*0.1); ctx.lineTo(s*0.5, -s*0.1); ctx.lineTo(s*0.7, s*0.5); ctx.lineTo(0, s*0.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.4, -s*0.1); ctx.lineTo(0, -s*0.1); ctx.moveTo(s*0.5, -s*0.1); ctx.lineTo(s*0.6, -s*0.4); ctx.stroke();
    },
    vase(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.8); ctx.lineTo(s*0.3, -s*0.8); ctx.bezierCurveTo(s*0.1, -s*0.4, s*0.8, 0, s*0.5, s*0.8);
      ctx.lineTo(-s*0.5, s*0.8); ctx.bezierCurveTo(-s*0.8, 0, -s*0.1, -s*0.4, -s*0.3, -s*0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.2, -s*0.5); ctx.lineTo(s*0.2, -s*0.5); ctx.stroke();
    },
    blocks(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.9, -s*0.9, s*0.7, s*0.7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(s*0.2, s*0.2, s*0.7, s*0.7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.5, -s*0.5, s*1.0, s*1.0); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.2); ctx.lineTo(s*0.3, -s*0.2); ctx.stroke();
    },
    refrigerator(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.roundRect(-s*0.6, -s*1.1, s*1.2, s*2.2, s*0.1); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.6, -s*0.2); ctx.lineTo(s*0.6, -s*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, -s*0.8); ctx.lineTo(-s*0.3, -s*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.3, 0); ctx.lineTo(-s*0.3, s*0.7); ctx.stroke();
    },
    ice_cream(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(-s*0.5, 0); ctx.lineTo(s*0.5, 0); ctx.lineTo(0, s*1.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(-s*0.3, s*0.3); ctx.lineTo(s*0.1, s*0.9); ctx.moveTo(-s*0.1, s*1.0); ctx.lineTo(s*0.3, s*0.4); ctx.stroke();
      ctx.strokeStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(-s*0.3, -s*0.2, s*0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(s*0.3, -s*0.2, s*0.35, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s*0.6, s*0.4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    dandelion(ctx, s, species, overrideColor) {
      ctx.beginPath(); for(let i=0;i<12;i++){ let a=i*Math.PI*2/12; ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s); } ctx.stroke();
      ctx.beginPath(); ctx.arc(0,0,s*0.2,0,Math.PI*2); ctx.fill(); ctx.stroke();
    },
    snowflake(ctx, s, species, overrideColor) {
      ctx.beginPath();
      for(let i=0; i<6; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.moveTo(0, 0); ctx.lineTo(0, -s*1.1); ctx.moveTo(0, -s*0.6); ctx.lineTo(-s*0.25, -s*0.85); ctx.moveTo(0, -s*0.6); ctx.lineTo(s*0.25, -s*0.85); ctx.moveTo(0, -s*0.3); ctx.lineTo(-s*0.15, -s*0.45); ctx.moveTo(0, -s*0.3); ctx.lineTo(s*0.15, -s*0.45); ctx.restore();
      }
      ctx.stroke();
      ctx.beginPath(); for(let i=0; i<6; i++) { ctx.lineTo(Math.cos(i * Math.PI / 3) * s * 0.2, Math.sin(i * Math.PI / 3) * s * 0.2); } ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    air_balloon(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.arc(0, -s*0.5, s*0.8, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.3, s*0.6, s*0.6, s*0.4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.5, 0); ctx.lineTo(-s*0.3, s*0.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.5, 0); ctx.lineTo(s*0.3, s*0.6); ctx.stroke();
    },
    candle(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.rect(-s*0.4, -s*0.2, s*0.8, s*1.2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = species.accent;
      ctx.beginPath(); ctx.moveTo(0, -s*1.2); ctx.quadraticCurveTo(s*0.4, -s*0.6, 0, -s*0.2); ctx.quadraticCurveTo(-s*0.4, -s*0.6, 0, -s*1.2); ctx.fill();
    },
    windmill(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.moveTo(0, -s*0.5); ctx.lineTo(s*0.6, s*1.2); ctx.lineTo(-s*0.6, s*1.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s*0.8, -s*1.3); ctx.lineTo(s*0.8, s*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.8, -s*1.3); ctx.lineTo(-s*0.8, s*0.3); ctx.stroke();
      ctx.fillStyle = species.accent;
      ctx.beginPath(); ctx.arc(0, -s*0.5, s*0.2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    swan(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, s*0.5, s*0.9, s*0.5, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s*0.5, s*0.2); ctx.bezierCurveTo(s*1.2, -s*0.5, s*0.2, -s*1.2, -s*0.2, -s*0.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(-s*0.2, -s*0.8, s*0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    },
    chick(ctx, s, species, overrideColor) {
  ctx.beginPath(); ctx.arc(0, 0, s*0.6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = species.accent;
  ctx.beginPath(); ctx.arc(s*0.2, -s*0.2, s*0.08, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(s*0.6, -s*0.1); ctx.lineTo(s*0.9, 0); ctx.lineTo(s*0.55, s*0.1); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s*0.2, s*0.6); ctx.lineTo(-s*0.2, s*1.0); ctx.lineTo(-s*0.4, s*1.0); ctx.moveTo(s*0.2, s*0.6); ctx.lineTo(s*0.2, s*1.0); ctx.lineTo(s*0.4, s*1.0); ctx.stroke();
  ctx.beginPath(); ctx.arc(-s*0.1, s*0.1, s*0.2, Math.PI, 0, true); ctx.stroke();
},
    fountain(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, s*0.8, s*1.0, s*0.3, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.2, -s*0.5, s*0.4, s*1.3); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = species.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -s*0.5); ctx.quadraticCurveTo(-s*0.8, -s*1.0, -s*1.0, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s*0.5); ctx.quadraticCurveTo(s*0.8, -s*1.0, s*1.0, 0); ctx.stroke();
      ctx.lineWidth = 2;
    },
    head_lamp(ctx, s, species, overrideColor) {
      ctx.beginPath(); ctx.ellipse(0, 0, s*0.8, s*0.6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(-s*0.9, -s*0.1, s*1.8, s*0.2); ctx.stroke();
      ctx.fillStyle = species.accent;
      ctx.beginPath(); ctx.arc(0, -s*0.3, s*0.4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
};
