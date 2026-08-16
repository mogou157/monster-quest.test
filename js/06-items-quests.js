// ============================================================
// 06-items-quests.js — 道具、商店、攜帶裝備、任務系統、每日任務
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================


// =========================================================
// 🛠️ 改造區 F:道具與商店 🛠️
// use(m) 回傳 true 代表使用成功(會消耗一個道具),false 代表沒有效果(不會消耗)
// =========================================================
// ==========================================
// 📦 消耗品與技能秘笈區
// ==========================================
// 🌟 秘笈小工具：教導怪獸學習指定招式
// 🌟 秘笈小工具：教導怪獸學習指定招式 (新增等級限制，預設為 Lv.20)
// 🌟 秘笈小工具：教導怪獸學習指定招式 (超過4招直接送回憶區)
function createManualUse(moveId, reqLevel = 20) {
    return (m) => {
        if (m.level < reqLevel) {
            toast(`等級不足！${MonsterUtil.species(m).name} 需要達到 Lv.${reqLevel} 才能學習此招式。`);
            return false;
        }
        const moveDef = MOVE_POOL[moveId];
        if (moveDef && moveDef.reqBondToLearn && (m.bond || 0) < moveDef.reqBondToLearn) {
            toast(`親密度不足！${MonsterUtil.species(m).name} 的親密度需要達到 ${moveDef.reqBondToLearn} 以上,才願意學習這個招式。`);
            return false;
        }
        m.moveHistory = m.moveHistory || [];
        if (m.moves.includes(moveId) || m.moveHistory.includes(moveId)) {
            toast('已經學會這個招式了！');
            return false; 
        }
        
        m.moveHistory.push(moveId); // 紀錄進歷史
        if (m.moves.length < 4) {
            m.moves.push(moveId);
            toast(`成功教導了 ${moveDisplayName(moveId,m)}！`);
        } else {
            toast(`技能格已滿！${moveDisplayName(moveId,m)} 已加入回憶清單，可找回憶師裝備。`);
        }
        return true; 
    };
}
// 🌟 每種食物對應的「喜好屬性」:餵給喜歡這種食物的怪物,友好度加成 x1.5
const FOOD_FAVORITES = {
  bdcandy: ['light'],
  chikenSoup: ['fire'],
  matcha: ['wood', 'wind'],
  juice: ['water', 'ice'],
  rice: ['earth'],
  chocolate: ['dark'],
  egg: ['thunder', 'none'],
};

// 🌟 食物製造小工廠：自動處理心情加成 + 喜好食物加成
function createFoodItem(name, desc, price, foodKey) {
    return {
        name: name, desc: desc, price: price,
        use: (m) => {
            if (m.hp <= 0) return false; 
            let bondGain = 2;
            if (m.mood === 'hungry') bondGain = 4; // 飢餓時效果兩倍！

            let likedIt = false;
            if (foodKey && FOOD_FAVORITES[foodKey] && FOOD_FAVORITES[foodKey].includes(MonsterUtil.species(m).type)) {
                bondGain = Math.round(bondGain * 1.5); // 喜好食物,友好度 x1.5
                likedIt = true;
            }

            m.bond = Math.min(400, (m.bond || 0) + bondGain);
            toast(likedIt
                ? `${MonsterUtil.species(m).name} 很喜歡這個口味!友好度提升了 ${bondGain} 點!💖`
                : `餵食了 ${name}！${MonsterUtil.species(m).name} 的友好度提升了 ${bondGain} 點！`);
            
            // 吃飽了就變回普通心情
            if (m.mood === 'hungry') m.mood = 'normal'; 
            return true;
        }
    };
}
const ITEMS = {
  // === 🏛️ 神獸聖物 (重要道具) ===
  ta: { name: '充能核心A', desc: '散發著雷光的零件，用於啟動雷暴聖殿。', keyItem: true },
  tb: { name: '充能核心B', desc: '散發著雷光的零件，用於啟動雷暴聖殿。', keyItem: true },
  tc: { name: '充能核心C', desc: '散發著雷光的零件，用於啟動雷暴聖殿。', keyItem: true },
  td: { name: '充能核心D', desc: '散發著雷光的零件，用於啟動雷暴聖殿。', keyItem: true },
  
  fa: { name: '不滅聖火A', desc: '燃燒著日珥之力的火種，用於熾熱山谷。', keyItem: true },
  fb: { name: '不滅聖火B', desc: '燃燒著日珥之力的火種，用於熾熱山谷。', keyItem: true },
  fc: { name: '不滅聖火C', desc: '燃燒著日珥之力的火種，用於熾熱山谷。', keyItem: true },
  fd: { name: '不滅聖火D', desc: '燃燒著日珥之力的火種，用於熾熱山谷。', keyItem: true },
  potion:  { name:'治癒藥水(15圓)', desc:'恢復50點HP',    price:15, use:(m)=>{ if(m.hp<=0||m.hp>=m.maxHp) return false; m.hp=Math.min(m.maxHp,m.hp+50); return true; } },
  potionH: { name:'強力藥水(40圓)', desc:'恢復150點HP',   price:40, use:(m)=>{ if(m.hp<=0||m.hp>=m.maxHp) return false; m.hp=Math.min(m.maxHp,m.hp+150); return true; } },
  candy:   { name:'經驗果實(25圓)', desc:'獲得30點經驗值', price:25, use:(m)=>{ if(m.hp<=0) return false; m.exp+=30; return true; } },
  fullHeal:{ name:'萬能藥(20圓)',   desc:'治癒異常狀態',   price:20, use:(m)=>{ if(!m.status) return false; m.status=null; return true; } },
// 👇 加入全新的捕獲護符
  catchCharm: { name: '捕獲護符(1500圓)', desc: '被動道具：放在背包就能提升捕捉率！最多可購買升級 3 次。', price: 1500, maxBuy: 3, // 🌟 最高上限 3 級
use: () => { toast('這是一項被動道具，只要擁有就會自動生效！'); return false; } },

  fusionBlueprint: { name: '融合圖紙(800圓)', desc: '融合機專用素材：使用後可以讓下一次融合100%成功(沒有圖紙也能融合，只是成功率沒那麼高)。', price: 800, noTarget: true,
    unlockCondition: () => QUESTS.filter(q => q.chapter === 4).every(q => q.check()),
    use: () => { toast('融合圖紙已收進背包，去融合機使用吧！'); return false; } },
  moveRecallPhone: { name: '回憶師電話(3000圓)', desc: '傳說中的道具，不用親自跑去找技能回憶師，直接在背包裡就能幫怪物回憶招式！', price: 3000, noTarget: true,
    unlockCondition: () => QUESTS.filter(q => q.chapter === 8).every(q => q.check()),
    use: () => { openMoveRecallScreen({ name: '📞 回憶師電話' }); return false; } },
  
  // 👇 替換原本的 worldMap (加入第九章解鎖的傳送功能)
worldMap: { 
name: '世界地圖(500圓)', 
desc: '記錄冒險足跡。完成第九章任務後解鎖「快速傳送」功能！', 
price: 500, 
noTarget: true, 
use: () => { 
    closeOverlays();
    overlayOpen = 'worldMap';
    renderWorldMapScreen();
    document.getElementById('worldMapOverlay').style.display = 'flex';
    return false; 
} 
},
      bdcandy:createFoodItem('一袋軟糖(15圓)','色彩鮮艷的軟糖。友好度+2',15,'bdcandy'),
  chikenSoup: createFoodItem('雞湯(25圓)', '溫熱的湯品，能溫暖身心。友好度+2', 25, 'chikenSoup'),
  matcha: createFoodItem('抹茶(20圓)', '微苦回甘的飲品。友好度+2', 20, 'matcha'),
  juice: createFoodItem('果汁(20圓)', '酸甜解渴。友好度+2', 20, 'juice'),
  rice: createFoodItem('米飯(20圓)', '填飽肚子的主食。友好度+2', 20, 'rice'),
  chocolate: createFoodItem('巧克力(15圓)', '甜美的點心。友好度+2', 15, 'chocolate'),
  egg: createFoodItem('兩顆雞蛋(15圓)', '營養豐富的原型食物。友好度+2', 15, 'egg'),
    scandy:   { name:'大經驗果(250圓)', desc:'獲得330點經驗值', price:250,  unlockCondition: () => QUESTS.filter(q => q.chapter === 5).every(q => q.check()),use:(m)=>{ if(m.hp<=0) return false; m.exp+=330; return true; } },
  fullRestore: { name: '全滿藥(150圓)', desc: '恢復全部HP並治癒異常狀態', price: 150, unlockCondition: () => QUESTS.filter(q => q.chapter === 5).every(q => q.check()), use: (m) => { 
          if(m.hp <= 0 || (m.hp === m.maxHp && !m.status)) return false;  m.hp = m.maxHp; m.status = null; return true;  }  },
  searchlight: { name: '探照燈(500圓)', desc: '被動裝備：帶在身上就能大幅照亮迷霧。', price: 500, use: (m) => { toast('💡 這是一項被動道具，只要放在背包裡就能自動擴大視野！');  return false;}  },
premiumPass: {name: 'Premium 會員證(5000圓)', desc: '解鎖遊樂場特權：每日首場半價、保底+1點、正點數獲得 1.5 倍放大，且有 20% 機率爆擊翻 2 倍！', 
price: 5000,  unlockCondition: () => QUESTS.filter(q => q.chapter === 5).every(q => q.check()),use: (m) => { toast('這是一項被動道具，只要擁有就會自動生效！'); return false; } },
  // 🌟 新增：七大技能秘笈
  tm_mercy:     { name:'秘笈:刀下留人(1000圓)', desc:'教導「刀下留人」(威力1.2,命中100%)。保證對手至少剩餘1滴血。', price: 1000, use: createManualUse('mercyStrike',15) ,},
  tm_guard:     { name:'秘笈:全面防禦(1400圓)', desc:'教導「全面防禦」(變化技,命中50%)。進入防禦狀態，完全擋下下一次傷害。', price: 1400, use: createManualUse('absoluteGuard') },
  tm_revSelf:   { name:'秘笈:潛能反轉(1500圓)', desc:'教導「潛能反轉」(變化技,必中)。將自身被下降與提升的能力全部顛倒。', price: 1500, use: createManualUse('reverseSelf') },
  tm_revEnemy:  { name:'秘笈:厄運反轉(1500圓)', desc:'教導「厄運反轉」(變化技,必中)。將對手被下降與提升的能力全部顛倒。', price: 1500, use: createManualUse('reverseEnemy') },
  tm_shieldStr: { name:'秘笈:守護打擊(1800圓)', desc:'教導「守護打擊」(威力1.5,命中80%)。攻擊後有30%機率進入全面防禦狀態。', price: 1800, use: createManualUse('shieldStrike') },
  tm_roulette:  { name:'秘笈:元素輪盤(1800圓)', desc:'教導「元素輪盤」(威力1.5,命中90%)。打出隨機一種屬性的強力攻擊。', price: 1800, use: createManualUse('elementalRoulette') },
  tm_charge:    { name:'秘笈:蓄力爆發(2000圓)', desc:'教導「蓄力爆發」(必中)。第一回合蓄力，第二回合造成隨機 1.2~3.6 倍的巨大傷害。', price: 2000, use: createManualUse('chargeStrike') },
  // 👇 加上這行：
  tm_hyper:     { name:'秘笈:破滅死光(2000圓)', desc:'教導「破滅死光」(威力1.5~3.8,命中50%)。命中後下回合將無法動彈。', price: 2000, use: createManualUse('hyperBeam') },
  // 👇 換人支援系
  tm_swapAtk:   { name:'秘笈:應援换位·攻(1200圓)', desc:'教導「應援换位·攻」。使出後強制換上後備隊友,並為牠提升攻擊力。', price: 1200, use: createManualUse('allySwapAtkUp') },
  tm_swapDef:   { name:'秘笈:應援换位·防(1200圓)', desc:'教導「應援换位·防」。使出後強制換上後備隊友,並為牠提升防禦力。', price: 1200, use: createManualUse('allySwapDefUp') },
  tm_swapCure:  { name:'秘笈:交替看護(1200圓)', desc:'教導「交替看護」。使出後強制換上後備隊友,並立即淨化牠的異常狀態。', price: 1200, use: createManualUse('allySwapCure') },
  tm_strikeSwap:{ name:'秘笈:突擊撤退(1600圓)', desc:'教導「突擊撤退」(威力1.0,必中)。攻擊後強制換上後備隊友。', price: 1600, use: createManualUse('strikeAndSwap') },
  // 👇 羈絆爆發系 (親密度需達160以上才能學會)
  tm_bondPower: { name:'秘笈:羈絆爆發·猛襲(2200圓)', desc:'教導「羈絆爆發·猛襲」(命中80%)。傷害隨親密度提升,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstPower') },
  tm_bondAcc:   { name:'秘笈:羈絆爆發·鎖定(2200圓)', desc:'教導「羈絆爆發·鎖定」(命中80%)。親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstAcc') },
  tm_bondHeal:  { name:'秘笈:羈絆爆發·治癒(2200圓)', desc:'教導「羈絆爆發·治癒」(命中80%)。恢復量隨親密度提升,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstHeal') },
  tm_bondSelf:  { name:'秘笈:羈絆爆發·奮起(2200圓)', desc:'教導「羈絆爆發·奮起」(命中80%)。自身攻防提升幅度隨親密度提升,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstSelfBuff') },
  tm_bondDebuff:{ name:'秘笈:羈絆爆發·威壓(2200圓)', desc:'教導「羈絆爆發·威壓」(命中80%)。降低對方攻防的幅度隨親密度提升,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstDebuff') },
  tm_bondDouble:{ name:'秘笈:羈絆爆發·連擊(2500圓)', desc:'教導「羈絆爆發·連擊」(命中80%)。有機率連續攻擊兩次,機率隨親密度提升,親密度需達160才能學會。', price: 2500, use: createManualUse('bondBurstDouble') },
  tm_bondEvade: { name:'秘笈:羈絆爆發·迴避(2200圓)', desc:'教導「羈絆爆發·迴避」(命中80%)。提高迴避下一次攻擊的機率,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstEvade') },
  tm_bondCrit:  { name:'秘笈:羈絆爆發·會心(2200圓)', desc:'教導「羈絆爆發·會心」(命中80%)。提高下一次攻擊的會心一擊率,親密度需達160才能學會。', price: 2200, use: createManualUse('bondBurstCrit') },
  // 👇 共鳴專屬招式 (該共鳴沒發動時無法使出)
  tm_swarmSting:  { name:'秘笈:蟲群亂舞(1800圓)', desc:'教導「蟲群亂舞」(威力1.4,命中90%)。需要隊伍的「蟲類共鳴」發動中才能使出。', price: 1800, use: createManualUse('swarmSting') },
  tm_wildInstinct:{ name:'秘笈:野性直覺(1800圓)', desc:'教導「野性直覺」(威力1.2,必中)。攻擊後提升自身防禦力。需要「動物共鳴」發動中才能使出。', price: 1800, use: createManualUse('wildInstinct') },
  tm_natureBloom: { name:'秘笈:自然綻放(1800圓)', desc:'教導「自然綻放」(必中)。恢復30%HP。需要「花草共鳴」發動中才能使出。', price: 1800, use: createManualUse('natureBloom') },
  tm_overclock:   { name:'秘笈:超頻驅動(1800圓)', desc:'教導「超頻驅動」(威力1.5,命中85%)。攻擊後自身防禦力下降。需要「電器機械共鳴」發動中才能使出。', price: 1800, use: createManualUse('overclock') },
  tm_crystalBarrier:{ name:'秘笈:結晶壁壘(1800圓)', desc:'教導「結晶壁壘」(必中)。大幅提升自身防禦力。需要「礦石光源共鳴」發動中才能使出。', price: 1800, use: createManualUse('crystalBarrier') },
  tm_junkStorm:   { name:'秘笈:雜物風暴(1800圓)', desc:'教導「雜物風暴」(威力1.3,命中90%)。需要「雜貨器物共鳴」發動中才能使出。', price: 1800, use: createManualUse('junkStorm') },
  // 👇 屬性剋制招式
  tm_adaptive:  { name:'秘笈:因勢而動(2000圓)', desc:'教導「因勢而動」(威力1.3,命中95%)。自動變成剋制對方的屬性;對方無屬性時,改用自己的屬性。', price: 2000, use: createManualUse('adaptiveStrike') },
  paintPotion: {name: '✨異色幻彩藥水(16888圓)',desc: '極度稀有的神奇藥水，使用後能為怪獸染上全新的隨機色彩！',price: 16888, // 設定極高價，主要靠轉盤取得
use: (m) => {const hue = Math.floor(Math.random() * 360);m.altColor = `hsl(${hue}, 85%, 65%)`; toast(`✨ 奇妙的事情發生了！${MonsterUtil.species(m).name} 閃爍著全新的光芒！`);return true; // 使用成功，消耗道具// 隨機產生一個漂亮的 HSL 顏色
}},
};

