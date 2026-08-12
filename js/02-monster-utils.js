// ============================================================
// 02-monster-utils.js — 怪物相關工具函式:進化、升級學習、屬性剋制、特性(被動能力)系統
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

// ==========================================
// 🌉 戰鬥系統全域轉發函式 (Bridge Functions)
// ==========================================
function playerTurn(move) { BattleManager.executePlayerTurn(move); }
function enemyTurn() { BattleManager.executeEnemyTurn(); }
function winBattle() { BattleManager.winBattle(); }
function endBattle(deathMsg) { BattleManager.endBattle(deathMsg); }
function doSwap(newIndex) { BattleManager.doSwap(newIndex); }
// ==========================================
// 🔄 戰鬥中：圖鑑化換人介面 (Swap UI)
// ==========================================
function openBattleSwapUI(forceSwap = false) {
    // 🌟 隱藏所有戰鬥選單與「對方行動中」的盾牌！
    document.getElementById('actionGrid').style.display = 'none';
    document.getElementById('controlsBlocker').style.display = 'none';    
    const swapList = document.getElementById('swapList');
    swapList.innerHTML = '';
swapList.style.display = 'grid';
    // 取得當前敵方屬性以計算相剋
    const wildMon = (typeof BattleManager !== 'undefined' && BattleManager.state.enemy) ? BattleManager.state.enemy : (typeof wild !== 'undefined' ? wild : null);
    const wType = wildMon ? effectiveType(wildMon) : 'none';

    let swapBtns = [];

    party.forEach((m, i) => {
        const sp = MonsterUtil.species(m);
        const isCurrent = (i === GameState.party.activeIndex);
        const isDead = (m.hp <= 0);
        
        const card = document.createElement('div');
        card.className = 'swapCard' + ((isCurrent || isDead) ? ' disabled' : '');
        
        // 畫怪獸小圖示
        const c = document.createElement('canvas');
        c.width = 48; c.height = 48;
        drawMonster(c.getContext('2d'), sp, 48, 48, m.altColor);

        // 資訊區塊 (包含屬性優劣勢計算)
        const info = document.createElement('div');
        info.className = 'swapCard-info';
        
        const pType = effectiveType(m);
        const adv = typeMultiplier(pType, wType);
        let advHtml = '';
        if (adv > 1) advHtml = '<span style="color:#4caf50; font-weight:bold;">▲ 屬性優勢</span>';
        else if (adv < 1) advHtml = '<span style="color:#e94560; font-weight:bold;">▼ 屬性劣勢</span>';
        else advHtml = '<span style="color:#9aa5ce">— 屬性平分</span>';

        info.innerHTML = `<b>${sp.name}</b> Lv.${m.level} <span class="typeTag" style="background:${ELEMENT_META[pType].color};color:#111;">${ELEMENT_META[pType].name}</span><br>
        HP: ${m.hp}/${m.maxHp} &nbsp;|&nbsp; ${advHtml}`;

        card.appendChild(c);
        card.appendChild(info);

        // 綁定點擊事件
        if (!isCurrent && !isDead) {
            card.onclick = () => {
                swapList.style.display = 'none';
                if (forceSwap) {
                    // 我方陣亡強制換人，不消耗回合
                    GameState.party.activeIndex = i;
                    party[i].hasDealtFirstDamage = false; 
                    let swapMsg = `派出 ${sp.name}!`;
                    if (typeof checkSnowSummon !== 'undefined' && checkSnowSummon(party[i])) swapMsg += ' ❄️天氣變成了雪!';
                    log(swapMsg); 
                    renderBattle(); 
                    showBattleControls();
                } else {
                    // 玩家主動換人，走消耗一回合的標準流程
                    doSwap(i);
                }
            };
            swapBtns.push(card);
        }
        swapList.appendChild(card);
    });

    // 只有在「不是強制換人」時，才顯示返回按鈕
    if (!forceSwap) {
        const backBtn = document.createElement('button');
        backBtn.className = 'actBtn backBtn';
        backBtn.style.marginTop = '8px';
        backBtn.textContent = '← 返回';
        backBtn.onclick = () => {
            swapList.style.display = 'none';
            if (typeof showBattleControls !== 'undefined') showBattleControls();
            else document.getElementById('actionGrid').style.display = 'grid';
        };
        swapList.appendChild(backBtn);
        swapBtns.push(backBtn);
    }

    if (typeof setFocusList !== 'undefined') setFocusList(swapBtns, 1);
}

