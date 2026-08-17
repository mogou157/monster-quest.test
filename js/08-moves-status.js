// ============================================================
// 08-moves-status.js — 技能資料庫 (MOVE_POOL) + 異常狀態資料 (STATUS_META)
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

// =========================================================
// 🛠️ 改造區 E:技能與升級學習表 🛠️
// tackle/ultimate 是每隻怪物一出生就會的招式(ultimate 名稱會自動帶入種族名)
// LEARNSET 是所有怪物共用的升級學習表,到了對應等級會嘗試學新招
// typeFilter:只有該屬性的怪物才會學到這招 / speciesFilter:只有該種族才會學到這招(不填就是通用)
// statusOnly:不計算傷害,直接嘗試附加指定的異常狀態
// setType:不計算傷害,把使用者的屬性暫時改成指定屬性(只在這場戰鬥中有效)
// buffStat/buffAmount:不計算傷害,提升自己的atk或def(戰鬥結束會重置)
// 技能格最多4格,滿了會先記錄在 pendingMoves,可以到隊伍狀態畫面手動學習
// =========================================================
const MOVE_POOL = {
  tackle:   { name:'衝撞',     power:1.0, acc:0.95, typeMode:'self' },
  ultimate: { name:null,       power:1.4, acc:0.8, typeMode:'self' },
  quick:    { name:'快速攻擊', power:1.1, acc:0.99, typeMode:'none' },
  bite:     { name:'狂咬',     power:1.3, acc:0.85, typeMode:'none' },
  blast:    { name:'爆裂衝擊', power:2.0, acc:0.6,  typeMode:'self' },
  hypnosis: { name:'催眠',     power:0,   acc:0.7,  typeMode:'self', statusOnly:'sleep', statusChance:1.0 },
  // 🔄 屬性變化技能
  fireShift:    { name:'火炎型態', power:0, acc:1.0, typeMode:'none', setType:'fire' },
  waterShift:   { name:'水流型態', power:0, acc:1.0, typeMode:'none', setType:'water' },
  woodShift:    { name:'草木型態', power:0, acc:1.0, typeMode:'none', setType:'wood' },
earthShift: { id: 'earthShift', name: '大地型態', type: 'earth', power: 0, acc: 1, setType: 'earth', buffStat: 'def', buffAmount: 0.5,desc: '將岩漿冷卻凝固，自身屬性轉變回「地」屬性，並大幅提升防禦力！' 
},  // 🔄 屬性變化技能
  iceShift:    { name:'冰霜型態', power:0, acc:1.0, typeMode:'none', setType:'ice' },
  windShift:   { name:'逍遙型態', power:0, acc:1.0, typeMode:'none', setType:'wind' },
  lightShift:    { name:'炫光型態', power:0, acc:1.0, typeMode:'none', setType:'light' },
  darkShift: { name:'幽暗型態', power:0, acc:1.0, typeMode:'none', setType:'dark' },

  thunderShift: { name:'雷屬化',   power:0, acc:0.95, typeMode:'none', setType:'thunder' },
  boostAtk:     { name:'力量強化', power:0, acc:1.0,  typeMode:'none', buffStat:'atk', buffAmount:0.3 },
  boostDef:     { name:'鋼鐵防禦', power:0, acc:1.0,  typeMode:'none', buffStat:'def', buffAmount:0.3 },
  // 🌿 恢復類：加入天氣對應版本
  synthesis:    { name:'光合作用', power:0, acc:1.0, typeMode:'none', healWeatherType:'sun' },
  aquaRing:     { name:'水之環', power:0, acc:1.0, typeMode:'none', healWeatherType:'rain' },
  iceMend:      { name:'冰雪重塑', power:0, acc:1.0, typeMode:'none', healWeatherType:'snow' },

  // ☠️ 干擾類：單純降能力 (無傷害)
  acid:         { name:'溶解液', power:0, acc:0.85, typeMode:'none', debuffStat:'def', debuffAmount:0.2 },
  roar:         { name:'威嚇咆哮', power:0, acc:0.85, typeMode:'none', debuffStat:'atk', debuffAmount:0.2 },
  mudSlap:      { name:'泥巴突擊', power:0, acc:0.85, typeMode:'none', debuffAcc:0.1 },
  
  // ⚔️ 攻擊附帶降能力 (Secondary Debuff - 有傷害)
  armorSmash:   { name:'碎甲擊', power:1.2, acc:0.85, typeMode:'none', debuffStat:'def', debuffAmount:0.2 },
  weaken:       { name:'虛弱打擊', power:1.2, acc:0.85, typeMode:'none', debuffStat:'atk', debuffAmount:0.2 },
  flash:        { name:'閃光突襲', power:1.0, acc:0.85, typeMode:'none', debuffAcc:0.1 },

  // 查封維持原樣，我們會在 damageCalc 幫它增傷
  knockOff:     { name:'查封', power:1.0, acc:1.0, typeMode:'none', disableItem:true },
  drain:        { name:'吸血', power:1.3, acc:0.95, typeMode:'self', drainPct:0.3 },
  regenSong:    { name:'大地祈禱', power:0, acc:1.0, typeMode:'none', applyHoT:{ turns:4, pct:0.15 } },
  rest:         { name:'冬眠', power:0, acc:1.0, typeMode:'none', selfSleepHeal:true },
  sleepwalk:    { name:'夢遊', power:1.6, acc:0.75, typeMode:'self', sleepUsable:true },
  deepSleep:    { name:'酣睡', power:0, acc:1.0, typeMode:'none', buffStat:'def', buffAmount:0.3, sleepUsable:true },
  // ☠️ 第二類：狀態與干擾類
  ignite:       { name:'點燃', power:0, acc:0.85, typeMode:'none', statusOnly:'burn', statusChance:1.0 },
  toxic:        { name:'毒素', power:0, acc:0.85, typeMode:'none', statusOnly:'poison', statusChance:1.0 },
  paralyze:     { name:'電磁波', power:0, acc:0.85, typeMode:'none', statusOnly:'paralysis', statusChance:1.0 },
  healBlock:    { name:'死亡印記', power:0, acc:0.8, typeMode:'none', applyHealBlock: 4 },

  // 💥 第三類：雙面刃與高爆發
  berserk:      { name:'背水一戰', power:0, acc:1.0, typeMode:'none', buffStat:'atk', buffAmount:1.0, selfDebuffStat:'def', selfDebuffAmount:0.5 },
  superpower:   { name:'奮力一擊', power:2.5, acc:0.8, typeMode:'self', selfDebuffStat:'def', selfDebuffAmount:0.5 },
  takeDown:     { name:'猛撞', power:2.0, acc:0.8, typeMode:'none', recoilPct:0.2 },
  tantrum:      { name:'不屈怒火', power:1.0, acc:0.75, typeMode:'none', comboMissPower: 1.6 },
  hone:         { name:'鷹眼鎖定', power:1.6, acc:0.75, typeMode:'none', accuracyStack: 0.24 },

  // 🛡️ 第四類：戰術與反制
  firstImp:     { name:'奪得先機', power:1.6, acc:0.70, typeMode:'none', firstTurnAcc: 1.0 },
  escape:       { name:'金蟬脫殼', power:0, acc:1.0, typeMode:'none', isEscape:true },
  // 🌦️ 天氣變換技能 (命中率 50%，每場限用 3 次)
  callSun:      { name:'祈晴之舞', power:0, acc:0.5, typeMode:'none', setWeather:'sunny', maxUses:3 },
  callRain:     { name:'求雨', power:0, acc:0.5, typeMode:'none', setWeather:'rain', maxUses:3 },
  callSnow:     { name:'祈雪', power:0, acc:0.5, typeMode:'none', setWeather:'snow', maxUses:3 },
  callSand:     { name:'揚沙', power:0, acc:0.5, typeMode:'none', setWeather:'sandstorm', maxUses:3 },
  callDark:     { name:'吞噬之暗', power:0, acc:0.5, typeMode:'none', setWeather:'pitchDark', maxUses:3 },
 
  counter: { name:'反擊', power:0, acc:1.0, typeMode:'none', counterPct:0.6 },
  guard: { name:'守勢', power:0, acc:1.0, typeMode:'none', damageReduction:0.5 },
  charge: { name:'蓄力', power:0, acc:1.0, typeMode:'none', setCharge:true },
  revenge: { name:'復仇', power:1.0, acc:1.0, typeMode:'none', revengePower:2.0 },
  lastStand: { name:'絕境反擊', power:1.0, acc:1.0, typeMode:'none', lowHpPower:true },
  taunt: { name:'挑釁', power:0, acc:0.9, typeMode:'none', tauntTurns:2 },
  leechSeed: { name:'寄生種子', power:0, acc:0.85, typeMode:'none', applyLeech:{ turns:4, pct:0.12 } },
  sacrifice: { name:'生命獻祭', power:0, acc:1.0, typeMode:'none', sacrificePct:0.3, nextAttackMultiplier:2.0 },
  purify: { name:'淨化', power:0, acc:1.0, typeMode:'none', cureStatus:true },
  swapStats: { name:'能力交換', power:0, acc:0.9, typeMode:'none', swapStats:true },
  // 🐉 神獸專屬究極大招 (必定命中/100%，自帶改變天氣或特效，每場限用 3 次)
  originBurst:  { name:'始源爆發', power:2.5, acc:1.0, typeMode:'self', setWeather:'sunny', maxUses:3 }, // 始源龍 (94)
  solarFlare:   { name:'日珥耀斑', power:2.5, acc:1.0, typeMode:'fire', setWeather:'harshSun', maxUses:3 }, // 日珥神龍 (90)
  worldRoots:   { name:'創世盤根', power:2.0, acc:1.0, typeMode:'wood', drainPct:0.5, maxUses:3 }, // 創世巨樹 (91) - 超大口吸血
  abyssalTide:  { name:'深淵海嘯', power:2.5, acc:1.0, typeMode:'water', setWeather:'rain', maxUses:3 }, // 深海海神 (92)
  thunderStorm: { name:'天雷滅世', power:2.5, acc:1.0, typeMode:'thunder', debuffStat:'def', debuffAmount:0.3, maxUses:3 }, // 天雷聖鳥 (93)
  voidRay:      { name:'虛空神光', power:2.0, acc:1.0, typeMode:'none', disableItem:true, maxUses:3 }, // 虛空神機 (95) - 必中且查封
  glacierCrash: { name:'冰河崩落', power:2.5, acc:1.0, typeMode:'ice', setWeather:'snow', maxUses:3 }, // 冰河猛瑪 (96)
// 🌟 秘笈專屬招式
  absoluteGuard: { name:'全面防禦', power:0, acc:0.5, typeMode:'none', applyImmunity: true },
  reverseSelf: { name:'潛能反轉', power:0, acc:1.0, typeMode:'none', reverseStatsTarget:'self' },
  reverseEnemy: { name:'厄運反轉', power:0, acc:1.0, typeMode:'none', reverseStatsTarget:'enemy' },
  mercyStrike: { name:'刀下留人', power:1.2, acc:1.0, typeMode:'none', leaveOneHp: true },
  shieldStrike: { name:'守護打擊', power:1.5, acc:0.8, typeMode:'none', chanceImmunity: 0.3 },
  chargeStrike: { name:'蓄力爆發', power: () => 1.2 + Math.random() * 2.4, acc: 1.0, typeMode: 'none', needsCharge: true },
  elementalRoulette: { name:'元素輪盤', power: 1.5, acc: 0.9, typeMode: 'random' },
  hyperBeam: { name:'破滅死光', power: () => 1.5 + Math.random() * 2.3, acc: 0.5, typeMode: 'none', rechargeNextTurn: true },
// ---------- 換人支援系招式 (使出後會強制換人,由後備隊友接手) ----------
  allySwapAtkUp:  { name:'應援换位·攻', power:0, acc:1.0, typeMode:'none', swapBuffStat:'atk', swapBuffAmount:0.2 },
  allySwapDefUp:  { name:'應援换位·防', power:0, acc:1.0, typeMode:'none', swapBuffStat:'def', swapBuffAmount:0.2 },
  allySwapCure:   { name:'交替看護', power:0, acc:1.0, typeMode:'none', swapCureStatus:true },
  strikeAndSwap:  { name:'突擊撤退', power:1.0, acc:1.0, alwaysHit:true, typeMode:'self', forceSwapAfter:true },
// ---------- 羈絆爆發系招式 (acc:0.8,效果隨親密度增強,親密度需超過160才能學會) ----------
  bondBurstPower:   { name:'羈絆爆發·猛襲',   power:1.0, acc:0.8, typeMode:'self', reqBondToLearn:160, bondBurstEffect:'power' },
  bondBurstAcc:     { name:'羈絆爆發·鎖定',   power:0.8, acc:0.8, typeMode:'self', reqBondToLearn:160, bondBurstEffect:'acc' },
  bondBurstHeal:    { name:'羈絆爆發·治癒',   power:0,   acc:0.8, typeMode:'none', reqBondToLearn:160, bondBurstEffect:'heal' },
  bondBurstSelfBuff:{ name:'羈絆爆發·奮起',   power:0,   acc:0.8, typeMode:'none', reqBondToLearn:160, bondBurstEffect:'selfBuff' },
  bondBurstDebuff:  { name:'羈絆爆發·威壓',   power:0,   acc:0.8, typeMode:'none', reqBondToLearn:160, bondBurstEffect:'enemyDebuff' },
  bondBurstDouble:  { name:'羈絆爆發·連擊',   power:0.8, acc:0.8, typeMode:'self', reqBondToLearn:160, bondBurstEffect:'doubleHit' },
  bondBurstEvade:   { name:'羈絆爆發·迴避',   power:0,   acc:0.8, typeMode:'none', reqBondToLearn:160, bondBurstEffect:'evade' },
  bondBurstCrit:    { name:'羈絆爆發·會心',   power:0,   acc:0.8, typeMode:'none', reqBondToLearn:160, bondBurstEffect:'crit' },
// ---------- 共鳴專屬招式 (每個外型共鳴類別一招,需該共鳴發動中才能使出) ----------
  swarmSting:     { name:'蟲群亂舞',   power:1.4, acc:0.9, typeMode:'self', reqResonanceCat:'insect' },
  wildInstinct:   { name:'野性直覺',   power:1.2, acc:1.0, typeMode:'self', reqResonanceCat:'animal', buffStat:'def', buffAmount:0.15 },
  natureBloom:    { name:'自然綻放',   power:0,   acc:1.0, typeMode:'none', reqResonanceCat:'plant', healPct:0.3 },
  overclock:      { name:'超頻驅動',   power:1.5, acc:0.85,typeMode:'self', reqResonanceCat:'machine', selfDebuffStat:'def', selfDebuffAmount:0.2 },
  crystalBarrier: { name:'結晶壁壘',   power:0,   acc:1.0, typeMode:'none', reqResonanceCat:'mineral', buffStat:'def', buffAmount:0.3 },
  junkStorm:      { name:'雜物風暴',   power:1.3, acc:0.9, typeMode:'self', reqResonanceCat:'object' },
// ---------- 屬性剋制招式 (剋對方屬性;對方無屬性時,改用自己的屬性計算) ----------
  adaptiveStrike: { name:'因勢而動', power:1.3, acc:0.95, typeMode:'adaptive' },
// ...保留原來的招式...
};
const LEARNSET = [
  // === 🟢 前期：基礎過渡與增益 (Lv 5 ~ 8) ===
  { level: 5, moveId: 'quick' }, // 全屬性通用先制技
  { level: 6, moveId: 'boostAtk', typeFilter: 'fire' },
  { level: 6, moveId: 'boostAtk', typeFilter: 'thunder' },
  { level: 6, moveId: 'boostAtk', typeFilter: 'earth' },
  { level: 6, moveId: 'boostDef', typeFilter: 'wood' },
  { level: 6, moveId: 'boostDef', typeFilter: 'water' },
  { level: 6, moveId: 'boostDef', typeFilter: 'ice' },
  { level: 8, moveId: 'bite', typeFilter: 'dark' },
  { level: 8, moveId: 'bite', typeFilter: 'none' },

  // === 🟡 中期：屬性專屬干擾與異常狀態 (Lv 10 ~ 14) ===
  { level: 10, moveId: 'ignite', typeFilter: 'fire' },
  { level: 10, moveId: 'toxic', typeFilter: 'dark' },
  { level: 10, moveId: 'toxic', typeFilter: 'wood' },
  { level: 10, moveId: 'paralyze', typeFilter: 'thunder' },
  { level: 11, moveId: 'flash', typeFilter: 'light' },
  { level: 11, moveId: 'flash', typeFilter: 'wind' },
  { level: 12, moveId: 'armorSmash', typeFilter: 'earth' },
  { level: 12, moveId: 'weaken', typeFilter: 'water' },
  { level: 13, moveId: 'knockOff', typeFilter: 'dark' },
  { level: 13, moveId: 'knockOff', typeFilter: 'wind' },
  { level: 14, moveId: 'firstImp', typeFilter: 'thunder' }, // 奪得先機
  { level: 14, moveId: 'firstImp', typeFilter: 'none' },

  // === 🟠 中後期：核心流派成型 (Lv 16 ~ 33,原本擠在16/18兩級,現在分散開) ===
  // 1. 吸血消耗流
  { level: 16, moveId: 'drain', typeFilter: 'wood' },
  { level: 16, moveId: 'drain', typeFilter: 'dark' },
  { level: 22, moveId: 'synthesis', typeFilter: 'wood' },
  { level: 22, moveId: 'synthesis', typeFilter: 'light' },
  { level: 30, moveId: 'healBlock', typeFilter: 'dark' },

  // 2. 睡夢坦克流
  { level: 17, moveId: 'rest', typeFilter: 'ice' },
  { level: 17, moveId: 'rest', typeFilter: 'earth' },
  { level: 17, moveId: 'rest', typeFilter: 'none' },
  { level: 24, moveId: 'deepSleep', typeFilter: 'ice' },
  { level: 24, moveId: 'deepSleep', typeFilter: 'earth' },
  { level: 31, moveId: 'sleepwalk', typeFilter: 'ice' },
  { level: 31, moveId: 'sleepwalk', typeFilter: 'none' },
  
  // 3. 怒火連擊流
  { level: 19, moveId: 'takeDown', typeFilter: 'fire' },
  { level: 19, moveId: 'takeDown', typeFilter: 'earth' },
  { level: 26, moveId: 'hone', typeFilter: 'thunder' }, // 鷹眼鎖定
  { level: 26, moveId: 'hone', typeFilter: 'fire' },
  { level: 33, moveId: 'tantrum', typeFilter: 'earth' }, // 不屈怒火
  { level: 33, moveId: 'tantrum', typeFilter: 'fire' },

  // === 🔴 大後期：終極爆發 (Lv 21 ~ 45,延伸範圍讓高等級怪物一路都學得到新招) ===
  { level: 36, moveId: 'regenSong', typeFilter: 'water' }, // 大地祈禱 (後期超強群補)
  { level: 36, moveId: 'regenSong', typeFilter: 'light' },
  { level: 21, moveId: 'berserk', typeFilter: 'dark' },
  { level: 21, moveId: 'berserk', typeFilter: 'thunder' },
  { level: 27, moveId: 'superpower', typeFilter: 'earth' },
  { level: 27, moveId: 'superpower', typeFilter: 'none' },
  { level: 38, moveId: 'blast' }, // 全屬性終極大招解鎖

  // === ✨ 特殊專屬技能 (指定 Species 才能學) ===
  { level: 12, moveId: 'hypnosis', speciesFilter: '72' }, // 妖菇 Mystroom 專屬催眠
  { level: 12, moveId: 'hypnosis', speciesFilter: 'sprigl' }, // 葉芽 Sprigl 專屬催眠
  { level: 15, moveId: 'thunderShift', speciesFilter: '69' }, // 機板獸 Bordroid 專屬雷屬化
  { level: 15, moveId: 'thunderShift', speciesFilter: '31' }, // Sparkdesk 專屬雷屬化
  { level: 18, moveId: 'escape', speciesFilter: '62' }, // 羽風 Windra 專屬金蟬脫殼
  { level: 18, moveId: 'escape', speciesFilter: '44' }, // 疾風蜓 Drafly 專屬金蟬脫殼
  // === 🛡️ 新增戰術與防禦技能 (Lv 14 ~ 45) ===

  // 1. 守勢 (guard) - 適合厚重的屬性與盾牌怪獸
  { level: 14, moveId: 'guard', typeFilter: 'earth' },
  { level: 14, moveId: 'guard', typeFilter: 'water' },
  { level: 14, moveId: 'guard', speciesFilter: '56' }, // 守護盾 Aegishield
  { level: 14, moveId: 'guard', speciesFilter: '75' }, // 疊塊獸 Blockon

  // 2. 寄生種子 (leechSeed) - 經典的木屬性專屬干擾技
  { level: 15, moveId: 'leechSeed', typeFilter: 'wood' },

  // 3. 淨化 (purify) - 適合光潔或水潤的屬性
  { level: 19, moveId: 'purify', typeFilter: 'light' },
  { level: 19, moveId: 'purify', typeFilter: 'water' },

  // 4. 挑釁 (taunt) - 適合狡猾的屬性與特定怪獸
  { level: 20, moveId: 'taunt', typeFilter: 'dark' },
  { level: 20, moveId: 'taunt', typeFilter: 'wind' },
  { level: 20, moveId: 'taunt', speciesFilter: '72' }, // 妖菇 Mystroom

  // 5. 反擊 (counter) - 適合擅長肉搏的地、無屬性
  { level: 23, moveId: 'counter', typeFilter: 'earth' },
  { level: 23, moveId: 'counter', typeFilter: 'none' },

  // 6. 蓄力 (charge) - 【全體通用】所有怪獸到了 Lv.25 都能學會的增傷爆發技
  { level: 25, moveId: 'charge' },

  // 7. 復仇 (revenge) - 適合具有攻擊性的火、暗屬性
  { level: 28, moveId: 'revenge', typeFilter: 'fire' },
  { level: 28, moveId: 'revenge', typeFilter: 'dark' },

  // 8. 能力交換 (swapStats) - 適合神秘的光、風、無屬性
  { level: 29, moveId: 'swapStats', typeFilter: 'light' },
  { level: 29, moveId: 'swapStats', typeFilter: 'wind' },
  { level: 29, moveId: 'swapStats', typeFilter: 'none' },

  // 9. 生命獻祭 (sacrifice) - 適合暗、火屬性，以及會自爆的危險怪獸
  { level: 32, moveId: 'sacrifice', typeFilter: 'dark' },
  { level: 32, moveId: 'sacrifice', typeFilter: 'fire' },
  { level: 32, moveId: 'sacrifice', speciesFilter: '01' }, // Ba-01 電池

  // 10. 絕境反擊 (lastStand) - 【全體通用】終極大後期翻盤神技,延伸到Lv.45才學得到
  { level: 45, moveId: 'lastStand' },
  { moveId: 'earthShift', level: 40, speciesFilter: '102' },
];
function moveDisplayName(moveId, mon){
  if(moveId==='ultimate') return `${MonsterUtil.species(mon).name.split(' ')[0]}爆擊`;
  return MOVE_POOL[moveId].name;
}
function resolveMove(moveId, mon){
  const def = MOVE_POOL[moveId];
  
  // 🌟 支援威力隨機與屬性隨機！
  const actualPower = typeof def.power === 'function' ? def.power() : def.power;
  const actualType = def.typeMode === 'random' ? CYCLE[Math.floor(Math.random()*CYCLE.length)] : (def.typeMode === 'self' ? effectiveType(mon) : 'none');

  return { id:moveId, name:moveDisplayName(moveId,mon), power:actualPower, acc:def.acc,
    type: actualType,
    statusOnly: def.statusOnly, statusChance: def.statusChance, setType: def.setType, 
    buffStat: def.buffStat, buffAmount: def.buffAmount, drainPct: def.drainPct, 
    healWeatherType: def.healWeatherType, sleepUsable: def.sleepUsable, debuffStat: def.debuffStat, debuffAmount: def.debuffAmount,
    debuffAcc: def.debuffAcc, disableItem: def.disableItem, applyHealBlock: def.applyHealBlock,
    selfDebuffStat: def.selfDebuffStat, selfDebuffAmount: def.selfDebuffAmount, 
    recoilPct: def.recoilPct, comboMissPower: def.comboMissPower, accuracyStack: def.accuracyStack,
    firstTurnAcc: def.firstTurnAcc, isEscape: def.isEscape, setWeather: def.setWeather, maxUses: def.maxUses,
       // 🌟 秘笈專屬的新效果
    applyImmunity: def.applyImmunity,
    chanceImmunity: def.chanceImmunity,
    reverseStatsTarget: def.reverseStatsTarget,
    leaveOneHp: def.leaveOneHp,
    needsCharge: def.needsCharge,
    rechargeNextTurn: def.rechargeNextTurn,
    // 👇 🌟 補上這 10 個新技能專用屬性
    counterPct: def.counterPct, damageReduction: def.damageReduction,
    setCharge: def.setCharge, revengePower: def.revengePower,
    lowHpPower: def.lowHpPower, tauntTurns: def.tauntTurns,
    applyLeech: def.applyLeech, sacrificePct: def.sacrificePct,
    applyHoT: def.applyHoT,
    nextAttackMultiplier: def.nextAttackMultiplier, cureStatus: def.cureStatus,
    swapStats: def.swapStats,
    // 👇 🌟 這次新增的招式效果欄位
    typeMode: def.typeMode, // 讓 calculateDamage 可以判斷 adaptive 模式
    swapBuffStat: def.swapBuffStat, swapBuffAmount: def.swapBuffAmount, swapCureStatus: def.swapCureStatus,
    forceSwapAfter: def.forceSwapAfter, alwaysHit: def.alwaysHit,
    reqBondToLearn: def.reqBondToLearn, bondBurstEffect: def.bondBurstEffect,
    reqResonanceCat: def.reqResonanceCat, healPct: def.healPct,
  };
}
function getMoves(mon){
  return mon.moves.map(id=> resolveMove(id, mon));
}
// 🌟 異常狀態賦予引擎
function applyStatus(target, statusId, source = null) {
    // 1. 如果目標已經有異常狀態，或是已經陣亡，則直接失敗 (符合標準 RPG 規則)
    if (target.hp <= 0 || target.status) {
        return { success: false, messages: [] };
    }

    // 2. 建立 Status Context
    const ctx = {
        target: target,
        source: source,
        status: statusId,
        cancelled: false // 特性可以把這個改成 true 來免疫狀態
    };

    // 3. 廣播事件，讓防禦方的特性有機會攔截
    const res = runPassiveEvent('beforeStatusApply', target, source, ctx);

    // 4. 檢查是否被特性免疫了
    if (ctx.cancelled) {
        return { success: false, messages: res.messages };
    }

    // 5. 真正賦予異常狀態
    target.status = statusId;
    
    // (可選) 這裡可以直接呼叫你之前的動畫函式
    const canvasId = (target === wild) ? 'wildCanvas' : 'playerCanvas';
    setTimeout(() => playStatusInflictAnim(canvasId, statusId), 350);

    // 翻譯狀態名稱
    const statusNames = { burn: '灼傷', poison: '中毒', paralysis: '麻痺', sleep: '睡眠' };
    const sName = statusNames[statusId] || statusId;
    const defaultMsg = `⚠️ ${MonsterUtil.species(target).name} 陷入了${sName}狀態！`;

    return {
        success: true,
        messages: [...res.messages, defaultMsg]
    };
}
// 🌟 瘦身成功的新版戰鬥計算引擎
// ==========================================
// 🎯 統一戰鬥命中系統 (使用 0.0 ~ 1.0 的 acc 屬性)
// ==========================================
// ==========================================
// 💞 隱藏親密度加成 (超過拍檔等級之後才會慢慢浮現的隱藏效果)
// ==========================================
// 200~300:每+20親密度,命中率+2%;命中率如果已經滿了,溢出的部分轉換成會心一擊率
// 350:HP歸零時,有機率留下1HP
// 400:HP歸零時,有機率留下1%HP(取代350的效果,不會疊加)
function getBondHiddenAccBonus(attacker, ctx){
    const bond = (party.includes(attacker)) ? (attacker.bond || 0) : 0;
    if (bond < 200) return 0;
    const steps = Math.min(5, Math.floor((bond - 200) / 20)); // 200~300,最多5階
    const bonusPct = steps * 2;
    const roomLeft = Math.max(0, 100 - ctx.accuracy);
    const applied = Math.min(bonusPct, roomLeft);
    ctx.accuracy += applied;
    return (bonusPct - applied) / 100; // 溢出的部分,回傳給calculateDamage轉成會心一擊率
}