// =========================================================
// 🛠️ 改造區 K:攜帶裝備 🛠️
// 每隻怪物最多攜帶一個裝備,商店購買後到隊伍狀態畫面「裝備」,效果持續生效直到卸下。
// atkMult/defMult:持續提升對應數值的倍率
// curesStatus:攜帶期間,每場戰鬥第一次陷入指定異常狀態時會自動立刻解除(裝備本身不會消耗)
// =========================================================
const HELD_ITEMS = {
  atkCharm:    { name:'力量護符(200圓)', desc:'攜帶期間攻擊力持續提升15%', price:200, atkMult:1.15 },
  defCharm:    { name:'守護護符(200圓)', desc:'攜帶期間防禦力持續提升15%', price:200, defMult:1.15 },
  sleepCharm:  { name:'安神符(200圓)',   desc:'攜帶期間,每場戰鬥第一次陷入睡眠會立刻解除', price:200, curesStatus:'sleep' },
  poisonCharm: { name:'解毒符(200圓)',   desc:'攜帶期間,每場戰鬥第一次中毒會立刻解除', price:200, curesStatus:'poison' },
  burnCharm:   { name:'防燒符(200圓)',   desc:'攜帶期間,每場戰鬥第一次灼燒會立刻解除', price:200, curesStatus:'burn' },
  paraCharm:   { name:'絕緣符(200圓)',   desc:'攜帶期間,每場戰鬥第一次麻痺會立刻解除', price:200, curesStatus:'paralysis' },
  glassSword:  { name:'玻璃劍(350圓)',   desc:'攻擊力提升30%，但防禦力降低20%', price:350, atkMult:1.3, defMult:0.8 },
  ironShield:  { name:'鐵壁盾(350圓)',   desc:'防禦力提升30%，但攻擊力降低20%', price:350, atkMult:0.8, defMult:1.3 },
  balanceGem:  { name:'平衡寶石(300圓)', desc:'攻擊力與防禦力同時提升10%', price:300, atkMult:1.1, defMult:1.1 },
  // === 特殊機制裝備 ===
  expCharm:    { name:'學習裝置(600圓)', desc:'戰鬥獲勝時，裝備者獲得的經驗值增加 50%', price:600, expBoost: 1.5 },
  scopeLens:   { name:'精準透鏡(800圓)', desc:'招式命中率提升 15%', price:800, accBoost: 0.15 },
  leftovers:   { name:'吃剩的蘋果(600圓)', desc:'每回合結束時，持續恢復自身 6% 的 HP', price:600, regenPct: 0.06 },
  focusLens:   { name:'焦點鏡片(850圓)', desc:'會心一擊機率提升 10%', price:850, critBoost: 0.1 },
  masterCharm: { name:'大師護符(1200圓)', desc:'攻擊與防禦力同時提升20%', price:1200, atkMult:1.2,defMult:1.2,    // 👇 解鎖條件：第五章所有任務皆已完成
      unlockCondition: () => QUESTS.filter(q => q.chapter === 5).every(q => q.check())  },
  drinkglass:{name:'酒醉眼鏡(30圓)',desc:'招式命中率降低 15%', price:30, accBoost: 0.15},
  hungerfruit: { name:'餓魔果實(10圓)', desc:'攻擊力與防禦力同時降低10%', price:10, atkMult:0.9, defMult:0.9 },
  atkdb:    { name:'破碎劍(20圓)', desc:'攜帶期間攻擊力持續降低15%', price:20, atkMult:0.85 },
  defCdb:    { name:'破碎盾(20圓)', desc:'攜帶期間防禦力持續降低15%', price:20, defMult:0.85 },
  held_light: { 
  name: '攜帶型照明(250圓)', desc: '特定非光系怪物才能配戴。戰鬥中防禦提升10%，且能驅散地圖迷霧。', price: 250,
   unlockCondition: () => QUESTS.filter(q => q.chapter===4).every(q => q.check()) ,defMult: 1.1, // 給點防禦獎勵// 🌟 核心：判定這隻怪獸能不能裝備！
canEquip: (mon) => {    // 在陣列中填入「允許裝備的怪物 ID」    // 例如：焰鼠(embit)、機板獸(69)、電鼬(59) 等等
    const allowedSpecies = ['embit', '20','69', '59', '66', '80']; return allowedSpecies.includes(mon.speciesId);} }
};
function heldItemDef(mon){ 
  if (mon.itemDisabled) return null; // 被「查封」打中後裝備失效
  return mon.heldItem ? HELD_ITEMS[mon.heldItem] : null; 
}
function equipHeldItem(mon, itemId){
  const itemDef = HELD_ITEMS[itemId];
  
  // 🌟 裝備限制攔截：如果道具有專屬限制，且這隻怪獸不符合，就擋下來！
  if(itemDef.canEquip && !itemDef.canEquip(mon)) {
      toast(`⚠️ 體型或屬性不合！${MonsterUtil.species(mon).name} 無法裝備 ${itemDef.name}！`);
      return;
  }
  if(mon.heldItem === itemId) return;
  if((GameState.inventory[itemId]||0)<=0) return;
  if(mon.heldItem){ GameState.inventory[mon.heldItem] = (GameState.inventory[mon.heldItem]||0)+1; }
  GameState.inventory[itemId]--;
  mon.heldItem = itemId;
}
function unequipHeldItem(mon){
  if(!mon.heldItem) return;
  GameState.inventory[mon.heldItem] = (GameState.inventory[mon.heldItem]||0)+1;
  mon.heldItem = null;
}
// 每場戰鬥第一次中招時,攜帶對應裝備的怪物會自動解除該異常狀態(每場戰鬥限一次)
function tryAutoCureByHeldItem(mon){
  const held = heldItemDef(mon);
  if(!held || !held.curesStatus) return null;
  if(!mon.status || mon.status!==held.curesStatus) return null;
  if(mon.heldItemUsedThisBattle) return null;
  mon.status = null;
  mon.heldItemUsedThisBattle = true;
  return held.curesStatus;
}
// 排毒體質特性:中毒會立刻解除,沒有次數限制(跟裝備限每場一次不同)
function tryAutoCureByPassive(mon){
  const p = MonsterUtil.passive(mon);
  if(!mon.status) return null;

  // 原有解控
  if(p === 'poisonImmune' && mon.status === 'poison'){ mon.status = null; return 'poison'; }
  if(p === 'paralysisImmune' && mon.status === 'paralysis'){ mon.status = null; return 'paralysis'; }
  if(p === 'burnImmune' && mon.status === 'burn'){ mon.status = null; return 'burn'; }
  if(p === 'wakeUp' && mon.status === 'sleep'){ mon.status = null; return 'sleep'; }
  
  // 新增：天氣淨化類
  if(p === 'shineCure' && currentWeather?.id === 'shine') { const s = mon.status; mon.status = null; return s; }
  if(p === 'windCure' && currentWeather?.id === 'wind') { const s = mon.status; mon.status = null; return s; }
  if(p === 'sunCure' && currentWeather?.id === 'harshSun') { const s = mon.status; mon.status = null; return s; }
  
  // 淨身 (全部解除)
  if(p === 'purity'){ const s = mon.status; mon.status = null; return s; }
  
  return null;
}
function updateCoinsHud(){
  // 確保寶石變數存在
  GameState.player.gems = GameState.player.gems || 0;
  // 同時顯示金幣與寶石
  document.getElementById('hudCoins').innerHTML = `💰 ${GameState.player.coins} &nbsp;|&nbsp; 💎 ${GameState.player.gems}`;
}

// =========================================================
// 🛠️ 改造區 D:新增任務 🛠️
// check() 回傳 true/false 代表是否達成,progress() 選填,用來顯示進度文字
// chapter:數字,用來分組顯示,以後要加第二章任務就用 chapter:2
// =========================================================
// =========================================================
// 🛠️ 改造區 D:新增任務 🛠️
// =========================================================
const QUEST_NON_LEGENDARY_COUNT = SPECIES.filter(s=>!s.legendary).length;