// 綁定主畫面按鈕
document.getElementById('btnParty').onclick = () => openBattleSwapUI(false);
// ==========================================
// 🎯 統一版命中率計算系統 (輸出 0.0 ~ 1.0 的小數)
// ==========================================
// ==========================================
// 🎯 統一版命中率計算與判定系統 (直接回傳 true/false)
// ==========================================
function checkHit(attacker, move, defender) {
    // 1. 取得基礎命中率 (防呆：同時支援 move.acc 與 move.accuracy)
    let baseAcc = 1.0; // 預設必中
    if (move.acc !== undefined) {
        baseAcc = move.acc > 1 ? move.acc / 100 : move.acc;
    } else if (move.accuracy !== undefined) {
        baseAcc = move.accuracy > 1 ? move.accuracy / 100 : move.accuracy;
    }

    if (move.alwaysHit) return true; // 必中招式直接回傳 true

    // 2. 建立命中 Context，將小數轉為整數百分比 (0~100) 方便特性做加減
    const ctx = {
        attacker: attacker,
        defender: defender,
        move: move,
        moveType: move.type,
        weather: currentWeather,
        accuracy: baseAcc * 100, // 轉成例如 95
        guaranteedHit: false
    };

    // 3. 觸發特性加成 (例如：發光、鎖定、強光等)
    if (typeof runPassiveEvent === 'function') {
        runPassiveEvent('beforeHitCheck', attacker, defender, ctx);
        runPassiveEvent('beforeHitCheck', defender, attacker, ctx);
    }

    if (ctx.guaranteedHit) return true;

    // 4. 處理天氣影響 (例如濃霧 -20% 命中)
    if (currentWeather && currentWeather.id === 'fog') {
        ctx.accuracy -= 20;
    }

    // 5. 處理裝備影響 (例如精準透鏡)
    const atkHeld = typeof heldItemDef === 'function' ? heldItemDef(attacker) : null;
    if (atkHeld && atkHeld.accBoost) {
        ctx.accuracy += (atkHeld.accBoost * 100);
    }

    // 6. 處理動態 Debuff (例如被潑沙降命中)
    if (attacker.accDebuff) {
        ctx.accuracy -= attacker.accDebuff;
    }

    // 7. 將最終的百分比轉回小數 (0.0~1.0)，並直接進行亂數判定
    const finalAcc = Math.max(0, Math.min(1.0, ctx.accuracy / 100));
    return Math.random() <= finalAcc;
}
// ==========================================
// 🗺️ 地圖與移動管理器 (Map Manager)
// ==========================================
let party = GameState.party.active;
let storageBox = GameState.party.storage;
let dex = GameState.party.dex;
let seenDex = GameState.party.seenDex;
let visitedMaps = GameState.world.visitedMaps;
let trainersDefeated = GameState.world.trainersDefeated;
let dailyProgress = GameState.world.dailyProgress;
// ---------- 元素系統(10種) ----------
// 主循環7元素:每個元素剋制下一個、被上一個剋制
const CYCLE = ['fire','ice','wind','wood','earth','thunder','water']; // 火剋冰、冰剋風、風剋木、木剋地、地剋雷、雷剋水、水剋火
const ELEMENT_META = {
  fire:{name:'火',color:'#ff6b4a'}, ice:{name:'冰',color:'#8fdcff'},
  wind:{name:'風',color:'#b8f2c9'}, thunder:{name:'雷',color:'#ffd23f'},
  earth:{name:'地',color:'#a88a5a'}, water:{name:'水',color:'#4aa3ff'},
  wood:{name:'木',color:'#5cd65c'}, none:{name:'無',color:'#999'},
  light:{name:'光',color:'#fff6c9'}, dark:{name:'暗',color:'#8a5cff'},
};