// HP歸零判定時統一呼叫這個函式,而不是直接 Math.max(0, mon.hp - dmg)
// 只有玩家自己的隊伍怪物才有親密度保命效果,野生/訓練家的怪物不受影響
function applyBondSurvival(mon, incomingDmg){
    const wouldFaint = mon.hp > 0 && (mon.hp - incomingDmg) <= 0;
    if (wouldFaint && party.includes(mon)) {
        const bond = mon.bond || 0;
        if (bond >= 400 && Math.random() < 0.20) {
            return Math.max(1, Math.round(mon.maxHp * 0.01));
        }
        if (bond >= 350 && Math.random() < 0.15) {
            return 1;
        }
    }
    return Math.max(0, mon.hp - incomingDmg);
}

function checkHit(attacker, move, defender) {
    // 1. 取得基礎命中率 (優先讀取 move.acc，若無則預設為必中 1.0)
    let accuracy = move.acc !== undefined ? move.acc : 1.0;

    // 2. 建立命中 Context，將小數轉為整數百分比 (0~100) 方便特性與裝備做加減
    const ctx = {
        attacker: attacker,
        defender: defender,
        move: move,
        moveType: move.type,
        weather: currentWeather,
        accuracy: accuracy * 100, // 轉成 95
        guaranteedHit: false
    };

    // 3. 觸發特性加成 (例如：發光、鎖定、強光等)
    if (typeof runPassiveEvent === 'function') {
        const atkRes = runPassiveEvent('beforeHitCheck', attacker, defender, ctx);
        const defRes = runPassiveEvent('beforeHitCheck', defender, attacker, ctx);
        // 如果有訊息，可以暫存在 ctx 中讓外部讀取 (這部分看你原本的系統實作)
    }

    // 4. 特性或技能保證必中
    if (ctx.guaranteedHit || move.alwaysHit) {
        return { hit: true, accuracy: 1.0, messages: [] };
    }

    // 5. 處理天氣影響 (例如濃霧 -20% 命中)
    if (currentWeather && currentWeather.id === 'fog') {
        ctx.accuracy -= 20;
    }

    // 6. 處理裝備影響 (例如精準透鏡)
    const atkHeld = typeof heldItemDef === 'function' ? heldItemDef(attacker) : null;
    if (atkHeld && atkHeld.accBoost) {
        ctx.accuracy += (atkHeld.accBoost * 100);
    }

    // 7. 處理動態 Debuff (例如被潑沙降命中)
    if (attacker.accDebuff) {
        ctx.accuracy -= attacker.accDebuff;
    }

    // 7.5 隱藏親密度命中率加成(溢出轉會心一擊率,暫存在攻擊方身上給calculateDamage讀取)
    attacker._bondCritBonus = getBondHiddenAccBonus(attacker, ctx);

    // 8. 最終判定：將百分比 (例如 75) 轉回小數 (0.75)，確保鎖在 0~1 之間
    let finalAccuracy = Math.max(0, Math.min(1.0, ctx.accuracy / 100));
    if (MonsterUtil.species(attacker).passive === 'unyielding') finalAccuracy = Math.max(0.2, finalAccuracy);

    // 🌟 羈絆爆發·迴避:防禦方如果有蓄積的迴避機率,優先判定(用過就清除,只生效一次)
    if (defender.evadeNextChance) {
        const dodge = Math.random() < defender.evadeNextChance;
        defender.evadeNextChance = 0;
        if (dodge) {
            return { hit: false, accuracy: finalAccuracy, messages: [`💨 ${MonsterUtil.species(defender).name} 靠著羈絆的力量迴避了攻擊！`] };
        }
    }
    
    // 🎲 產生 0.0 ~ 1.0 的亂數，小於等於最終命中率即為命中
    const roll = Math.random();
    const isHit = roll <= finalAccuracy;

    return {
        hit: isHit,
        accuracy: finalAccuracy,
        messages: [] // (如果特性有產生額外訊息，放在這裡回傳)
    };
}