const QUESTS = [
  // --- 第一章 ---
  { id:'beatT1',    chapter:1, name:'初戰告捷',     desc:'擊敗任意一位訓練家', check:()=> trainersDefeated.size>=1 },
  { id:'beatAllT1', chapter:1, name:'新手之路制霸', desc:'擊敗新手之路全部訓練家', check:()=> TRAINERS1.every(t=>trainersDefeated.has(t.id)), progress:()=> `${TRAINERS1.filter(t=>trainersDefeated.has(t.id)).length}/${TRAINERS1.length}` },
  { id:'beatAllT2', chapter:1, name:'初出茅廬',     desc:'擊敗幽暗森林全部訓練家', check:()=> TRAINERS2.every(t=>trainersDefeated.has(t.id)), progress:()=> `${TRAINERS2.filter(t=>trainersDefeated.has(t.id)).length}/${TRAINERS2.length}` },
  { id:'explore2',  chapter:1, name:'探索者',       desc:'抵達幽暗森林', check:()=> visitedMaps.has('map2') },
  { id:'lv10',      chapter:1, name:'升級高手',     desc:'任一隊員等級達到10', check:()=> party.some(m=>m.level>=10) },
  
  // --- 第二章 (加入聖火A) ---
  { id:'catch1',    chapter:2, name:'新夥伴',       desc:'捕捉一隻怪物', check:()=> dex.size>=1 },
  { id:'explore3',  chapter:2, name:'探索者',       desc:'抵達地下洞窟', check:()=> visitedMaps.has('map3') },
  { id:'beatAllT3', chapter:2, name:'洞窟霸主',     desc:'擊敗洞窟北側全部訓練家', check:()=> TRAINERS4.every(t=>trainersDefeated.has(t.id)), progress:()=> `${TRAINERS4.filter(t=>trainersDefeated.has(t.id)).length}/${TRAINERS4.length}` },
  { id:'dex3',      chapter:2, name:'冒險筆記-1',   desc:'遇過8種不同怪物', check:()=> seenDex.size >= 8 },
  { id:'rich_boy3', chapter:2, name:'冒險資金',     desc:'累積獲得超過 500 金幣', check:()=> (GameState.player.totalEarnedCoins||0) >= 500, progress:()=> `${Math.min(GameState.player.totalEarnedCoins||0, 500)}/500` },
  { id:'q_fireA',   chapter:2, name:'神秘火種',     desc:'(隱藏獎勵) 完成第二章探索，領取不滅聖火A', check:()=> visitedMaps.has('map3') && seenDex.size >= 8, onClaim:()=> { GameState.inventory.fa = 1; toast('🔥 獲得不滅聖火A！'); SaveManager.save(); } },

  // --- 第三章 ---
  { id:'item4',     chapter:3, name:'保心安',       desc:'購買五瓶藥水', check:()=> (GameState.inventory.potion || 0) >= 5 },
  { id:'win20',     chapter:3, name:'勇士',         desc:'累積戰勝 20 場戰鬥', check:()=> (GameState.player.totalWins || 0) >= 20, progress:()=> `${Math.min((GameState.player.totalWins || 0), 20)}/20` },
  { id:'catch_ice', chapter:3, name:'冰系專家',     desc:'捕捉任意一隻冰屬性怪物', check:()=> [...dex].some(id=> { const sp = SPECIES.find(s=>s.id===id); return sp && sp.type==='ice'; }) }, 
  { id:'step1000',  chapter:3, name:'徒步旅行家',   desc:'累積在地圖上移動 1000 步', check:()=> (GameState.player.totalSteps || 0) >= 1000, progress:()=> `${Math.min(GameState.player.totalSteps || 0, 1000)}/1000` },
  { id:'first_trade',chapter:3,name:'等價交換',     desc:'與怪物商人進行一次交易', check:()=> !!GameState.player.hasTraded },

  // --- 第四章 ---
  { id:'shop5',     chapter:4, name:'上裝備',       desc:'購買力量護符', check:()=>(GameState.inventory.atkCharm||0)>=1 }, 
  { id:'rich_boy5', chapter:4, name:'第一桶金',     desc:'累積獲得超過 1500 金幣', check:()=> (GameState.player.totalEarnedCoins||0) >= 1500, progress:()=> `${Math.min(GameState.player.totalEarnedCoins||0, 1500)}/1500` },
  { id:'win100',    chapter:4, name:'慶百勝',       desc:'累積戰勝 100 場戰鬥', check:()=> (GameState.player.totalWins || 0) >= 100, progress:()=> `${Math.min((GameState.player.totalWins || 0), 100)}/100` },
  { id:'catch3',    chapter:4, name:'小小收藏家',   desc:'捕捉3種不同的怪物', check:()=> dex.size>=3, progress:()=> `${Math.min(dex.size,3)}/3` },
  { id:'dex6',      chapter:4, name:'冒險筆記-2',   desc:'遇過24種不同怪物', check:()=> seenDex.size >= 24 },

  // --- 第五章 ---
  { id:'lv20',      chapter:5, name:'成熟熟成',     desc:'任一隊員等級達到30', check:()=> party.some(m=>m.level>=30) },
  { id:'catch_thun',chapter:5, name:'行動充電',     desc:'捕捉任意一隻雷屬性怪物', check:()=> [...dex].some(id=> { const sp = SPECIES.find(s=>s.id===id); return sp && sp.type==='thunder'; }) }, 
  { id:'earn5000',  chapter:5, name:'賞金獵人',     desc:'歷史累積賺取 5000 金幣', check:()=> (GameState.player.totalEarnedCoins || 0) >= 5000, progress:()=> `${Math.min(GameState.player.totalEarnedCoins || 0, 5000)}/5000` },
  { id:'partner_bond',chapter:5,name:'心靈相通',    desc:'將任意一隻怪物的親密度培養至「拍檔」', check:()=> party.some(m=> (m.bond || 0) >= 161) || storageBox.some(m=> (m.bond || 0) >= 161) },
    { id:'dex6_2',    chapter:5, name:'冒險筆記-3',   desc:'遇過36種不同怪物', check:()=> seenDex.size >= 36 },

  // --- 第六章 ---
  { id:'shop7',     chapter:6, name:'購買伴手禮',   desc:'購買大師護符', check:()=>(GameState.inventory.masterCharm||0)>=1 }, 
  { id:'catch_fire',chapter:6, name:'紀念捕捉',     desc:'捕捉任意一隻火屬性怪物', check:()=> [...dex].some(id=> { const sp = SPECIES.find(s=>s.id===id); return sp && sp.type==='fire'; }) }, 
  { id:'explore_fire',chapter:6,name:'抵達景點',    desc:'抵達熾熱山谷 (map10)', check:()=> visitedMaps.has('map10') },
  { id:'beatAllT6', chapter:6, name:'在地交流',     desc:'擊敗中央廣場全部訓練家', check:()=> TRAINERS_PLAZA.every(t=>trainersDefeated.has(t.id)), progress:()=> `${TRAINERS_PLAZA.filter(t=>trainersDefeated.has(t.id)).length}/${TRAINERS_PLAZA.length}` },
{ id:'lv25',      chapter:6, name:'收穫滿滿',   desc:'隊伍中有 4 隻等級達到 35 以上的怪物', check:()=> party.filter(m => m.level >= 35).length >= 4 },
  // --- 第七章 (神獸海神 + 充能閘門A) ---
  { id:'explore_sea',chapter:7, name:'航向大海',    desc:'抵達蔚藍海域 (map12)', check:()=> visitedMaps.has('map12') },
  { id:'catch_water',chapter:7, name:'水系專家',    desc:'捕捉任意一隻水屬性怪物', check:()=> [...dex].some(id=> { const sp = SPECIES.find(s=>s.id===id); return sp && sp.type==='water'; }) }, 
  { id:'q_thunderA', chapter:7, name:'古代遺物',    desc:'(隱藏獎勵) 探索海域領取充能核心A', check:()=> visitedMaps.has('map12'), onClaim:()=> { GameState.inventory.ta = 1; toast('⚡ 獲得充能核心A！'); SaveManager.save(); } },
{ id:'catch20', chapter:7, name:'勢力龐大', desc:'圖鑑中成功捕捉 10 隻不同的怪物', check:()=> dex.size >= 10, progress:()=> `${Math.min(dex.size, 10)}/10` },
  { id:'explore_water',chapter:7,name:'海上交戰',   desc:'擊敗珊瑚礁岩全部訓練家', check:()=> TRAINERS14.every(t=>trainersDefeated.has(t.id)), progress:()=> `${TRAINERS14.filter(t=>trainersDefeated.has(t.id)).length}/${TRAINERS14.length}` },


  // --- 第八章 ---
  { id:'rich_boy8', chapter:8, name:'富翁',         desc:'累積獲得超過 3500 金幣', check:()=> (GameState.player.totalEarnedCoins||0) >= 3500, progress:()=> `${Math.min(GameState.player.totalEarnedCoins||0, 3500)}/3500` },
  { id:'win200',    chapter:8, name:'慶二百勝',     desc:'累積戰勝 200 場戰鬥', check:()=> (GameState.player.totalWins || 0) >= 200, progress:()=> `${Math.min((GameState.player.totalWins || 0), 200)}/200` },
  { id:'lv30',      chapter:8, name:'三十而立',     desc:'任一隊員等級達到30', check:()=> party.some(m=>m.level>=30) },
  { id:'explore_gra',chapter:8, name:'旅程尾聲',    desc:'抵達大草原-南 (map22)', check:()=> visitedMaps.has('map22') },
  { id:'explorer_15', chapter:8, name:'世界旅人', desc:'探索超過 15 個不同的區域(地圖)', check:()=> visitedMaps.size >= 15, progress:()=> `${Math.min(visitedMaps.size, 15)}/15` },

  // --- 第九章 ---
  { id:'step88',    chapter:9, name:'百聞不如一見', desc:'累積在地圖上移動 999 步', check:()=> (GameState.player.totalSteps || 0) >= 999, progress:()=> `${Math.min(GameState.player.totalSteps || 0, 999)}/999` },
  { id:'partner_b9',chapter:9, name:'團隊',         desc:'將任意五隻怪物的親密度培養至「拍檔」', check:()=> party.filter(m=> (m.bond || 0) >= 161).length + storageBox.filter(m=> (m.bond || 0) >= 161).length >= 5 },
  { id:'elite_squad', chapter:9, name:'精銳小隊', desc:'隊伍中有 4 隻等級達到 45 以上的怪物', check:()=> party.filter(m => m.level >= 45).length >= 4 },
{ id:'earn10k', chapter:9, name:'萬金戶', desc:'歷史累積賺取 10000 金幣', check:()=> (GameState.player.totalEarnedCoins || 0) >= 10000, progress:()=> `${Math.min(GameState.player.totalEarnedCoins || 0, 10000)}/10000` },
{ id:'catch40', chapter:9, name:'生態大師', desc:'圖鑑中成功捕捉 20 隻不同的怪物', check:()=> dex.size >= 20, progress:()=> `${Math.min(dex.size, 20)}/20` },
  // --- 第十章 (神機與最終圖鑑) ---
  { id:'seeAll',    chapter:10, name:'圖鑑達人',    desc:'遇過除了神獸以外的所有怪物', check:()=> seenDex.size>=QUEST_NON_LEGENDARY_COUNT, progress:()=> `${Math.min(seenDex.size,QUEST_NON_LEGENDARY_COUNT)}/${QUEST_NON_LEGENDARY_COUNT}` },
  { id:'shop10',    chapter:10, name:'堅毅之盾',    desc:'購買鐵壁盾', check:()=>(GameState.inventory.ironShield||0)>=1 },
  { id:'lv40',      chapter:10, name:'戰力十足',    desc:'任一隊員等級達到50', check:()=> party.some(m=>m.level>=50) },
  { id:'rich_boy9', chapter:10, name:'富豪',        desc:'累積獲得超過 5500 金幣', check:()=> (GameState.player.totalEarnedCoins||0) >= 5500, progress:()=> `${Math.min(GameState.player.totalEarnedCoins||0, 5500)}/5500` },
  { id:'step8888',  chapter:10, name:'千里之行',    desc:'累積移動 8888 步', check:()=> (GameState.player.totalSteps || 0) >= 8888, progress:()=> `${Math.min(GameState.player.totalSteps || 0, 8888)}/8888` },
// --- 🌟 神獸傳說 (獨立頁面) ---
  { id: 'trial_seagod', chapter: 99, name: '🌊 深淵的守護者', desc: '解開海神遺跡的謎題並擊敗深淵海神。', check: () => trainersDefeated.has('boss_seagod'), isClaimed: () => dex.has('92'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('92', 40)); dex.add('92'); seenDex.add('92'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '🌊 深淵海神加入了隊伍！' : '🌊 深淵海神已送往倉庫！'); } },
  { id: 'trial_firegod', chapter: 99, name: '🔥 日珥的化身', desc: '點燃四把不滅聖火並擊敗日珥神龍。', check: () => trainersDefeated.has('boss_firegod'), isClaimed: () => dex.has('90'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('90', 40)); dex.add('90'); seenDex.add('90'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '🔥 日珥神龍加入了隊伍！' : '🔥 日珥神龍已送往倉庫！'); } },
  { id: 'trial_woodgod', chapter: 99, name: '🌳 創世的意志', desc: '引發彩虹奇蹟或羈絆共鳴，擊敗創世巨樹。', check: () => trainersDefeated.has('boss_woodgod'), isClaimed: () => dex.has('91'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('91', 40)); dex.add('91'); seenDex.add('91'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '🌳 創世巨樹加入了隊伍！' : '🌳 創世巨樹已送往倉庫！'); } },
  { id: 'trial_thundergod', chapter: 99, name: '⚡ 天雷的化身', desc: '收集四個充能核心啟動聖殿，擊敗天雷聖鳥。', check: () => trainersDefeated.has('boss_thundergod'), isClaimed: () => dex.has('93'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('93', 40)); dex.add('93'); seenDex.add('93'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '⚡ 天雷聖鳥加入了隊伍！' : '⚡ 天雷聖鳥已送往倉庫！'); } },
  { id: 'trial_icegod', chapter: 99, name: '❄️ 冰河的霸主', desc: '成為冰系大師或尋求天時地利，擊敗冰河猛瑪。', check: () => trainersDefeated.has('boss_icegod'), isClaimed: () => dex.has('96'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('96', 40)); dex.add('96'); seenDex.add('96'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '❄️ 冰河猛瑪加入了隊伍！' : '❄️ 冰河猛瑪已送往倉庫！'); } },
  { id: 'trial_voidgear', chapter: 99, name: '⚙️ 虛空的兵器', desc: '抵達隱藏迷宮的終點，擊敗並控制虛空神機。', check: () => trainersDefeated.has('boss_voidgear'), isClaimed: () => dex.has('95'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('95', 45)); dex.add('95'); seenDex.add('95'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '⚙️ 虛空神機加入了隊伍！' : '⚙️ 虛空神機已送往倉庫！'); } },
  { id: 'trial_origindra', chapter: 99, name: '👑 始源的霸主', desc: '完成所有考驗開啟封印之門，擊敗始源龍。', check: () => trainersDefeated.has('boss_origindra'), isClaimed: () => dex.has('94'), onClaim: () => { const dest = addToPartyOrStorage(makeMonster('94', 50)); dex.add('94'); seenDex.add('94'); updateHud(); SaveManager.save(); toast(dest === 'party' ? '👑 始源龍加入了隊伍！' : '👑 始源龍已送往倉庫！'); } }
];
// 把兩章的名稱合併在同一個物件裡 (注意第二章的數字要用 2)
const CHAPTER_NAMES = { 
  1: 'CHAPTER-1・新手之路', 
  2: 'CHAPTER-2・洞穴探險',
  3:'CHAPTER-3・登上雪山',
  4:'CHAPTER-4・機械基地',
  5:'CHAPTER-5・攻略迷宮',
  6:'CHAPTER-6・熔岩觀光',
  7: 'CHAPTER-7・水上之路',
  8:'CHAPTER-8・菁英訓練',
  9:'CHAPTER-9・迷霧林徑',
  10:'CHAPTER-10・頂尖冒險者',
99:'🌟 傳說旅程' // 👈 加上這行
};
// =========================================================
// 🛠️ 改造區 I:每日任務 🛠️
// 依照瀏覽器當下的日期判斷,換日就會重置進度跟領取狀態。
// need 是需要累積的次數,progress() 回傳目前累積了多少。
// =========================================================
function todayStr(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function ensureDailyFresh(){
  const t = todayStr();
  if(dailyProgress.date !== t){
    dailyProgress = { date:t, catches:0, battles:0, shopVisits:0, claimed:{}, minigamePlayed: false }; // 👈 加入 minigamePlayed 紀錄
  }
}
const DAILY_QUESTS = [
  { id:'d_catch',  name:'今日捕手',  desc:'今天捕捉1隻怪物',   need:1, reward:15, progress:()=> dailyProgress.catches },
  { id:'d_battle', name:'今日戰士',  desc:'今天打贏3場戰鬥',   need:3, reward:20, progress:()=> dailyProgress.battles },
  { id:'d_shop',   name:'今日採購',  desc:'今天造訪商店1次',   need:1, reward:10, progress:()=> dailyProgress.shopVisits },
];

let selectedQuestChapter = 1; // 🌟 紀錄目前選擇的章節

function renderQuestScreen(){
  ensureDailyFresh();
  const list = document.getElementById('questList');
  list.innerHTML='';

  // 1. 抓取所有有任務的章節
  const chapters = [...new Set(QUESTS.map(q=>q.chapter))].sort((a,b)=>a-b);
  if (!chapters.includes(selectedQuestChapter) && chapters.length > 0) {
      selectedQuestChapter = chapters[0]; // 防呆：如果當前章節沒任務，跳回第一個
  }

  // 2. 繪製「章節切換分頁按鈕」
  const tabsRow = document.createElement('div');
  tabsRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px; justify-content:center;';
  chapters.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'actBtn';
      // 🌟 標示出目前被選中的章節按鈕
      btn.style.cssText = `font-size:10px; padding:4px 8px; ${ch === selectedQuestChapter ? 'background:var(--accent); color:#fff; border-color:var(--accent);' : ''}`;
// 🌟 將第 99 章的按鈕文字改為神獸圖示
      btn.textContent = ch === 99 ? '🌟神獸' : `第${ch}章`;
            btn.onclick = () => {
          selectedQuestChapter = ch;
          renderQuestScreen();
      };
      tabsRow.appendChild(btn);
  });
  list.appendChild(tabsRow);

  // 3. 繪製該章節的標題與任務
  const header = document.createElement('div');
  header.style.cssText='color:var(--gold);font-size:12px;margin:4px 0 6px;letter-spacing:1px;text-align:center;';
  header.textContent = CHAPTER_NAMES[selectedQuestChapter] || `第${selectedQuestChapter}章`;
  list.appendChild(header);

  QUESTS.filter(q=>q.chapter===selectedQuestChapter).forEach(q=>{
      const done = q.check();
      const claimed = q.isClaimed ? q.isClaimed() : false;
      
      const card = document.createElement('div');
      card.className = 'questCard' + (done?' done':'');
      
      let statusIcon = '⬜';
      if(claimed) statusIcon = '✅ (已領取)';
      else if(done) statusIcon = '✅';
      
      card.innerHTML = `<span class="questCheck" style="font-size:12px;">${statusIcon}</span><b>${q.name}</b><br>${q.desc}` +
        (q.progress ? `<br><span style="color:#9aa5ce;">${q.progress()}</span>` : '');
        
      if (done && q.onClaim && !claimed) {
        const btn = document.createElement('button');
        btn.className = 'actBtn';
        btn.style.marginTop = '6px';
        btn.style.fontSize = '10px';
        btn.textContent = '🎁 領取獎勵';
        btn.onclick = () => {
          q.onClaim(); 
          renderQuestScreen(); 
        };
        card.appendChild(btn);
      }
      list.appendChild(card);
  });

  // 4. 繪製每日任務區塊 (固定在最下方)
  const dailyHeader = document.createElement('div');
  dailyHeader.style.cssText='color:var(--gold);font-size:12px;margin:18px 0 6px;letter-spacing:1px;text-align:center; border-top:1px dashed #444; padding-top:12px;';
  dailyHeader.textContent = `── 每日任務(${dailyProgress.date} 重置) ──`;
  list.appendChild(dailyHeader);

  DAILY_QUESTS.forEach(q=>{
    const cur = q.progress();
    const done = cur >= q.need;
    const claimed = !!dailyProgress.claimed[q.id];
    const card = document.createElement('div');
    card.className = 'questCard' + (done?' done':'');
    card.innerHTML = `<span class="questCheck">${claimed?'🎁':(done?'✅':'⬜')}</span><b>${q.name}</b><br>${q.desc}<br><span style="color:#9aa5ce;">${Math.min(cur,q.need)}/${q.need}</span>`;
    
    if(done && !claimed){
      const btn = document.createElement('button');
      btn.className='actBtn'; btn.style.marginTop='6px'; btn.style.fontSize='10px';
      btn.textContent = `領取 💰${q.reward}`;
      btn.onclick = ()=>{
        dailyProgress.claimed[q.id] = true;
        GameState.player.coins += q.reward;
        GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + q.reward;
        updateCoinsHud();
        toast(`領取每日任務獎勵:💰${q.reward}`);
        renderQuestScreen();
        SaveManager.save();
      };
      card.appendChild(btn);
    } else if(claimed){
      const tag = document.createElement('div');
      tag.style.cssText='font-size:10px;color:#9aa5ce;margin-top:4px;';
      tag.textContent='今天已領取過了';
      card.appendChild(tag);
    }
    list.appendChild(card);
  });
}
// ==========================================
// 🗺️ 渲染世界地圖介面
// ==========================================
function renderWorldMapScreen() {
    const gridEl = document.getElementById('worldMapGrid');
    const legendEl = document.getElementById('worldMapLegend');
    gridEl.innerHTML = '';
    legendEl.innerHTML = '';

    // 判斷傳送是否解鎖
    const ch9Done = typeof QUESTS !== 'undefined' && QUESTS.filter(q => q.chapter === 9).every(q => q.check());
    const tpTargets = ['map1', 'map5', 'map7', 'map12', 'map23'];

    // 依照你提供的圖片排列的 24 宮格 (4x6)
    const layout = [
        17, 18,  8, 10,
        19, 20,  7,  9,
         6,  5,  4, 11,
         1,  2,  3, 12,
        21, 23, 15, 13,
        22, 24, 16, 14
    ];

    // 數字與 mapId 對照表
    const numToMap = {
        1:'map1', 2:'map2', 3:'map3', 4:'map4', 5:'map5', 6:'map6_1',
        7:'map7', 8:'map8', 9:'map9', 10:'map10', 11:'map11', 12:'map12',
        13:'map13', 14:'map14', 15:'map15', 16:'map16', 17:'map17', 18:'map18',
        19:'map19', 20:'map20', 21:'map21', 22:'map22', 23:'map23', 24:'map24'
    };

    // 1. 繪製上方網格
    layout.forEach(num => {
        const mapId = numToMap[num];
        const isVisited = GameState.world.visitedMaps.has(mapId) || (mapId==='map6_1' && GameState.world.visitedMaps.has('map6_2'));
        const isTeleport = ch9Done && tpTargets.includes(mapId) && isVisited;
        const isCurrent = GameState.player.mapId === mapId || (mapId==='map6_1' && GameState.player.mapId==='map6_2');

        const cell = document.createElement('div');
        cell.className = 'mapGridCell' + (isVisited ? ' visited' : '') + (isTeleport ? ' teleport' : '') + (isCurrent ? ' current' : '');
        
        // 內容：有去過才顯示數字，沒去過顯示 ?
        if (isVisited) {
            const biome = (typeof getMapBiome === 'function') ? getMapBiome(mapId) : null;
            const biomeTag = biome ? `<div style="font-size:9px;opacity:.8;">${biome.icon}</div>` : '';
            if (isTeleport && !isCurrent) {
                cell.innerHTML = `<div>${num}</div>${biomeTag}<div style="font-size:10px; margin-top:2px;">✈️</div>`;
                cell.onclick = () => {
                    closeOverlays();
                    switchMap(mapId, 2, 2);
                };
            } else if (isCurrent) {
                cell.innerHTML = `<div>${num}</div>${biomeTag}<div style="font-size:9px; margin-top:2px; font-weight:normal;">(目前位置)</div>`;
            } else {
                cell.innerHTML = `<div>${num}</div>${biomeTag}`;
            }
        } else {
            cell.textContent = '?';
        }

        gridEl.appendChild(cell);
    });

    // 2. 繪製下方圖例對照表 (1 ~ 24)
    for (let i = 1; i <= 24; i++) {
        const mapId = numToMap[i];
        const isVisited = GameState.world.visitedMaps.has(mapId) || (mapId==='map6_1' && GameState.world.visitedMaps.has('map6_2'));
        
        // 抓取地圖名稱，若是 map6_1 特別處理一下名稱
        let mapName = '???';
        let biomeText = '';
        if (isVisited) {
            mapName = (mapId === 'map6_1') ? '雪山步道/北峰' : (WORLDS[mapId]?.name || '未知區域');
            const biome = (typeof getMapBiome === 'function') ? getMapBiome(mapId) : null;
            if (biome) biomeText = ` ${biome.icon}${biome.name}`;
        }

        const isCurrent = GameState.player.mapId === mapId || (mapId==='map6_1' && GameState.player.mapId==='map6_2');

        const legItem = document.createElement('div');
        legItem.textContent = `${i.toString().padStart(2, '0')}: ${mapName}${biomeText}`;
        
        // 目前位置標紅高亮
        if (isCurrent) {
            legItem.style.color = '#e94560';
            legItem.style.fontWeight = 'bold';
        }
        legendEl.appendChild(legItem);
    }
}
let currentShopTab = 'food'; // 目前的商店分頁:food/equip/tm/other