function typeMultiplier(atk, def){
  if(atk==='none'||def==='none') return 1.0;
  if(atk==='light'&&def==='dark') return 1.5;
  if(atk==='dark'&&def==='light') return 1.5;
  if((atk==='light'&&def==='light')||(atk==='dark'&&def==='dark')) return 1.0;
  if(CYCLE.includes(atk) && CYCLE.includes(def)){
    const ai = CYCLE.indexOf(atk);
    if(CYCLE[(ai+1)%7] === def) return 1.5;   // 剋制
    if(CYCLE[(ai-1+7)%7] === def) return 0.65; // 被剋
  }
  return 1.0;
}
//mapmanger end
// ==========================================
// 👁️ 視野與迷霧管理器 (Vision Manager) [自動偵測版]
// ==========================================
const VisionManager = {
    // 自動判斷當前地圖需不需要迷霧
    needsFog: function() {
        return ['map3','map4', 'map21','map22'].includes(GameState.player.mapId);
    },

// 自動計算當前視野半徑 (多重疊加系統！)
    getRadius: function() {
        let baseR = 4; // 預設視野

        // 1. 任務加成：完成第三章，獲得「夜視力強化」 (+2 格)
        if (typeof QUESTS !== 'undefined') {
            const ch3Completed = QUESTS.filter(q => q.chapter === 3).every(q => q.check());
            if (ch3Completed) baseR += 2;
        }

        // 2. 隊伍加成：有光屬性怪獸 (+3 格)
        if (partyHasType('light')) {
            baseR += 3;
        }

        // 3. 背包道具加成：擁有探照燈 (+3 格)
        if ((GameState.inventory.searchlight || 0) > 0) {
            baseR += 3;
        }

        // 🌟 4. 裝備加成：隊伍中有怪獸「攜帶著」照明裝備 (+2 格)
        // 檢查隊伍裡有沒有怪獸帶著 held_light，且裝備沒有被查封(itemDisabled)
        if (party.some(m => !m.itemDisabled && m.heldItem === 'held_light')) {
            baseR += 2;
        }

        return baseR; 
    },    // 判斷某個座標是否在玩家視野內
    isVisible: function(x, y) {
        if (!this.needsFog()) return true; 
        
        const r = this.getRadius();
        const dx = x - player.x;
        const dy = y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        return dist <= (r + 0.5);
    },

    // 畫出黑幕與玩家周圍的柔邊洞
    drawFog: function(ctx, tileSize) {
        if (!this.needsFog()) return; // 不是迷霧地圖，直接不畫

        const r = this.getRadius();
        const centerX = (player.x * tileSize) + (tileSize / 2);
        const centerY = (player.y * tileSize) + (tileSize / 2);
        const radiusInPixels = r * tileSize;

        ctx.save(); 
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radiusInPixels * 0.3, 
            centerX, centerY, radiusInPixels        
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');     
        gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)'); 
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)'); 

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore(); 
    }
};
// ---------- 特性(被動能力) ----------
// ==========================================
// 📖 特性資料中心 (Passive Registry)
// ==========================================
// ==========================================
// 📖 特性資料中心 (Passive Registry) - 完整收錄版
// ==========================================
const PASSIVES = {
  // === 🌟 第七類：入場與特殊戰術 (onEntry / 其他) ===
  intimidate:     { name:'威嚇', desc:'登場時降低敵方20%攻擊力', trigger:'onEntry' },
  copycat:        { name:'基因複製', desc:'登場時複製對方特性', trigger:'onEntry' },
  snowSummon:     { name:'雪之呼喚', desc:'每次上場(含開場、換人上場)有50%機率讓天氣變成雪', trigger:'onEntry' },
  rainSummon:     { name:'雨之呼喚', desc:'上場時50%機率將天氣改為下雨', trigger:'onEntry' },
  scavenger:      { name:'尋寶', desc:'對戰獲勝後有機率獲得道具或額外金幣', trigger:'onBattleEnd' }, // 預留時機
  friendly:       { name:'友好', desc:'被捕捉時成功率提升20%', trigger:'onCatch' }, // 預留時機
  expBoost:       { name:'好學', desc:'自己獲得的經驗值提升30%', trigger:'onBattleEnd' }, // 預留時機

  // === ⚔️ 第二類：傷害與機制強化 (beforeAttack) ===
  guts:           { name:'拚命', desc:'HP低於30%時,攻擊力提升25%', trigger:'beforeAttack' },
  shieldBash:     { name:'盾擊', desc:'傷害額外增加40%防禦力數值', trigger:'beforeAttack' },
  firstStrike:    { name:'奇襲', desc:'登場後首次造成的傷害x1.7', trigger:'beforeAttack' },
  keenEye:        { name:'銳利', desc:'會心一擊機率提高20%', trigger:'beforeAttack' },
  swift:          { name:'敏捷', desc:'招式命中率提升15%', trigger:'beforeAttack' },
  underdogAtk:    { name:'下克上・攻', desc:'等級低於敵方時,攻擊力提升40%', trigger:'beforeAttack' },
  dreamEater:     { name:'食夢', desc:'對方睡眠時,自己的攻擊力提升70%', trigger:'beforeAttack' },
  statusExploit:  { name:'趁虛而入', desc:'對方有異常狀態時,自己的攻擊力提升25%', trigger:'beforeAttack' },
  statusAccBoost: { name:'鎖定', desc:'對方有異常狀態時,自己的命中率提升40%', trigger:'beforeAttack' },
  steady:         { name:'沉穩', desc:'HP低於50%時,命中率提升20%', trigger:'beforeAttack' },
  illuminate:     { name:'發光', desc:'在濃霧天氣時,命中率不會下降', trigger:'beforeAttack' },

  // === ☀️ 第三類：天氣環境連動 (攻方 beforeAttack / 防方 onDamage) ===
  moisture:       { name:'濕氣', desc:'陰天時,造成的傷害x1.2', trigger:'beforeAttack' },
  sunnyPower:     { name:'晴朗', desc:'大晴天時,造成的傷害x1.66', trigger:'beforeAttack' },
  darkRage:       { name:'暗夜狂暴', desc:'漆黑天氣時,造成的傷害x1.66', trigger:'beforeAttack' },
  firelight:      { name:'火光', desc:'閃耀天氣時,傷害x1.5', trigger:'beforeAttack' },
  rainPower:      { name:'水暴走', desc:'雨天時,造成的傷害x1.66', trigger:'beforeAttack' },
  pitchDarkGuard: { name:'暗夜守護', desc:'漆黑天氣時,防禦力提升30%', trigger:'onDamage' },

  // === 🛡️ 第一類：防禦、屬性與傷害減免 (onDamage) ===
  thick_skin:     { name:'厚皮', desc:'受到的傷害減少18%', trigger:'onDamage' },
  ironWall:       { name:'堅壁', desc:'受到的傷害減少40%', trigger:'onDamage' },
  nightWalker:    { name:'夜行', desc:'受到的光系傷害減少50%', trigger:'onDamage' },
  fireResist:     { name:'耐火', desc:'受到的火系傷害減少30%', trigger:'onDamage' },
  windResist:     { name:'避風', desc:'受到的風系傷害減少50%', trigger:'onDamage' },
  lightShield:    { name:'光盾', desc:'受到的光系傷害減少50%', trigger:'onDamage' },
  levitate:       { name:'漂浮', desc:'受到的地系傷害減少50%', trigger:'onDamage' },
  waterAbsorbDef: { name:'蓄水裝甲', desc:'每次受到水系攻擊時,防禦力提升10%(可疊加)', trigger:'onDamage' },
  chargeUp:       { name:'充電', desc:'受到雷系傷害時,攻擊力提升10%', trigger:'onDamage' },
  desperateDef:   { name:'逆境防禦', desc:'HP低於30%時,防禦力提升25%', trigger:'onDamage' },
  underdogDef:    { name:'下克上・防', desc:'等級低於敵方時,防禦力提升40%', trigger:'onDamage' },
  statusDefBoost: { name:'趁虛防禦', desc:'對方有異常狀態時,自己的防禦力提升25%', trigger:'onDamage' },
  statusResilience: { name:'帶病抗性', desc:'自身陷入異常狀態時,受到的傷害降低40%', trigger:'onDamage' },
  dazzling:       { name:'強光', desc:'降低敵方15%的命中率', trigger:'onDamage' }, // 當敵方攻擊自己時觸發判定

  // === 🎯 攻擊後觸發與動態疊加 (afterAttack) ===
  hypnoticTouch:  { name:'催眠觸覺', desc:'攻擊命中時25%機率讓對方睡著(不限招式屬性)', trigger:'afterAttack' },
  missBuffAtk:    { name:'越挫越勇・攻', desc:'每次攻擊未命中時,攻擊力提升15%', trigger:'afterAttack' },
  missBuffDef:    { name:'越挫越勇・防', desc:'每次攻擊未命中時,防禦力提升15%', trigger:'afterAttack' },

  // === 💉 異常狀態免疫 (beforeStatusApply) ===
  poisonImmune:   { name:'排毒體質', desc:'中毒會立刻自動解除(免疫中毒)', trigger:'beforeStatusApply' },
  paralysisImmune:{ name:'通電體質', desc:'麻痺會立刻自動解除(免疫麻痺)', trigger:'beforeStatusApply' },
  burnImmune:     { name:'耐熱體質', desc:'灼傷會立刻自動解除(免疫灼傷)', trigger:'beforeStatusApply' },
  wakeUp:         { name:'精神好', desc:'睡眠會立刻自動解除(免疫睡眠)', trigger:'beforeStatusApply' },
  purity:         { name:'淨身', desc:'立刻解除任何異常狀態(免疫所有狀態)', trigger:'beforeStatusApply' },

  // === 💚 第六類：生存、持續回復與環境淨化 (onTurnEnd) ===
  regen:          { name:'自癒', desc:'每回合結束回復6%最大HP', trigger:'onTurnEnd' },
  strongRegen:    { name:'強效自癒', desc:'HP低於50%時,自己回合結束恢復15%最大HP', trigger:'onTurnEnd' },
  berryHeal:      { name:'緊急果實', desc:'HP低於40%時恢復30%最大HP(每場限一次)', trigger:'onTurnEnd' },
  rainRegen:      { name:'雨之恩惠', desc:'雨天時,每回合結束回復15%最大HP', trigger:'onTurnEnd' },
  wheelAtk:       { name:'輪轉', desc:'自己的回合結束後,攻擊力提升5%', trigger:'onTurnEnd' },
  wheelDef:       { name:'熟練', desc:'自己的回合結束後,防禦力提升5%', trigger:'onTurnEnd' },
  sandstormCure:  { name:'沙暴淨化', desc:'風沙天氣時,每回合結束會自動解除異常狀態', trigger:'onTurnEnd' },
  shineCure:      { name:'閃耀淨化', desc:'閃耀天氣時,每回合結束會自動解除異常狀態', trigger:'onTurnEnd' },
  windCure:       { name:'狂風淨化', desc:'風天氣時,每回合結束會自動解除異常狀態', trigger:'onTurnEnd' },
  sunCure:        { name:'晴天淨化', desc:'大晴天時,每回合結束會自動解除異常狀態', trigger:'onTurnEnd' },

  // === 💀 陣亡時 (onFaint) ===
  martyr:         { name:'共患難', desc:'HP歸零時,對擊倒自己的對手造成自身最大HP 25%的傷害', trigger:'onFaint' },
  frostSkin: { name:'冰霜皮膚', desc:'將無屬性招式轉化為冰屬性，並提升20%傷害。', trigger:'beforeAttack' },
  vampiric: { name:'吸血鬼', desc:'每次攻擊造成傷害時，將傷害的 30% 轉化為自身 HP。', trigger:'afterAttack' },

  // === 🧬 融合限定特性 ===
  mimic:          { name:'技能模仿', desc:'登場時暫時變成與對方相同的屬性(戰鬥結束後恢復)', trigger:'onEntry' },
  evasive:        { name:'高速迴避', desc:'有30%機率讓對方的攻擊完全落空', trigger:'beforeHitCheck' },
};
// ==========================================
// 🦖 怪物資料操作中心 (Monster Utility)
// 規範：全專案存取怪物資料，皆須透過此模組
// ==========================================
const MonsterUtil = {
    // --- 🧬 基礎資料 ---
    // 取得物種完整資料 (取代原本的 speciesOf)
    species(mon) {
        if (!mon) return null;
        // SPECIES 是一個陣列，必須用 find 來尋找對應的 id
        return SPECIES.find(s => s.id === mon.speciesId) || null; 
    },

    // 檢查是否包含特定屬性 (取代硬挖 type1, type2)
    hasType(mon, targetType) {
        const sp = this.species(mon);
        if (!sp) return false;
        // 假設你的系統是單/雙屬性制，若未來改成陣列，也只需改這行
        return sp.type === targetType || sp.type1 === targetType || sp.type2 === targetType;
    },

    // --- 🌟 特性相關 ---

    // 取得特性 ID (取代原本的 getPassive)
    passive(mon) {
        if (!mon) return null;
        // 優先讀取個體特性，若無則讀取物種基礎特性
        return mon.passive || (this.species(mon) ? this.species(mon).passive : null);
    },

    // 取得特性詳細資料字典 (取代 getPassiveInfo)
    passiveInfo(mon) {
        const pId = this.passive(mon);
        return pId ? PASSIVES[pId] : null;
    },

    // 判斷是否擁有某特性 (取代 hasPassive)
    hasPassive(mon, id) {
        return this.passive(mon) === id;
    },

    // --- ⚔️ 數值相關 (可依專案狀態機制彈性擴充) ---
    
    getStat(mon, statName) {
        if (!mon) return 0;
        return mon[statName] || 0;
    },

    maxHP(mon) {
        return this.getStat(mon, 'maxHp');
    },

    attack(mon) {
        // 若未來要在此統一計算特性/天氣加成，架構已準備好
        return this.getStat(mon, 'atk');
    },

    defense(mon) {
        return this.getStat(mon, 'def');
    }
};
// ==========================================
// 🌟 1. 建立全域的特性事件分發中心 (Context 字典)
// ==========================================
const PassiveEvents = {
    onEntry: Object.create(null),
    onTurnStart: Object.create(null),
    beforeHitCheck: Object.create(null),
    beforeAttack: Object.create(null),
    afterAttack: Object.create(null),
    onDamage: Object.create(null),
    beforeStatusApply: Object.create(null),
    onTurnEnd: Object.create(null),
    onFaint: Object.create(null)
};

