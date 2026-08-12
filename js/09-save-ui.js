// ============================================================
// 09-save-ui.js — 存檔系統(版本/存檔格畫面)、初始怪物選擇、遊戲主流程初始化
// 此檔案為 script.js 依邏輯區塊拆分而成,執行順序不可更動
// ============================================================

// =========================================================
// 🛠️ 改造區 I:存檔版本號 🛠️
// 每次存檔格式有調整(新增欄位、改變資料結構)就把 SAVE_VERSION 加1,
// 不同版本的相容轉換直接寫在 SaveManager.load() 裡處理,
// 讀檔時不管存檔是哪個版本存的,都會走同一套安全的轉換流程。
// =========================================================
const SAVE_VERSION = 4;

document.getElementById('retrySaveBtn').onclick = ()=> SaveManager.save(true);
document.getElementById('manualSaveBtn').onclick = ()=>{
  if(inBattle){ toast('戰鬥中無法手動存檔'); return; }
  if(!currentSlot){ toast('目前沒有載入中的存檔'); return; }
  toast('💾 手動存檔中…');
  SaveManager.save(true);
};
document.getElementById('autoSaveToggle').onchange = (e)=>{
  autoSaveEnabled = e.target.checked;
  toast(autoSaveEnabled ? '✅ 自動存檔已開啟' : '⏸ 自動存檔已關閉(仍可手動存檔)');
};
document.getElementById('exportLiveBtn').onclick = ()=>{
  if(inBattle){ toast('戰鬥中無法匯出存檔'); return; }
  if(!party.length){ toast('目前沒有可以匯出的進度'); return; }
  
  // 1. 強制存檔一次，確保匯出的資料是最新的
  SaveManager.save(true);
  
  // 2. 透過標準的 SaveManager 產生代碼
  const code = 'MQSAVE-' + SaveManager.export();
  
  // 3. 彈出簡單乾淨的系統視窗讓玩家複製 (不會干擾背景遊戲畫面)
  prompt('📦 這是你目前的進度代碼，請全選並「複製」：\n(之後可以在遊戲最一開始的選單點擊「匯入」來接續遊玩)', code);
};
async function renderSlotScreen(){
  const list = document.getElementById('slotList');
  list.innerHTML = '讀取中...';
  const summaries = await Promise.all(SLOT_KEYS.map(async key=>{
    try{
      const res = await window.storage.get(key);
      return res && res.value ? JSON.parse(res.value) : null;
    }catch(e){ return null; }
  }));
  list.innerHTML='';
  
  summaries.forEach((data, i) => {
    const wrap = document.createElement('div');
    const btn = document.createElement('button');
    btn.className='actBtn slotBtn';
    
    // 🌟 修正 1：精準抓取新版存檔的隊伍資料 (支援壓縮版代碼)
    let partyList = [];
    if (data && data.party && Array.isArray(data.party.active)) {
        partyList = data.party.active;
    } else if (data && Array.isArray(data.party)) {
        partyList = data.party; // 相容極早期的舊存檔
    }

    const hasData = partyList.length > 0;

    if(hasData){
      const lead = partyList[0];
      // 新版存檔代碼會有壓縮過 (lead.s) 與未壓縮 (lead.speciesId) 的情況
      const spId = lead.s || lead.speciesId; 
      const spLvl = lead.l || lead.level;
      const sp = SPECIES.find(s => s.id === spId);
      
      // 🌟 修正 2：精準抓取新版存檔的地圖資料
      const mapId = (data.player && data.player.mapId) ? data.player.mapId : data.mapId;
      const mapName = (WORLDS[mapId] || WORLDS.map1).name;
      
      btn.innerHTML = `存檔 ${i+1}<br><span style="font-size:10px;color:#9aa5ce;">${sp?sp.name:'?'} Lv.${spLvl} ・隊伍${partyList.length}隻 ・${mapName}</span>`;
    } else {
      btn.innerHTML = `存檔 ${i+1}<br><span style="font-size:10px;color:#666;">空白存檔 - 開始新遊戲</span>`;
    }
    
btn.onclick = async () => {
    currentSlot = SLOT_KEYS[i]; // 記錄玩家選了哪一格

    if (hasData) {
        // 📂 情況 A：有存檔資料 ➡️ 直接讀檔並進入地圖
        SaveManager.load(data);
        document.getElementById('saveScreen').style.display = 'none';

        // 啟動遊戲 (根據你的程式碼，可能是以下這幾行)
        updateHud();
        drawMap();
        started = true; 
    } else {
        // ✨ 情況 B：空存檔 (新遊戲) ➡️ 關閉存檔畫面，打開選怪畫面
        document.getElementById('switchSlotBtn').style.display = 'none';
        document.getElementById('saveScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';

        // (可選) 確保這是一個乾淨的新進度
        GameState.party.active = [];
        GameState.player.coins = 60;
    }
};
    wrap.appendChild(btn);
    
    const btnRow = document.createElement('div');
    btnRow.style.cssText='display:flex;gap:6px;margin-top:4px;';
    
    if(hasData){
      const del = document.createElement('button');
      del.className='smallDelBtn';
      del.textContent='刪除';
      del.onclick = async (ev)=>{
        ev.stopPropagation();
        if(!confirm(`確定刪除存檔 ${i+1} 嗎?這無法復原。`)) return;
        await window.storage.delete(SLOT_KEYS[i]);
        renderSlotScreen();
      };
      btnRow.appendChild(del);
      
      const exp = document.createElement('button');
      exp.className='smallDelBtn';
      exp.textContent='匯出(轉移用)';
      exp.onclick = (ev)=>{ ev.stopPropagation(); openExport(i, data); };
      btnRow.appendChild(exp);
    }
    
    const imp = document.createElement('button');
    imp.className='smallDelBtn';
    imp.textContent='匯入(貼上舊存檔)';
    // 🌟 修正 3：傳遞真正的鑰匙名稱 (SLOT_KEYS[i]) 給 openImport
    imp.onclick = (ev)=>{ ev.stopPropagation(); openImport(SLOT_KEYS[i]); };
    btnRow.appendChild(imp);
    
    wrap.appendChild(btnRow);
    list.appendChild(wrap);
  });
}
// ---------- 存檔匯出 / 匯入(用來把進度轉移到未來的新版本)----------
// 匯出隻包含最基本的進度:怪物種類與等級、道具、金幣、神獸是否已取得。
// 匯入後,怪物的技能一律用當時版本的規則重新套用初始技能,不會保留原本學到的招式。
// ==========================================
// 🔄 匯出 / 匯入 / 存檔槽位控制介面
// ==========================================
// ==========================================
// ✈️ 神秘旅人 & 存檔通信系統
// ==========================================

// 🌟 1. 括號內記得加上 npc
function renderTravelerScreen(npc) {
    GameState.party.traveler = GameState.party.traveler || [];
    const overlay = document.getElementById('exportImportOverlay');
    overlay.innerHTML = ''; 
    overlay.style.display = 'flex';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e; border:2px solid #9aa5ce; padding:20px; width:90%; max-width:400px; text-align:center; border-radius:8px; max-height:80vh; overflow-y:auto;';
    
    // 🌟 2. 動態判斷：如果有傳入 NPC，就顯示他的名字，否則顯示預設名稱
    const titleName = npc ? npc.name : '神秘旅人 & 代碼系統';
    
    box.innerHTML = `<h3 style="color:var(--gold);margin:0 0 10px;">✈️ ${titleName}</h3>
    <p style="font-size:12px;color:#9aa5ce;margin-bottom:15px;line-height:1.4;">寄放怪獸在旅人處。當你產生代碼分享給朋友時，他們就能與你的旅人進行怪獸交換！</p>`;

    // ... (底下完全保留你原本的程式碼)
    // 🌟 旅人寄放區
    const slotsDiv = document.createElement('div');
    slotsDiv.style.cssText = 'display:flex; gap:15px; justify-content:center; margin-bottom:20px;';
    
    for(let i=0; i<2; i++) {
        const mon = GameState.party.traveler[i];
        const slot = document.createElement('div');
        slot.style.cssText = 'border:2px dashed #666; width:90px; height:90px; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; background:rgba(0,0,0,0.3); transition:all 0.2s;';
        slot.onmouseover = ()=> slot.style.borderColor = 'var(--gold)';
        slot.onmouseout = ()=> slot.style.borderColor = '#666';

        if(mon) {
            const sp = MonsterUtil.species(mon);
            const c = document.createElement('canvas'); c.width=50; c.height=50;
            drawMonster(c.getContext('2d'), sp, 50, 50, mon.altColor);
            slot.appendChild(c);
            const nameLabel = document.createElement('div');
            nameLabel.style.cssText = 'font-size:11px; margin-top:4px; font-weight:bold;';
            nameLabel.textContent = `Lv.${mon.level}`;
            slot.appendChild(nameLabel);
            
            slot.onclick = () => {
                if(!confirm(`要取回 ${sp.name} 嗎？`)) return;
                if(party.length < 4) party.push(mon);
                else storageBox.push(mon);
                GameState.party.traveler.splice(i, 1);
                SaveManager.save();
                renderTravelerScreen();
            };
        } else {
            slot.innerHTML = '<span style="color:#666;font-size:28px;">+</span><div style="font-size:10px;color:#666;margin-top:4px;">點擊寄放</div>';
            slot.onclick = () => showMonsterSelectorForTraveler();
        }
        slotsDiv.appendChild(slot);
    }
    box.appendChild(slotsDiv);

    // 🌟 產生/輸入代碼按鈕
    const genBtn = document.createElement('button');
    genBtn.className = 'actBtn';
    genBtn.style.cssText = 'width:100%; margin-bottom:10px; font-size:14px; padding:10px;';
    genBtn.textContent = '📤 產生進度代碼 (複製)';
    genBtn.onclick = () => {
        const code = 'MQSAVE-' + SaveManager.export();
        navigator.clipboard.writeText(code).then(()=>{ toast('已將代碼複製到剪貼簿！'); })
        .catch(()=>{ prompt('請手動複製以下代碼:', code); });
    };
    box.appendChild(genBtn);

    const impBtn = document.createElement('button');
    impBtn.className = 'actBtn';
    impBtn.style.cssText = 'width:100%; margin-bottom:15px; font-size:14px; padding:10px; background:#4a2c2c; border-color:#ff6b4a;';
    impBtn.textContent = '📥 輸入代碼 (讀檔/交換)';
    impBtn.onclick = () => {
        const code = prompt('請貼上朋友的代碼 (MQSAVE-...)');
        if(!code) return;
        const data = SaveManager.peek(code);
        if(!data) { toast('❌ 無效的代碼'); return; }
        showImportOptions(data, code);
    };
    box.appendChild(impBtn);

    const closeBtn = document.createElement('button');
    // 🌟 改成這樣：徹底呼叫 closeOverlays 釋放遊戲的控制權
    closeBtn.onclick = () => { closeOverlays(); }; 
    box.appendChild(closeBtn);
}

// 🌟 選擇寄放怪獸介面
function showMonsterSelectorForTraveler() {
    const overlay = document.getElementById('exportImportOverlay');
    overlay.innerHTML = ''; 
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e; border:2px solid #9aa5ce; padding:20px; width:90%; max-width:400px; text-align:center; border-radius:8px; max-height:80vh; overflow-y:auto;';
    box.innerHTML = `<h3 style="color:var(--gold);margin:0 0 15px;">選擇要寄放的怪獸</h3>`;
    
    const list = [...party, ...storageBox];
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;';
    
    list.forEach(m => {
        const sp = MonsterUtil.species(m);
        const btn = document.createElement('button');
        btn.className = 'actBtn';
        btn.style.cssText = 'display:flex; flex-direction:column; align-items:center; padding:10px;';
        const c = document.createElement('canvas'); c.width=40; c.height=40;
        drawMonster(c.getContext('2d'), sp, 40, 40, m.altColor);
        btn.appendChild(c);
        btn.innerHTML += `<div style="font-size:11px; margin-top:6px;">Lv.${m.level} ${sp.name}</div>`;
        
        btn.onclick = () => {
            const idxP = party.indexOf(m);
            if(idxP > -1) {
                if(party.length === 1) { toast('必須保留至少一隻先發怪獸!'); return; }
                party.splice(idxP, 1);
            } else { storageBox.splice(storageBox.indexOf(m), 1); }
            GameState.party.traveler.push(m);
            SaveManager.save(); renderTravelerScreen();
        };
        grid.appendChild(btn);
    });
    box.appendChild(grid);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'actBtn backBtn'; cancelBtn.style.width = '100%'; cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => renderTravelerScreen();
    box.appendChild(cancelBtn);
    overlay.appendChild(box);
}

// 🌟 輸入代碼後的分歧選擇
function showImportOptions(data, rawCode) {
    const overlay = document.getElementById('exportImportOverlay');
    overlay.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e; border:2px solid #9aa5ce; padding:20px; width:90%; max-width:350px; text-align:center; border-radius:8px;';
    
    box.innerHTML = `<h3 style="color:var(--gold);margin:0 0 15px;">讀取代碼成功</h3>
    <p style="font-size:12px;color:#9aa5ce;margin-bottom:20px;">這是一份有效的遊戲進度。你要完全覆蓋目前的遊戲，還是與此代碼中的旅人交換怪獸？</p>`;

    const loadBtn = document.createElement('button');
    loadBtn.className = 'actBtn'; loadBtn.style.cssText = 'width:100%; margin-bottom:10px; padding:10px;';
    loadBtn.textContent = '💾 覆蓋並讀取此進度';
    loadBtn.onclick = () => {
        if(!confirm("警告：這將會完全覆蓋你目前的遊戲進度！確定嗎？")) return;
        SaveManager.import(rawCode); overlay.style.display = 'none';
        updateHud(); renderMap(); toast('讀檔成功！');
    };
    box.appendChild(loadBtn);

    const tradeBtn = document.createElement('button');
    tradeBtn.className = 'actBtn'; tradeBtn.style.cssText = 'width:100%; margin-bottom:15px; padding:10px; background:#4a2c2c; border-color:#ff6b4a;';
    tradeBtn.textContent = '🔄 進行靈魂交換';
    tradeBtn.onclick = () => renderTradeScreen(data);
    box.appendChild(tradeBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'actBtn backBtn'; cancelBtn.style.width = '100%'; cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => renderTravelerScreen();
    box.appendChild(cancelBtn);
    overlay.appendChild(box);
}

// 🌟 核心：靈魂交換儀式 UI
function renderTradeScreen(foreignData) {
    const overlay = document.getElementById('exportImportOverlay');
    overlay.innerHTML = '';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1a1a2e; border:2px solid #ff6b4a; padding:15px; width:90%; max-width:450px; text-align:center; border-radius:8px; max-height:85vh; overflow-y:auto;';
    
    box.innerHTML = `<h3 style="color:#ff6b4a;margin:0 0 10px;">🔄 靈魂交換儀式</h3>
    <p style="font-size:11px;color:#9aa5ce;margin-bottom:15px;line-height:1.4;">選擇一隻旅人的怪獸，再選擇一隻你的怪獸。<br><b style="color:var(--gold);">旅人怪獸將會繼承你原本怪獸的等級與友好度！</b></p>`;

    // 防呆：如果代碼沒寄放旅人，抓對方隊伍前兩隻
    let foreignMons = foreignData.party?.traveler || [];
    if(foreignMons.length === 0) foreignMons = (foreignData.party?.active || []).slice(0, 2);

    let selectedForeign = null; let selectedMine = null;

    // --- 上半部：旅人怪獸 ---
    const topDiv = document.createElement('div');
    topDiv.style.cssText = 'border:1px solid #444; border-radius:6px; padding:10px; margin-bottom:10px; background:rgba(0,0,0,0.3);';
    topDiv.innerHTML = '<div style="font-size:12px; color:#ffb347; margin-bottom:8px;">1. 選擇想要的旅人怪獸</div>';
    
    const fGrid = document.createElement('div');
    fGrid.style.cssText = 'display:flex; gap:10px; justify-content:center;';
    foreignMons.forEach(fm => {
        const sp = MonsterUtil.species(fm);
        const btn = document.createElement('button');
        btn.className = 'actBtn'; btn.style.cssText = 'display:flex; flex-direction:column; align-items:center; padding:8px; width:90px; border-color:#444;';
        const c = document.createElement('canvas'); c.width=40; c.height=40;
        drawMonster(c.getContext('2d'), sp, 40, 40, fm.altColor);
        btn.appendChild(c);
        btn.innerHTML += `<div style="font-size:11px; margin-top:4px;">Lv.${fm.level}<br>${sp.name}</div>`;
        
        btn.onclick = () => {
            Array.from(fGrid.children).forEach(b => b.style.borderColor = '#444');
            btn.style.borderColor = '#ff6b4a';
            selectedForeign = fm; checkTradeReady();
        };
        fGrid.appendChild(btn);
    });
    topDiv.appendChild(fGrid); box.appendChild(topDiv);

    // --- 下半部：你的怪獸 ---
    const botDiv = document.createElement('div');
    botDiv.style.cssText = 'border:1px solid #444; border-radius:6px; padding:10px; margin-bottom:15px; background:rgba(0,0,0,0.3); max-height:200px; overflow-y:auto;';
    botDiv.innerHTML = '<div style="font-size:12px; color:#9aa5ce; margin-bottom:8px;">2. 選擇你要交出去的怪獸 (提供等級與羈絆)</div>';
    
    const mGrid = document.createElement('div');
    mGrid.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px;';
    
    const myRefs = [];
    party.forEach((m, i) => myRefs.push({m, list: party, idx: i}));
    storageBox.forEach((m, i) => myRefs.push({m, list: storageBox, idx: i}));

    myRefs.forEach(ref => {
        const sp = MonsterUtil.species(ref.m);
        const btn = document.createElement('button');
        btn.className = 'actBtn'; btn.style.cssText = 'display:flex; align-items:center; padding:4px; border-color:#444; text-align:left;';
        const c = document.createElement('canvas'); c.width=30; c.height=30;
        drawMonster(c.getContext('2d'), sp, 30, 30, ref.m.altColor);
        btn.appendChild(c);
        btn.innerHTML += `<div style="font-size:10px; margin-left:6px;"><b>${sp.name}</b><br>Lv.${ref.m.level} / 絆:${ref.m.bond||0}</div>`;
        
        btn.onclick = () => {
            Array.from(mGrid.children).forEach(b => b.style.borderColor = '#444');
            btn.style.borderColor = 'var(--gold)';
            selectedMine = ref; checkTradeReady();
        };
        mGrid.appendChild(btn);
    });
    botDiv.appendChild(mGrid); box.appendChild(botDiv);

    // --- 確認交換按鈕 ---
    const actBtn = document.createElement('button');
    actBtn.className = 'actBtn'; actBtn.style.cssText = 'width:100%; margin-bottom:10px; padding:10px; background:#2c3e50; color:#aaa; font-size:14px;';
    actBtn.textContent = '請先選擇雙方怪獸'; actBtn.disabled = true;
    box.appendChild(actBtn);

    const checkTradeReady = () => {
        if(selectedForeign && selectedMine) {
            actBtn.disabled = false; actBtn.style.background = '#4a2c2c'; actBtn.style.color = '#fff';
            actBtn.style.borderColor = '#ff6b4a'; actBtn.textContent = '✨ 確認進行靈魂交換！';
        }
    };

    actBtn.onclick = () => {
        const m = selectedMine.m; const fm = selectedForeign;
        if(!confirm(`確定要將 ${MonsterUtil.species(m).name} 的靈魂(等級/友好度)轉移給 ${MonsterUtil.species(fm).name} 嗎？\n(你原本的怪獸將會永遠離開)`)) return;

        // 🌟 靈魂轉移核心：新怪獸繼承原本的心血！
        fm.level = m.level; fm.exp = m.exp; fm.bond = m.bond || 0;
        
        // 重新計算新怪獸的能力值
        const fmSp = MonsterUtil.species(fm);
        Object.assign(fm, computeStats(fmSp, fm.level, fm.iv));
        
        // 將新怪獸取代原本的位置
        selectedMine.list[selectedMine.idx] = fm;
        
        dex.add(fm.speciesId); seenDex.add(fm.speciesId);
        toast(`✨ 靈魂交換成功！旅人的 ${fmSp.name} 加入了，並完美繼承了 Lv.${fm.level} 的羈絆！`);
        SaveManager.save(); overlay.style.display = 'none'; updateHud();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'actBtn backBtn'; cancelBtn.style.width = '100%'; cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => renderTravelerScreen();
    box.appendChild(cancelBtn);
    overlay.appendChild(box);
}

let eiTargetSlot = null;

document.getElementById('eiCopyBtn').onclick = async ()=>{
  const ta = document.getElementById('eiTextarea');
  ta.select();
  try { 
      await navigator.clipboard.writeText(ta.value); 
      toast('✅ 已複製到剪貼簿!'); 
  } catch(e) { 
      toast('複製失敗,請手動全選後自行複製'); 
  }
};

// 🌟 瘦身超過 40 行的匯入按鈕核心！
document.getElementById('eiImportBtn').onclick = async ()=>{
  const text = document.getElementById('eiTextarea').value.trim();
  if(!text) return;
  
  // 1. 交給 SaveManager 處理所有複雜的解析、相容與寫入
  const success = SaveManager.import(text);
  
  if (success) {
      currentSlot = SLOT_KEYS[eiTargetSlot];
      
      // 2. 準備地圖資料
      MAP = WORLDS[GameState.player.mapId].tiles;
      TRAINERS = WORLDS[GameState.player.mapId].trainers;
      MAP_W = MAP[0].length;
      MAP_H = MAP.length;
      
      // 3. 更新畫面與介面
      document.getElementById('exportImportOverlay').style.display = 'none';
      document.getElementById('saveScreen').style.display = 'none';
      
      drawMap();
      updateHud(); 
      updateCoinsHud(); 
      document.getElementById('hudPos').textContent = `位置: (${GameState.player.x}, ${GameState.player.y}) ・ ${WORLDS[GameState.player.mapId].name}`;
      
      toast('✅ 匯入成功!');
      // 匯入成功後，立刻把資料存進這個槽位
      SaveManager.save(false); 
  } else {
      toast('❌ 匯入失敗，請確認存檔文字格式是否完整');
  }
};

document.getElementById('eiCloseBtn').onclick = ()=>{
  document.getElementById('exportImportOverlay').style.display = 'none';
};

document.getElementById('resetBtn').onclick = async ()=>{
  if(!currentSlot) return;
  if(!confirm('確定要清除目前這個存檔並重新開始嗎?這無法復原。')) return;
  try{ await window.storage.delete(currentSlot); }catch(e){}
  location.reload();
};

// ✅ 正確代碼：
document.getElementById('switchSlotBtn').onclick = ()=>{
  if(!confirm('切換存檔前,尚未經過「自動存檔」的變化不會保留,確定要切換嗎?')) return;
  location.reload();
};
// ---------- 啟動 ----------
(async function init(){
  await renderSlotScreen();
  document.getElementById('saveScreen').style.display='flex';
})();