function buyItem(id, item){
  if(GameState.player.coins < item.price) return;
  GameState.player.coins -= item.price;
  GameState.inventory[id] = (GameState.inventory[id]||0) + 1;
  updateCoinsHud(); toast(`購買了 ${item.name}!`); renderShopScreen(); SaveManager.save();
}

function renderShopItemCard(id, item, list){
  if (item.unlockCondition && !item.unlockCondition()) return;
  const card = document.createElement('div');
  card.className='shopCard';
  const currentOwned = GameState.inventory[id] || 0;
  const isMaxed = item.maxBuy && currentOwned >= item.maxBuy;
  const lvText = item.maxBuy ? ` (Lv.${currentOwned}/${item.maxBuy})` : '';
  card.innerHTML = `<div><b>${item.name}</b><span style="color:var(--gold);">${lvText}</span><small>${item.desc}</small></div>`;
  const btn = document.createElement('button');
  btn.className='actBtn';
  btn.textContent = isMaxed ? '已達上限' : `💰${item.price} 購買`;
  btn.disabled = GameState.player.coins < item.price || isMaxed;
  btn.onclick = () => buyItem(id, item);
  card.appendChild(btn);
  list.appendChild(card);
}

function renderShopScreen(){
  document.getElementById('shopCoins').textContent = `目前金幣:💰 ${GameState.player.coins}`;
  const list = document.getElementById('shopList');
  list.innerHTML='';

  // 👇 前往幸運遊樂場的按鈕(第六章全部任務完成後解鎖)
  if(QUESTS.filter(q => q.chapter === 6).every(q => q.check())){
    const mgBtn = document.createElement('button');
    mgBtn.className = 'actBtn';
    mgBtn.style.cssText = 'width:100%; margin-bottom: 12px; border-color: var(--gold); color: var(--gold);';
    mgBtn.textContent = '🎰 前往幸運遊樂場';
    mgBtn.onclick = () => openMinigameScreen();
    list.appendChild(mgBtn);
  }

  // 👇 融合機入口(第四章全部任務完成後解鎖)
  if(QUESTS.filter(q => q.chapter === 4).every(q => q.check())){
    const fusionBtn = document.createElement('button');
    fusionBtn.className = 'actBtn';
    fusionBtn.style.cssText = 'width:100%; margin-bottom: 12px; border-color: #8e44ff; color: #c9a4ff;';
    fusionBtn.textContent = '🧬 前往融合機';
    fusionBtn.onclick = () => openFusionScreen();
    list.appendChild(fusionBtn);
  }

  // 🌟 分類分頁列
  const tabs = [
    { id:'food',  label:'🍎 食物' },
    { id:'equip', label:'🛡️ 裝備' },
    { id:'tm',    label:'📖 秘笈' },
    { id:'other', label:'📦 其他' },
  ];
  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex; gap:4px; margin-bottom:10px;';
  tabs.forEach(t=>{
    const tb = document.createElement('button');
    tb.className = 'actBtn';
    tb.style.cssText = 'flex:1; padding:6px 2px; font-size:12px;' + (currentShopTab===t.id ? 'border-color:var(--gold); color:var(--gold); font-weight:bold;' : '');
    tb.textContent = t.label;
    tb.onclick = () => { currentShopTab = t.id; renderShopScreen(); };
    tabRow.appendChild(tb);
  });
  list.appendChild(tabRow);

  const FOOD_KEYS = Object.keys(FOOD_FAVORITES);

  if(currentShopTab === 'food'){
    Object.entries(ITEMS).filter(([id]) => FOOD_KEYS.includes(id)).forEach(([id,item]) => renderShopItemCard(id, item, list));

  } else if(currentShopTab === 'equip'){
    Object.entries(HELD_ITEMS).forEach(([id,item]) => renderShopItemCard(id, item, list));

  } else if(currentShopTab === 'tm'){
    const tip = document.createElement('p');
    tip.style.cssText='font-size:11px;color:#9aa5ce;margin-bottom:6px;';
    tip.textContent = '買回去要到隊伍狀態畫面教學';
    list.appendChild(tip);
    Object.entries(ITEMS).filter(([id]) => id.startsWith('tm_')).forEach(([id,item]) => renderShopItemCard(id, item, list));

  } else if(currentShopTab === 'other'){
    const otherEntries = Object.entries(ITEMS).filter(([id, item]) => !id.startsWith('tm_') && !item.keyItem && !FOOD_KEYS.includes(id));
    const isNonConsumable = (item) => !!item.noTarget || !!item.maxBuy || /被動/.test(item.desc);
    const consumables = otherEntries.filter(([,item]) => !isNonConsumable(item));
    const nonConsumables = otherEntries.filter(([,item]) => isNonConsumable(item));

    const cols = document.createElement('div');
    cols.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:start;';

    const colA = document.createElement('div');
    const colAHeader = document.createElement('div');
    colAHeader.style.cssText='font-size:11px;color:#9aa5ce;margin-bottom:4px;';
    colAHeader.textContent = '── 消耗品 ──';
    colA.appendChild(colAHeader);
    consumables.forEach(([id,item]) => renderShopItemCard(id, item, colA));

    const colB = document.createElement('div');
    const colBHeader = document.createElement('div');
    colBHeader.style.cssText='font-size:11px;color:#9aa5ce;margin-bottom:4px;';
    colBHeader.textContent = '── 非消耗品 ──';
    colB.appendChild(colBHeader);
    nonConsumables.forEach(([id,item]) => renderShopItemCard(id, item, colB));

    cols.appendChild(colA); cols.appendChild(colB);
    list.appendChild(cols);
  }
}
// ==========================================
// 🎰 幸運遊樂場 (Minigame System)
// ==========================================
function openMinigameScreen() {
  if (!QUESTS.filter(q => q.chapter === 6).every(q => q.check())) {
    toast('🔒 幸運遊樂場需要完成第六章全部任務才能開放！');
    return;
  }
  closeOverlays();
  overlayOpen = 'minigame';
  ensureDailyFresh();
  renderMinigameScreen();
  document.getElementById('minigameOverlay').style.display = 'flex';
}