// ==========================================
// 🌟 2. 核心事件調度器 (支援 Context Object 與 Payload)
// ==========================================
function runPassiveEvent(eventName, mon, enemy, ctx = {}) {
    if (!mon) return { messages: [] };

    const passive = MonsterUtil.passive(mon); // 👈 使用最新的 MonsterUtil
    if (!passive) return { messages: [] };

    const table = PassiveEvents[eventName];
    if (!table) return { messages: [] };

    const handler = table[passive];
    if (!handler) return { messages: [] };

    const result = handler(mon, enemy, ctx);

    if (!result) return { messages: [] };

    if (typeof result === 'string') {
        return { messages: [result] };
    }

    return {
        messages: result.messages || [],
        animation: result.animation || null,
        sound: result.sound || null,
        weather: result.weather || null,
        ...result 
    };
}

// ⬇️ 下方緊接著應該要是你設定的各種特性邏輯
// 例如：PassiveEvents.onEntry.intimidate = function(...) { ... }
// ==========================================
// 🌟 核心事件調度器 (支援 Context Object 與 Payload)
// ==========================================
function runPassiveEvent(eventName, mon, enemy, ctx = {}) {
    if (!mon) return { messages: [] };

    const passive = MonsterUtil.passive(mon);
    if (!passive) return { messages: [] };

    const table = PassiveEvents[eventName];
    if (!table) return { messages: [] };

    const handler = table[passive];
    if (!handler) return { messages: [] };

    // 將 ctx 傳入特性中，讓特性可以自由讀取與修改裡面的數值
    const result = handler(mon, enemy, ctx);

    if (!result) return { messages: [] };

    if (typeof result === 'string') {
        return { messages: [result] };
    }

    return {
        messages: result.messages || [],
        animation: result.animation || null,
        sound: result.sound || null,
        weather: result.weather || null,
        ...result 
    };
}
// ==========================================
// ⚡ 1. 登場時 (onEntry)
// ==========================================
PassiveEvents.onEntry.intimidate = function(mon, enemy) {
    if (!enemy) return null;

    enemy.intimidateStacks = (enemy.intimidateStacks || 0) + 1;
    return { 
        messages: [`⚡ ${MonsterUtil.species(mon).name} 散發出威嚇的氣場，${MonsterUtil.species(enemy).name} 的攻擊力下降了！`] 
    };
};
PassiveEvents.onEntry.copycat = function(mon, enemy) {
    if (!enemy) return null;
    mon.copiedPassive = MonsterUtil.passive(enemy);
    return { messages: [`🧬 ${MonsterUtil.species(mon).name} 複製了對方的特性！`] };
};