// ⚠️ 向下相容處理：讓原本呼叫 effectiveAcc 的地方直接轉接給 checkHit
// ==========================================
// 🌟 觸發主函式 (提供給 Battle 系統呼叫)
// ==========================================
function triggerEntryPassives(mon, enemy) {
    const res = runPassiveEvent("onEntry", mon, enemy);
    let msgs = res.messages || [];

    // ⚡ 雷系與 ❄️ 冰系羈絆共鳴
    const sp = MonsterUtil.species(mon);
    const tier = getBondTier(mon.bond);
    if (tier > 0) {
        if (sp.type === 'thunder') {
            mon.atkMult = Math.min(3.0, (mon.atkMult || 1) + 0.05 * tier);
            msgs.push(`⚡ 雷電共鳴！${sp.name} 速度極快，攻擊力提升了！`);
        }
        if (sp.type === 'ice') {
            mon.defMult = Math.min(3.0, (mon.defMult || 1) + 0.05 * tier);
            msgs.push(`❄️ 堅冰護甲！${sp.name} 凝結冰霜，防禦力提升了！`);
        }
    }
    return msgs;
}
// ==========================================
// 🌟 回合結束特性與狀態清理
// ==========================================
function triggerTurnEndPassives(mon) {
    if (mon.hp <= 0) return '';
    let msgs = [];

    // 狀態類持續恢復/印記邏輯
    if (mon.healBlockTurns > 0) mon.healBlockTurns--;
    if (mon.hotTurns > 0) {
        mon.hotTurns--;
        if (!mon.healBlockTurns) {
            const heal = Math.max(1, Math.round(mon.maxHp * mon.hotPct));
            mon.hp = Math.min(mon.maxHp, mon.hp + heal);
            msgs.push(`${MonsterUtil.species(mon).name} 受到持續恢復效果，恢復了 HP！`);
        }
    }

    // 🌟 新增：寄生種子扣血
    if (mon.leechTurns > 0) {
        mon.leechTurns--;
        const dmg = Math.max(1, Math.round(mon.maxHp * mon.leechPct));
        mon.hp = Math.max(0, mon.hp - dmg);
        msgs.push(`🌱 ${MonsterUtil.species(mon).name} 被寄生種子吸取了 ${dmg} 點 HP！`);
    }
    
    // 🌟 新增：挑釁與守勢倒數清理
    if (mon.tauntTurns > 0) mon.tauntTurns--;
    mon.guardReduction = null;  // 守勢只維持一回合
    mon.counterReady = null;    // 反擊架勢也只維持一回合

    // 觸發引擎分發
    const res = runPassiveEvent("onTurnEnd", mon);
    if (res.messages && res.messages.length > 0) {
        msgs.push(...res.messages);
    }
    // 💧 水系羈絆共鳴：拍檔階段微幅自癒
    const sp = MonsterUtil.species(mon);
    const tier = getBondTier(mon.bond);
    if (sp.type === 'water' && tier === 3 && mon.hp < mon.maxHp && mon.healBlockTurns === 0) {
        const heal = Math.max(1, Math.round(mon.maxHp * 0.05));
        mon.hp = Math.min(mon.maxHp, mon.hp + heal);
        msgs.push(`💧 源泉滋潤！${sp.name} 受到水之羈絆的治癒，恢復了少許 HP！`);
    }
    return msgs.join(' '); 
}
function triggerDeathPassives(defeated, attacker) {
    if (!attacker || attacker.hp <= 0) return '';
    const res = runPassiveEvent("onFaint", defeated, attacker);
    return (res.messages || []).join(' ');
}

