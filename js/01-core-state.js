// ============================================================
// 01-core-state.js — 核心遊戲狀態 + 存檔管理器 + 戰鬥管理器 (BattleManager)
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

  // ==========================================
// 💾 瀏覽器存檔相容包 (Polyfill)
// ==========================================
if (!window.storage) {
    window.storage = {
        get: async (key) => ({ value: localStorage.getItem(key) }),
        set: async (key, val) => localStorage.setItem(key, val),
        delete: async (key) => localStorage.removeItem(key)
    };
}

/* =========================================================
   MONSTER QUEST — 擴充版
   原創怪物設計。元素相剋概念(水火冰木風地雷無光暗)為通用
   奇幻設定的原創詮釋，並非重製任何特定作品的美術或角色。
   ========================================================= */
   // ==========================================
// 📦 遊戲全域狀態庫 (Game State)
// ==========================================
const GameState = {
    version: 2,
    player: { mapId: 'map1', x: 2,y: 2,coins: 60, name: '訓練家'},
    party: {active: [], storage: [],activeIndex: 0,dex: new Set(),seenDex: new Set()},
    inventory: {potion: 2, candy: 1, fullHeal: 1 },
    world: {legendaryUnlocked: false,visitedMaps: new Set(['map1']), trainersDefeated: new Set(), dailyProgress: { date: '', catches: 0, battles: 0, shopVisits: 0, claimed: {} },
        started: false, notifiedChapters: []
    },
};
// ==========================================
// 💾 存檔管理器 (Save Manager)
// ==========================================
// ==========================================
// 💾 存檔管理器 (Save Manager) - 終極瘦身版
// ==========================================
// ==========================================
// 💾 存檔管理器 (Save Manager) - 神秘旅人版
// ==========================================
const SaveManager = {
    _getPackedData: function() {
        const minify = (list) => list.map(m => ({
            s: m.speciesId, l: m.level, h: m.hp, e: m.exp, v: m.moves,
            mh: m.moveHistory, st: m.status || undefined, hi: m.heldItem || undefined,
            i: m.iv, c: m.altColor || undefined, b: m.bond || undefined
        }));

        return {
            version: typeof SAVE_VERSION !== 'undefined' ? SAVE_VERSION : 1,
            player: GameState.player,
            inventory: GameState.inventory,
            party: {
                active: minify(GameState.party.active),
                storage: minify(GameState.party.storage),
                traveler: minify(GameState.party.traveler || []), // 🌟 旅人寄放區
                activeIndex: GameState.party.activeIndex,
                dex: Array.from(GameState.party.dex),
                seenDex: Array.from(GameState.party.seenDex)
            },
            world: {
                ...GameState.world,
                visitedMaps: Array.from(GameState.world.visitedMaps),
                trainersDefeated: Array.from(GameState.world.trainersDefeated)
            }
        };
    },

    save: async function(isManual = true) {
        if (typeof inBattle !== 'undefined' && inBattle && isManual) { toast('戰鬥中無法手動存檔'); return; }
        if (!currentSlot) return;
        isSaving = true;
        const statusEl = document.getElementById('saveStatus');
        if (statusEl) statusEl.textContent = '存檔中…請稍候';
        try {
            const dataToSave = this._getPackedData();
            await window.storage.set(currentSlot, JSON.stringify(dataToSave));
            if (statusEl) statusEl.textContent = `已存檔 ${new Date().toLocaleTimeString()}`;
        } catch(err) {
            if (statusEl) statusEl.textContent = '⚠ 存檔失敗,請重試';
        } finally {
            isSaving = false;
        }
    },

    load: function(data) {
        if (!data) return false;
        try {
            GameState.player = player = data.player || { mapId: data.mapId || 'map1', x: data.pos?.x ?? 2, y: data.pos?.y ?? 2, coins: data.coins ?? 60 };
            GameState.player.totalSteps = data.player?.totalSteps || data.totalSteps || 0;
            GameState.player.totalEarnedCoins = data.player?.totalEarnedCoins || data.totalEarnedCoins || 0;
            // 👇 🌟 加入圖鑑自動修復邏輯：掃描隊伍與倉庫，確保擁有的怪獸絕對有登錄進圖鑑
            party.forEach(m => { if(m.speciesId) { dex.add(m.speciesId); seenDex.add(m.speciesId); } });
            storageBox.forEach(m => { if(m.speciesId) { dex.add(m.speciesId); seenDex.add(m.speciesId); } });
            if(GameState.party.traveler) {
                GameState.party.traveler.forEach(m => { if(m.speciesId) { dex.add(m.speciesId); seenDex.add(m.speciesId); } });
            }
            GameState.inventory = data.inventory || { potion: 2, candy: 1, fullHeal: 1, paintPotion: data.inventory?.paintPotion || 0 };

            const restore = (list) => list.map(m => {
                if (m.speciesId) return m; 
                let sp = SPECIES.find(x => x.id === m.s) || SPECIES[0];
                let stats = computeStats(sp, m.l, m.i);
                return {
                    speciesId: m.s, level: m.l, maxHp: stats.maxHp, hp: m.h ?? stats.maxHp,
                    atk: stats.atk, def: stats.def, exp: m.e || 0,
                    moves: m.v || ['tackle', 'ultimate'], 
                    moveHistory: m.mh || m.v || ['tackle', 'ultimate'],
                    status: m.st || null, iv: m.i, altColor: m.c,
                    heldItem: m.hi || null, heldItemUsedThisBattle: false, bond: m.b || 0,
                    mood: 'normal'
                };
            });

            GameState.party.active = party = restore(data.party?.active || data.party || []);
            GameState.party.storage = storageBox = restore(data.party?.storage || data.storageBox || []);
            GameState.party.traveler = restore(data.party?.traveler || []); // 🌟 讀取旅人寄放區
            GameState.party.activeIndex = data.party?.activeIndex ?? data.activeIndex ?? 0;
            GameState.party.dex = dex = new Set(data.party?.dex || data.dex || []);
            GameState.party.seenDex = seenDex = new Set(data.party?.seenDex || data.seen || []);

            GameState.world.visitedMaps = visitedMaps = new Set(data.world?.visitedMaps || data.visitedMaps || ['map1']);
            GameState.world.trainersDefeated = trainersDefeated = new Set(data.world?.trainersDefeated || data.trainersDefeated || []);
            GameState.world.legendaryUnlocked = data.world?.legendaryUnlocked ?? !!data.legendaryUnlocked;
            GameState.world.started = data.world?.started ?? !!data.started;
GameState.world.dailyProgress = dailyProgress = data.world?.dailyProgress || data.dailyProgress || { date: '', catches: 0, battles: 0, shopVisits: 0, claimed: {} };

    // 👇 🌟 關鍵修復：讀取存檔後，強制將全域地圖變數切換成存檔中的地圖！
    if (WORLDS[GameState.player.mapId]) {
        MAP = WORLDS[GameState.player.mapId].tiles;
        TRAINERS = WORLDS[GameState.player.mapId].trainers;
        MAP_W = MAP[0].length;
        MAP_H = MAP.length;
    }

    return true;
} catch (err) {
              return false;
        }
    },

    export: function() { return btoa(encodeURIComponent(JSON.stringify(this._getPackedData()))); },

    // 🌟 窺探代碼內容 (解析代碼但不直接覆蓋遊戲)
    peek: function(saveString) {
        try {
            saveString = saveString.trim().replace(/^MQSAVE-/, '');
            let data = JSON.parse(decodeURIComponent(atob(saveString)));
            const restore = (list) => list.map(m => {
                if (m.speciesId) return m; 
                let sp = SPECIES.find(x => x.id === m.s) || SPECIES[0];
                let stats = computeStats(sp, m.l, m.i);
                return {
                    speciesId: m.s, level: m.l, maxHp: stats.maxHp, hp: m.h ?? stats.maxHp, atk: stats.atk, def: stats.def, 
                    exp: m.e || 0, moves: m.v || [], moveHistory: m.mh || [], status: m.st || null, iv: m.i, 
                    altColor: m.c, heldItem: m.hi || null, heldItemUsedThisBattle: false, bond: m.b || 0, mood: 'normal'
                };
            });
            if(data.party) {
                data.party.active = restore(data.party.active || []);
                data.party.traveler = restore(data.party.traveler || []);
            }
            return data;
        } catch(e) {
            return null;
        }
    },

    import: function(saveString) {
        const data = this.peek(saveString);
        if (data) return this.load(data);
        return false;
    } 
};
// ==========================================
// 📦 存檔選擇畫面：匯出功能 (升級版：使用專屬介面防截斷)
// ==========================================
function openExport(slotIndex, data) {
    // 1. 先將該存檔資料載入 GameState (記憶體)
    if (SaveManager.load(data)) {
        // 2. 呼叫 SaveManager 產生代碼
        const code = 'MQSAVE-' + SaveManager.export();
        
        // 3. 開啟專屬 UI 介面 (不會截斷文字)
        closeOverlays();
        document.getElementById('eiTitle').textContent = `▌ 匯出進度 (存檔 ${slotIndex + 1}) ▌`;
        const ta = document.getElementById('eiTextarea');
        ta.value = code;
        ta.readOnly = true;
        
        document.getElementById('eiCopyBtn').style.display = 'block';
        document.getElementById('eiImportBtn').style.display = 'none';
        
        document.getElementById('eiCopyBtn').onclick = async () => {
            ta.select();
            try {
                await navigator.clipboard.writeText(code);
                toast('✅ 代碼已成功複製到剪貼簿！');
            } catch(e) {
                toast('複製失敗，請在文字框內手動全選並複製');
            }
        };
        
        document.getElementById('eiCloseBtn').onclick = () => {
            closeOverlays();
            location.reload(); // 重整以清除記憶體中的殘留資料
        };
        
        document.getElementById('exportImportOverlay').style.display = 'flex';
        overlayOpen = 'exportImport';
    } else {
        alert('❌ 存檔讀取失敗，無法匯出。');
    }
}

