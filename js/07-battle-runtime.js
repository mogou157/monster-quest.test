// ============================================================
// 07-battle-runtime.js — 戰鬥流程執行:個體值/天氣系統、HUD、圖鑑畫面、野外遭遇、戰鬥UI
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================


// =========================================================
// 🛠️ 改造區 K:數值浮動與個體值 🛠️
// 一般怪物每次算數值都會有 ±5% 的隨機浮動(不記錄,每次重算都不一樣)
// 只有透過「交換」得到的怪物,會在交換當下產生固定的個體值(iv)並記錄起來,
// 之後這隻怪物的數值永遠用同一個固定浮動去算,不會再變動。
// =========================================================
function generateIV(){
  return (Math.random()*0.1) - 0.05; // -5% ~ +5%,交換當下產生並記錄
}

// =========================================================
// 🔮 共鳴系統 (Resonance System)
// 隊伍裡外型(shape)相近的怪物越多,就會產生「共鳴」,提供全隊攻防加成。
// 每個分類都算「隊伍裡有幾隻符合的怪物」,達到2隻開始生效,每多1隻加成更高(有上限)。
// =========================================================
const SHAPE_CATEGORIES = {
  // 🐛 蟲類 —— 共鳴效果:攻擊力
  butterfly_1:'insect', butterfly_3:'insect', dragonfly:'insect', spider:'insect', shrimp:'insect',
  // 🐾 動物類 —— 共鳴效果:防禦力
  bat:'animal', rabbit:'animal', chick:'animal', swan:'animal', ice_mammoth:'animal', crow:'animal',
  dragon:'animal', sun_dragon:'animal', thunder_bird:'animal', fish:'animal', slender_fish:'animal',
  anglerfish:'animal', abyssal_whale:'animal', shell:'animal', coral:'animal', wing:'animal',
  // 🌿 花草類 —— 共鳴效果:攻擊+防禦(均衡)
  bamboo:'plant', cactus:'plant', daisy_top:'plant', dandelion:'plant', dead_tree:'plant', leaf:'plant',
  lotus:'plant', lotus_top:'plant', tree:'plant', trumpet_flower_side:'plant', tulip_side:'plant',
  world_tree:'plant', mushroom:'plant', vase:'plant', mushroomb:'plant', leaf2:'plant',
  // 🔌 電器/機械類 —— 共鳴效果:攻擊力
  battery:'machine', bike:'machine', board:'machine', desk_lamp:'machine', floor_lamp:'machine',
  head_lamp:'machine', led_light:'machine', refrigerator:'machine', subway_head:'machine',
  water_pump:'machine', zap:'machine', windmill:'machine', fishing_rod:'machine',
  // 💎 礦石/光源類 —— 共鳴效果:防禦力
  crystal:'mineral', diamond:'mineral', snowflake:'mineral', star:'mineral', round:'mineral',
  square:'mineral', candle:'mineral', lantern_1:'mineral', lantern_2:'mineral', shield:'mineral',
  sacred_gear:'mineral', blocks:'mineral', '3rhombic_120degrees':'mineral',
  // 🎒 器物/雜貨類 —— 共鳴效果:攻擊+防禦(均衡)
  chair:'object', chess:'object', cleaver:'object', hat:'object', heart:'object', ice_cream:'object',
  candy:'object', musical_note:'object', piano_keys:'object', mask:'object', tilted_book:'object',
  drifting_flag:'object', drop:'object', fountain:'object', bridge:'object', tower:'object',
  lighthouse:'object', crown:'object', bell:'object', air_balloon:'object', tornado:'object',
};

const RESONANCE_CATEGORIES = {
  insect:  { name:'蟲類共鳴',       icon:'🐛', atkPerExtra:0.05, defPerExtra:0,     maxBonus:0.25 },
  animal:  { name:'動物共鳴',       icon:'🐾', atkPerExtra:0,    defPerExtra:0.05,  maxBonus:0.25 },
  plant:   { name:'花草共鳴',       icon:'🌿', atkPerExtra:0.03, defPerExtra:0.03,  maxBonus:0.15 },
  machine: { name:'電器機械共鳴',   icon:'🔌', atkPerExtra:0.05, defPerExtra:0,     maxBonus:0.25 },
  mineral: { name:'礦石光源共鳴',   icon:'💎', atkPerExtra:0,    defPerExtra:0.05,  maxBonus:0.25 },
  object:  { name:'雜貨器物共鳴',   icon:'🎒', atkPerExtra:0.03, defPerExtra:0.03,  maxBonus:0.15 },
};

// 計算目前隊伍(不論死活,都算在陣容裡)的共鳴加成,回傳 {atkMult, defMult, active:[...]}
function calculatePartyResonance(){
  const counts = {};
  party.forEach(m=>{
    const sp = MonsterUtil.species(m);
    const cat = SHAPE_CATEGORIES[sp.shape];
    if(cat) counts[cat] = (counts[cat]||0) + 1;
  });

  let atkBonus = 0, defBonus = 0;
  const active = [];
  Object.entries(counts).forEach(([cat, count])=>{
    if(count < 2) return; // 至少要2隻同類型才會共鳴
    const meta = RESONANCE_CATEGORIES[cat];
    const extra = count - 1; // 第2隻開始才算加成
    const atkAdd = Math.min(meta.atkPerExtra * extra, meta.atkPerExtra>0 ? meta.maxBonus : 0);
    const defAdd = Math.min(meta.defPerExtra * extra, meta.defPerExtra>0 ? meta.maxBonus : 0);
    atkBonus += atkAdd; defBonus += defAdd;
    if(atkAdd>0 || defAdd>0) active.push({ ...meta, count, atkAdd, defAdd });
  });

  return { atkMult: 1+atkBonus, defMult: 1+defBonus, active };
}

// 產生一句共鳴狀態的說明文字(用在戰鬥開始的訊息裡)
function describeResonance(){
  const r = calculatePartyResonance();
  if(r.active.length === 0) return '';
  const parts = r.active.map(a => `${a.icon}${a.name}x${a.count}`);
  return `\n✨ 隊伍共鳴發動:${parts.join('、')}!`;
}