PassiveEvents.onEntry.snowSummon = function(mon, enemy) {
    if (Math.random() < 0.5) {
        currentWeather = WEATHERS.find(w => w.id === 'snow');
        return { messages: [`❄️ ${MonsterUtil.species(mon).name} 的呼喚讓天氣變成了雪！`] };
    }
    return null;
};

PassiveEvents.onEntry.rainSummon = function(mon, enemy) {
    if (Math.random() < 0.5) {
        currentWeather = WEATHERS.find(w => w.id === 'rain');
        return { messages: [`🌧️ ${MonsterUtil.species(mon).name} 的呼喚讓天氣變成了雨！`] };
    }
    return null;
};

// 🧬 融合限定：技能模仿(登場時暫時變成對方的屬性,借用 currentType 機制,戰鬥結束會自動重置)
PassiveEvents.onEntry.mimic = function(mon, enemy) {
    if (!enemy) return null;
    mon.currentType = effectiveType(enemy);
    return { messages: [`🎭 ${MonsterUtil.species(mon).name} 模仿了對方,暫時變成了${ELEMENT_META[mon.currentType]?.name || mon.currentType}屬性！`] };
};
// ==========================================
// 👁️ 命中判定前 (beforeHitCheck)
// ==========================================

// --- 攻擊方 (提升命中) ---
PassiveEvents.beforeHitCheck.swift = function(mon, enemy, ctx) {
    if (mon === ctx.attacker) ctx.accuracy += 15;
    return null;
};
PassiveEvents.beforeHitCheck.statusAccBoost = function(mon, enemy, ctx) {
    if (mon === ctx.attacker && enemy.status) ctx.accuracy += 40;
    return null;
};
PassiveEvents.beforeHitCheck.steady = function(mon, enemy, ctx) {
    if (mon === ctx.attacker && mon.hp <= mon.maxHp * 0.5) ctx.accuracy += 20;
    return null;
};
PassiveEvents.beforeHitCheck.illuminate = function(mon, enemy, ctx) {
    if (mon === ctx.attacker && ctx.weather?.id === 'fog') {
        ctx.accuracy += 20; // 抵銷濃霧的 -20 減益
    }
    return null;
};