function renderMinigameScreen() {
  const content = document.getElementById('minigameContent');
  content.innerHTML = '';
  
  const isPremium = (GameState.inventory.premiumPass || 0) > 0;
  const firstTime = !dailyProgress.minigamePlayed;
  
  content.innerHTML += `<div style="text-align:center; color:var(--gold); margin-bottom:10px;">💰 目前金幣: ${GameState.player.coins}</div>`;
  if (isPremium) {
      content.innerHTML += `<div style="text-align:center; font-size:11px; color:#e94560; margin-bottom:10px;">👑 Premium 特權生效中：底薪 +1 點 / 正收益 1.5 倍 / 20% 爆擊翻倍<br>${firstTime ? '🎁 今日首場入場費半價！' : ''}</div>`;
  }

  // 入場費輸入區
  const feeContainer = document.createElement('div');
  feeContainer.style.textAlign = 'center';
  feeContainer.innerHTML = `入場費: <input type="number" id="mgEntryFee" value="100" min="10" max="10000" style="width:70px; background:#111; color:#fff; border:1px solid #444; padding:4px; text-align:center; border-radius:4px;"> 金幣`;
  content.appendChild(feeContainer);

  const logArea = document.createElement('div');
  logArea.id = 'mgLog';
  logArea.style.cssText = 'background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; min-height:80px; margin:12px 0; font-size:11px; line-height:1.6; text-align:center; color:#9aa5ce;';
  logArea.innerHTML = '請選擇遊戲模式並投入金幣。<br>獲得金幣 = 結算點數 × 入場費。';
  content.appendChild(logArea);

  // 模式按鈕
  const btnG1 = document.createElement('button');
  btnG1.className = 'actBtn'; btnG1.style.width = '100%'; btnG1.style.marginBottom = '6px';
  btnG1.textContent = '🎲 遊戲 1：單局模式 (平穩，0~2點)';
  btnG1.onclick = () => playMinigame(1);
  
  const btnG2 = document.createElement('button');
  btnG2.className = 'actBtn'; btnG2.style.width = '100%'; btnG2.style.marginBottom = '6px';
  btnG2.textContent = '🎢 遊戲 2：三局累加模式 (高波動，-2~4點)';
  btnG2.onclick = () => playMinigame(2);
  
// ... 前面保留 btnG1 和 btnG2 的程式碼 ...
  content.appendChild(btnG1);
  content.appendChild(btnG2);

  // 👇 新增：珍稀星辰轉盤 UI
  const divider = document.createElement('div');
  divider.style.cssText = 'border-top: 1px dashed #444; margin: 16px 0 10px 0;';
  content.appendChild(divider);

  const gemInfo = document.createElement('div');
  gemInfo.style.cssText = 'text-align:center; font-size:11px; color:var(--accent2); margin-bottom:8px;';
  gemInfo.innerHTML = `💎 寶物轉盤 💎<br>機率一覽0.3 : 1500金幣,0.25 : 道具,0.2 : 大補包,0.15 : 高級裝備,0.08 : 招式秘笈,0.02 : 神獸！`;
  content.appendChild(gemInfo);

  const btnRoulette = document.createElement('button');
  btnRoulette.className = 'actBtn'; 
  btnRoulette.style.width = '100%'; 
  btnRoulette.style.border = '2px solid #8a5cff';
  btnRoulette.innerHTML = '✨ 啟動寶物轉盤 (消耗 1 顆 石頭💎)';
  btnRoulette.onclick = () => playPremiumRoulette();
  content.appendChild(btnRoulette);

  const btnBuyGem = document.createElement('button');
  btnBuyGem.className = 'actBtn'; 
  btnBuyGem.style.width = '100%'; 
  btnBuyGem.style.marginTop = '6px';
  btnBuyGem.style.background = '#1a1a2e';
  btnBuyGem.innerHTML = '🛒 購買石頭抽獎券 (💰 1000 金幣 / 顆)';
  btnBuyGem.onclick = () => {
      if(GameState.player.coins < 1000) return toast('金幣不足！需要 1000 金幣。');
      GameState.player.coins -= 1000;
      GameState.player.gems = (GameState.player.gems || 0) + 1;
      updateCoinsHud();
      toast('獲得了 1 顆 💎 石頭抽獎券！');
      renderMinigameScreen();
      SaveManager.save();
  };
  content.appendChild(btnBuyGem);

  // ... 底下保留原本的 back 按鈕 ...
  const back = document.createElement('button');
  back.className = 'actBtn backBtn'; back.style.width = '100%'; back.style.marginTop = '8px';
  back.textContent = '← 返回商店';
  back.onclick = () => { closeOverlays(); openShop(); };
  content.appendChild(back);
}

function playMinigame(mode) {
  const feeInput = document.getElementById('mgEntryFee');
  let fee = parseInt(feeInput.value) || 0;
  if (fee <= 0) return toast('請輸入有效的入場費！');
  
  const isPremium = (GameState.inventory.premiumPass || 0) > 0;
  const isFirstTime = !dailyProgress.minigamePlayed;
  let actualFee = fee;

  // C. Premium 每日首抽半價特權
  if (isPremium && isFirstTime) {
      actualFee = Math.floor(fee * 0.5);
  }

  if (GameState.player.coins < actualFee) {
      return toast('金幣不足以支付入場費！');
  }

  GameState.player.coins -= actualFee;
  dailyProgress.minigamePlayed = true;
  updateCoinsHud();

  // 機率滾動引擎
  const rollGame1 = () => {
      const r = Math.random();
      return r < 0.25 ? 0 : (r < 0.75 ? 1 : 2);
  };
  const rollGame2Sub = () => {
      const r = Math.random();
      return r < 0.25 ? -1 : (r < 0.75 ? 0 : 1);
  };

  let basePoints = 0;
  let breakdown = '';
  if (mode === 1) {
      basePoints = rollGame1();
      breakdown = `單局擲出: <b>${basePoints}</b> 點`;
  } else {
      const p1 = rollGame1(), p2 = rollGame2Sub(), p3 = rollGame2Sub();
      basePoints = p1 + p2 + p3;
      breakdown = `三局累積擲出: ${p1} + ${p2} + ${p3} = <b>${basePoints}</b> 點`;
  }

  let finalPoints = basePoints;
  let logHtml = `投入 ${fee} 金幣 (實扣 ${actualFee})<br>${breakdown}<br>`;

  // A & B: Premium 進階加成與爆擊
  if (isPremium) {
      const baseSalary = 1;
      finalPoints += baseSalary;
      logHtml += `👑 Premium 底薪加成: +${baseSalary} 點 (目前 ${finalPoints} 點)<br>`;
      
      // 僅對正點數放大
      if (finalPoints > 0) {
          let mult = 1.5;
          let isCrit = false;
          if (Math.random() < 0.20) {
              mult = 2.0;
              isCrit = true;
          }
          finalPoints = finalPoints * mult;
          logHtml += isCrit ? `<span style="color:var(--accent);">✨ 幸運爆擊觸發！點數放大 ${mult} 倍！</span><br>` : `💎 Premium 點數放大 ${mult} 倍！<br>`;
      }
  }

  // 結算獲得金幣
  let finalCoins = Math.max(0, Math.floor(finalPoints * fee));
  GameState.player.coins += finalCoins;
  GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + finalCoins;
  SaveManager.save();

  logHtml += `<br><strong style="color:var(--gold); font-size:14px;">最終結算點數: ${finalPoints} 點 ➜ 獲得 ${finalCoins} 金幣！</strong>`;
  
  renderMinigameScreen(); // 重新渲染刷新 UI 狀態 (首場半價提示等)
  document.getElementById('mgLog').innerHTML = logHtml; // 覆寫 log 區塊
}
function renderBagScreen(){
  const list = document.getElementById('bagList');
  const targetList = document.getElementById('bagTargetList');
  targetList.style.display='none';
  list.style.display='block';
  list.innerHTML='';
  const owned = Object.entries(GameState.inventory).filter(([id,n])=> n>0);
  if(owned.length===0){ list.innerHTML='<div style="text-align:center;color:#666;">背包是空的,可以去商店買點東西</div>'; return; }

  const cols = document.createElement('div');
  cols.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:start;';
  const colConsume = document.createElement('div');
  const colConsumeHeader = document.createElement('div');
  colConsumeHeader.style.cssText='font-size:11px;color:#9aa5ce;margin-bottom:4px;';
  colConsumeHeader.textContent = '── 消耗品 ──';
  colConsume.appendChild(colConsumeHeader);
  const colOther = document.createElement('div');
  const colOtherHeader = document.createElement('div');
  colOtherHeader.style.cssText='font-size:11px;color:#9aa5ce;margin-bottom:4px;';
  colOtherHeader.textContent = '── 非消耗品/裝備 ──';
  colOther.appendChild(colOtherHeader);

  owned.forEach(([id,n])=>{
    // 🌟 修正:抽獎轉盤抽到的裝備(HELD_ITEMS)不在ITEMS裡,原本會導致item是undefined而直接崩潰
    const item = ITEMS[id] || HELD_ITEMS[id];
    if(!item) return; // 防呆:萬一真的找不到定義,就跳過這筆,不要讓整個背包畫面壞掉
    const isHeldItem = !ITEMS[id] && !!HELD_ITEMS[id];

    const card = document.createElement('div');
    card.className='bagCard';
    card.innerHTML = `<div><b>${item.name}</b> x${n}<small>${item.desc}</small></div>`;
    const btn = document.createElement('button');
    btn.className='actBtn';

    if (isHeldItem) {
      // 裝備類道具不能直接「使用」,要去隊伍狀態畫面裝備
      btn.textContent = '前往裝備';
      btn.onclick = () => {
        closeOverlays();
        overlayOpen = 'status';
        renderStatusScreen();
        document.getElementById('statusOverlay').style.display = 'flex';
      };
    } else {
      btn.textContent = '使用';
      btn.onclick = () => {
        if (item.noTarget) {
            item.use();
        } else {
            openBagTargetPicker(id);
        }
      };
    }
    card.appendChild(btn);

    const isNonConsumable = isHeldItem || !!item.noTarget || !!item.maxBuy || /被動/.test(item.desc||'');
    (isNonConsumable ? colOther : colConsume).appendChild(card);
  });

  cols.appendChild(colConsume);
  cols.appendChild(colOther);
  list.appendChild(cols);
}
function playPremiumRoulette() {
    GameState.player.gems = GameState.player.gems || 0;
    
    // 檢查寶石是否足夠
    if (GameState.player.gems < 1) {
        toast('💎 抽獎券不足！請先攜帶金幣前往購買。');
        return;
    }

    // 扣除寶石
    GameState.player.gems -= 1;
    updateCoinsHud();

    const r = Math.random();
    let msg = '';
    
    // 🎁 獎池機率分佈
    if (r < 0.30) {
        // 30% 機率：大獎金幣回本 (賺 500)
        GameState.player.coins += 1500;
        GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + 1500;
        msg = '🎰 叮叮叮！大回饋！獲得 💰1500 金幣！';
        updateCoinsHud();
        
    } else if (r < 0.55) {
        // 25% 機率：實用道具包
        GameState.inventory.candy = (GameState.inventory.candy || 0) + 5;
        msg = '🍬 獲得 經驗糖果 x5！';
        
    } else if (r < 0.75) {
        // 20% 機率：高級恢復包
        GameState.inventory.fullRestore = (GameState.inventory.fullRestore || 0) + 3;
        msg = '🧪 獲得 全滿藥 x3！';
        
    } else if (r < 0.90) {
        // 15% 機率：高級裝備
        const equips = ['expCharm', 'scopeLens', 'leftovers', 'focusLens', 'masterCharm'];
        const eq = equips[Math.floor(Math.random() * equips.length)];
        GameState.inventory[eq] = (GameState.inventory[eq] || 0) + 1;
        msg = `🛡️ 裝備出爐！獲得高級裝備：${HELD_ITEMS[eq].name}！`;
        
    } else if (r < 0.98) {
        // 8% 機率：隨機技能秘笈
        const tms = Object.keys(ITEMS).filter(k => k.startsWith('tm_'));
        const tm = tms[Math.floor(Math.random() * tms.length)];
        GameState.inventory[tm] = (GameState.inventory[tm] || 0) + 1;
        msg = `📜 秘寶現世！獲得稀有秘笈：${ITEMS[tm].name}！`;
        
    } else {
// 🌟 2% 機率：終極大獎 - 異色神獸！(加入唯一限制)
        const rareMons = ['90', '91', '92', '93', '96']; 
        // 篩選出玩家「還沒有」的神獸
        const availableMons = rareMons.filter(id => !hasMonster(id)); 
        
        if (availableMons.length > 0) {
            const monId = availableMons[Math.floor(Math.random() * availableMons.length)];
            const newMon = makeMonster(monId, 35); 
            newMon.altColor = '#ffea00'; 
            
            const dest = addToPartyOrStorage(newMon);
            dex.add(monId); 
            seenDex.add(monId);
            msg = `✨ 奇蹟發生！！異色 ${MonsterUtil.species(newMon).name} 降臨了！(${dest==='party'?'加入隊伍':'送至倉庫'})`;
       } else {
            // 👇 🌟 如果神獸全滿了，改發「異色幻彩藥水」
            GameState.inventory.paintPotion = (GameState.inventory.paintPotion || 0) + 1;
            msg = `✨ 奇蹟發生！！由於你已集齊所有轉盤神獸，轉盤湧出了超級大獎：🧪 ✨異色幻彩藥水！`;
        }
    }

    SaveManager.save();
    
    // 將結果顯示在遊樂場的對話框中
    const logHtml = `投入 1 顆 💎 石頭... 轉盤旋轉中...<br><br><strong style="color:var(--accent2); font-size:14px;">${msg}</strong>`;
    document.getElementById('mgLog').innerHTML = logHtml;
    
    renderMinigameScreen(); // 刷新 UI 上的寶石數量
}
function openBagTargetPicker(itemId){
  const list = document.getElementById('bagList');
  const targetList = document.getElementById('bagTargetList');
  list.style.display='none';
  targetList.style.display='block';
  targetList.innerHTML='';
  const item = ITEMS[itemId];
  party.forEach(m=>{
    const sp = MonsterUtil.species(m);
    const btn = document.createElement('button');
    btn.className='actBtn';
    btn.style.width='100%'; btn.style.textAlign='left'; btn.style.marginBottom='6px';
    btn.textContent = `${sp.name} Lv.${m.level} HP:${m.hp}/${m.maxHp}`;
    btn.onclick = ()=>{
      const success = item.use(m);
      if(success){
        GameState.inventory[itemId]--;
        toast(`對 ${sp.name} 使用了 ${item.name}!`);
        updateHud();
      } else {
        toast('現在對這隻怪物沒有效果');
      }
      renderBagScreen();
    };
    targetList.appendChild(btn);
  });
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%';
  back.textContent='← 返回';
  back.onclick = renderBagScreen;
  targetList.appendChild(back);
}