// ==========================================
// 🌟 1. 親密度階級判定
// ==========================================
function getBondTier(bond) {
    if (!bond || bond <= 60) return 0;
    if (bond <= 120) return 1;
    if (bond <= 160) return 2;
    return 3;
}

// ==========================================
// 🌟 2. 數值計算 (支援木系與無系血量共鳴)
// ==========================================
function computeStats(sp, level, iv, bond = 0){
    const mult = (iv!=null) ? (1+iv) : (0.95 + Math.random()*0.1);
    let hpMult = 1.0;
    const tier = getBondTier(bond);
    
    if (sp.type === 'wood') hpMult += 0.05 * tier; // 木系最高 +15% HP
    if (sp.type === 'none' && tier === 3) hpMult += 0.05; // 無系拍檔 +5% HP

    return {
        maxHp: Math.round((sp.baseHp + level*4.2) * mult * hpMult),
        atk:   Math.round((sp.baseAtk + level*1.3) * mult),
        def:   Math.round((sp.baseDef + level*1.1) * mult),
    };
}
// 🌟 檢查玩家是否已經擁有該怪獸 (防重複神獸)
function hasMonster(speciesId) {
    return party.some(m => m.speciesId === speciesId) || storageBox.some(m => m.speciesId === speciesId);
}
// 🌟 心情對照表 (加入專屬表情符號)
const MOOD_META = {
    'normal': { name: '普通', icon: '🙂', color: '#9aa5ce', desc: '心情平穩' },
    'hungry': { name: '飢餓', icon: '🤤', color: '#ffb347', desc: '食物友好度加倍' },
    'want_fight': { name: '好學', icon: '😠', color: '#ff6b4a', desc: '戰勝友好度加倍' },
    'want_fight_2': { name: '好戰', icon: '👿', color: '#8a5cff', desc: '陣亡不扣友好度' }
};

// 🌟 判斷親密度階級的文字轉換工具 (加入愛心與王冠)
function getBondRank(bond) {
    if (bond <= 60) return '🤍 陌生';
    if (bond <= 120) return '💛 友好';
    if (bond <= 160) return '💖 要好';
    return '👑 拍檔';
}
function makeMonster(speciesId, level, iv){
    let sp = SPECIES.find(s => s.id === String(speciesId));
    if (!sp) {
        console.warn(`⚠ 警告：找不到怪物 ID [${speciesId}]，已替換為預設怪物！`);
        sp = SPECIES[0];
    }
    const stats = computeStats(sp, level, iv);
    return { 
        speciesId, level, maxHp:stats.maxHp, hp:stats.maxHp,
        atk:stats.atk, def:stats.def, exp:0, 
        bond: 0, // 🌟 新增：親密度預設為 0
        mood: 'normal',
        moves:['tackle','ultimate'], pendingMoves:[], moveHistory:['tackle','ultimate'], status:null,
        iv: (iv!=null) ? iv : undefined, altColor: undefined,
        heldItem: null, heldItemUsedThisBattle: false 
    };
}
// // 🌟 判斷親密度階級的文字轉換工具
// function getBondRank(bond) {
//     if (bond <= 60) return '陌生';
//     if (bond <= 120) return '友好';
//     if (bond <= 160) return '要好';
//     return '拍檔';
// }
function updateHud(){
  document.getElementById('hudParty').textContent = `隊伍: ${party.length}/${PARTY_LIMIT}`;
  const active = party[GameState.party.activeIndex];
  document.getElementById('hudLevel').textContent = active ? `${MonsterUtil.species(active).name} Lv.${active.level}` : '-';
}