// --- 防禦方 (降低對方命中) ---
PassiveEvents.beforeHitCheck.dazzling = function(mon, enemy, ctx) {
    if (mon === ctx.defender) ctx.accuracy -= 15;
    return null;
};
// 🧬 融合限定：高速迴避(30%機率讓對方完全落空)
PassiveEvents.beforeHitCheck.evasive = function(mon, enemy, ctx) {
    if (mon === ctx.defender) ctx.accuracy -= 30;
    return null;
};
// ==========================================
// ⚔️ 2. 攻擊前 (beforeAttack) 
// 💡 (mon = 攻擊者, enemy = 防禦者)
// ==========================================
// ❄️ 屬性轉化類
PassiveEvents.beforeAttack.frostSkin = function(mon, enemy, ctx) {
    // 只要判斷當前招式是不是無屬性
    if (ctx.moveType === 'none') {
        ctx.moveType = 'ice'; // 轉屬性
        ctx.damage *= 1.2;    // 增傷
        return { messages: [`❄️ 冰霜皮膚將招式轉化為了冰屬性！`] };
    }
    return null;
};
PassiveEvents.beforeAttack.guts = function(mon, enemy, ctx) {
    if (mon.hp <= mon.maxHp * 0.3) {
        ctx.damage *= 1.25;
        return { messages: [`💢 ${MonsterUtil.species(mon).name} 拚命發動，傷害提升！`] };
    }
    return null;
};
PassiveEvents.beforeAttack.keenEye = function(mon, enemy, ctx) {
    ctx.critRate += 0.20; // 提升 20% 爆擊率
    return null;
};
PassiveEvents.beforeAttack.shieldBash = function(mon, enemy, ctx) {
    ctx.damage += (mon.def * (mon.defMult || 1)) * 0.4;
    return null;
};

PassiveEvents.beforeAttack.firstStrike = function(mon, enemy, ctx) {
    if (!mon.hasDealtFirstDamage) {
        ctx.damage *= 1.7;
        mon.hasDealtFirstDamage = true;
        return { messages: [`💨 ${MonsterUtil.species(mon).name} 發動了奇襲！`] };
    }
    return null;
};

PassiveEvents.beforeAttack.underdogAtk = function(mon, enemy, ctx) {
    if (mon.level < enemy.level) ctx.damage *= 1.4;
    return null;
};

PassiveEvents.beforeAttack.dreamEater = function(mon, enemy, ctx) {
    if (enemy.status === 'sleep') {
        ctx.damage *= 1.7;
        return { messages: [`💤 食夢效果拔群！`] };
    }
    return null;
};

PassiveEvents.beforeAttack.statusExploit = function(mon, enemy, ctx) {
    if (enemy.status) ctx.damage *= 1.25;
    return null;
};

// --- 天氣增傷類 ---
PassiveEvents.beforeAttack.moisture = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'cloudy') ctx.damage *= 1.2;
    return null;
};
PassiveEvents.beforeAttack.sunnyPower = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'sun') ctx.damage *= 1.66;
    return null;
};
PassiveEvents.beforeAttack.darkRage = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'dark') ctx.damage *= 1.66;
    return null;
};
PassiveEvents.beforeAttack.firelight = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'shine') ctx.damage *= 1.5;
    return null;
};
PassiveEvents.beforeAttack.rainPower = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'rain') ctx.damage *= 1.66;
    return null;
};