// ==========================================
// 🌟 觸發攻擊後特性 (afterAttack)
// ==========================================
function triggerAfterAttackPassives(attacker, defender, move, hitCtx) {
    const ctx = {
        move: move,
        hit: hitCtx.hit,
        damage: hitCtx.damage || 0,
        weather: currentWeather
    };
    const res = runPassiveEvent('afterAttack', attacker, defender, ctx);
    return res.messages || [];
}

// ==========================================
// 🌟 戰鬥計算引擎 (支援攻擊前屬性變更)
// ==========================================
// ==========================================
// 🌟 戰鬥計算引擎 (支援新技能、羈絆共鳴、特性攔截)
// ==========================================
function damageCalc(attacker, move, defender) {
    // 🛡️ 1. 絕對防禦判定 (秘笈:全面防禦 / 守護打擊)
    if (defender.damageImmunity) {
        defender.damageImmunity = false; // 消耗掉無敵盾
        return { dmg: 0, mult: 1, crit: false, messages: ['🛡️ 絕對防禦擋下了所有的傷害！'] };
    }

    const atkSp = MonsterUtil.species(attacker);
    const defSp = MonsterUtil.species(defender);
    const atkType = effectiveType(attacker);
    const defType = effectiveType(defender);
    
    // 📦 2. 建立 Context
    const ctx = {
        attacker: attacker,
        defender: defender,
        move: move,
        moveType: move.type,
        weather: currentWeather,
        critRate: 0.08 + (attacker._bondCritBonus || 0) + (attacker.critBoostNext || 0), // 基礎爆擊率 8% + 隱藏親密度溢出加成 + 羈絆爆發·會心
        isCritical: false,
        damage: 0,
        multiplier: 1 
    };
    attacker._bondCritBonus = 0; // 用過就清掉,避免累積到下一次攻擊
    attacker.critBoostNext = 0;

    // 🌤️ 3. 天氣加成
    let weatherAtkMult = 1;
    let weatherDefMult = 1;
    if (currentWeather) {
        if (currentWeather.id === 'rain') {
            if (ctx.moveType === 'water') weatherAtkMult = 1.5;
            if (ctx.moveType === 'fire') weatherAtkMult = 0.5;
        }
        if (currentWeather.id === 'harshSun') {
            if (ctx.moveType === 'fire') weatherAtkMult = 1.5;
            if (ctx.moveType === 'water' || ctx.moveType === 'ice') weatherAtkMult = 0.5;
        }
        if (currentWeather.id === 'snow' && defType === 'ice') weatherDefMult = 1.5;
        if (currentWeather.id === 'sandstorm' && defType === 'earth') weatherDefMult = 1.5;
        if (currentWeather.id === 'windy' && ctx.moveType === 'wind') weatherAtkMult = 1.5;
        if (currentWeather.id === 'radiant') {
            if (ctx.moveType === 'light') weatherAtkMult = 1.5;
            if (ctx.moveType === 'dark') weatherAtkMult = 0.5;
        }
        if (currentWeather.id === 'pitchDark') {
            if (ctx.moveType === 'dark') weatherAtkMult = 1.5;
            if (ctx.moveType === 'light') weatherAtkMult = 0.5;
        }
    }
// 🌟 計算威嚇層數帶來的減傷倍率 (攻擊方)
    let intimidateMultA = 1;
    if (attacker.intimidateStacks) {
        intimidateMultA = Math.max(0.2, 1 - attacker.intimidateStacks * 0.2);
    }
    
    // 🌟 計算威嚇層數帶來的減傷倍率 (防禦方，預防之後有需要用防禦力算傷害的招式)
    let intimidateMultD = 1;
    if (defender.intimidateStacks) {
        intimidateMultD = Math.max(0.2, 1 - defender.intimidateStacks * 0.2);
    }
    // 🔮 共鳴系統加成 (只對玩家自己的隊伍生效,敵方不受影響)
    let resonanceAtkMult = 1, resonanceDefMult = 1;
    if (typeof party !== 'undefined') {
        if (party.includes(attacker)) resonanceAtkMult = calculatePartyResonance().atkMult;
        if (party.includes(defender)) resonanceDefMult = calculatePartyResonance().defMult;
    }
    // 🗡️ 4. 基礎攻防計算 (包含能力階級、燒傷、威嚇層數、共鳴加成)
    let atkMultValue = attacker.atkMult || 1;
    if (MonsterUtil.species(attacker).passive === 'unyielding') atkMultValue = Math.max(0.4, atkMultValue);
    let defMultValue = defender.defMult || 1;
    if (MonsterUtil.species(defender).passive === 'unyielding') defMultValue = Math.max(0.4, defMultValue);

    let atkStat = attacker.atk * atkMultValue * weatherAtkMult * intimidateMultA * resonanceAtkMult;
    let defStat = defender.def * defMultValue * weatherDefMult * resonanceDefMult;
    if (attacker.status === 'burn') atkStat *= 0.5; // 燒傷攻擊減半

    // 🎒 裝備加成
    const heldA = heldItemDef(attacker);
    if (heldA && heldA.atkMult) atkStat *= heldA.atkMult;
    if (heldA && heldA.defMult) defStat *= heldA.defMult;
    
    const heldD = heldItemDef(defender);
    if (heldD && heldD.atkMult) atkStat *= heldD.atkMult;
    if (heldD && heldD.defMult) defStat *= heldD.defMult;

    // 🌟 特性加成 (beforeAttack)
    const atkRes = runPassiveEvent('beforeAttack', attacker, defender, ctx);
    
    // ⚔️ 基礎傷害公式
    ctx.damage = Math.max(1, (atkStat * move.power) - defStat * 0.5);

    // 👇 🌟 5. 新技能：傷害加成與減免處理 🌟 👇
    
    // (1) 絕境反擊 (lastStand)：HP 越低，威力越高
    if (move.lowHpPower) {
        let hpPct = attacker.hp / attacker.maxHp;
        if (hpPct <= 0.3) ctx.damage *= 2.0;
        else if (hpPct <= 0.6) ctx.damage *= 1.5;
    }

    // (2) 復仇 (revenge)：上回合受傷，這回合傷害翻倍
    if (move.revengePower && attacker.tookDamageLastTurn) {
        ctx.damage *= move.revengePower;
        attacker.tookDamageLastTurn = false; // 消耗掉復仇標記
    }

    // (3) 蓄力 / 生命獻祭：消耗標記並放大傷害
    if (attacker.nextAttackMult) {
        ctx.damage *= attacker.nextAttackMult;
        attacker.nextAttackMult = null; 
    }

    // (4) 守勢 (guard)：防禦方減免傷害
    if (defender.guardReduction) {
        ctx.damage *= (1 - defender.guardReduction);
    }

    // 👇 🌟 6. 羈絆共鳴：火系增傷、地系減傷、無系均衡 🌟 👇
    const atkTier = getBondTier(attacker.bond);
    const defTier = getBondTier(defender.bond);

    // 攻擊方共鳴
    if (atkTier > 0) {
        if (atkType === 'fire') ctx.damage *= (1 + 0.05 * atkTier); 
        if (atkType === 'none' && atkTier === 3) ctx.damage *= 1.05; 
    }
    // 防禦方共鳴
    if (defTier > 0) {
        if (defType === 'earth') ctx.damage *= (1 - 0.05 * defTier); 
        if (defType === 'none' && defTier === 3) ctx.damage *= 0.95; 
    }

    // 🎯 7. 屬性剋制與 STAB (同屬性加成)
    // 🌟 adaptive 模式:動態變成「剋制對方屬性」的類型;對方是無屬性的話,改用自己的屬性
    if (move.typeMode === 'adaptive') {
        ctx.moveType = getCounterType(defType) || atkType;
    }
    const mult = typeMultiplier(ctx.moveType, defType);
    ctx.multiplier = mult;
    ctx.damage *= mult;
    if (ctx.moveType === atkType && ctx.moveType !== 'none') ctx.damage *= 1.5;

    // 🔥 8. 會心一擊
    if (heldA && heldA.critBoost) ctx.critRate += heldA.critBoost;
    if (Math.random() < ctx.critRate) {
        ctx.isCritical = true;
        ctx.damage *= 1.5;
    }

    // 🎲 9. 傷害浮動 (85% ~ 100%)
    ctx.damage = Math.floor(ctx.damage * (0.85 + Math.random() * 0.15));

    // 🛡️ 10. 受擊特性 (onDamage)
    const defRes = runPassiveEvent('onDamage', defender, attacker, ctx);

    // 確保最低傷害為 1
    ctx.damage = Math.max(1, Math.floor(ctx.damage));

    // 回傳最終結果
    return {
        dmg: ctx.damage,
        mult: ctx.multiplier,
        crit: ctx.isCritical,
        messages: [...(atkRes.messages || []), ...(defRes.messages || [])]
    };
}
function effectiveAcc(attacker, move, defender){
  const sp = MonsterUtil.species(attacker);
  const p = MonsterUtil.passive(attacker);
  let acc = p === 'swift' ? Math.min(0.99, move.acc + 0.15) : move.acc;
  if(!attacker.itemDisabled && heldItemDef(attacker)?.accBoost) {
    acc += heldItemDef(attacker).accBoost;
  }
  // 奪得先機：第一回合必定命中
  if (move.firstTurnAcc && !attacker.hasDealtFirstDamage) return move.firstTurnAcc;
  
  // 鷹眼鎖定：上回合未命中疊加命中率
  if (move.accuracyStack && attacker.honeMissCount) acc += move.accuracyStack * attacker.honeMissCount;

  if(p === 'statusAccBoost' && defender && defender.status) acc += 0.4;
  if(p === 'steady' && attacker.hp <= attacker.maxHp * 0.5) acc += 0.2;
  if(defender && MonsterUtil.passive(defender) === 'dazzling') acc -= 0.15;
  
  // 閃光突襲：命中率 Debuff
  if(attacker.accDebuff) acc -= attacker.accDebuff;
  
  // 命中提升類：鎖定、沉穩
  if(p === 'statusAccBoost' && defender && defender.status) acc += 0.4;
  if(p === 'steady' && attacker.hp <= attacker.maxHp * 0.5) acc += 0.2;
  
  // 命中干擾類：強光
  if(defender && MonsterUtil.passive(defender) === 'dazzling') acc -= 0.15;
  
  // 天氣影響與發光抵銷
  let wDelta = (currentWeather && currentWeather.accDelta) ? currentWeather.accDelta : 0;
  if(p === 'illuminate' && currentWeather && currentWeather.id === 'fog') wDelta = 0; // 發光無視霧天
  
  acc = Math.max(0.05, acc + wDelta);
  return acc;
}