// ---------- 狀態畫面 ----------
let equipPickerIndex = null; // 目前正在幫哪隻怪物選裝備(index),null表示沒有開啟
function renderStatusScreen(){
  const list = document.getElementById('statusList');
  list.innerHTML='';
  const focusBtns = [];
  party.forEach((m,i)=>{
    const sp = MonsterUtil.species(m);
    const card = document.createElement('div');
    card.className = 'statCard' + (m.hp<=0 ? ' fainted':'');
    const c = document.createElement('canvas'); c.width=44; c.height=44;
    card.appendChild(c);
    const info = document.createElement('div');
    info.className='statInfo';
    const needed = m.level*20;
    const moveNames = m.moves.map(id=>moveDisplayName(id,m)).join('、');
    const heldDef = heldItemDef(m);
    // 👇 🌟 取得並翻譯當前親密度
    const bondVal = m.bond || 0;
    const bondRank = getBondRank(bondVal);
    const currentMood = MOOD_META[m.mood] || MOOD_META['normal'];
    
    info.innerHTML = `<b>${i===0?'▶ ':''}${sp.name}</b> Lv.${m.level}
      <span class="typeTag" style="background:${ELEMENT_META[sp.type].color};color:#111;">${ELEMENT_META[sp.type].name}</span>${m.altColor?' <span class="typeTag" style="background:#fff8c9;color:#7a5c00;">✨異色</span>':''}<br>
      HP ${m.hp}/${m.maxHp} ・ ATK ${m.atk} ・ DEF ${m.def} ・ EXP ${m.exp}/${needed}<br>
      羈絆: ${bondRank} (${bondVal}/200) ・ 心情: <span style="color:${currentMood.color}; font-weight:bold;">${currentMood.name}</span><br>
      特性:${PASSIVES[sp.passive].name} — ${PASSIVES[sp.passive].desc}<br>
      裝備:${heldDef ? heldDef.name : '無'}<br>
      技能:${moveNames}`;
          card.appendChild(info);

    // 攜帶裝備:裝備/更換/卸下(equipPickerIndex控制目前是哪隻怪物打開了選擇清單)
// 🌟 攜帶裝備與隊伍操作 (改為同一個橫排顯示)
    if(equipPickerIndex===i){
      const heldOwned = Object.entries(HELD_ITEMS).filter(([id])=> (GameState.inventory[id]||0)>0);
      if(heldOwned.length===0){
        const noneMsg = document.createElement('div');
        noneMsg.style.cssText='font-size:10px;color:#666;margin-top:4px;';
        noneMsg.textContent='沒有可裝備的道具(先到商店購買)';
        info.appendChild(noneMsg);
      }
      heldOwned.forEach(([id,def])=>{
        const eb = document.createElement('button');
        eb.className='actBtn'; eb.style.cssText='font-size:10px;margin-top:4px;display:block;width:100%;text-align:left;';
        eb.textContent = `裝備:${def.name} x${GameState.inventory[id]}`;
        eb.onclick = ()=>{ equipHeldItem(m, id); equipPickerIndex=null; renderStatusScreen(); SaveManager.save(); };
        info.appendChild(eb);
      });
      const cancelBtn = document.createElement('button');
      cancelBtn.className='actBtn backBtn'; cancelBtn.style.cssText='font-size:10px;margin-top:4px;display:block;width:100%;';
      cancelBtn.textContent='取消';
      cancelBtn.onclick = ()=>{ equipPickerIndex=null; renderStatusScreen(); };
      info.appendChild(cancelBtn);
    } else {
      // 🌟 建立橫向排列的容器 (Flexbox)
      const actionRow = document.createElement('div');
      actionRow.style.cssText = 'display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;';

      // 1. 裝備道具鈕
      const eqBtn = document.createElement('button');
      eqBtn.className='actBtn'; 
      eqBtn.style.cssText='font-size:10px; flex:1; padding:6px 2px; text-align:center;';
      eqBtn.textContent = heldDef ? '更換裝備' : '裝備道具';
      eqBtn.onclick = ()=>{ equipPickerIndex=i; renderStatusScreen(); };
      actionRow.appendChild(eqBtn);

      // 2. 卸下裝備鈕 (如果已經有裝備才顯示)
      if(heldDef){
        const unBtn = document.createElement('button');
        unBtn.className='actBtn'; 
        unBtn.style.cssText='font-size:10px; flex:1; padding:6px 2px; text-align:center;';
        unBtn.textContent = '卸下裝備';
        unBtn.onclick = ()=>{ unequipHeldItem(m); renderStatusScreen(); SaveManager.save(); };
        actionRow.appendChild(unBtn);
      }

      // 3. 設為先發鈕
      if(m.hp>0){
        const leadBtn = document.createElement('button');
        leadBtn.className='actBtn'; 
        leadBtn.style.cssText='font-size:10px; flex:1; padding:6px 2px; text-align:center;';
        leadBtn.textContent = i===0 ? '目前先發' : '設為先發';
        leadBtn.disabled = i===0;
        leadBtn.onclick = ()=>{
          [party[0], party[i]] = [party[i], party[0]];
          renderStatusScreen(); updateHud();
        };
        actionRow.appendChild(leadBtn);
        focusBtns.push(leadBtn);
      }

      // 4. 存入倉庫鈕
      if(party.length>1){
        const depBtn = document.createElement('button');
        depBtn.className='actBtn'; 
        depBtn.style.cssText='font-size:10px; flex:1; padding:6px 2px; text-align:center;';
        depBtn.textContent = '📦存入倉庫';
        depBtn.onclick = ()=>{
          if(!confirm(`確定要把 ${sp.name} 存進倉庫嗎?要取出的話得去找倉庫管理員。`)) return;
          depositToStorage(i);
          renderStatusScreen(); updateHud(); SaveManager.save();
        };
        actionRow.appendChild(depBtn);
      }
      
      info.appendChild(actionRow);
    }
    card.appendChild(info);
    list.appendChild(card);
    drawMonster(c.getContext('2d'), sp, 44, 44, m.altColor);
  });
  if(party.length===0){ list.innerHTML = '<div style="text-align:center;color:#666;">隊伍是空的</div>'; }
  if(overlayOpen==='status') setFocusList(focusBtns, 1);
}