// ---------- 怪物商人(森林裡的NPC):A.怪物換獎勵 / B.怪物換怪物 ----------
function openTradeMonsterScreen(npc){
  closeOverlays();
  overlayOpen='trade';
  document.getElementById('tradeTitle').textContent = `▌ ${npc.name} ▌`;
  renderTradeMonsterHome(npc);
  document.getElementById('tradeOverlay').style.display='flex';
}
function renderTradeMonsterHome(npc){
  const content = document.getElementById('tradeContent');
  content.innerHTML='';
  const intro = document.createElement('p');
  intro.style.cssText='font-size:12px;color:#9aa5ce;';
  intro.textContent = '「想清清隊伍還是換點特別的貨色?我兩種生意都做。」';
  content.appendChild(intro);

  const btnA = document.createElement('button');
  btnA.className='actBtn'; btnA.style.cssText='width:100%;margin-bottom:8px;';
  btnA.textContent = 'A. 怪物換獎勵(交出怪物換金幣或經驗糖果)';
  btnA.onclick = ()=> renderTradeReward(npc);
  content.appendChild(btnA);

  const btnB = document.createElement('button');
  btnB.className='actBtn'; btnB.style.cssText='width:100%;margin-bottom:8px;'; // 加了底部間距
  const offerSp = SPECIES.find(s=>s.id===npc.offerSpecies);
  btnB.textContent = `B. 怪物換怪物(用一隻怪物換 ✨異色 ${offerSp.name} Lv.${npc.offerLevel})`;
  btnB.onclick = ()=> renderTradeSwap(npc);
  content.appendChild(btnB);

  // 🌟 新增：離開按鈕
  const backBtn = document.createElement('button');
  backBtn.className = 'actBtn backBtn'; 
  backBtn.style.width = '100%';
  backBtn.textContent = '← 離開';
  backBtn.onclick = () => closeOverlays();
  content.appendChild(backBtn);
}
function renderTradeReward(npc){
  const content = document.getElementById('tradeContent');
  content.innerHTML='';
  if(party.length<=1){
    content.innerHTML = '<p style="font-size:12px;color:#e94560;">隊伍裡至少要留一隻怪物,沒有多的可以交出去。</p>';
  } else {
    party.forEach((m,i)=>{
      const sp = MonsterUtil.species(m);
      const row = document.createElement('div');
      row.className='bagCard';
      row.innerHTML = `<div><b>${sp.name}</b> Lv.${m.level}</div>`;
      const btnCoin = document.createElement('button');
      btnCoin.className='actBtn'; btnCoin.style.fontSize='10px';
      btnCoin.textContent = `💰${m.level*8}`;
      btnCoin.onclick = ()=>{
        if(!confirm(`確定要用 ${sp.name} 交換 ${m.level*8} 金幣嗎?這無法復原。`)) return;
        GameState.player.hasTraded = true; // 🌟 記錄已交易
        GameState.player.coins += m.level*8;
        GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + m.level*8;
        party.splice(i,1);
        updateHud(); updateCoinsHud();
        toast(`交出了 ${sp.name},獲得 💰${m.level*8}!`);
        SaveManager.save();
        renderTradeMonsterHome(npc);
      };
      const candyCount = Math.max(1, Math.floor(m.level/5));
      const btnCandy = document.createElement('button');
      btnCandy.className='actBtn'; btnCandy.style.fontSize='10px';
      btnCandy.textContent = `🍬經驗糖果x${candyCount}`;
      btnCandy.onclick = ()=>{
        if(!confirm(`確定要用 ${sp.name} 交換 ${candyCount} 個經驗糖果嗎?這無法復原。`)) return;
        GameState.player.hasTraded = true; // 🌟 記錄已交易
        GameState.inventory.candy = (GameState.inventory.candy||0)+candyCount;
        party.splice(i,1);
        updateHud();
        toast(`交出了 ${sp.name},獲得 經驗糖果x${candyCount}!`);
        SaveManager.save();
        renderTradeMonsterHome(npc);
      };
      row.appendChild(btnCoin); row.appendChild(btnCandy);
      content.appendChild(row);
    });
  }
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = ()=> renderTradeMonsterHome(npc);
  content.appendChild(back);
}
function renderTradeSwap(npc){
  const content = document.getElementById('tradeContent');
  content.innerHTML='';
  const offerSp = SPECIES.find(s=>s.id===npc.offerSpecies);
  const info = document.createElement('p');
  info.style.cssText='font-size:12px;color:#9aa5ce;';
  info.textContent = `選一隻你的怪物,交換 ${offerSp.name} Lv.${npc.offerLevel}:`;
  content.appendChild(info);
  if(party.length<=1){
    content.innerHTML += '<p style="font-size:12px;color:#e94560;">隊伍裡至少要留一隻怪物,沒有多的可以交換。</p>';
  } else {
    party.forEach((m,i)=>{
      const sp = MonsterUtil.species(m);
      const btn = document.createElement('button');
      btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;margin-bottom:6px;';
      btn.textContent = `${sp.name} Lv.${m.level}`;
btn.onclick = ()=>{
      if (sp.legendary) { toast('無法交出神獸進行交換！'); return; }

      if(!confirm(`確定要提交 ${sp.name} 來交換 ${offerSp.name} 嗎?這無法復原。`)) return;

      const newMon = makeMonster(npc.offerSpecies, npc.offerLevel, generateIV());
      if(npc.offerColor) newMon.altColor = npc.offerColor;

      party.splice(i,1,newMon);
      dex.add(npc.offerSpecies);
      seenDex.add(npc.offerSpecies);
      updateHud();

      toast(`✅ ${npc.offerColor?'✨異色 ':''}${offerSp.name} 加入了隊伍!(技能已重置為初始技能)`);

      SaveManager.save();
      closeOverlays();
        };
          content.appendChild(btn);
    });
  }
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = ()=> renderTradeMonsterHome(npc);
  content.appendChild(back);
}

// ---------- 跨存檔密碼交換站:用一段文字代碼把單一怪物帶到別的存檔 ----------
// 代碼包含「種類+等級+個體值+異色」,技能一律重置為初始技能,但個體值/異色會保留。
function encodeTradeCode(mon){
  const iv = (mon.iv!=null) ? mon.iv : generateIV(); // 交換當下如果還沒有個體值,現在產生並記錄
  const payload = JSON.stringify({ s:mon.speciesId, l:mon.level, iv:Math.round(iv*1000)/1000, c:mon.altColor||null });
  return 'MQT-' + btoa(payload).replace(/=+$/,'');
}
function decodeTradeCode(code){
  const b64 = code.trim().replace(/^MQT-/,'');
  const obj = JSON.parse(atob(b64));
  if(!obj || !obj.s || !SPECIES.some(s=>s.id===obj.s) || !obj.l) throw new Error('無效代碼');
  return obj;
}
// 🌟 動態設定神秘旅人的標題
function openTradeCodeScreen(npc){
  closeOverlays();
  overlayOpen='code';
  const titleEl = document.querySelector('#codeOverlay .panelTitle');
  if(titleEl && npc) titleEl.textContent = `▌ ${npc.name} ▌`;
  
  renderTradeCodeHome();
  document.getElementById('codeOverlay').style.display='flex';
}

function renderTradeCodeHome(){
  const content = document.getElementById('codeContent');
  content.innerHTML='';
  const intro = document.createElement('p');
  intro.style.cssText='font-size:12px;color:#9aa5ce;';
  intro.textContent = '「把怪物換成代碼帶去別的存檔,或是把代碼換回怪物。」';
  content.appendChild(intro);

  const btnOut = document.createElement('button');
  btnOut.className='actBtn'; btnOut.style.cssText='width:100%;margin-bottom:8px;';
  btnOut.textContent = '取出怪物(產生代碼)';
  btnOut.onclick = renderTradeCodeExport;
  content.appendChild(btnOut);

  const btnIn = document.createElement('button');
  btnIn.className='actBtn'; btnIn.style.cssText='width:100%;margin-bottom:8px;'; // 加了底部間距
  btnIn.textContent = '帶入怪物(輸入代碼)';
  btnIn.onclick = renderTradeCodeImport;
  content.appendChild(btnIn);

  // 🌟 新增：離開按鈕
  const backBtn = document.createElement('button');
  backBtn.className = 'actBtn backBtn'; 
  backBtn.style.width = '100%';
  backBtn.textContent = '← 離開';
  backBtn.onclick = () => closeOverlays();
  content.appendChild(backBtn);
}
function renderTradeCodeExport(){
  const content = document.getElementById('codeContent');
  content.innerHTML='';
  if(party.length<=1){
    content.innerHTML = '<p style="font-size:12px;color:#e94560;">隊伍裡至少要留一隻怪物,沒有多的可以取出。</p>';
  } else {
    party.forEach((m,i)=>{
      const sp = MonsterUtil.species(m);
      const btn = document.createElement('button');
      btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;margin-bottom:6px;';
      btn.textContent = `${sp.name} Lv.${m.level}`;
      btn.onclick = ()=>{
        // 👇 新增這行：攔截神獸！
        if (sp.legendary) { toast('神獸擁有強大的力量，無法化為代碼跨時空傳送！'); return; }
        
        if(!confirm(`確定要取出 ${sp.name} 嗎?牠會離開這個存檔的隊伍,變成一段代碼。`)) return;
        // ... (底下保留原本產生代碼的邏輯) ...        if(!confirm(`確定要取出 ${sp.name} 嗎?牠會離開這個存檔的隊伍,變成一段代碼。`)) return;
        const code = encodeTradeCode(m);
        party.splice(i,1);
        updateHud();
        SaveManager.save();
        content.innerHTML = `<p style="font-size:12px;color:var(--gold);">把下面這段代碼給另一個存檔使用:</p>`;
        const ta = document.createElement('textarea');
        ta.className='codeTextarea'; ta.readOnly=true; ta.value=code;
        content.appendChild(ta);
        const copyBtn = document.createElement('button');
        copyBtn.className='actBtn'; copyBtn.textContent='複製代碼';
        copyBtn.onclick = async ()=>{
          ta.select();
          try{ await navigator.clipboard.writeText(code); toast('✅ 已複製到剪貼簿!'); }
          catch(e){ toast('複製失敗,請手動全選複製'); }
        };
        content.appendChild(copyBtn);
        const back = document.createElement('button');
        back.className='actBtn backBtn'; back.style.marginLeft='6px';
        back.textContent='完成';
        back.onclick = renderTradeCodeHome;
        content.appendChild(back);
      };
      content.appendChild(btn);
    });
  }
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = renderTradeCodeHome;
  content.appendChild(back);
}
function renderTradeCodeImport(){
  const content = document.getElementById('codeContent');
  content.innerHTML='';
  const label = document.createElement('p');
  label.style.cssText='font-size:12px;color:#9aa5ce;';
  label.textContent = '把從別的存檔取出的代碼貼在這裡:';
  content.appendChild(label);
  const ta = document.createElement('textarea');
  ta.className='codeTextarea'; ta.placeholder='MQT-......';
  content.appendChild(ta);
  const confirmBtn = document.createElement('button');
  confirmBtn.className='actBtn'; confirmBtn.textContent='下一步:選擇要提交的怪物';
  confirmBtn.onclick = ()=>{
    let obj;
    try{ obj = decodeTradeCode(ta.value); }
    catch(e){ toast('❌ 代碼格式不正確'); return; }
    renderTradeCodeSubmit(obj);
  };
  content.appendChild(confirmBtn);
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.marginLeft='6px';
  back.textContent='← 返回';
  back.onclick = renderTradeCodeHome;
  content.appendChild(back);
}
function renderTradeCodeSubmit(obj){
  const content = document.getElementById('codeContent');
  content.innerHTML='';
  const incomingSp = SPECIES.find(s=>s.id===obj.s);
  
  // 👇 1. 攔截惡意代碼：如果別人給的代碼裡藏著神獸，直接拒絕！
  if (incomingSp && incomingSp.legendary) {
      content.innerHTML = '<p style="font-size:12px;color:#e94560;">錯誤：代碼中包含無法跨時空傳送的神獸資料！</p>';
      const back = document.createElement('button');
      back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
      back.textContent='← 返回';
      back.onclick = renderTradeCodeHome;
      content.appendChild(back);
      return;
  }

  const label = document.createElement('p');
  label.style.cssText='font-size:12px;color:#9aa5ce;';
  label.textContent = `帶入 ${obj.c?'✨異色 ':''}${incomingSp.name} Lv.${obj.l} 之前,要先提交一隻你的怪物來交換:`;
  content.appendChild(label);
  
  party.forEach((m,i)=>{
    const sp = MonsterUtil.species(m);
    const btn = document.createElement('button');
    btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;margin-bottom:6px;';
    btn.textContent = `${sp.name} Lv.${m.level}`;
    btn.onclick = ()=>{
      // 👇 2. 攔截玩家：不准拿神獸去換代碼！
      if (sp.legendary) { toast('無法交出神獸進行交換！'); return; }
        
      if(!confirm(`確定要提交 ${sp.name} 來交換 ${incomingSp.name} 嗎?這無法復原。`)) return;

      // 👇 🌟 數位異變判定核心 (跨存檔傳送資料時,特定種族有機會發生基因突變)
      let finalSpeciesId = obj.s;
      let isMutated = false;

      // 突變字典 (原本ID -> 突變後ID)
      const mutations = {
          '71': '107', // 蛛靈 -> 網域魔蛛
          '36': '112', // Zapbit -> 電馭駭兔
          '55': '113'  // 沉思椅 -> 全知網椅
      };

      if (mutations[finalSpeciesId]) {
          finalSpeciesId = mutations[finalSpeciesId];
          isMutated = true;
      }

      // 用最終判定好的 ID 來生成怪獸
      const newMon = makeMonster(finalSpeciesId, obj.l, obj.iv);
      if(obj.c) newMon.altColor = obj.c;
      party.splice(i,1,newMon);
      dex.add(finalSpeciesId); seenDex.add(finalSpeciesId);
      updateHud();

      // 👇 根據是否發生變異，跳出不同的驚喜提示
      if (isMutated) {
          alert(`⚠️ 警告：資料傳輸過程中發生異常！\n\n${incomingSp.name} 的基因序列被數位亂碼覆寫...\n✨ 發生了數位異變！進化成了 ${MonsterUtil.species(newMon).name}！`);
      } else {
          toast(`✅ ${obj.c?'✨異色 ':''}${MonsterUtil.species(newMon).name} 加入了隊伍!(技能已重置為初始技能)`);
      }

      SaveManager.save();
      closeOverlays();
    };
    content.appendChild(btn);
  });
  
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = renderTradeCodeHome;
  content.appendChild(back);
}
// ---------- 技能回憶師:把忘記的招式重新學回來 ----------
function openMoveRecallScreen(npc){
  closeOverlays();
  overlayOpen='recall';
  // 🌟 動態更新介面標題為 NPC 名字
  const titleEl = document.querySelector('#recallOverlay .panelTitle');
  if(titleEl && npc) titleEl.textContent = `▌ ${npc.name} ▌`;
  
  renderMoveRecallHome();
  document.getElementById('recallOverlay').style.display='flex';
}
function renderMoveRecallHome(){
  const content = document.getElementById('recallContent');
  content.innerHTML='';
  const intro = document.createElement('p');
  intro.style.cssText='font-size:12px;color:#9aa5ce;';
  intro.textContent = '「想不起以前學過的招式了嗎?選一隻怪物,我幫牠想起來。」';
  content.appendChild(intro);
  if(party.length===0){
    content.innerHTML += '<p style="font-size:12px;color:#e94560;">隊伍是空的。</p>';
  }
  const grid = document.createElement('div');
  grid.style.cssText='display:grid; grid-template-columns:1fr 1fr; gap:6px;';
  party.forEach((m)=>{
    const sp = MonsterUtil.species(m);
    const forgotten = (m.moveHistory||[]).filter(id=> !m.moves.includes(id));
    const btn = document.createElement('button');
    btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;';
    btn.textContent = `${sp.name} Lv.${m.level}(可回憶 ${forgotten.length} 招)`;
    btn.disabled = forgotten.length===0;
    btn.onclick = ()=> renderMoveRecallPicker(m);
    grid.appendChild(btn);
  });
  content.appendChild(grid);
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 離開';
  back.onclick = closeOverlays;
  content.appendChild(back);
}
function renderMoveRecallPicker(m){
  const content = document.getElementById('recallContent');
  content.innerHTML='';
  const sp = MonsterUtil.species(m);
  const info = document.createElement('p');
  info.style.cssText='font-size:12px;color:#9aa5ce;';
  info.textContent = `${sp.name} 目前技能:${m.moves.map(id=>moveDisplayName(id,m)).join('、')}`;
  content.appendChild(info);
  const forgotten = (m.moveHistory||[]).filter(id=> !m.moves.includes(id));
  forgotten.forEach(id=>{
    const btn = document.createElement('button');
    btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;margin-bottom:6px;';
    btn.textContent = `回憶:${moveDisplayName(id,m)}`;
    btn.onclick = ()=> renderMoveRecallSlotPicker(m, id);
    content.appendChild(btn);
  });
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = renderMoveRecallHome;
  content.appendChild(back);
}
// 🌟 選好要回憶的招式之後,讓玩家自己選要取代目前的哪一招(而不是自動取代最後一格)
function renderMoveRecallSlotPicker(m, newMoveId){
  const content = document.getElementById('recallContent');
  content.innerHTML='';
  const sp = MonsterUtil.species(m);
  const info = document.createElement('p');
  info.style.cssText='font-size:12px;color:#9aa5ce;';
  info.textContent = `要用「${moveDisplayName(newMoveId,m)}」取代 ${sp.name} 目前的哪一招呢?`;
  content.appendChild(info);
  m.moves.forEach((oldId, i)=>{
    const btn = document.createElement('button');
    btn.className='actBtn'; btn.style.cssText='width:100%;text-align:left;margin-bottom:6px;';
    btn.textContent = `取代:${moveDisplayName(oldId,m)}`;
    btn.onclick = ()=>{
      if(!confirm(`確定要讓 ${sp.name} 忘記 ${moveDisplayName(oldId,m)},改回憶起 ${moveDisplayName(newMoveId,m)} 嗎?`)) return;
      m.moves[i] = newMoveId;
      toast(`${sp.name} 想起了 ${moveDisplayName(newMoveId,m)}!`);
      SaveManager.save();
      renderMoveRecallHome();
    };
    content.appendChild(btn);
  });
  const back = document.createElement('button');
  back.className='actBtn backBtn'; back.style.width='100%'; back.style.marginTop='8px';
  back.textContent='← 返回';
  back.onclick = ()=> renderMoveRecallPicker(m);
  content.appendChild(back);
}