// =========================================================
// 🛠️ 改造區 G:異常狀態 🛠️
// STATUS_INFLICT:攻擊招式的屬性符合這裡的 key,就有機會讓對方中招
// STATUS_INFLICT_CHANCE:個別狀態的中招機率覆寫(沒列出的用預設的 STATUS_CHANCE)
// 注意:睡眠目前指定給「木」屬性招式觸發(草系催眠孢子的經典設計),
// 如果你想要別的屬性觸發,告訴我要換成哪個屬性就好。
// =========================================================
const STATUS_META = {
  burn:      { name:'灼燒', icon:'🔥', dot:0.05, color:'#ff6b4a' },
  poison:    { name:'中毒', icon:'☠️', dot:0.06, color:'#8a5cff' },
  paralysis: { name:'麻痺', icon:'⚡', skipChance:0.25, color:'#ffd23f' },
  sleep:     { name:'睡眠', icon:'💤', wakeChance:0.5, color:'#8899cc' },
};
const STATUS_INFLICT = { fire:'burn', dark:'poison', thunder:'paralysis' }; // 睡眠已經改成「催眠觸覺」特性,不再由木屬性招式固定觸發
const STATUS_CHANCE = 0.25;
const STATUS_INFLICT_CHANCE = { sleep:1.0 }; // 睡眠:命中就一定會睡著(不管是特性還是催眠招式觸發的)