// ==========================================
// 📥 存檔選擇畫面：匯入功能 (升級版：使用專屬介面)
// ==========================================
function openImport(slotId) {
    closeOverlays();
    document.getElementById('eiTitle').textContent = `▌ 匯入進度 ▌`;
    const ta = document.getElementById('eiTextarea');
    ta.value = '';
    ta.readOnly = false;
    ta.placeholder = '請在此貼上完整的存檔代碼 (包含 MQSAVE-...)';
    
    document.getElementById('eiCopyBtn').style.display = 'none';
    document.getElementById('eiImportBtn').style.display = 'block';
    
    document.getElementById('eiImportBtn').onclick = () => {
        const code = ta.value.trim();
        if (!code) { toast('請先貼上代碼！'); return; }
        
        if (confirm('即將完全覆蓋此存檔格的進度，確定嗎？')) {
            if (SaveManager.import(code)) {
                currentSlot = slotId;
                SaveManager.save(false).then(() => {
                    alert('✅ 匯入成功！網頁即將重新整理以載入新進度。');
                    location.reload(); 
                });
            } else {
                alert('❌ 匯入失敗！這似乎是一段無效或不完整的代碼。');
            }
        }
    };
    
    document.getElementById('eiCloseBtn').onclick = () => {
        closeOverlays();
    };
    
    document.getElementById('exportImportOverlay').style.display = 'flex';
    overlayOpen = 'exportImport';
}
// ==========================================
// ⚔️ 戰鬥管理器 (Battle Manager)
// ==========================================
const BattleManager = {
    state: {
        inBattle: false,
        enemy: null, // 統一用這個代替 wild 或當前敵方
        turnCount: 0,
        isTrainerBattle: false,
        trainerData: null
    },

    // 執行玩家回合
// 執行玩家回合
    executePlayerTurn: function(move) {
        hideBattleControls();
        const p = party[GameState.party.activeIndex];
        const wild = this.state.enemy; 
        const currentTrainer = this.state.isTrainerBattle ? this.state.trainerData : null;
        if (p.rechargeTurns > 0) {
            p.rechargeTurns--;
            log(`${MonsterUtil.species(p).name} 因為先前的強大反作用力，本回合無法動彈！`);
            renderBattle();
            setTimeout(enemyTurn, 900);
            return;
        }
        if (p.tauntTurns > 0 && move.power === 0) {
            log(`💢 ${MonsterUtil.species(p).name} 受到挑釁影響，腦中只想著攻擊，無法使用變化招式！`);
            showBattleControls();
            return;
        }
        if (move.reqResonanceCat && (typeof calculatePartyResonance === 'undefined' || !calculatePartyResonance().active.some(a => a.catId === move.reqResonanceCat))) {
            log(`${MonsterUtil.species(p).name} 想使出 ${move.name},但隊伍裡的共鳴還沒有發動，招式使不出來！`);
            showBattleControls();
            return;
        }
        p.moveUses = p.moveUses || {};
        if (move.maxUses && (p.moveUses[move.id] || 0) >= move.maxUses) {
            log(`${MonsterUtil.species(p).name} 的 ${move.name} 已經沒有剩餘使用次數了！`);
            showBattleControls();
            return;
        }
        
        const sc = checkStatusBlock(p, move); 
        if(sc.blocked){
            log(sc.msg);
        } else {
            if(move.maxUses) p.moveUses[move.id] = (p.moveUses[move.id] || 0) + 1;
            
            const prefix = sc.msg ? sc.msg+' ' : '';
            if(sc.msg && !move.sleepUsable) playCureAnim('playerCanvas'); 
            
            if(move.sleepUsable && p.status !== 'sleep'){
                log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，但因為沒有睡著所以失敗了！`);
                
            // 🌟 1. 蓄力系統判定！
            } else if (move.needsCharge && !p.isCharging) {
                p.isCharging = move.id; 
                log(prefix + `${MonsterUtil.species(p).name} 正在為 ${move.name} 聚集強大的力量！`);
                renderBattle();
                setTimeout(enemyTurn, 900);
                return;
                
            } else if (move.isEscape) {
                log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}！`);
                if (currentTrainer) {
                    let available = party.map((m,i)=>({m,i})).filter(o=> o.m.hp>0 && o.i!==GameState.party.activeIndex);
                    if(available.length > 0) {
                        let next = available[Math.floor(Math.random()*available.length)].i;
                        setTimeout(() => doSwap(next), 1000);
                        return; 
                    } else log("沒有其他能戰鬥的隊友，無法替換！");
                } else {
                    log('金蟬脫殼成功，脫離了戰鬥！');
                    setTimeout(()=> endBattle(null), 1000);
                    return;
                }
} else if(!checkHit(p, move, wild).hit){
                  wild.lastMoveMissed = true;
                if(move.accuracyStack) wild.honeMissCount = (wild.honeMissCount || 0) + 1;
                
                let missMsg = prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name},但沒有命中!`;
                const afterMsgs = triggerAfterAttackPassives(wild, p, move, { hit: false });
                if(afterMsgs.length > 0) missMsg += ' ' + afterMsgs.join(' ');
                log(missMsg);
            } else {
                p.lastMoveMissed = false; p.honeMissCount = 0;

                if(move.power === 0 && move.setWeather){
                    playLungeAnim('playerCanvas','player');
                    currentWeather = WEATHERS.find(w => w.id === move.setWeather) || null;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，天氣變成了 ${currentWeather ? currentWeather.name : ''}！`);
                } else if(move.setType){
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.currentType = move.setType;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},屬性變成了${ELEMENT_META[move.setType].name}!`);
                } else if(move.buffStat && move.selfDebuffStat) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p[move.buffStat+'Mult'] = Math.min(3.0, (p[move.buffStat+'Mult']||1) + move.buffAmount);
                    p[move.selfDebuffStat+'Mult'] = Math.max(0.2, (p[move.selfDebuffStat+'Mult']||1) - move.selfDebuffAmount);
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}！攻擊力大幅提升，但防禦力下降了！`);
                } else if(move.buffStat){
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p[move.buffStat+'Mult'] = Math.min(2.0, (p[move.buffStat+'Mult']||1) + move.buffAmount);
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}!${move.buffStat==='atk'?'攻擊力':'防禦力'}提升了!`);
                } else if(move.debuffStat && move.power === 0){
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'poison');
                    wild[move.debuffStat+'Mult'] = Math.max(0.2, (wild[move.debuffStat+'Mult']||1) - move.debuffAmount);
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}! 對方的${move.debuffStat==='atk'?'攻擊力':'防禦力'}下降了！`);
                } else if(move.debuffAcc){
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'poison');
                    wild.accDebuff = (wild.accDebuff || 0) + move.debuffAcc;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}! 對方的命中率下降了！`);
                } else if(move.applyHealBlock){
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'poison');
                    wild.healBlockTurns = move.applyHealBlock;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}! 對方被刻上了死亡印記，暫時無法恢復 HP！`);
                } else if(move.healWeatherType || move.healWeather){
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    if(p.healBlockTurns > 0) log(prefix + `${MonsterUtil.species(p).name} 受到死亡印記影響，無法恢復！`);
                    else {
                        let healPct = 0.25;
                        if(currentWeather?.id === 'pitchDark') healPct = 0;
                        else if(currentWeather?.id === 'sunny' || currentWeather?.id === 'harshSun') healPct = 0.4;
                        if(healPct === 0) log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，但在漆黑中沒有效果...`);
                        else {
                            const healAmt = Math.max(1, Math.round(p.maxHp * healPct));
                            p.hp = Math.min(p.maxHp, p.hp + healAmt);
                            log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，恢復了 HP！`);
                        }
                    }
                } else if(move.applyHoT){
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.hotTurns = move.applyHoT.turns; p.hotPct = move.applyHoT.pct;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，周圍充滿了治癒的能量！`);
                } else if(move.selfSleepHeal){
                    playLungeAnim('playerCanvas','player'); playCureAnim('playerCanvas'); 
                    p.hp = p.maxHp; p.status = 'sleep';
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，恢復所有 HP 並進入了冬眠！`);
                } else if(move.statusOnly){
                    playLungeAnim('playerCanvas','player');
                    const inflicted = maybeInflictStatus(p, move, wild);
                    let curedMsg = '';
                    if(inflicted){
                        setTimeout(()=>playStatusInflictAnim('wildCanvas', inflicted), 150);
                        const cured = tryAutoCureByHeldItem(wild) || tryAutoCureByPassive(wild);
                        if(cured){ curedMsg = ` 但${MonsterUtil.species(wild).name}立刻解除了${STATUS_META[cured].name}!`; setTimeout(()=>playCureAnim('wildCanvas'), 400); }
                    }
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}!` + (inflicted ? ` 對方陷入了${STATUS_META[inflicted].name}狀態!${curedMsg}` : ' 但是沒有效果...'));
                    } else if (move.cureStatus) {
                    playLungeAnim('playerCanvas','player'); playCureAnim('playerCanvas');
                    p.status = null;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，完全淨化了自身的異常狀態！`);
                } else if (move.swapStats) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas'); playBuffAnim('wildCanvas');
                    let tempAtk = p.atkMult, tempDef = p.defMult;
                    p.atkMult = wild.atkMult; p.defMult = wild.defMult;
                    wild.atkMult = tempAtk; wild.defMult = tempDef;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，雙方的能力變化值被對調了！`);
                } else if (move.tauntTurns) {
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'burn'); 
                    wild.tauntTurns = move.tauntTurns;
                    log(prefix + `${MonsterUtil.species(p).name} 瘋狂 ${move.name} 對方！對手被激怒，接下來只能使用攻擊招式！`);
                } else if (move.applyLeech) {
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'poison');
                    wild.leechTurns = move.applyLeech.turns; wild.leechPct = move.applyLeech.pct;
                    log(prefix + `${MonsterUtil.species(p).name} 撒下了 ${move.name}！種子深深扎根在對方身上！`);
                } else if (move.sacrificePct) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    let cost = Math.max(1, Math.round(p.maxHp * move.sacrificePct));
                    p.hp = Math.max(1, p.hp - cost); // 不會自殺
                    p.nextAttackMult = move.nextAttackMultiplier;
                    log(prefix + `${MonsterUtil.species(p).name} 進行 ${move.name}，獻祭了 ${cost} 點 HP 換取極大破壞力！`);
                } else if (move.damageReduction) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.guardReduction = move.damageReduction;
                    log(prefix + `${MonsterUtil.species(p).name} 擺出 ${move.name}，準備化解接下來的攻擊！`);
                } else if (move.setCharge) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.nextAttackMult = 2.0; 
                    log(prefix + `${MonsterUtil.species(p).name} 正在 ${move.name}！下一次攻擊威力將會翻倍！`);
                } else if (move.counterPct) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.counterReady = move.counterPct;
                    log(prefix + `${MonsterUtil.species(p).name} 架起了 ${move.name} 的架勢！`);
                // 🌟 2. 秘笈效果：絕對防禦與反轉
                } else if (move.applyImmunity) {
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    p.damageImmunity = true;
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，進入了絕對防禦狀態！下一次受到的傷害將被化解！`);
                } else if (move.reverseStatsTarget === 'self') {
                    playLungeAnim('playerCanvas','player'); playCureAnim('playerCanvas');
                    p.atkMult = 1 / (p.atkMult || 1);
                    p.defMult = 1 / (p.defMult || 1);
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，自身的能力變化全部顛倒了！`);
                } else if (move.reverseStatsTarget === 'enemy') {
                    playLungeAnim('playerCanvas','player'); playStatusInflictAnim('wildCanvas', 'poison');
                    wild.atkMult = 1 / (wild.atkMult || 1);
                    wild.defMult = 1 / (wild.defMult || 1);
                    log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}，對方能力變化全部顛倒了！`);
                } else if (move.swapBuffStat || move.swapCureStatus) {
                    // 🌟 應援換位系:給即將上場的隊友加成,然後強制換人
                    playLungeAnim('playerCanvas','player'); playBuffAnim('playerCanvas');
                    const available = party.map((m,i)=>({m,i})).filter(o => o.m.hp>0 && o.i!==GameState.party.activeIndex);
                    if (available.length === 0) {
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},但沒有其他隊友可以上場了！`);
                    } else {
                        const target = available[Math.floor(Math.random()*available.length)];
                        let effectMsg = '';
                        if (move.swapBuffStat) {
                            target.m[move.swapBuffStat+'Mult'] = Math.min(2.0, (target.m[move.swapBuffStat+'Mult']||1) + move.swapBuffAmount);
                            effectMsg = `為即將上場的 ${MonsterUtil.species(target.m).name} 提升了${move.swapBuffStat==='atk'?'攻擊力':'防禦力'}!`;
                        } else if (move.swapCureStatus) {
                            target.m.status = null;
                            effectMsg = `為即將上場的 ${MonsterUtil.species(target.m).name} 淨化了異常狀態!`;
                        }
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name}!${effectMsg}`);
                        renderBattle();
                        setTimeout(() => doSwap(target.i), 900);
                        return;
                    }
                } else if (move.bondBurstEffect) {
                    // 🌟 羈絆爆發系:效果隨親密度(0~400)增強
                    const bond = p.bond || 0;
                    const bondFactor = Math.min(1, bond / 400);
                    playLungeAnim('playerCanvas','player');

                    if (move.bondBurstEffect === 'power' || move.bondBurstEffect === 'doubleHit') {
                        setTimeout(()=> playElementHitAnim('wildCanvas', move.type), 150);
                        let hits = 1;
                        if (move.bondBurstEffect === 'doubleHit' && Math.random() < bondFactor * 0.6) hits = 2;
                        let totalDmg = 0, lastMult = 1, lastCrit = false;
                        for (let h=0; h<hits; h++){
                            const bonusPower = move.bondBurstEffect === 'power' ? (1 + bondFactor) : 1;
                            const calc = damageCalc(p, Object.assign({}, move, {power: move.power * bonusPower}), wild);
                            totalDmg += calc.dmg; lastMult = calc.mult; lastCrit = calc.crit;
                            wild.hp = Math.max(0, wild.hp - calc.dmg);
                        }
                        let msg = prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},造成了 ${totalDmg} 傷害!` + (hits===2 ? '(二連擊!)' : '');
                        if(lastMult>1) msg += '效果絕佳!'; if(lastMult<1) msg += '效果不太好...'; if(lastCrit) msg += ' 會心一擊!';
                        log(msg);
                    } else if (move.bondBurstEffect === 'acc') {
                        setTimeout(()=> playElementHitAnim('wildCanvas', move.type), 150);
                        const calc = damageCalc(p, move, wild);
                        wild.hp = Math.max(0, wild.hp - calc.dmg);
                        let msg = prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},造成了 ${calc.dmg} 傷害!(親密度讓招式更容易命中)`;
                        if(calc.mult>1) msg += '效果絕佳!'; if(calc.mult<1) msg += '效果不太好...'; if(calc.crit) msg += ' 會心一擊!';
                        log(msg);
                    } else if (move.bondBurstEffect === 'heal') {
                        const healPct = 0.2 + bondFactor * 0.3;
                        const healAmt = Math.max(1, Math.round(p.maxHp * healPct));
                        p.hp = Math.min(p.maxHp, p.hp + healAmt);
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},靠著與訓練家的羈絆恢復了 ${healAmt} 點HP!`);
                    } else if (move.bondBurstEffect === 'selfBuff') {
                        const amt = 0.15 + bondFactor * 0.25;
                        p.atkMult = Math.min(3.0, (p.atkMult||1) + amt);
                        p.defMult = Math.min(3.0, (p.defMult||1) + amt);
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},攻擊力與防禦力都提升了!`);
                    } else if (move.bondBurstEffect === 'enemyDebuff') {
                        const amt = 0.15 + bondFactor * 0.25;
                        wild.atkMult = Math.max(0.2, (wild.atkMult||1) - amt);
                        wild.defMult = Math.max(0.2, (wild.defMult||1) - amt);
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},對方的攻擊力與防禦力都下降了!`);
                    } else if (move.bondBurstEffect === 'evade') {
                        p.evadeNextChance = 0.3 + bondFactor * 0.4;
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},提高了迴避下一次攻擊的機率!`);
                    } else if (move.bondBurstEffect === 'crit') {
                        p.critBoostNext = 0.2 + bondFactor * 0.3;
                        log(prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},下一次攻擊更容易會心一擊!`);
                    }
                } else {
                    
                    // ⚔️ 攻擊招式結算
                    if (p.isCharging) p.isCharging = false; 

                    playLungeAnim('playerCanvas','player');
                    setTimeout(()=> playElementHitAnim('wildCanvas', move.type), 150);
                    const calc = damageCalc(p, move, wild);
                    let dmg = calc.dmg; 
                    const mult = calc.mult;
                    const crit = calc.crit;         
                    
                    // 🌟 3. 秘笈效果：刀下留人
                    if (move.leaveOneHp && wild.hp - dmg <= 0) {
                        dmg = wild.hp - 1;
                    }
                    
                    wild.hp = Math.max(0, wild.hp - dmg);
                    // 標記受傷給「復仇」使用
                    if (dmg > 0) wild.tookDamageLastTurn = true; 
                    
                    let msg = prefix + `${MonsterUtil.species(p).name} 使出 ${move.name},造成 ${dmg} 傷害!`;

                    // 處理反擊機制
                    if (wild.counterReady && dmg > 0 && move.power > 0) {
                        let counterDmg = Math.max(1, Math.round(dmg * wild.counterReady));
                        p.hp = applyBondSurvival(p, counterDmg);
                        msg += ` ⚡ 對方發動反擊，彈回了 ${counterDmg} 點傷害！`;
                        wild.counterReady = null; 
                    }
                    
                    if (move.leaveOneHp && wild.hp === 1 && dmg === 0) {
                        msg += ' 刀下留人手下留情了！';
                    }

                    if(mult>1) msg += '效果絕佳!'; if(mult<1) msg += '效果不太好...'; if(crit) msg += ' 會心一擊!';
                    
                    if (calc.messages && calc.messages.length > 0) {
                        msg += ' ' + calc.messages.join(' ');
                    }
                    
                    if(move.setWeather && dmg > 0){
                        currentWeather = WEATHERS.find(w => w.id === move.setWeather) || null;
                        msg += ` 強大的力量讓天氣變成了 ${currentWeather ? currentWeather.name : ''}！`;
                    }

                    if(move.disableItem && !wild.itemDisabled && wild.heldItem){
                        wild.itemDisabled = true; msg += ` 對方的裝備被查封了！`;
                    }
                    if(move.debuffStat){
                        wild[move.debuffStat+'Mult'] = Math.max(0.2, (wild[move.debuffStat+'Mult']||1) - move.debuffAmount);
                        msg += ` 並且降低了對方的${move.debuffStat==='atk'?'攻擊力':'防禦力'}！`;
                    }
                    if(move.debuffAcc){
                        wild.accDebuff = (wild.accDebuff || 0) + move.debuffAcc;
                        msg += ` 並且降低了對方的命中率！`;
                    }
                    if(move.selfDebuffStat){
                        p[move.selfDebuffStat+'Mult'] = Math.max(0.2, (p[move.selfDebuffStat+'Mult']||1) - move.selfDebuffAmount);
                        msg += ` 但自己的${move.selfDebuffStat==='atk'?'攻擊力':'防禦力'}下降了！`;
                    }
                    if(move.recoilPct){
                        const recoil = Math.max(1, Math.round(dmg * move.recoilPct));
                        p.hp = applyBondSurvival(p, recoil);
                        msg += ` 自己也受到了 ${recoil} 點反彈傷害！`;
                    }
                    if(move.drainPct && !wild.healBlockTurns){
                        const heal = Math.max(1, Math.round(dmg * move.drainPct));
                        p.hp = Math.min(p.maxHp, p.hp + heal);
                        msg += ` 並且吸取了 ${heal} 點 HP！`;
                    }
                    
                    const inflicted = maybeInflictStatus(p, move, wild);
                    if(inflicted){
                        msg += ` 對方陷入了${STATUS_META[inflicted].name}狀態!`;
                        setTimeout(()=>playStatusInflictAnim('wildCanvas', inflicted), 350);
                        const cured = tryAutoCureByHeldItem(wild) || tryAutoCureByPassive(wild);
                        if(cured){ msg += ` 但${MonsterUtil.species(wild).name}立刻解解除${STATUS_META[cured].name}!`; setTimeout(()=>playCureAnim('wildCanvas'), 600); }
                    }
                    
                    // 🌟 4. 秘笈效果：守護打擊 (機率無敵)
                    if (move.chanceImmunity && Math.random() < move.chanceImmunity) {
                        p.damageImmunity = true;
                        msg += ' 並且進入了絕對防禦狀態！';
                    }
                    if (move.rechargeNextTurn) {
                        p.rechargeTurns = 1;
                        msg += ' 釋放了全部力量，下一回合將無法動彈！';
                    }
                    if (move.forceSwapAfter) {
                        const available = party.map((m,i)=>({m,i})).filter(o => o.m.hp>0 && o.i!==GameState.party.activeIndex);
                        if (available.length > 0) msg += ' 順勢撤回,換上了後備隊友！';
                    }
                    const afterMsgs = triggerAfterAttackPassives(p, wild, move, { hit: true, damage: dmg });
                    if(afterMsgs.length > 0) {
                        msg += ' ' + afterMsgs.join(' ');
                    }
                    log(msg);

                    if (move.forceSwapAfter && wild.hp > 0) {
                        const available = party.map((m,i)=>({m,i})).filter(o => o.m.hp>0 && o.i!==GameState.party.activeIndex);
                        if (available.length > 0) {
                            renderBattle();
                            const next = available[Math.floor(Math.random()*available.length)].i;
                            setTimeout(() => doSwap(next), 900);
                            return;
                        }
                    }
                }
            }
        }
        renderBattle();
        if(wild.hp<=0 || p.hp<=0) {
            if(wild.hp<=0) return winBattle();
            else return enemyTurn(); 
        }
        const turnEndMsg = triggerTurnEndPassives(p);
        if(turnEndMsg) { log(turnEndMsg); renderBattle(); }
        setTimeout(enemyTurn, 900);
    },

// ==========================================
    // 執行敵方回合 (Enemy Turn)
    // ==========================================
    executeEnemyTurn: function() {
        const p = party[GameState.party.activeIndex];
        const wild = this.state.enemy; 
        const currentTrainer = this.state.isTrainerBattle ? this.state.trainerData : null;
        
        if(p.hp <= 0) {
            // 判斷心情決定是否扣分
            if (p.mood === 'want_fight_2') {
                log(`${MonsterUtil.species(p).name} 倒下了... (好戰：友好度不減！)`);
            } else {
                p.bond = Math.max(0, (p.bond || 0) - 5);
                log(`${MonsterUtil.species(p).name} 倒下了... (bond下降)`);
            }
            const next = party.findIndex(m=>m.hp>0);            
            if(next === -1){
                const lost = Math.round(GameState.player.coins * 0.2); GameState.player.coins -= lost; updateCoinsHud();
                setTimeout(()=>{ endBattle(`你的隊伍全滅了,損失了 💰${lost} 金幣,已為你恢復血量。`); }, 1200);
            } else {
                // 強制打開換人介面
                setTimeout(() => {
                    log('請選擇下一隻上場的怪獸！');
                    openBattleSwapUI(true); 
                }, 1200);
            }
            return; // 🌟 確保死亡後不會繼續執行後續攻擊代碼
        }

        if (wild.rechargeTurns > 0) {
            wild.rechargeTurns--;
            log(`${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 因為先前的強大反作用力，本回合無法動彈！`);
            renderBattle();
            showBattleControls(); 
            return;
        }

        const sc = checkStatusBlock(wild, null);

        if(sc.blocked){
            log(sc.msg);
        } else {
            const prefix = sc.msg ? sc.msg+' ' : '';
            if(sc.msg) playCureAnim('wildCanvas'); 
            
            wild.moveUses = wild.moveUses || {};
            
            // 🌟 敵方選擇招式系統
            let move;
            if (wild.isCharging) {
                move = resolveMove(wild.isCharging, wild);
            } else {
                let moves = getMoves(wild).filter(m => !m.isEscape && (!m.maxUses || (wild.moveUses[m.id] || 0) < m.maxUses));
                
                // 👇 🌟 修復：挑釁邏輯移到這裡！敵方在選招前會過濾掉變化技
                if (wild.tauntTurns > 0) {
                    const atkMoves = moves.filter(m => m.power > 0);
                    if (atkMoves.length > 0) moves = atkMoves;
                }
                
                move = moves.length > 0 ? moves[Math.floor(Math.random()*moves.length)] : resolveMove('tackle', wild);
            }
            
            if(move.maxUses) wild.moveUses[move.id] = (wild.moveUses[move.id] || 0) + 1;
            
            if(move.sleepUsable && wild.status !== 'sleep'){
                log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，但因為沒有睡著所以失敗了！`);
            } else if (wild.tauntTurns > 0 && move.power === 0) {
                // 防呆：如果真的選到了變化技，直接失敗
                log(`💢 ${MonsterUtil.species(wild).name} 受到挑釁影響，腦中只想著攻擊，施放變化招式失敗！`);
            } else if (move.needsCharge && !wild.isCharging) {
                wild.isCharging = move.id; 
                log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 正在為 ${move.name} 聚集強大的力量！`);
                renderBattle();
                showBattleControls(); 
                return;
} else if(!checkHit(wild, move, p).hit){
                  wild.lastMoveMissed = true;
                if(move.accuracyStack) wild.honeMissCount = (wild.honeMissCount || 0) + 1;
                log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name},但沒有命中!`);
            } else {
                wild.lastMoveMissed = false; wild.honeMissCount = 0;

                if(move.power === 0 && move.setWeather){
                    playLungeAnim('wildCanvas','wild');
                    currentWeather = WEATHERS.find(w => w.id === move.setWeather) || null;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，天氣變成了 ${currentWeather ? currentWeather.name : ''}！`);
                } else if(move.setType){
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.currentType = move.setType;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name},屬性變成了${ELEMENT_META[move.setType].name}!`);
                } else if(move.buffStat && move.selfDebuffStat){
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild[move.buffStat+'Mult'] = Math.min(3.0, (wild[move.buffStat+'Mult']||1) + move.buffAmount);
                    wild[move.selfDebuffStat+'Mult'] = Math.max(0.2, (wild[move.selfDebuffStat+'Mult']||1) - move.selfDebuffAmount);
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}! 攻擊力大幅提升，但防禦力下降了！`);
                } else if(move.buffStat){
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild[move.buffStat+'Mult'] = Math.min(2.0, (wild[move.buffStat+'Mult']||1) + move.buffAmount);
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}!${move.buffStat==='atk'?'攻擊力':'防禦力'}提升了!`);
                } else if(move.debuffStat && move.power === 0){
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'poison');
                    p[move.debuffStat+'Mult'] = Math.max(0.2, (p[move.debuffStat+'Mult']||1) - move.debuffAmount);
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}! ${MonsterUtil.species(p).name}的${move.debuffStat==='atk'?'攻擊力':'防禦力'}下降了！`);
                } else if(move.debuffAcc){
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'poison');
                    p.accDebuff = (p.accDebuff || 0) + move.debuffAcc;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}! ${MonsterUtil.species(p).name}的命中率下降了！`);
                } else if(move.applyHealBlock){
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'poison');
                    p.healBlockTurns = move.applyHealBlock;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}! ${MonsterUtil.species(p).name}被刻上了死亡印記，暫時無法恢復 HP！`);
                } else if(move.healWeatherType || move.healWeather){
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    if(wild.healBlockTurns > 0) log(prefix + `${MonsterUtil.species(wild).name} 受到死亡印記影響，無法恢復！`);
                    else {
                        let healPct = 0.25;
                        if(currentWeather?.id === 'pitchDark') healPct = 0;
                        else if(currentWeather?.id === 'sunny' || currentWeather?.id === 'harshSun') healPct = 0.4;
                        
                        if(healPct === 0) log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，但在漆黑中沒有效果...`);
                        else {
                            const healAmt = Math.max(1, Math.round(wild.maxHp * healPct));
                            wild.hp = Math.min(wild.maxHp, wild.hp + healAmt);
                            log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，恢復了 HP！`);
                        }
                    }
                } else if(move.applyHoT){
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.hotTurns = move.applyHoT.turns; wild.hotPct = move.applyHoT.pct;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，周圍充滿了治癒的能量！`);
                } else if(move.selfSleepHeal){
                    playLungeAnim('wildCanvas','wild'); playCureAnim('wildCanvas'); 
                    wild.hp = wild.maxHp; wild.status = 'sleep';
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，恢復所有 HP 並進入了冬眠！`);
                } else if(move.statusOnly){
                    playLungeAnim('wildCanvas','wild');
                    const inflicted = maybeInflictStatus(wild, move, p);
                    let curedMsg = '';
                    if(inflicted){
                        setTimeout(()=>playStatusInflictAnim('playerCanvas', inflicted), 150);
                        const cured = tryAutoCureByHeldItem(p) || tryAutoCureByPassive(p);
                        if(cured){ curedMsg = ` 但${MonsterUtil.species(p).name}立刻解除了${STATUS_META[cured].name}!`; setTimeout(()=>playCureAnim('playerCanvas'), 400); }
                    }
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}!` + (inflicted ? ` ${MonsterUtil.species(p).name} 陷入了${STATUS_META[inflicted].name}狀態!${curedMsg}` : ' 但是沒有效果...'));
                } else if (move.applyImmunity) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.damageImmunity = true;
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，進入了絕對防禦狀態！下一次受到的傷害將被化解！`);
                } else if (move.reverseStatsTarget === 'self') {
                    playLungeAnim('wildCanvas','wild'); playCureAnim('wildCanvas');
                    wild.atkMult = 1 / (wild.atkMult || 1);
                    wild.defMult = 1 / (wild.defMult || 1);
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，自身的能力變化全部顛倒了！`);
                } else if (move.reverseStatsTarget === 'enemy') {
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'poison');
                    p.atkMult = 1 / (p.atkMult || 1);
                    p.defMult = 1 / (p.defMult || 1);
                    log(prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name}，對方能力變化全部顛倒了！`);
                } else if (move.cureStatus) {
                    playLungeAnim('wildCanvas','wild'); playCureAnim('wildCanvas');
                    wild.status = null;
                    log(prefix + `${MonsterUtil.species(wild).name} 使出 ${move.name}，完全淨化了自身的異常狀態！`);
                } else if (move.swapStats) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas'); playBuffAnim('playerCanvas');
                    let tempAtk = wild.atkMult, tempDef = wild.defMult;
                    wild.atkMult = p.atkMult || 1; wild.defMult = p.defMult || 1;
                    p.atkMult = tempAtk || 1; p.defMult = tempDef || 1;
                    log(prefix + `${MonsterUtil.species(wild).name} 使出 ${move.name}，雙方的能力變化值被對調了！`);
                } else if (move.tauntTurns) {
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'burn'); 
                    p.tauntTurns = move.tauntTurns;
                    log(prefix + `${MonsterUtil.species(wild).name} 瘋狂 ${move.name} 你的怪獸！接下來只能使用攻擊招式！`);
                } else if (move.applyLeech) {
                    playLungeAnim('wildCanvas','wild'); playStatusInflictAnim('playerCanvas', 'poison');
                    p.leechTurns = move.applyLeech.turns; p.leechPct = move.applyLeech.pct;
                    log(prefix + `${MonsterUtil.species(wild).name} 撒下了 ${move.name}！種子深深扎根在你身上！`);
                } else if (move.sacrificePct) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    let cost = Math.max(1, Math.round(wild.maxHp * move.sacrificePct));
                    wild.hp = Math.max(1, wild.hp - cost);
                    wild.nextAttackMult = move.nextAttackMultiplier;
                    log(prefix + `${MonsterUtil.species(wild).name} 進行 ${move.name}，獻祭了 ${cost} 點 HP 換取極大破壞力！`);
                } else if (move.damageReduction) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.guardReduction = move.damageReduction;
                    log(prefix + `${MonsterUtil.species(wild).name} 擺出 ${move.name}，準備化解接下來的攻擊！`);
                } else if (move.setCharge) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.nextAttackMult = 2.0; 
                    log(prefix + `${MonsterUtil.species(wild).name} 正在 ${move.name}！下一次攻擊威力將會翻倍！`);
                } else if (move.counterPct) {
                    playLungeAnim('wildCanvas','wild'); playBuffAnim('wildCanvas');
                    wild.counterReady = move.counterPct;
                    log(prefix + `${MonsterUtil.species(wild).name} 架起了 ${move.name} 的架勢！`);
                } else {
                    
                    // ⚔️ 攻擊招式結算
                    if (wild.isCharging) wild.isCharging = false; 

                    playLungeAnim('wildCanvas','wild');
                    setTimeout(()=> playElementHitAnim('playerCanvas', move.type), 150);
                    const calc = damageCalc(wild, move, p);
                    let dmg = calc.dmg;
                    const mult = calc.mult;
                    const crit = calc.crit;         
                    
                    // 敵方刀下留人判定
                    if (move.leaveOneHp && p.hp - dmg <= 0) {
                        dmg = p.hp - 1;
                    }
                    
                    p.hp = applyBondSurvival(p, dmg);
                    // 🌟 標記受傷給「復仇」使用
                    if (dmg > 0) p.tookDamageLastTurn = true; 
                    
                    let msg = prefix + `${(currentTrainer?currentTrainer.name+' 的 ':'野生')} ${MonsterUtil.species(wild).name} 使出 ${move.name},造成 ${dmg} 傷害!`;

                    // 🌟 處理反擊機制
                    if (p.counterReady && dmg > 0 && move.power > 0) {
                        let counterDmg = Math.max(1, Math.round(dmg * p.counterReady));
                        wild.hp = Math.max(0, wild.hp - counterDmg);
                        msg += ` ⚡ ${MonsterUtil.species(p).name} 發動反擊，彈回了 ${counterDmg} 點傷害！`;
                        p.counterReady = null; // 消耗反擊狀態
                    }
                    
                    if (move.leaveOneHp && p.hp === 1 && dmg === 0) {
                        msg += ' 刀下留人手下留情了！';
                    }

                    if(crit) msg += ' 會心一擊!';
                    if (calc.messages && calc.messages.length > 0) {
                        msg += ' ' + calc.messages.join(' ');
                    }
                    if(move.setWeather && dmg > 0){
                        currentWeather = WEATHERS.find(w => w.id === move.setWeather) || null;
                        msg += ` 強大的力量讓天氣變成了 ${currentWeather ? currentWeather.name : ''}！`;
                    }

                    if(move.disableItem && !p.itemDisabled && p.heldItem){
                        p.itemDisabled = true; msg += ` 你的裝備被查封了！`;
                    }
                    if(move.debuffStat){
                        p[move.debuffStat+'Mult'] = Math.max(0.2, (p[move.debuffStat+'Mult']||1) - move.debuffAmount);
                        msg += ` 並且降低了你的${move.debuffStat==='atk'?'攻擊力':'防禦力'}！`;
                    }
                    if(move.debuffAcc){
                        p.accDebuff = (p.accDebuff || 0) + move.debuffAcc;
                        msg += ` 並且降低了你的命中率！`;
                    }
                    if(move.selfDebuffStat){
                        wild[move.selfDebuffStat+'Mult'] = Math.max(0.2, (wild[move.selfDebuffStat+'Mult']||1) - wild.selfDebuffAmount);
                        msg += ` 但自己的${move.selfDebuffStat==='atk'?'攻擊力':'防禦力'}下降了！`;
                    }
                    if(move.recoilPct){
                        const recoil = Math.max(1, Math.round(dmg * move.recoilPct));
                        wild.hp = Math.max(0, wild.hp - recoil);
                        msg += ` 對方也受到了 ${recoil} 點反彈傷害！`;
                    }
                    if(move.drainPct && !wild.healBlockTurns){
                        const heal = Math.max(1, Math.round(dmg * move.drainPct));
                        wild.hp = Math.min(wild.maxHp, wild.hp + heal);
                        msg += ` 並且吸取了 ${heal} 點 HP！`;
                    }

                    const inflicted = maybeInflictStatus(wild, move, p);
                    if(inflicted){
                        msg += ` ${MonsterUtil.species(p).name} 陷入了${STATUS_META[inflicted].name}狀態!`;
                        setTimeout(()=>playStatusInflictAnim('playerCanvas', inflicted), 350);
                        const cured = tryAutoCureByHeldItem(p) || tryAutoCureByPassive(p);
                        if(cured){ msg += ` 但${MonsterUtil.species(p).name}立刻解除了${STATUS_META[cured].name}!`; setTimeout(()=>playCureAnim('playerCanvas'), 600); }
                    }
                    
                    // 敵方機率無敵
                    if (move.chanceImmunity && Math.random() < move.chanceImmunity) {
                        wild.damageImmunity = true;
                        msg += ' 並且進入了絕對防禦狀態！';
                    }
                    if (move.rechargeNextTurn) {
                        wild.rechargeTurns = 1;
                        msg += ' 釋放了全部力量，下一回合將無法動彈！';
                    }
                    
                    const afterMsgs = triggerAfterAttackPassives(wild, p, move, { hit: true, damage: dmg });
                    if(afterMsgs.length > 0) {
                        msg += ' ' + afterMsgs.join(' ');
                    }
                    log(msg);
                }
            }
        }
        renderBattle();
        const turnEndMsg = triggerTurnEndPassives(wild);
        if(turnEndMsg) { log(turnEndMsg); renderBattle(); }

        const dotP = applyStatusDot(p);
        const dotW = applyStatusDot(wild);
        if(dotP || dotW){
            const parts=[];
            if(dotP) parts.push(`${MonsterUtil.species(p).name} 因為${STATUS_META[dotP.statusId].name}受到 ${dotP.dmg} 傷害!`);
            if(dotW) parts.push(`${MonsterUtil.species(wild).name} 因為${STATUS_META[dotW.statusId].name}受到 ${dotW.dmg} 傷害!`);
            log(parts.join(' '));
            renderBattle();
        }

        if(currentWeather && currentWeather.id==='sandstorm'){
            const sandCureMsgs = [];
            if(MonsterUtil.species(p).passive==='sandstormCure' && p.status){ sandCureMsgs.push(`${MonsterUtil.species(p).name} 被風沙淨化,解除了${STATUS_META[p.status].name}!`); p.status=null; playCureAnim('playerCanvas'); }
            if(MonsterUtil.species(wild).passive==='sandstormCure' && wild.status){ sandCureMsgs.push(`${MonsterUtil.species(wild).name} 被風沙淨化,解除了${STATUS_META[wild.status].name}!`); wild.status=null; playCureAnim('wildCanvas'); }
            if(sandCureMsgs.length){ log(sandCureMsgs.join(' ')); renderBattle(); }
        }

        if(wild.hp <= 0){
            const deathMsg = triggerDeathPassives(wild, p);
            if(deathMsg) log(deathMsg);
            winBattle();
            return;
        }

        if(p.hp <= 0){
            const deathMsg = triggerDeathPassives(p, wild);
            if(deathMsg) log(deathMsg);                
            
            p.bond = Math.max(0, (p.bond || 0) - 5);
            log(`${MonsterUtil.species(p).name} 倒下了... (友好下降)`);
            
            const next = party.findIndex(m=>m.hp>0);
            if(next === -1){
                const lost = Math.round(GameState.player.coins * 0.2); GameState.player.coins -= lost; updateCoinsHud();
                setTimeout(()=>{ endBattle(`你的隊伍全滅了,損失了 💰${lost} 金幣,已為你恢復血量。`); }, 1200);
            } else {
                setTimeout(() => {
                    log('請選擇下一隻上場的怪獸！');
                    openBattleSwapUI(true); 
                }, 1200);
            }
        } else {
            showBattleControls();
        }
    },
        // ----------------------------------------------------
    // 下面是原本全域的結束與輔助戰鬥邏輯，已成功收編！
    // ----------------------------------------------------

    // 處理戰鬥勝利結算
    winBattle: function() {
        ensureDailyFresh();
        dailyProgress.battles++;
        GameState.player.totalWins = (GameState.player.totalWins || 0) + 1;
// 從 BattleManager 抓取當前戰鬥資訊
        const isTrainer = this.state.isTrainerBattle;
        const currentTrainer = this.state.trainerData;
        let wild = this.state.enemy;

        // 🌪️ 🌑 結算前的羈絆掃描 (風系加全隊經驗、暗系加金幣)
        let extraGoldMult = 1.0;
        let windExpMult = 1.0;
        party.forEach(m => {
            if (m.hp > 0) {
                const sp = MonsterUtil.species(m);
                const tier = getBondTier(m.bond);
                if (sp.type === 'dark' && tier > 0) extraGoldMult += (0.1 * tier); // 最高 +30% 金幣
                if (sp.type === 'wind' && tier > 0) windExpMult = Math.max(windExpMult, 1 + 0.03 * tier); // 最高 +9% 全隊經驗
            }
        });

        const diversity = (typeof calculateTypeDiversityBonus === 'function') ? calculateTypeDiversityBonus() : null;
        const diversityExpMult = diversity ? diversity.expMult : 1;
        const diversityCoinMult = (diversity && isTrainer) ? diversity.coinMult : 1;

        const bonus = isTrainer ? 1.4 : 1.0;
        const baseExp = Math.round((10 + wild.level*4) * bonus * windExpMult * diversityExpMult); // 套用風系全隊加成+屬性多樣性加成
        const coinGain = Math.round((5 + wild.level*2) * bonus * extraGoldMult * diversityCoinMult); // 套用暗系金幣加成+屬性多樣性加成(僅訓練家戰鬥)
        
        GameState.player.coins += coinGain;
        GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + coinGain; // 🌟 歷史總金幣紀錄
        let scavengeMsg = '';
        if(party.some(m => m.hp > 0 && MonsterUtil.passive(m) === 'scavenger') && Math.random() < 0.3){
            const extraCoins = Math.round(wild.level * 3);
            GameState.player.coins += extraCoins;
            
            // 👇 新增：尋寶找到的也要算進總收入
            GameState.player.totalEarnedCoins = (GameState.player.totalEarnedCoins || 0) + extraCoins;
            scavengeMsg = ` 尋寶發現了額外的 💰${extraCoins}！`;
        }
        updateCoinsHud();
        let firstMsg = `${MonsterUtil.species(wild).name} 被擊倒了!獲得 ${coinGain} 金幣。` + scavengeMsg;
        const extraMsgs = [];

            party.forEach((m,i)=>{
            if(m.hp<=0) return; 
            
// 👇 🌟 戰勝存活：依心情給予友好度
            let winBondGain = (m.mood === 'want_fight') ? 4 : 2;
            m.bond = Math.min(400, (m.bond || 0) + winBondGain);            
            let gain = i===GameState.party.activeIndex ? baseExp : Math.round(baseExp*0.5);
            // ✨ 光系羈絆共鳴：自身經驗值加成
    const pTier = getBondTier(m.bond);
    if (MonsterUtil.species(m).type === 'light' && pTier > 0) {
        gain = Math.round(gain * (1 + 0.1 * pTier)); // 最高額外 +30% 經驗
    }
            if(MonsterUtil.species(m).passive==='expBoost') gain = Math.round(gain*1.3); 
            if(!m.itemDisabled && heldItemDef(m)?.expBoost) gain = Math.round(gain * heldItemDef(m).expBoost);
            m.exp += gain;
            let leveled = false;
            const events = [];
            while(m.exp >= m.level*20){
                m.exp -= m.level*20;
                m.level++;
                m.bond = Math.min(400, (m.bond || 0) + 2);
                let spNow = MonsterUtil.species(m);
                let stats = computeStats(spNow, m.level, m.iv, m.bond);
                m.maxHp = stats.maxHp; m.atk = stats.atk; m.def = stats.def;
                m.hp = m.maxHp;
                leveled = true;
// 🌟 新版升級學習邏輯 (直接送回憶區)
                LEARNSET.filter(ls=> ls.level===m.level && (!ls.typeFilter || spNow.type===ls.typeFilter) && (!ls.speciesFilter || m.speciesId===ls.speciesFilter)).forEach(ls=>{
                    if(m.moves.includes(ls.moveId) || m.moveHistory.includes(ls.moveId)) return;
                    
                    m.moveHistory.push(ls.moveId); // 不管怎樣都加入歷史清單
                    if(m.moves.length < 4){
                        m.moves.push(ls.moveId);
                        events.push(`學會了${moveDisplayName(ls.moveId,m)}!`);
                    } else {
                        events.push(`領悟了${moveDisplayName(ls.moveId,m)}(可找回憶師替換)`);
                    }
                });                
// 🌟 新版萬能進化判定引擎
                let evolvedToId = null;

                // 1. 檢查是否有自訂的特殊進化邏輯 (多條件判定)
                if (spNow.evolutions) {
                    for (let evo of spNow.evolutions) {
                        if (m.level >= evo.level) {
                            let canEvolve = true;
                            if (evo.reqBond && (m.bond || 0) < evo.reqBond) canEvolve = false;
                            if (evo.reqWeather && (typeof WeatherManager !== 'undefined') && WeatherManager.getOverworldWeather(GameState.player.mapId) !== evo.reqWeather) canEvolve = false;
                            if (evo.reqItem && (GameState.inventory[evo.reqItem] || 0) <= 0) canEvolve = false;
                            if (evo.reqMap && !evo.reqMap.includes(GameState.player.mapId)) canEvolve = false;
                            if (evo.reqStat) {
                                if (evo.reqStat === 'atk>def' && m.atk <= m.def) canEvolve = false;
                                if (evo.reqStat === 'def>=atk' && m.def < m.atk) canEvolve = false;
                            }
                            if (evo.reqSteps && (GameState.player.totalSteps || 0) < evo.reqSteps) canEvolve = false;
                            if (evo.reqStatus && m.status !== evo.reqStatus) canEvolve = false;
                            if (evo.reqMove && (!m.moves.includes(evo.reqMove) && !(m.moveHistory||[]).includes(evo.reqMove))) canEvolve = false;
                            if (evo.reqResonance && (typeof calculatePartyResonance === 'undefined' || !calculatePartyResonance().active.some(a => a.catId === SHAPE_CATEGORIES[spNow.shape]))) canEvolve = false;

                            if (canEvolve) {
                                evolvedToId = evo.to;
                                // 若設定為消耗道具進化，則扣除道具
                                if (evo.consumeItem) GameState.inventory[evo.reqItem]--;
                                break; // 找到第一個符合條件的型態就跳出
                            }
                        }
                    }
                } 
                // 2. 兼容舊版的單一等級進化
                else if (spNow.evolvesTo && m.level >= spNow.evolveLevel) {
                    evolvedToId = spNow.evolvesTo;
                }

                // 🌟 執行進化處理
                if (evolvedToId) {
                    const newSp = SPECIES.find(s => s.id === evolvedToId);
                    m.speciesId = newSp.id;
                    dex.add(newSp.id); seenDex.add(newSp.id);
                    
                    const newStats = computeStats(newSp, m.level, m.iv);
                    m.maxHp = newStats.maxHp; m.atk = newStats.atk; m.def = newStats.def; 
                    m.hp = m.maxHp; // 進化後恢復體力
                    m.status = null; // 進化時解除異常狀態
                    
                    events.push(`✨進化成了${newSp.name}!`);
                    spNow = newSp; // 更新當前迴圈的物種基準，避免錯誤
                }            }
            const sp = MonsterUtil.species(m);
            const line = `${sp.name} 獲得 ${gain} 經驗值!` + (leveled?` 升到了 Lv.${m.level}!`:'') + events.join(' ');
            if(i===GameState.party.activeIndex) firstMsg += line; else extraMsgs.push(line);
        });
        log(firstMsg);
        if(extraMsgs.length>0){
            setTimeout(()=> log(extraMsgs.join(' ')), 1400);
        }
        updateHud();

if(isTrainer && trainerTeamQueue.length>0){
            setTimeout(()=>{
                const nextMon = trainerTeamQueue.shift();
                this.state.enemy = nextMon; // 更新 BM 狀態
                wild = nextMon; // 相容全域
                seenDex.add(nextMon.speciesId);
                
                let msg = `${currentTrainer.name} 派出了 ${MonsterUtil.species(nextMon).name}(Lv.${nextMon.level})!`;
                
                // 🌟 修正：敵方觸發上場特性 (如威嚇)
                const p = party[GameState.party.activeIndex];
                const entryRes = runPassiveEvent('onEntry', nextMon, p);
                if (entryRes && entryRes.messages && entryRes.messages.length > 0) {
                    msg += ' ' + entryRes.messages.join(' ');
                }
                
                log(msg);
                renderBattle();
                showBattleControls();
            }, 2000);
            return;
        }
                if(isTrainer && trainerTeamQueue.length===0){
            trainersDefeated.add(currentTrainer.id);
            if(currentTrainer.id === 'boss_origindra'){
                setTimeout(()=>{ log(`✨ 始源龍認可了你的實力！請開啟【任務(Q)】介面領取牠！`); }, 2000);
                setTimeout(()=> this.endBattle(null), 4500);
                return;
            }
            setTimeout(()=>{ log(currentTrainer.winMsg || `擊敗了 ${currentTrainer.name}!下次還可以再挑戰。`); }, 2000);
            setTimeout(()=> this.endBattle(null), 3600);
            return;
        }
        setTimeout(()=> this.endBattle(null), 2200);
    },

    // 處理戰鬥結束收尾
    endBattle: function(deathMsg) {
        inBattle = false;
        overlayOpen = null; // 🌟 關鍵修正 1：清空彈窗狀態，解除地圖方向鍵的鎖定
        focusList = [];     // 🌟 關鍵修正 2：清空鍵盤焦點，避免殘留
        document.getElementById('battleOverlay').style.display = 'none';        
        // 清除 BM 狀態與全域變數
        this.state.enemy = null;
        this.state.isTrainerBattle = false;
        this.state.trainerData = null;
        wild = null; 
        currentTrainer = null; 
        trainerTeamQueue = [];
        const moodPool = ['normal', 'normal', 'hungry', 'want_fight', 'want_fight_2'];
        
        // 重置隊伍戰鬥狀態
        party.forEach(m=>{ 
            m.status=null; m.currentType=undefined; m.atkMult=undefined; 
            m.defMult=undefined; m.heldItemUsedThisBattle=false; 
            m.hotTurns=0; m.itemDisabled=false; m.healBlockTurns=0; 
            m.accDebuff=0; m.lastMoveMissed=false; m.honeMissCount=0;
            m.moveUses={}; 
            m.damageImmunity = false; 
            m.isCharging = false;
            m.rechargeTurns = 0;
            m.mood = moodPool[Math.floor(Math.random() * moodPool.length)];
            m.intimidateStacks = 0; // 🌟 新增這行：重置威嚇層數
        });
        if (wild) wild.intimidateStacks = 0;
       document.getElementById('btnCatch').disabled=false;
        hideBattleControls();
        if(deathMsg){ party.forEach(m=> m.hp=m.maxHp); toast(deathMsg); }
        updateHud(); SaveManager.save();

        // 👇 🌟 創世巨樹：彩虹奇蹟判定 (戰鬥結束後立刻檢查)
        if (GameState.world.woodGodTrial) {
            GameState.world.woodGodTrial = false; // 判定完立刻重置標記
            
// 🌟 關鍵修正 3：加入 typeof 判定，避免 currentWeather 從未觸發過而報錯當機
            if (!deathMsg && typeof currentWeather !== 'undefined' && currentWeather && currentWeather.id === 'rainbow') {
                setTimeout(() => {
                    alert('🌈 戰鬥中引發的彩虹光芒，照亮了枯萎的聖壇...\n\n神樹吸收了彩虹的奇蹟之力，創世巨樹拔地而起！');
                    triggerWoodGodBattle(); // 召喚神獸！
                }, 1000);
            }
        }
    },
        // 處理更換怪獸
    doSwap: function(newIndex) {
        hideBattleControls();
        const oldMon = party[GameState.party.activeIndex];
        const oldName = MonsterUtil.species(oldMon).name;
        
        GameState.party.activeIndex = newIndex;
        
        const newMon = party[GameState.party.activeIndex];
        newMon.hasDealtFirstDamage = false;
        const newName = MonsterUtil.species(newMon).name;
        
        let msg = `收回了 ${oldName},派出 ${newName}!`;
// 🌟 修正：觸發上場特性 (包含威嚇、天氣呼喚等)
        const entryRes = runPassiveEvent('onEntry', newMon, this.state.enemy);
        if (entryRes && entryRes.messages && entryRes.messages.length > 0) {
            msg += ' ' + entryRes.messages.join(' ');
        }        
        log(msg);
        renderBattle();
        setTimeout(enemyTurn, 900); // 這裡依然會呼叫你全域包裝好的 enemyTurn
    }
    
};//battlemanager end
// ==========================================
// 🛡️ 戰鬥介面控制器：動態隱藏/顯示選單
// ==========================================
function hideBattleControls(msg = '請稍候…') {
    document.getElementById('actionGrid').style.display = 'none';
    const moveListEl = document.getElementById('moveList');
    if (moveListEl) moveListEl.style.display = 'none';
    
    const swapListEl = document.getElementById('swapList');
    if (swapListEl) swapListEl.style.display = 'none';

    // 顯示隱形盾牌，並設定文字 (如果你按捕捉，就會顯示「請稍候…」，不再是「對方行動中」)
    const blocker = document.getElementById('controlsBlocker');
    if (blocker) {
        blocker.style.display = 'flex';
        blocker.textContent = msg;
    }
}