// ---------- 圖鑑畫面 ----------
// ---------- 圖鑑畫面 ----------
function renderDexScreen(){
  const grid = document.getElementById('dexGrid');
  grid.innerHTML = '';
  document.getElementById('dexCount').textContent = `已遇見: ${seenDex.size} / 已捕捉: ${dex.size} / 總共: ${QUEST_NON_LEGENDARY_COUNT}`;
  
  // 🌟 判斷玩家是否擁有世界地圖
  const hasMap = (GameState.inventory.worldMap || 0) > 0;

  SPECIES.forEach(sp => {
    const isCaught = dex.has(sp.id);
    const isSeen = seenDex.has(sp.id);
    if (!isSeen && !isCaught) return; // 完全沒看過的隱藏

    const card = document.createElement('div');
    card.className = 'dexCard' + (isCaught ? '' : ' seen');
    
    const c = document.createElement('canvas');
    c.width = 40; c.height = 40;
    
    if (isCaught) {
        drawMonster(c.getContext('2d'), sp, 40, 40);
    } else {
        drawSilhouette(c.getContext('2d'), 40, 40);
    }

    // 📍 棲息地自動推斷邏輯
    let locHtml = '';
    if (hasMap) {
        let location = '各地草叢';
        if (sp.legendary) location = '神聖的遺跡深處';
        else if (sp.fused) location = '無法野生捕獲 (需融合)';
        else if (sp.evolved) location = '無法野生捕獲 (需進化)';
        else if (sp.type === 'water') location = '水域 / 沙灘';
        else if (sp.type === 'ice') location = '雪山 / 極寒海域';
        else if (sp.type === 'fire') location = '熾熱山谷';
        else if (sp.type === 'wood' || sp.type === 'wind') location = '幽暗森林 / 迷霧高地';
        else if (sp.type === 'earth') location = '地下洞窟 / 山路';
        else if (sp.type === 'dark') location = '漆黑地帶 / 隱藏小徑';
        
        locHtml = `<div style="color:var(--accent2); font-size:9px; margin-top:4px;">📍 棲息: ${location}</div>`;
    }

const info = document.createElement('div');
    if (isCaught) {
        // 抓到的：顯示名字、屬性、棲息地
        info.innerHTML = `<b>${sp.name}</b><br><span class="typeTag" style="background:${ELEMENT_META[sp.type].color};color:#111;">${ELEMENT_META[sp.type].name}</span>${locHtml}`;
    } else if (isSeen) {
        // 🌟 遇過但沒抓到：顯示真實名字與屬性，保留黑影
        info.innerHTML = `<b>${sp.name}</b><br><span class="typeTag" style="background:${ELEMENT_META[sp.type].color};color:#111;">${ELEMENT_META[sp.type].name}</span>${locHtml}`;
    } else {
        // 完全沒看過的：顯示 ???
        info.innerHTML = `<b>???</b><br><span style="font-size:9px; color:#666f9e;">未知物種</span>${locHtml}`;
    }

    card.appendChild(c);
    card.appendChild(info);
    grid.appendChild(card);
  });
}
// ---------- 起始畫面 ----------
const starterRow = document.getElementById('starterRow');
[SPECIES[0], SPECIES[1], SPECIES[2]].forEach(sp=>{
  const card = document.createElement('div');
  card.className='starterCard';
  const c = document.createElement('canvas');
  c.width=56; c.height=56; c.style.width='56px'; c.style.height='56px';
  card.appendChild(c);
  const label = document.createElement('span');
  label.textContent = sp.name;
  card.appendChild(label);
// 將選取初始怪物的點擊事件替換為這段
    card.onclick = () => {
        // 1. 給予玩家該怪獸 (預設給 Lv.5)
        const mon = makeMonster(sp.id, 5, generateIV());
        party.push(mon);
        dex.add(sp.id); 
        seenDex.add(sp.id);
        
        // 2. 隱藏選怪畫面
        document.getElementById('saveScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'none';

        // 3. 🌟 關鍵：選完怪獸後，立即將新進度寫入剛剛選擇的存檔格！
        SaveManager.save(false); // false 代表這是系統自動存檔，不會跳出錯誤
        
        // 4. 啟動遊戲畫面的更新
        updateHud();
        drawMap();
        started = true;
        toast(`冒險開始！${sp.name} 加入了隊伍！`);
    };
      starterRow.appendChild(card);
  drawMonster(c.getContext('2d'), sp, 56, 56);
});

// ---------- 戰鬥系統 ----------
let wild=null, currentTrainer=null, trainerTeamQueue=[];
const overlay = document.getElementById('battleOverlay');
const wildCanvas = document.getElementById('wildCanvas').getContext('2d');
const playerCanvas = document.getElementById('playerCanvas').getContext('2d');
const logBox = document.getElementById('logBox');
function log(msg){ logBox.textContent = msg; }

// =========================================================
// 🛠️ 改造區 H:天氣系統 🛠️
// 每場戰鬥開始時隨機選一種天氣,持續整場戰鬥。
// atkMult:攻擊招式是該屬性時,傷害倍率;defMult:被攻擊方是該屬性時,防禦倍率
// accDelta:全體命中率的加減
// commonWeather:標記成「常見天氣」,晴/陰/彩虹都沒有特殊效果,合計佔抽選機率的90%,
// 其餘有特殊效果的天氣合計只佔10%(pickWeather() 負責這個加權抽選)
// =========================================================
const WEATHERS = [
  { id:'sunny',     name:'晴',   icon:'☀️', commonWeather:true },
  { id:'cloudy',    name:'陰',   icon:'☁️', commonWeather:true },
  { id:'rainbow',   name:'彩虹', icon:'🌈' },
  { id:'rain',      name:'雨',   icon:'🌧️', atkMult:{ water:1.5, fire:0.6 } },
  { id:'harshSun',  name:'大晴天', icon:'🔆', atkMult:{ fire:1.5, ice:0.6, water:0.6 } },
  { id:'snow',      name:'雪',   icon:'❄️', defMult:{ ice:1.5 } },
  { id:'windy',     name:'颳風', icon:'💨', atkMult:{ wind:1.5 } },
  { id:'sandstorm', name:'風沙', icon:'🏜️', atkMult:{ wind:1.2 }, defMult:{ earth:1.5 } },
  { id:'radiant',   name:'閃耀', icon:'✨', atkMult:{ light:1.2, dark:0.6 } },
  { id:'pitchDark', name:'漆黑', icon:'🌑', atkMult:{ light:0.6, dark:1.2 } },
  { id:'fog',       name:'霧',   icon:'🌫️', accDelta:-0.15 },
];
let currentWeather = null;
// ==========================================
// 🌦️ 真實時間天氣與背景管理器 (Weather & Background Manager)
// ==========================================
const WeatherManager = {
    getOverworldWeather: function(mapId) {
        // 核心：使用「真實世界時間」做為種子 (每 5 分鐘變換一次)
        // 無論怎麼進出地圖，這 5 分鐘內的天氣都是固定的，無法硬刷！
        const cycle = Math.floor(Date.now() / (5 * 60 * 1000));
        
        let hash = cycle;
        for(let i = 0; i < mapId.length; i++) hash += mapId.charCodeAt(i);

        // --- 根據地圖特性，決定天氣池 ---
        if (['map3', 'map4', 'map17', 'map18', 'map19', 'map20'].includes(mapId)) {
            return (hash % 100 < 65) ? 'pitchDark' : 'fog'; // 洞窟與迷宮
        }
        if (['map15', 'map16', 'map6_1', 'map6_2'].includes(mapId)) {
            return (hash % 100 < 70) ? 'snow' : 'windy'; // 雪山與冰海-雪
        }
        if (['map12', 'map13', 'map14'].includes(mapId)) {
            return (hash % 100 < 40) ? 'rain' : 'harshSun'; // 一般海域-雨
        }
        if (['map9', 'map10'].includes(mapId)) {
            return (hash % 100 < 50) ? 'sunny' : 'harshSun'; // 廣場與火山-晴
        }
        if (mapId === 'map2') return 'fog'; // 迷霧高地永遠是霧

        if (mapId === 'map21') return 'fog'; // 迷霧高地永遠是霧

        // 預設 (包含大草原等)：晴/陰/雨/沙暴 隨機循環
        const rand = hash % 100;
        if (rand < 20) return 'rain';
        if (rand < 40) return 'cloudy';
        if (rand < 60) return 'sunny';
        if (rand < 70) return 'sandstorm'; // 草原偶爾起風沙
        return null;
    }
};
function pickWeather(){
  // 1. 取得目前所在的地圖 ID
  const mapId = GameState.player.mapId;
  const r = Math.random(); // 產生一個 0 ~ 1 之間的隨機數

  // 2. 針對特定地圖設定專屬機率 (攔截並強制回傳特定天氣)
      // 🌲 幽暗森林：容易起霧或漆黑

  if (mapId === 'map3'||mapId === 'map4'||mapId === 'map21'||mapId === 'map22') { 
    if (r < 0.65) return WEATHERS.find(w => w.id === 'pitchDark'); // 35% 機率漆黑
    if (r < 0.85) return WEATHERS.find(w => w.id === 'fog');       // 30% 機率起霧 (0.35~0.65)
    // 剩下的 35% 讓它漏下去，走下方的預設常規邏輯
  } 
  else if (mapId === 'map15'||mapId === 'map16') { 
    // ❄️ 冰山海域：極高機率下雪或刮風
    if (r < 0.70) return WEATHERS.find(w => w.id === 'snow');  // 60% 機率下雪
    if (r < 0.85) return WEATHERS.find(w => w.id === 'windy'); // 25% 機率刮風
  } 
  else if (mapId === 'map12' || mapId === 'map13' || mapId === 'map14') { 
    // 🌊 一般海域：天氣多變，容易下雨或大晴天
    if (r < 0.30) return WEATHERS.find(w => w.id === 'rain');     // 30% 機率下雨
    if (r < 0.50) return WEATHERS.find(w => w.id === 'harshSun'); // 20% 機率大晴天
  }
    else if (mapId === 'map9'||mapId === 'map10') { 
    if (r < 0.20) return WEATHERS.find(w => w.id === 'sunny');     
    if (r < 0.80) return WEATHERS.find(w => w.id === 'harshSun'); 
  }
  else if (mapId === 'map18') { 
    // 🏜️ (假設未來有沙漠地圖)
    if (r < 0.70) return WEATHERS.find(w => w.id === 'sandstorm'); // 70% 沙暴
        if (r < 0.20) return WEATHERS.find(w => w.id === 'windy');     
  }
    else if (mapId === 'map17') { 
    if (r < 0.70) return WEATHERS.find(w => w.id === 'rain'); // 70% 沙暴
        if (r < 0.35) return WEATHERS.find(w => w.id === 'pitchDark');     
  }
  else if (mapId === 'map19') { 
    if (r < 0.70) return WEATHERS.find(w => w.id === 'radiant'); // 70% 沙暴
        if (r < 0.40) return WEATHERS.find(w => w.id === 'windy');     
  }
  else if (mapId === 'map20') { 
    if (r < 0.70) return WEATHERS.find(w => w.id === 'harshSun'); // 70% 沙暴
        if (r < 0.40) return WEATHERS.find(w => w.id === 'windy');     
  }


  // 3. 其他沒有特別指定的地圖，或是上述機率沒被抽中(漏下來)的部分，走原本的預設邏輯
  // 90% 機率抽常見天氣 (晴/陰)，10% 抽稀有天氣
  if(Math.random() < 0.9){
    const basic = WEATHERS.filter(w=> w.commonWeather);
    return basic[Math.floor(Math.random()*basic.length)];
  }
  const rare = WEATHERS.filter(w=> !w.commonWeather);
  return rare[Math.floor(Math.random()*rare.length)];
}
function updateBattleBackground(mapId, weatherId) {
    const overlay = document.getElementById('battleOverlay');
    // 預設戰鬥背景 (深藍夜空)
    let bg = 'linear-gradient(180deg,#1e2749,#0f1530)'; 

    // 🌟 根據地圖主題改變「戰鬥背景色」
    if (['map3', 'map4', 'map17', 'map18', 'map19', 'map20'].includes(mapId)) {
        bg = 'linear-gradient(180deg,#2b2b2b,#0a0a0a)'; // 洞窟: 幽暗岩壁
    } else if (['map15', 'map16', 'map6_1', 'map6_2'].includes(mapId)) {
        bg = 'linear-gradient(180deg,#568CC4,#0984e3)'; // 雪地: 冰霜藍
    } else if (['map12', 'map13', 'map14'].includes(mapId)) {
        bg = 'linear-gradient(180deg,#00a8ff,#0097e6)'; // 海域: 湛藍海洋
    } else if (['map10'].includes(mapId)) {
        bg = 'linear-gradient(180deg,#BF5237,#A82E22)'; // 火山: 熔岩紅
    } else if (['map23', 'map24'].includes(mapId)) {
        bg = 'linear-gradient(180deg,#55efc4,#7BA67C)'; // 草原: 翠綠色
    }

    // 🌟 氣候特效強行覆蓋背景色
    if (weatherId === 'pitchDark') bg = 'linear-gradient(180deg,#000000,#303030)'; // 漆黑
    if (weatherId === 'harshSun') bg = 'linear-gradient(180deg,#BD5857,#9E2122)';  // 大晴天(熾熱)

    overlay.style.background = bg;
}
// ---------- 野生戰鬥觸發器 (固定地圖等級 + 動態安全網) ----------
function startWildBattle() {
    if (typeof debugNoEncounters !== 'undefined' && debugNoEncounters) return;

    // 🌟 1. 根據地圖設定固定等級範圍
    const MAP_LEVELS = {
        'map1': [2, 5], 'map2': [4, 7], 'map3': [6, 11], 'map4': [10, 14],
        'map5': [12, 16], 'map6_1': [14, 18], 'map6_2': [16, 20], 'map7': [18, 22],
        'map8': [20, 24], 'map9': [24, 28], 'map10': [24, 29], 'map11': [26, 32],
        'map12': [28, 34], 'map13': [30, 35], 'map14': [33, 37], 'map15': [35, 40],
        'map16': [36, 42], 'map17': [24, 28], 'map18': [24, 29], 'map19': [24, 28],
        'map20': [24, 28], 'map21': [40, 45], 'map22': [42, 47], 'map23': [38, 43],
        'map24': [40, 45], //'map25': [55, 60], 'map26': [58, 63], 'map27': [60, 65],        'map28': [62, 68], 'map29': [65, 70]
    };

    const mapId = GameState.player.mapId;
    let lv;

    // 🌟 2. 決定等級：如果在表單內就用固定區間，否則使用先發怪獸動態等級 (0 ~ -4)
    if (MAP_LEVELS[mapId]) {
        const range = MAP_LEVELS[mapId];
        lv = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    } else {
        const pLevel = party[GameState.party.activeIndex].level;
        lv = Math.max(2, Math.round(pLevel + (Math.random() * 4 - 4)));
    }

    // 🌟 3. 決定出現的野怪 (排除神獸與進化型)
    const wildPool = SPECIES.filter(s => !s.legendary && !s.evolved);
    const sp = wildPool[Math.floor(Math.random() * wildPool.length)];

    // 🌟 4. 產生野怪並進入戰鬥
    let wildMon = makeMonster(sp.id, lv, generateIV());
    
    // 賦予野怪隨機的初始心情
    const moodPool = ['normal', 'normal', 'hungry', 'want_fight'];
    wildMon.mood = moodPool[Math.floor(Math.random() * moodPool.length)];

    // 創世巨樹的連動標記判斷
    if (GameState.world.woodGodTrial) {
        toast('🍂 枯木聖壇驚動了強大的野生怪獸！');
    }

    // 寫入戰鬥狀態
    if (typeof BattleManager !== 'undefined') {
        BattleManager.state.enemy = wildMon;
        BattleManager.state.isTrainerBattle = false;
        BattleManager.state.trainerData = null;
    } else {
        window.wild = wildMon; // 舊版全域變數相容
    }

    inBattle = true;
    GameState.party.activeIndex = party.findIndex(m => m.hp > 0);
    
    document.getElementById('logBox').innerHTML = `遇到了野生的 ${sp.name}!${describeResonance()}`;
    renderBattle();
    showBattleControls();
    document.getElementById('battleOverlay').style.display = 'flex';
    overlayOpen = 'battle';
}
function startTrainerBattle(trainer){
  if(inBattle) return;
  if(!party.some(m=>m.hp>0)){ toast('隊伍已無法戰鬥,先去怪物中心恢復!'); return; }
  GameState.party.activeIndex = party.findIndex(m=>m.hp>0);
  currentTrainer = trainer;
  const avgLvl = Math.max(3, Math.round(party.reduce((s,m)=>s+m.level,0)/party.length));
trainerTeamQueue = trainer.team.map(tMon => {
        // 🌟 關鍵修正：必須傳入 tMon.lvl 讓等級固定！
        let mon = makeMonster(tMon.speciesId, tMon.lvl, generateIV());
        return mon;
    });  
  wild = trainerTeamQueue.shift();
  // 🌟 加入 BattleManager 綁定
  BattleManager.state.enemy = wild;
  BattleManager.state.isTrainerBattle = true;
  BattleManager.state.trainerData = currentTrainer;
  
  seenDex.add(wild.speciesId);
  document.getElementById('btnCatch').disabled = true;
  document.getElementById('btnRun').disabled = true;
  enterBattleUI(`${trainer.name}:「來戰鬥吧!」派出了 ${MonsterUtil.species(wild).name}(Lv.${wild.level})!${describeResonance()}`);
  party[GameState.party.activeIndex].hasDealtFirstDamage = false;
  wild.hasDealtFirstDamage = false;
}

function startBossBattle(npc){
  // 如果已經打贏過了，就只顯示文字
  if(trainersDefeated.has(npc.id)){
    toast('✨ 這裡已經風平浪靜了。');
    return;
  }
  if(!party.some(m=>m.hp>0)){ toast('隊伍已無法戰鬥,先去怪物中心恢復!'); return; }
  GameState.party.activeIndex = party.findIndex(m=>m.hp>0);

  // 巧妙利用 currentTrainer 機制：只要有 currentTrainer，系統就會自動禁用「捕捉」與「逃跑」
  currentTrainer = { id: npc.id, name: npc.name, winMsg: npc.winMsg };

  // 🌟 修正：正確使用呼叫端傳入的 team(神獸本體),沒有給 team 時才 fallback 用 species/lvl 生成
  const team = (npc.team && npc.team.length) ? npc.team : [makeMonster(npc.species, npc.lvl, generateIV())];
  trainerTeamQueue = team.slice(1);
  wild = team[0];

  // 🌟 加入 BattleManager 綁定
  BattleManager.state.enemy = wild;
  BattleManager.state.isTrainerBattle = true; 
  BattleManager.state.trainerData = currentTrainer;
  
  seenDex.add(wild.speciesId);
  
  document.getElementById('btnCatch').disabled = true;
  document.getElementById('btnRun').disabled = true;
  
  enterBattleUI(`強大的 ${MonsterUtil.species(wild).name} 發出了震耳欲聾的咆哮，準備進行戰鬥！${describeResonance()}`);
}


// 共用的顯示/隱藏戰鬥控制區函式(取代原本到處重複的 DOM 操作)
function hideBattleControls(){
  document.getElementById('actionGrid').style.display='none';
  document.getElementById('moveList').style.display='none';
  document.getElementById('swapList').style.display='none';
  document.getElementById('controlsBlocker').style.display='flex';
  focusList=[];
}
// 🌟 記錄主選單與技能的行動
let lastMainActionIndex = 0;
document.getElementById('btnFight').addEventListener('click', () => lastMainActionIndex = 0);
document.getElementById('btnCatch').addEventListener('click', () => lastMainActionIndex = 1);
document.getElementById('btnParty').addEventListener('click', () => lastMainActionIndex = 2);
document.getElementById('btnRun').addEventListener('click', () => lastMainActionIndex = 3);

function hideBattleControls(){
  document.getElementById('actionGrid').style.display='none';
  document.getElementById('moveList').style.display='none';
  document.getElementById('swapList').style.display='none';
  document.getElementById('controlsBlocker').style.display='flex';
  focusList=[];
}
// ---------- 顯示戰鬥主選單 ----------
function showBattleControls() {
    document.getElementById('actionGrid').style.display = 'grid';
    document.getElementById('moveList').style.display = 'none';
// 👇 🌟 關鍵修復：確保每次顯示主選單時，撤除「對方行動中」的隱形盾牌！
    const blocker = document.getElementById('controlsBlocker');
    if (blocker) blocker.style.display = 'none';

    const swapListEl = document.getElementById('swapList');
    if (swapListEl) swapListEl.style.display = 'none';    
    const isTrainer = typeof BattleManager !== 'undefined' ? BattleManager.state.isTrainerBattle : false;
    document.getElementById('btnCatch').disabled = isTrainer;

    const p = party[GameState.party.activeIndex];
    
    // ⚔️ 1. 戰鬥按鈕 (顯示技能、威力、命中率)
    document.getElementById('btnFight').onclick = () => {
        document.getElementById('actionGrid').style.display = 'none';
        const moveListEl = document.getElementById('moveList');
        moveListEl.innerHTML = '';
        moveListEl.style.display = 'grid';
        
        let btns = [];
        getMoves(p).forEach((move, i) => {
            const b = document.createElement('button');
            b.className = 'actBtn';
            
            // 🌟 判斷威力與變化技
            const defPower = typeof MOVE_POOL !== 'undefined' && MOVE_POOL[move.id] ? MOVE_POOL[move.id].power : move.power;
            const defAcc = typeof MOVE_POOL !== 'undefined' && MOVE_POOL[move.id] ? MOVE_POOL[move.id].acc : move.acc;
            
            let pwrDisplay;
            if (typeof defPower === 'function') {
                pwrDisplay = '隨機威力';
            } else if (defPower === 0) {
                if (move.statusOnly === 'poison') pwrDisplay = '使對手中毒';
                else if (move.statusOnly === 'burn') pwrDisplay = '使對手灼傷';
                else if (move.statusOnly === 'paralysis') pwrDisplay = '使對手麻痺';
                else if (move.statusOnly === 'sleep') pwrDisplay = '使對手睡眠';
                else if (move.buffStat === 'atk') pwrDisplay = '提升攻擊力';
                else if (move.buffStat === 'def') pwrDisplay = '提升防禦力';
                else if (move.debuffStat === 'atk') pwrDisplay = '降低敵攻擊';
                else if (move.debuffStat === 'def') pwrDisplay = '降低敵防禦';
                else if (move.setWeather) pwrDisplay = '改變天氣';
                else if (move.healWeatherType || move.healWeather || move.selfSleepHeal) pwrDisplay = '恢復HP';
                else if (move.applyImmunity || move.damageReduction) pwrDisplay = '防禦提升';
                else if (move.cureStatus) pwrDisplay = '解除異常';
                else pwrDisplay = '變化技';
            } else {
                pwrDisplay = `威力${Math.round(defPower * 100)}%`;
            }
            
            // 🎯 加入命中率判斷 (處理 100% 或 alwaysHit 的情況)
            let accDisplay = (!defAcc || defAcc >= 100 || move.alwaysHit) ? '必中' : `命中${defAcc}%`;
            let btnText = `${move.name} (${pwrDisplay} / ${accDisplay})`;
            
            // PP 次數系統
            if(move.maxUses){
                p.moveUses = p.moveUses || {};
                const used = p.moveUses[move.id] || 0;
                const remain = move.maxUses - used;
                btnText += ` [${remain}/${move.maxUses}]`;
                if(remain <= 0){
                    b.disabled = true;
                    b.style.opacity = '0.5';
                    b.style.cursor = 'not-allowed';
                }
            }
            
            b.textContent = btnText;
            
            // 屬性顏色側邊條
            if(move.type && move.type !== 'none' && ELEMENT_META[move.type]){
                b.style.borderLeft = `4px solid ${ELEMENT_META[move.type].color}`;
            }
            
            if(!b.disabled){
                b.onclick = ()=> {
                    p.lastMoveIndex = i; 
                    if (typeof playerTurn === 'function') playerTurn(move);
                };
            }
            moveListEl.appendChild(b);
            btns.push(b);
        });
        
        // 返回按鈕
        const back = document.createElement('button');
        back.className='actBtn backBtn'; back.textContent='← 返回';
        back.onclick = showBattleControls;
        moveListEl.appendChild(back);
        btns.push(back);
        
        if (typeof setFocusList !== 'undefined') setFocusList(btns, 2, p.lastMoveIndex || 0);
    };

    // 🔄 2. 換人按鈕 (連接到全新的圖鑑化介面)
    document.getElementById('btnParty').onclick = () => {
        if (typeof openBattleSwapUI === 'function') openBattleSwapUI(false);
    };

    
// 🏃 4. 逃跑按鈕 (已修復 null.level 崩潰 Bug)
    document.getElementById('btnRun').onclick = () => {
        if (isTrainer) return toast('無法從訓練家對戰中逃跑!');
        hideBattleControls();

        // 🌟 修正：先安全取得敵方物件，若為 null 則等級歸 0，避免崩潰
        const wildMon = (typeof BattleManager !== 'undefined' && BattleManager.state.enemy) ? BattleManager.state.enemy : (typeof wild !== 'undefined' && wild !== null ? wild : null);
        const wildLevel = wildMon ? wildMon.level : 0;

        const runChance = 0.5 + (p.level - wildLevel) * 0.05;
        if (Math.random() < runChance) {
            log('逃跑成功!');
            setTimeout(() => endBattle(null), 1000);
        } else {
            log('逃跑失敗!');
            setTimeout(() => {
                if (typeof enemyTurn === 'function') enemyTurn();
            }, 1000);
        }
    };
    // 重置焦點到「戰鬥」按鈕
    if (typeof setFocusList !== 'undefined') {
        setFocusList([
            document.getElementById('btnFight'),
            document.getElementById('btnCatch'),
            document.getElementById('btnParty'),
            document.getElementById('btnRun')
        ], 2);
    }
}
// 雪之呼喚特性:上場時(開場或換人上場)50%機率讓天氣變成雪
function checkSnowSummon(mon){
  if(MonsterUtil.species(mon).passive==='snowSummon' && Math.random()<0.5){
    currentWeather = WEATHERS.find(w=>w.id==='snow');
    return true;
  }
  return false;
}
// ==========================================
// ⚔️ 戰鬥畫面更新與進入邏輯
// ==========================================
// ---------- 更新戰鬥畫面 UI ----------
function renderBattle() {
    const p = party[GameState.party.activeIndex];
    // 相容 BattleManager 或全域 wild 變數
    const wildMon = (typeof BattleManager !== 'undefined' && BattleManager.state.enemy) ? BattleManager.state.enemy : (typeof wild !== 'undefined' ? wild : null);
    
    if (!p || !wildMon) return;

    const pSp = MonsterUtil.species(p);
    const wildSp = MonsterUtil.species(wildMon);
    
    // 取得當前屬性 (可能因技能改變)
    const pType = effectiveType(p);
    const wildType = effectiveType(wildMon);

    // 內部小工具：產生狀態與能力變化的 HTML 標籤
    const getStatusAndBuffs = (mon) => {
        let html = '';
        
        // 1. 異常狀態標籤
        if (mon.status && typeof STATUS_META !== 'undefined' && STATUS_META[mon.status]) {
            html += `<span class="statusTag ${mon.status}">${STATUS_META[mon.status].name}</span> `;
        }
        
        // 2. 攻擊力變化標籤
        if (mon.atkMult && mon.atkMult !== 1) {
            const isUp = mon.atkMult > 1;
            html += `<span class="buffTag ${isUp ? 'up' : 'down'}">攻 ${isUp ? '▲' : '▼'}${(mon.atkMult).toFixed(1)}</span> `;
        }
        
        // 3. 防禦力變化標籤
        if (mon.defMult && mon.defMult !== 1) {
            const isUp = mon.defMult > 1;
            html += `<span class="buffTag ${isUp ? 'up' : 'down'}">防 ${isUp ? '▲' : '▼'}${(mon.defMult).toFixed(1)}</span>`;
        }
        
        return html;
    };

    // --- 更新玩家 UI ---
    const pNameEl = document.getElementById('playerName');
    pNameEl.innerHTML = `${pSp.name} Lv.${p.level} <span class="typeTag" style="background:${ELEMENT_META[pType].color};color:#111;">${ELEMENT_META[pType].name}</span><br><div style="margin-top:4px;">${getStatusAndBuffs(p)}</div>`;
    
    document.getElementById('playerHpBar').style.width = Math.max(0, (p.hp / p.maxHp) * 100) + '%';
    document.getElementById('playerHpText').innerHTML = `HP ${p.hp}/${p.maxHp}`;
    drawMonster(document.getElementById('playerCanvas').getContext('2d'), pSp, 64, 64, p.altColor);

    // --- 更新敵方 UI ---
    const wNameEl = document.getElementById('wildName');
    const isTrainer = typeof BattleManager !== 'undefined' ? BattleManager.state.isTrainerBattle : false;
    const trainerData = typeof BattleManager !== 'undefined' ? BattleManager.state.trainerData : null;
    const trainerPrefix = (isTrainer && trainerData) ? `[${trainerData.name}] ` : '';
    
    wNameEl.innerHTML = `${trainerPrefix}${wildSp.name} Lv.${wildMon.level} <span class="typeTag" style="background:${ELEMENT_META[wildType].color};color:#111;">${ELEMENT_META[wildType].name}</span><br><div style="margin-top:4px;">${getStatusAndBuffs(wildMon)}</div>`;
    
    document.getElementById('wildHpBar').style.width = Math.max(0, (wildMon.hp / wildMon.maxHp) * 100) + '%';
    document.getElementById('wildHpText').innerHTML = `HP ${wildMon.hp}/${wildMon.maxHp}`;
    drawMonster(document.getElementById('wildCanvas').getContext('2d'), wildSp, 64, 64, wildMon.altColor);

    // =====================================
    // 🌟 保留你原本的：天氣與屬性相剋提示
    // =====================================
    const wBadge = document.getElementById('weatherBadge');
    if (currentWeather) {
        wBadge.textContent = `[天氣: ${currentWeather.icon} ${currentWeather.name}]`;
        wBadge.style.display = 'inline-block';
    } else {
        wBadge.style.display = 'none';
    }
    
    const adv = typeMultiplier(pType, wildType);
    const advBadge = document.getElementById('typeAdvBadge');
    advBadge.style.display = 'inline-block';
    if(adv > 1) { advBadge.textContent = '▲ 屬性優勢'; advBadge.style.color = '#4caf50'; }
    else if(adv < 1) { advBadge.textContent = '▼ 屬性劣勢'; advBadge.style.color = '#e94560'; }
    else { advBadge.textContent = '— 屬性平分'; advBadge.style.color = '#9aa5ce'; }
}
function enterBattleUI(msg) {
    inBattle = true;
    closeOverlays();
    
    // 🌟 1. 戰鬥天氣獨立：每場戰鬥開始時，重新隨機抽取天氣 (不影響場外)
    currentWeather = pickWeather();
    
    // 🌟 2. 戰鬥背景：繼承地圖的基礎色調，但「氣候特效」跟隨戰鬥內的隨機天氣
    const battleWeatherId = currentWeather ? currentWeather.id : null;
    updateBattleBackground(GameState.player.mapId, battleWeatherId);
    
    document.getElementById('battleOverlay').style.display = 'flex';
    log(msg);
    renderBattle();
    hideBattleControls(); // 先隱藏按鈕，等進場動畫與特性播完
    
    const p = party[GameState.party.activeIndex];
    const pEntryMsgs = triggerEntryPassives(p, wild);
    const wEntryMsgs = triggerEntryPassives(wild, p);
    
    let delay = 1200;
    
    if (pEntryMsgs && pEntryMsgs.length > 0) {
        setTimeout(() => { log(pEntryMsgs.join(' ')); renderBattle(); }, delay);
        delay += 1200;
    }
    if (wEntryMsgs && wEntryMsgs.length > 0) {
        setTimeout(() => { log(wEntryMsgs.join(' ')); renderBattle(); }, delay);
        delay += 1200;
    }
    
    setTimeout(showBattleControls, delay);
}