function maybeInflictStatus(attacker, move, defender){
  if(defender.status || defender.hp<=0) return null;
  if(move.statusOnly){
    if(Math.random() < (move.statusChance ?? 1.0)){ defender.status = move.statusOnly; return move.statusOnly; }
    return null;
  }
  // 特性:催眠觸覺 —— 不管用什麼招式攻擊,命中時都有額外機率讓對方睡著
  const atkSp = MonsterUtil.species(attacker);
  if(atkSp.passive==='hypnoticTouch' && Math.random() < STATUS_CHANCE){
    defender.status = 'sleep';
    return 'sleep';
  }
  const statusId = STATUS_INFLICT[move.type];
  if(!statusId) return null;
  const chance = STATUS_INFLICT_CHANCE[statusId] ?? STATUS_CHANCE;
  if(Math.random() < chance){ defender.status = statusId; return statusId; }
  return null;
}
// 回合開始前檢查這隻怪物會不會被異常狀態卡住這回合:
// 麻痺:機率完全無法行動 / 睡眠:每回合0.5機率醒來,醒來後這回合可以正常行動,沒醒就跳過
function checkStatusBlock(mon, move){
  if(mon.status==='paralysis' && Math.random() < STATUS_META.paralysis.skipChance){
    return { blocked:true, msg:`${MonsterUtil.species(mon).name} 因為麻痺而無法動彈!` };
  }
  if(mon.status==='sleep'){
    // 💤 新增：檢查招式是否可以在睡眠中使用
    if(move && move.sleepUsable){
      return { blocked:false, msg:`${MonsterUtil.species(mon).name} 在睡夢中行動了!` };
    }
    if(Math.random() < STATUS_META.sleep.wakeChance){
      mon.status = null;
      return { blocked:false, msg:`${MonsterUtil.species(mon).name} 醒過來了!` };
    }
    return { blocked:true, msg:`${MonsterUtil.species(mon).name} 還在睡覺,無法動彈...` };
  }
  return { blocked:false, msg:null };
}
function applyStatusDot(mon){
  if(mon.hp<=0) return null;
  if(mon.status==='burn' || mon.status==='poison'){
    const pct = STATUS_META[mon.status].dot;
    const dmg = Math.max(1, Math.round(mon.maxHp*pct));
    mon.hp = Math.max(0, mon.hp-dmg);
    return { statusId:mon.status, dmg };
  }
  return null;
}
function statusTag(mon){
  if(!mon.status) return '';
  const s = STATUS_META[mon.status];
  return ` <span class="statusTag ${mon.status}">${s.icon}${s.name}</span>`;
}

