// ==========================================
// 📱 手機直式 UI：選單頁、底部分頁列、方向鍵長按
// 只「包裝」既有函式（closeOverlays、toggleRun），不改動原本的遊戲邏輯。
// ==========================================
(function(){
  const $ = id => document.getElementById(id);
  const menu = $('menuOverlay'), tabMenu = $('tabMenu');
  if(!menu || !tabMenu) return;

  let returnToMenu = false;   // 從選單進入的子面板，按「返回」時回到選單
  let userClose = false;      // 這次關閉是玩家按 B / Esc 造成的（而非遊戲程式內部呼叫）
  const markUserClose = () => { userClose = true; setTimeout(()=>{ userClose = false; }, 0); };
  const chartOpen = () => typeof typeChartOpen !== 'undefined' && typeChartOpen;
  const syncTab = () => tabMenu.classList.toggle('on', overlayOpen === 'menu');

  function openMenu(){
    overlayOpen = 'menu';
    menu.style.display = 'flex';
    SoundManager.menuOpen();
    syncTab();
  }

  // 包裝 closeOverlays：一併關閉選單與屬性圖，必要時回到選單
  const origClose = closeOverlays;
  window.closeOverlays = function(){
    const was = overlayOpen, chartWas = chartOpen();
    if(chartWas) toggleTypeChart();
    origClose.apply(this, arguments);
    menu.style.display = 'none';
    const back = userClose && returnToMenu && !inBattle && (chartWas || (was && was !== 'menu'));
    if(back){ returnToMenu = false; openMenu(); }
    else if(was !== 'menu'){ returnToMenu = false; }
    syncTab();
  };

  // 玩家按 B 鈕或 Esc → 標記為「玩家主動返回」
  $('dpadF').addEventListener('click', markUserClose, true);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') markUserClose(); }, true);

  // 分頁：選單（開／關）
  tabMenu.addEventListener('click', () => {
    if(!started || inBattle || isSaving) return;
    const wasMenu = overlayOpen === 'menu';
    returnToMenu = false;
    closeOverlays();
    if(!wasMenu) openMenu();
  });

  // 選單內任何按鈕（原本的 onclick 先執行完）→ 若面板已切走，就隱藏選單
  menu.addEventListener('click', e => {
    if(!e.target.closest('button')) return;
    if(overlayOpen !== 'menu' || chartOpen()){
      menu.style.display = 'none';
      returnToMenu = true;
      syncTab();
    }
  });

  // 分頁：走／跑 標籤（沿用原本的 toggleRun）
  const origRun = toggleRun;
  window.toggleRun = function(){
    origRun.apply(this, arguments);
    const b = $('quickG');
    if(b) b.innerHTML = '<i>' + (isRunning ? '🏃' : '🚶') + '</i>' + (isRunning ? '跑' : '走');
  };

  // 方向鍵：長按連續移動（只在地圖上；點一下仍是原本的單步）
  const DIRS = { dpadUp:[0,-1], dpadDown:[0,1], dpadLeft:[-1,0], dpadRight:[1,0] };
  Object.keys(DIRS).forEach(id => {
    const el = $(id), dx = DIRS[id][0], dy = DIRS[id][1];
    let delay = null, timer = null, repeated = false;
    const stop = () => { clearTimeout(delay); clearInterval(timer); delay = timer = null; };
    el.addEventListener('pointerdown', () => {
      repeated = false; stop();
      delay = setTimeout(() => {
        timer = setInterval(() => {
          if(inBattle || overlayOpen || isSaving){ stop(); return; }
          repeated = true;
          MapManager.handleDirectionInput(dx, dy);
        }, 130);
      }, 320);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev => el.addEventListener(ev, stop));
    el.addEventListener('click', e => { if(repeated){ repeated = false; e.stopImmediatePropagation(); } }, true);
    el.addEventListener('contextmenu', e => e.preventDefault());
  });

  // ---- 跟隨鏡頭（只在手機直式啟用；桌機維持整張地圖）----
  const mq = window.matchMedia ? window.matchMedia('(max-width:640px)') : { matches:false, addEventListener(){} };
  const wrap = $('gameWrap'), cvs = $('mapCanvas');
  let cols = 15, rows = 18, portrait = false;
  function applyView(){
    portrait = mq.matches;
    if(!portrait){
      if(cvs.width !== 680 || cvs.height !== 440){ cvs.width = 680; cvs.height = 440; }
    }else{
      const r = wrap.getBoundingClientRect();
      if(r.width < 50 || r.height < 50) return;
      cols = Math.max(11, Math.min(21, Math.round(r.width / 26) | 1));          // 每格約 26px，取奇數讓玩家置中
      rows = Math.max(9, Math.floor(r.height / (r.width / cols)));
      cvs.width = cols * TILE; cvs.height = rows * TILE;
    }
    if(started){ try{ drawMap(); }catch(_){} }
  }
  window.getCamera = function(){
    if(!portrait) return { x:0, y:0 };
    const axis = (p, n, v) => n <= v ? -(v - n) / 2 : Math.max(0, Math.min(n - v, p - Math.floor(v / 2)));
    return { x: axis(player.x, MAP_W, cols), y: axis(player.y, MAP_H, rows) };
  };
  if(mq.addEventListener) mq.addEventListener('change', applyView);
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(applyView, 120); });
  applyView();

  // ---- 戰鬥中隱藏操作區（用 CSS 判斷 body.in-battle；不改動戰鬥程式碼）----
  const battle = $('battleOverlay');
  if(battle && window.MutationObserver){
    const syncBattle = () => document.body.classList.toggle('in-battle', battle.style.display === 'flex');
    new MutationObserver(syncBattle).observe(battle, { attributes:true, attributeFilter:['style'] });
    syncBattle();
  }
})();