// ---------- 倉庫管理員:取出寄放在倉庫的怪物(存入在隊伍狀態畫面隨時可做)----------
function openStorageScreen(npc){
  closeOverlays();
  overlayOpen='storage';
  // 🌟 動態更新介面標題為 NPC 名字
  const titleEl = document.querySelector('#storageOverlay .panelTitle');
  if(titleEl && npc) titleEl.textContent = `▌ ${npc.name} ▌`;
  
  renderStorageScreen();
  document.getElementById('storageOverlay').style.display='flex';
}
function renderStorageScreen(){
  const content = document.getElementById('storageContent');
  content.innerHTML='';
  const info = document.createElement('p');
  info.style.cssText='font-size:12px;color:#9aa5ce;';
  info.textContent = `「歡迎回來!目前隊伍 ${party.length}/${PARTY_LIMIT} 隻,倉庫裡有 ${storageBox.length} 隻。」`;
  content.appendChild(info);
  if(storageBox.length===0){
    const none = document.createElement('p');
    none.style.cssText='font-size:12px;color:#666;text-align:center;';
    none.textContent = '倉庫是空的。';
    content.appendChild(none);
  }
  storageBox.forEach((m,i)=>{
    const sp = MonsterUtil.species(m);
    const card = document.createElement('div');
    card.className='bagCard';
    card.innerHTML = `<div><b>${sp.name}${m.altColor?' ✨':''}</b> Lv.${m.level}<small>HP ${m.hp}/${m.maxHp}</small></div>`;
    const btn = document.createElement('button');
    btn.className='actBtn';
    const full = party.length>=PARTY_LIMIT;
    btn.disabled = full;
    btn.textContent = full ? '隊伍已滿' : '取出';
    btn.onclick = ()=>{
      if(!withdrawFromStorage(i)) return;
      toast(`${sp.name} 加入了隊伍!`);
      updateHud();
      SaveManager.save();
      renderStorageScreen();
    };
    card.appendChild(btn);
    content.appendChild(card);
  });
// 🌟 新增：離開按鈕 (貼在 forEach 結束之後)
  const backBtn = document.createElement('button');
  backBtn.className = 'actBtn backBtn'; 
  backBtn.style.width = '100%';
  backBtn.style.marginTop = '8px';
  backBtn.textContent = '← 離開';
  backBtn.onclick = () => closeOverlays();
  content.appendChild(backBtn);
} // 這是 renderStorageScreen 函式結尾

// ==========================================
// 🧬 融合機 (Fusion Machine) —— 第四章全部任務完成後,商店會出現入口
// 規則:
//   1. 隊伍裡必須有一隻雷屬性怪物,融合機才能通電啟動(每次開啟畫面都會檢查)。
//   2. 每個配方需要兩隻指定物種的怪物(在隊伍或倉庫裡都算),且達到等級/親密度/天氣/地圖等條件。
//   3. 沒有融合圖紙:基礎成功率 60%。消耗一張融合圖紙:100% 保證成功。
//   4. 失敗的話,兩隻怪物都不會受到任何影響,可以之後再試。
//   5. 融合成功後,兩隻怪物會一起消失,原本兩者已學會/記錄過的招式會合併進新怪物的「回憶清單」,
//      可以直接去找技能回憶師把想要的招式換回來。
// ==========================================
const FUSION_BASE_SUCCESS_RATE = 0.6;

const FUSION_RECIPES = [
  { id:'fuse_stormwing',    parents:['34','66'], minLevel:25, reqWeather:'rain',
    result:'121', condText:'雙方等級需達到25,並在雨天進行融合' },
  { id:'fuse_iceshield',    parents:['56','79'], minLevel:20, reqBond:160,
    result:'122', condText:'雙方等級需達到20,親密度需達160以上' },
  { id:'fuse_guardian',     parents:['48','87'], minLevel:25, reqWeather:'sunny',
    result:'123', condText:'雙方等級需達到25,並在晴天進行融合' },
  { id:'fuse_sandai',       parents:['59','84'], minLevel:25, reqBond:160,
    result:'124', condText:'雙方等級需達到25,親密度需達160以上' },
  { id:'fuse_oracle',       parents:['39','63'], minLevel:25, reqBond:160,
    result:'125', teachMoves:['synthesis','hone'], condText:'雙方等級需達到25,親密度需達160以上(融合後會學會恢復技能「光合作用」與命中強化技能「鷹眼鎖定」)' },
  { id:'fuse_duality',      parents:['46','10'], minLevel:20, reqBond:160,
    resolveResult:(a,b)=>{
      const m46 = a.speciesId==='46' ? a : b;
      const m10 = a.speciesId==='10' ? a : b;
      if(m46.level === m10.level) return '126'; // 等級相同時預設幻風蝶的型態
      return (m46.level > m10.level) ? '126' : '127';
    },
    teachMoves:['elementalRoulette'],
    condText:'雙方等級需達到20,親密度需達160以上(等級較高的一方決定屬性,較低的一方決定外型;融合後會學會隨機屬性技能「元素輪盤」)' },
  { id:'fuse_mycofly',      parents:['49','11'], minLevel:25, reqMap:['map23','map24'],
    result:'128', condText:'雙方等級需達到25,並在大草原(map23/map24)進行融合' },
  { id:'fuse_blazefly',     parents:['44','23'], minLevel:20, reqMap:['map9','map10'],
    result:'129', condText:'雙方等級需達到20,並在中央廣場或熾熱山谷(map9/map10)進行融合' },
  { id:'fuse_illusionist',  parents:['42','37'], minLevel:20, reqWeather:'fog',
    result:'130', teachMoves:['firstImp'], condText:'雙方等級需達到20,並在濃霧天氣進行融合(融合後會學會先制技能「奪得先機」)' },
  { id:'fuse_lumintower',   parents:['33','06'], minLevel:20, reqBond:160,
    resolveResult:(a,b)=>{
      const m33 = a.speciesId==='33' ? a : b;
      const m06 = a.speciesId==='06' ? a : b;
      if(m33.level === m06.level) return '131'; // 等級相同時預設Beaconvolt的屬性
      return (m33.level > m06.level) ? '131' : '132';
    },
    condText:'雙方等級需達到20,親密度需達160以上(等級較高的一方決定屬性)' },
  { id:'fuse_velocycle',    parents:['43','73'], minLevel:30, reqWeather:'fog',
    result:'133', condText:'雙方等級需達到30,並在濃霧天氣進行融合' },
  { id:'fuse_batterycart',  parents:['01','73'], minLevel:20, reqBond:160,
    result:'134', teachMoves:['takeDown'], condText:'雙方等級需達到20,親密度需達160以上(融合後會學會衝撞技能「猛撞」)' },
];

// 🌟 在隊伍+倉庫裡尋找指定物種、等級最高(同等級則親密度最高)的一隻怪物
function findFusionCandidate(speciesId, exclude){
  const pool = [...party.map((m,i)=>({m,loc:'party',i})), ...storageBox.map((m,i)=>({m,loc:'storage',i}))]
    .filter(o => o.m.speciesId === speciesId && o.m !== exclude);
  if(pool.length === 0) return null;
  pool.sort((a,b)=> (b.m.level - a.m.level) || ((b.m.bond||0) - (a.m.bond||0)));
  return pool[0].m;
}

// 🌟 檢查一個配方目前是否符合融合條件,回傳 {ready, reason, a, b}
function checkFusionRecipe(recipe){
  const a = findFusionCandidate(recipe.parents[0]);
  const b = findFusionCandidate(recipe.parents[1], a);
  if(!a || !b) return { ready:false, reason:'缺少素材怪物', a, b };

  if(a.level < recipe.minLevel || b.level < recipe.minLevel){
    return { ready:false, reason:`還不能融合(等級需達到 Lv.${recipe.minLevel})`, a, b };
  }
  if(recipe.reqBond && (Math.min(a.bond||0, b.bond||0) < recipe.reqBond)){
    return { ready:false, reason:`還不能融合(親密度需達到 ${recipe.reqBond} 以上)`, a, b };
  }
  if(recipe.reqWeather){
    const ow = (typeof WeatherManager !== 'undefined') ? WeatherManager.getOverworldWeather(GameState.player.mapId) : null;
    if(ow !== recipe.reqWeather) return { ready:false, reason:'還不能融合(天氣條件不符)', a, b };
  }
  if(recipe.reqMap && !recipe.reqMap.includes(GameState.player.mapId)){
    return { ready:false, reason:'還不能融合(地點條件不符)', a, b };
  }
  return { ready:true, reason:'', a, b };
}

// 🌟 把一隻怪物實例從隊伍或倉庫中移除
function removeMonsterInstance(mon){
  let idx = party.indexOf(mon);
  if(idx !== -1){ party.splice(idx,1); return; }
  idx = storageBox.indexOf(mon);
  if(idx !== -1){ storageBox.splice(idx,1); }
}