// ==========================================
// 🛡️ 3. 受擊時 (onDamage)
// 💡 (mon = 防禦者, enemy = 攻擊者)
// ==========================================
PassiveEvents.onDamage.thick_skin = function(mon, enemy, ctx) { ctx.damage *= 0.82; return null; };
PassiveEvents.onDamage.ironWall = function(mon, enemy, ctx) { ctx.damage *= 0.6; return null; };

// --- 屬性減免類 ---
PassiveEvents.onDamage.nightWalker = function(mon, enemy, ctx) { if (ctx.move?.type === 'light') ctx.damage *= 0.5; return null; };
PassiveEvents.onDamage.fireResist = function(mon, enemy, ctx) { if (ctx.move?.type === 'fire') ctx.damage *= 0.7; return null; };
PassiveEvents.onDamage.windResist = function(mon, enemy, ctx) { if (ctx.move?.type === 'wind') ctx.damage *= 0.5; return null; };
PassiveEvents.onDamage.lightShield = function(mon, enemy, ctx) { if (ctx.move?.type === 'light') ctx.damage *= 0.5; return null; };
PassiveEvents.onDamage.levitate = function(mon, enemy, ctx) { if (ctx.move?.type === 'earth') ctx.damage *= 0.5; return null; };

// --- 受擊增益類 ---
PassiveEvents.onDamage.waterAbsorbDef = function(mon, enemy, ctx) {
    if (ctx.move?.type === 'water') {
        mon.defMult = Math.min(3.0, (mon.defMult || 1) + 0.1);
        return { messages: [`💧 蓄水裝甲提升了防禦力！`] };
    }
    return null;
};
PassiveEvents.onDamage.chargeUp = function(mon, enemy, ctx) {
    if (ctx.move?.type === 'thunder') {
        mon.atkMult = Math.min(3.0, (mon.atkMult || 1) + 0.1);
        return { messages: [`⚡ 充電提升了攻擊力！`] };
    }
    return null;
};

// --- 戰況防禦類 --- (防禦提升 = 受到傷害減少)
PassiveEvents.onDamage.desperateDef = function(mon, enemy, ctx) {
    if (mon.hp <= mon.maxHp * 0.3) ctx.damage *= 0.8; // 防禦提升25%近似於減傷20%
    return null;
};
PassiveEvents.onDamage.underdogDef = function(mon, enemy, ctx) {
    if (mon.level < enemy.level) ctx.damage *= (1 / 1.4);
    return null;
};
PassiveEvents.onDamage.statusDefBoost = function(mon, enemy, ctx) {
    if (enemy.status) ctx.damage *= 0.8;
    return null;
};
PassiveEvents.onDamage.statusResilience = function(mon, enemy, ctx) {
    if (mon.status) ctx.damage *= 0.6;
    return null;
};
PassiveEvents.onDamage.pitchDarkGuard = function(mon, enemy, ctx) {
    if (ctx.weather?.id === 'dark') ctx.damage *= (1 / 1.3);
    return null;
};


// ==========================================
// 💉 4. 異常狀態免疫 (beforeStatusApply)
// 💡 (mon = 目標, enemy = 來源)
// ==========================================
PassiveEvents.beforeStatusApply.poisonImmune = function(mon, enemy, ctx) {
    if (ctx.status === 'poison') { ctx.cancelled = true; return { messages: [`🛡️ 排毒體質防止了中毒！`] }; }
    return null;
};
PassiveEvents.beforeStatusApply.paralysisImmune = function(mon, enemy, ctx) {
    if (ctx.status === 'paralysis') { ctx.cancelled = true; return { messages: [`🛡️ 通電體質防止了麻痺！`] }; }
    return null;
};
PassiveEvents.beforeStatusApply.burnImmune = function(mon, enemy, ctx) {
    if (ctx.status === 'burn') { ctx.cancelled = true; return { messages: [`🛡️ 耐熱體質防止了灼傷！`] }; }
    return null;
};
PassiveEvents.beforeStatusApply.wakeUp = function(mon, enemy, ctx) {
    if (ctx.status === 'sleep') { ctx.cancelled = true; return { messages: [`🛡️ 精神好防止了睡眠！`] }; }
    return null;
};
PassiveEvents.beforeStatusApply.purity = function(mon, enemy, ctx) {
    ctx.cancelled = true; return { messages: [`✨ 淨身特性防止了所有異常狀態！`] };
};