// ---------- 攻擊動畫 ----------
// 攻擊方的衝刺動畫(不分效果種類,單純代表「出招」這個動作本身)
function playLungeAnim(attackerId, side){
  const atkEl = document.getElementById(attackerId);
  atkEl.classList.remove('atk-player','atk-wild');
  void atkEl.offsetWidth;
  atkEl.classList.add(side==='player' ? 'atk-player' : 'atk-wild');
}
// 1. 屬性傷害:依招式屬性顏色發光
function playElementHitAnim(targetId, moveType){
  const el = document.getElementById(targetId);
  el.style.setProperty('--elemColor', (ELEMENT_META[moveType]||ELEMENT_META.none).color);
  el.classList.remove('hit-anim'); void el.offsetWidth; el.classList.add('hit-anim');
}
// 2. 附加異常狀態:依狀態顏色脈動
function playStatusInflictAnim(targetId, statusId){
  const el = document.getElementById(targetId);
  el.style.setProperty('--statusColor', (STATUS_META[statusId]||{}).color || '#fff');
  el.classList.remove('status-anim'); void el.offsetWidth; el.classList.add('status-anim');
}
// 3. 異常狀態解除:白光一閃
function playCureAnim(targetId){
  const el = document.getElementById(targetId);
  el.classList.remove('cure-anim'); void el.offsetWidth; el.classList.add('cure-anim');
}
// 4. 增益狀態:金色上浮
function playBuffAnim(targetId){
  const el = document.getElementById(targetId);
  el.classList.remove('buff-anim'); void el.offsetWidth; el.classList.add('buff-anim');
}
// ---------- 雲端存檔(window.storage,跨裝置/跨session保留) ----------
// 只有在「戰鬥結束」與「怪物中心回血」這兩個時機會自動存檔,
// 移動位置、切換先發等操作不會即時存檔,離開前記得先觸發其中一種情況。
const SLOT_KEYS = ['mq_slot_1','mq_slot_2','mq_slot_3'];
let currentSlot = null;
let debugNoEncounters = false;
let autoSaveEnabled = true;
let isSaving = false;