function performFusion(recipe, useBlueprint){
  const check = checkFusionRecipe(recipe);
  if(!check.ready){ toast(`⚠️ ${check.reason}`); return; }
  if(!partyHasType('thunder')){ toast('⚡ 融合機需要隊伍裡有雷屬性怪物才能通電啟動'); return; }
  if(useBlueprint && (GameState.inventory.fusionBlueprint||0) <= 0){ toast('沒有融合圖紙了'); return; }

  const { a, b } = check;
  const resultId = recipe.resolveResult ? recipe.resolveResult(a, b) : recipe.result;
  const newSp = SPECIES.find(s => s.id === resultId);

  const successRate = useBlueprint ? 1.0 : FUSION_BASE_SUCCESS_RATE;
  const success = Math.random() < successRate;

  if(useBlueprint) GameState.inventory.fusionBlueprint--;

  if(!success){
    toast('💥 融合失敗了...兩隻怪物雖然很沮喪,但都沒有受傷,可以再試一次。');
    SaveManager.save();
    return;
  }

  // 🌟 產生融合後的新怪物:等級取較高者,個體值取兩者平均,招式合併進回憶清單
  const level = Math.max(a.level, b.level);
  const iv = ((a.iv!=null ? a.iv : 0) + (b.iv!=null ? b.iv : 0)) / 2;
  const stats = computeStats(newSp, level, iv, 0);

  const combinedHistory = Array.from(new Set([...(a.moves||[]), ...(a.moveHistory||[]), ...(b.moves||[]), ...(b.moveHistory||[])]));
  let startMoves = Array.from(new Set([...(a.moves||[]), ...(b.moves||[])])).slice(0,4);
  if(startMoves.length === 0) startMoves = ['tackle','ultimate'];
  if(recipe.teachMoves){
    recipe.teachMoves.forEach(mv=>{
      if(!combinedHistory.includes(mv)) combinedHistory.push(mv);
      if(!startMoves.includes(mv) && startMoves.length < 4) startMoves.push(mv);
    });
  }

  const newMon = {
    speciesId: newSp.id, level,
    maxHp: stats.maxHp, hp: stats.maxHp, atk: stats.atk, def: stats.def, exp: 0,
    bond: 0, mood: 'normal',
    moves: startMoves, pendingMoves: [], moveHistory: combinedHistory, status: null,
    iv, altColor: undefined, heldItem: null, heldItemUsedThisBattle: false,
  };

  removeMonsterInstance(a);
  removeMonsterInstance(b);
  const dest = addToPartyOrStorage(newMon);
  dex.add(newSp.id); seenDex.add(newSp.id);

  updateHud();
  alert(`🧬 融合成功!誕生了全新的 ${newSp.name}!` + (dest==='storage' ? '\n\n隊伍已滿,先放進倉庫保管了。' : ''));
  SaveManager.save();
  renderFusionScreen();
}

function openFusionScreen(){
  closeOverlays();
  overlayOpen = 'fusion';
  renderFusionScreen();
  document.getElementById('fusionOverlay').style.display = 'flex';
}

function renderFusionScreen(){
  const content = document.getElementById('fusionContent');
  content.innerHTML = '';

  const hasThunder = partyHasType('thunder');
  const powerLine = document.createElement('p');
  powerLine.style.cssText = `font-size:12px;margin-bottom:10px;color:${hasThunder ? '#4caf50' : '#e94560'};`;
  powerLine.textContent = hasThunder ? '⚡ 融合機通電中,可以進行融合。' : '⚡ 融合機需要隊伍裡有一隻雷屬性怪物才能啟動供電!';
  content.appendChild(powerLine);

  const bpLine = document.createElement('p');
  bpLine.style.cssText = 'font-size:11px;color:#9aa5ce;margin-bottom:10px;';
  bpLine.textContent = `目前持有融合圖紙:${GameState.inventory.fusionBlueprint||0} 張(沒有圖紙也能融合,基礎成功率${Math.round(FUSION_BASE_SUCCESS_RATE*100)}%;使用圖紙可保證100%成功)`;
  content.appendChild(bpLine);

  FUSION_RECIPES.forEach(recipe=>{
    const spA = SPECIES.find(s=>s.id===recipe.parents[0]);
    const spB = SPECIES.find(s=>s.id===recipe.parents[1]);
    const check = checkFusionRecipe(recipe);
    const previewId = recipe.resolveResult ? (check.a && check.b ? recipe.resolveResult(check.a, check.b) : recipe.result || recipe.parents[0]) : recipe.result;
    const resultSp = SPECIES.find(s=>s.id===previewId) || SPECIES.find(s=>s.id===recipe.result);

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--panel); border-radius:6px; padding:8px 10px; margin-bottom:8px; border:1px solid #2a2a4a; font-size:12px;';
    card.innerHTML = `<div><b>${spA?spA.name:'???'} + ${spB?spB.name:'???'} → ${resultSp?resultSp.name:'???'}</b><small style="display:block;color:#9aa5ce;font-size:10px;margin-top:2px;">${recipe.condText}</small></div>`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;';

    const btn = document.createElement('button');
    btn.className = 'actBtn';
    btn.style.cssText = 'flex:1; min-width:120px;';
    btn.textContent = check.ready ? '🧬 開始融合' : (check.reason || '還不能融合');
    btn.disabled = !check.ready || !hasThunder;
    btn.onclick = () => {
      if(!confirm(`確定要用 ${spA.name} 和 ${spB.name} 融合嗎?融合失敗的話怪物不會受到影響,但成功的話兩隻怪物會消失,變成新的 ${resultSp.name}。`)) return;
      performFusion(recipe, false);
    };
    btnRow.appendChild(btn);

    if((GameState.inventory.fusionBlueprint||0) > 0){
      const bpBtn = document.createElement('button');
      bpBtn.className = 'actBtn';
      bpBtn.style.cssText = 'flex:1; min-width:120px; border-color:var(--gold); color:var(--gold);';
      bpBtn.textContent = '📜 用圖紙(保證成功)';
      bpBtn.disabled = !check.ready || !hasThunder;
      bpBtn.onclick = () => {
        if(!confirm(`確定要消耗一張融合圖紙,讓 ${spA.name} 和 ${spB.name} 保證融合成功嗎?`)) return;
        performFusion(recipe, true);
      };
      btnRow.appendChild(bpBtn);
    }

    card.appendChild(btnRow);
    content.appendChild(card);
  });

  const back = document.createElement('button');
  back.className = 'actBtn backBtn'; back.style.cssText = 'width:100%;margin-top:8px;';
  back.textContent = '← 離開';
  back.onclick = closeOverlays;
  content.appendChild(back);
}

// ==========================================
// 📖 說明畫面 (新手教學 / 技能 / 共鳴 / 設定)
// ==========================================
let currentHelpTab = 'tutorial';

function openHelpScreen(){
  closeOverlays();
  overlayOpen = 'help';
  renderHelpScreen();
  document.getElementById('helpOverlay').style.display = 'flex';
}

function renderHelpScreen(){
  const content = document.getElementById('helpContent');
  content.innerHTML = '';

  const tabs = [
    { id:'tutorial', label:'📘 新手教學' },
    { id:'moves',    label:'⚔️ 技能' },
    { id:'resonance',label:'✨ 共鳴' },
    { id:'settings', label:'⚙️ 設定' },
  ];
  const tabRow = document.createElement('div');
  tabRow.style.cssText = 'display:flex; gap:4px; margin-bottom:10px; position:sticky; top:0; background:rgba(8,10,26,.97); padding-bottom:6px; z-index:2;';
  tabs.forEach(t=>{
    const tb = document.createElement('button');
    tb.className = 'actBtn';
    tb.style.cssText = 'flex:1; padding:6px 2px; font-size:12px;' + (currentHelpTab===t.id ? 'border-color:var(--gold); color:var(--gold); font-weight:bold;' : '');
    tb.textContent = t.label;
    tb.onclick = () => { currentHelpTab = t.id; renderHelpScreen(); };
    tabRow.appendChild(tb);
  });
  content.appendChild(tabRow);

  if(currentHelpTab === 'tutorial') renderHelpTutorial(content);
  else if(currentHelpTab === 'moves') renderHelpMoves(content);
  else if(currentHelpTab === 'resonance') renderHelpResonance(content);
  else if(currentHelpTab === 'settings') renderHelpSettings(content);
}

function renderHelpTutorial(content){
  const steps = [
    ['🎮 基本操作', '用 WASD 或方向鍵移動,靠近 NPC 或機關後按 F 確認互動。按 G 可以切換跑步,移動速度加倍。'],
    ['👊 遇到野生怪物', '在草地、洞窟等地形走動時,有機率隨機遭遇野生怪物,進入戰鬥畫面。'],
    ['⚔️ 戰鬥流程', '每回合可以選擇「攻擊」使出技能、「捕捉」丟出捕獲珠(只對野生怪物有效)、「換人」替換隊伍中的怪物、或「逃跑」離開戰鬥(對訓練家無效)。'],
    ['📈 升級與進化', '戰鬥勝利會獲得經驗值,等級提升後數值會變強,某些怪物到了特定等級(或滿足特殊條件)會進化成更強的型態。'],
    ['💞 親密度與心情', '餵食物或戰鬥勝利可以提升怪物的親密度,親密度越高,獎勵羈絆效果越強;定期照顧怪物的心情,牠會更願意配合你戰鬥。'],
    ['🔮 共鳴系統', '隊伍裡外型相近、或屬性相近的怪物湊在一起,會發動「共鳴」,提供全隊攻防甚至特殊效果的加成,詳情可以看「共鳴」分頁。'],
    ['🗺️ 探索世界', '世界很大,建議善用疾風傳送(T鍵,需要風屬性怪物)快速往返已經去過的怪物中心。'],
    ['💾 存檔', '按 M 可以隨時手動存檔,最多同時保留 3 組進度,也可以把進度匯出成一串代碼,帶到別的裝置繼續玩。'],
  ];
  steps.forEach(([title, desc])=>{
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--panel); border-radius:6px; padding:8px 10px; margin-bottom:8px; border:1px solid #2a2a4a; font-size:12px;';
    card.innerHTML = `<b>${title}</b><div style="color:#9aa5ce; margin-top:4px; line-height:1.5;">${desc}</div>`;
    content.appendChild(card);
  });
}

function renderHelpMoves(content){
  const tip = document.createElement('p');
  tip.style.cssText = 'font-size:11px; color:#9aa5ce; margin-bottom:8px;';
  tip.textContent = '威力是相對倍率(1.0倍約等同基礎攻擊力),不是實際傷害數字;命中是招式本身的基礎命中率。';
  content.appendChild(tip);

  Object.entries(MOVE_POOL).forEach(([id, move])=>{
    const powerText = typeof move.power === 'function' ? '隨機威力'
      : (!move.power ? '變化技(無傷害)' : `威力${Math.round(move.power*100)}%`);
    const accText = move.alwaysHit ? '必中' : (move.acc ? `命中${Math.round((move.acc<=1?move.acc*100:move.acc))}%` : '必中');
    const typeText = move.type && move.type !== 'none' && ELEMENT_META[move.type] ? ELEMENT_META[move.type].name : (move.typeMode==='self' ? '(依自身屬性)' : (move.typeMode==='adaptive' ? '(自動剋制對方)' : (move.typeMode==='random' ? '(隨機屬性)' : '無屬性')));

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--panel); border-radius:6px; padding:6px 10px; margin-bottom:5px; border:1px solid #2a2a4a; font-size:12px;';
    card.innerHTML = `<b>${move.name}</b> <span style="color:#9aa5ce; font-size:10px;">${typeText} ・ ${powerText} ・ ${accText}</span>`;
    content.appendChild(card);
  });
}

function renderHelpResonance(content){
  const intro = document.createElement('p');
  intro.style.cssText = 'font-size:11px; color:#9aa5ce; margin-bottom:8px;';
  intro.textContent = '隊伍裡符合條件的怪物越多,共鳴效果越強(有上限),戰鬥開場會顯示目前發動中的共鳴。';
  content.appendChild(intro);

  Object.entries(RESONANCE_CATEGORIES).forEach(([id, meta])=>{
    const effectParts = [];
    if(meta.atkPerExtra>0) effectParts.push(`每多1隻+${Math.round(meta.atkPerExtra*100)}%攻擊力(上限+${Math.round(meta.maxBonus*100)}%)`);
    if(meta.defPerExtra>0) effectParts.push(`每多1隻+${Math.round(meta.defPerExtra*100)}%防禦力(上限+${Math.round(meta.maxBonus*100)}%)`);
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--panel); border-radius:6px; padding:8px 10px; margin-bottom:6px; border:1px solid #2a2a4a; font-size:12px;';
    card.innerHTML = `<b>${meta.icon} ${meta.name}</b><div style="color:#9aa5ce; margin-top:2px;">隊伍中2隻以上外型屬於此類的怪物即可發動。${effectParts.join('、')}</div>`;
    content.appendChild(card);
  });

  const extra = [
    ['❄️ 冰系共鳴', '目前上場的先發怪物是冰屬性時,戰鬥開場有機率讓天氣變成下雪;是水屬性時則有機率變成下雨。'],
    ['🌈 大四喜', '隊伍中有4種以上不同屬性:經驗值+15%,擊敗訓練家的金幣獎勵+20%。'],
    ['🌈 六六大順', '隊伍中有6種以上不同屬性:經驗值+30%,擊敗訓練家的金幣獎勵+40%。'],
    ['🌈 萬花筒', '隊伍中8隻怪物全部不同屬性:經驗值+50%,擊敗訓練家的金幣獎勵+70%。'],
  ];
  extra.forEach(([title, desc])=>{
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--panel); border-radius:6px; padding:8px 10px; margin-bottom:6px; border:1px solid #2a2a4a; font-size:12px;';
    card.innerHTML = `<b>${title}</b><div style="color:#9aa5ce; margin-top:2px;">${desc}</div>`;
    content.appendChild(card);
  });
}

function renderHelpSettings(content){
  const card = document.createElement('div');
  card.style.cssText = 'background:var(--panel); border-radius:6px; padding:10px; margin-bottom:8px; border:1px solid #2a2a4a;';
  card.innerHTML = `
    <label style="font-size:12px; color:#9aa5ce; display:block; margin-bottom:6px;">訓練家名稱</label>
    <input id="playerNameInput" type="text" maxlength="10" value="${GameState.player.name || '訓練家'}"
      style="width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #2a2a4a; background:#0b0b1a; color:#fff; font-size:14px;">
  `;
  content.appendChild(card);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'actBtn';
  saveBtn.style.cssText = 'width:100%;';
  saveBtn.textContent = '💾 儲存名稱';
  saveBtn.onclick = () => {
    const val = document.getElementById('playerNameInput').value.trim();
    GameState.player.name = val || '訓練家';
    toast(`✅ 名稱已更新為「${GameState.player.name}」`);
    SaveManager.save();
  };
  content.appendChild(saveBtn);
}