// ==========================================
// 💚 5. 回合結束 (onTurnEnd)
// ==========================================
PassiveEvents.onTurnEnd.regen = function(mon) {
    if (mon.healBlockTurns > 0) return null;
    if (mon.hp < mon.maxHp) mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, Math.round(mon.maxHp * 0.06)));
    return null;
};
PassiveEvents.onTurnEnd.strongRegen = function(mon) {
    if (mon.healBlockTurns > 0) return null;
    if (mon.hp <= mon.maxHp * 0.5 && mon.hp < mon.maxHp) {
        mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, Math.round(mon.maxHp * 0.15)));
        return { messages: [`${MonsterUtil.species(mon).name} 觸發了強效自癒！`] };
    }
    return null;
};
PassiveEvents.onTurnEnd.berryHeal = function(mon) {
    if (mon.healBlockTurns > 0) return null;
    if (mon.hp <= mon.maxHp * 0.4 && !mon.berryUsed) {
        mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, Math.round(mon.maxHp * 0.3)));
        mon.berryUsed = true;
        return { messages: [`${MonsterUtil.species(mon).name} 吃下了緊急果實，大幅恢復了HP！`] };
    }
    return null;
};
PassiveEvents.onTurnEnd.rainRegen = function(mon) {
    if (mon.healBlockTurns > 0) return null;
    if (currentWeather?.id === 'rain' && mon.hp < mon.maxHp) mon.hp = Math.min(mon.maxHp, mon.hp + Math.max(1, Math.round(mon.maxHp * 0.15)));
    return null;
};
PassiveEvents.onTurnEnd.wheelAtk = function(mon) { mon.atkMult = Math.min(2.0, (mon.atkMult || 1) + 0.05); return null; };
PassiveEvents.onTurnEnd.wheelDef = function(mon) { mon.defMult = Math.min(2.0, (mon.defMult || 1) + 0.05); return null; };

// --- 淨化類 ---
function cureStatusWithMsg(mon, weatherName) {
    if (mon.status) {
        mon.status = null;
        return { messages: [`✨ 受到${weatherName}的影響，${MonsterUtil.species(mon).name} 的異常狀態解除了！`] };
    }
    return null;
}
PassiveEvents.onTurnEnd.sandstormCure = function(mon) { if(currentWeather?.id === 'sandstorm') return cureStatusWithMsg(mon, '風沙'); return null; };
PassiveEvents.onTurnEnd.shineCure = function(mon) { if(currentWeather?.id === 'shine') return cureStatusWithMsg(mon, '閃耀'); return null; };
PassiveEvents.onTurnEnd.windCure = function(mon) { if(currentWeather?.id === 'wind') return cureStatusWithMsg(mon, '狂風'); return null; };
PassiveEvents.onTurnEnd.sunCure = function(mon) { if(currentWeather?.id === 'sun') return cureStatusWithMsg(mon, '晴天'); return null; };


// ==========================================
// 💀 6. 陣亡時 (onFaint)
// ==========================================
PassiveEvents.onFaint.martyr = function(defeated, attacker) {
    if (!attacker) return null;
    const dmg = Math.max(1, Math.round(defeated.maxHp * 0.25));
    attacker.hp = Math.max(0, attacker.hp - dmg);
    return { messages: [`⚠️ 共患難發動！對 ${MonsterUtil.species(attacker).name} 造成了 ${dmg} 點傷害！`] };
};

// ==========================================
// 🎯 7. 攻擊後觸發 (afterAttack) - 預留給下一步實裝
// ==========================================
PassiveEvents.afterAttack.vampiric = function(mon, enemy, ctx) {
    if (ctx.hit && ctx.damage > 0 && mon.hp < mon.maxHp && mon.healBlockTurns === 0) {
        const heal = Math.max(1, Math.round(ctx.damage * 0.3));
        mon.hp = Math.min(mon.maxHp, mon.hp + heal);
        return { messages: [`🩸 吸血鬼特性吸收了 ${heal} 點 HP！`] };
    }
    return null;
};
PassiveEvents.afterAttack.hypnoticTouch = function(mon, enemy, ctx) {
    if (ctx.hit && Math.random() < 0.25) {
        const res = applyStatus(enemy, 'sleep', mon);
        if (res.success) return { messages: [`🌀 催眠觸覺發動！`, ...res.messages] };
    }
    return null;
};
PassiveEvents.afterAttack.missBuffAtk = function(mon, enemy, ctx) {
    if (!ctx.hit) { mon.atkMult = Math.min(3.0, (mon.atkMult || 1) + 0.15); return { messages: [`💢 越挫越勇提升了攻擊力！`] }; }
    return null;
};
PassiveEvents.afterAttack.missBuffDef = function(mon, enemy, ctx) {
    if (!ctx.hit) { mon.defMult = Math.min(3.0, (mon.defMult || 1) + 0.15); return { messages: [`🛡️ 越挫越勇提升了防禦力！`] }; }
    return null;
};
// ==========================================
// 🦠 狀態賦予前 (beforeStatusApply)
// ==========================================

// 免疫：防止中毒
PassiveEvents.beforeStatusApply.immunity = function(mon, enemy, ctx) {
    if (ctx.status === 'poison') {
        ctx.cancelled = true; // 擋下狀態
        return { messages: [`🛡️ ${MonsterUtil.species(mon).name} 的免疫特性防止了中毒！`] };
    }
    return null;
};

// 水幕：防止灼傷
PassiveEvents.beforeStatusApply.waterVeil = function(mon, enemy, ctx) {
    if (ctx.status === 'burn') {
        ctx.cancelled = true;
        return { messages: [`💧 ${MonsterUtil.species(mon).name} 的水幕包覆全身，防止了灼傷！`] };
    }
    return null;
};

// 柔軟：防止麻痺
PassiveEvents.beforeStatusApply.limber = function(mon, enemy, ctx) {
    if (ctx.status === 'paralysis') {
        ctx.cancelled = true;
        return { messages: [`🤸 ${MonsterUtil.species(mon).name} 柔軟的身體不會被麻痺！`] };
    }
    return null;
};
