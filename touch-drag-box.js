// iPhoneでドラッグ選択ボックスを表示するだけのシンプルなコード

// 画面サイズ表示
function updateScreenSize() {
    const screenSize = document.getElementById('screenSize');
    if (screenSize) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        let deviceType = 'Desktop';
        if (width <= 414) deviceType = 'iPhone';
        else if (width <= 768) deviceType = 'Mobile';
        else if (width <= 1024) deviceType = 'Tablet';
        
        screenSize.innerHTML = `📀 ${width} × ${height}px (${deviceType})`;
    }
}

// デバッグ表示
function showDebug(message) {
    console.log('[Touch Drag]', message);
    
    // 画面上にも表示
    let debugDiv = document.getElementById('dragDebug');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'dragDebug';
        debugDiv.style.cssText = `
            position: fixed;
            top: 50px;
            left: 10px;
            background: rgba(0, 100, 255, 0.9);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1001;
        `;
        document.body.appendChild(debugDiv);
    }
    debugDiv.textContent = message;
}

// タッチドラッグで青い選択ボックスを表示
function enableTouchDragBox() {
    showDebug('初期化中...');
    
    const bodyView = document.querySelector('.body-view');
    if (!bodyView) {
        showDebug('body-view が見つかりません');
        return;
    }
    
    // 選択ボックスがなければ作成
    let selectionBox = document.getElementById('touchSelectionBox');
    if (!selectionBox) {
        selectionBox = document.createElement('div');
        selectionBox.id = 'touchSelectionBox';
        selectionBox.style.cssText = `
            position: absolute;
            border: 2px solid #4A90E2;
            background: rgba(74, 144, 226, 0.2);
            pointer-events: none;
            display: none;
            z-index: 999;
            box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
        `;
        bodyView.appendChild(selectionBox);
        showDebug('選択ボックス作成完了');
    }
    
    let isDragging = false;
    let startX, startY;
    
    // タッチ開始
    bodyView.addEventListener('touchstart', function(e) {
        // スクロールを防ぐ
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = bodyView.getBoundingClientRect();
        
        startX = touch.clientX - rect.left;
        startY = touch.clientY - rect.top;
        isDragging = true;
        
        // 選択ボックスの初期位置
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        selectionBox.style.display = 'block';
        
        showDebug(`ドラッグ開始: ${Math.round(startX)}, ${Math.round(startY)}`);
    }, { passive: false });
    
    // タッチ移動
    bodyView.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        // スクロールを防ぐ
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = bodyView.getBoundingClientRect();
        
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        // ボックスのサイズと位置を計算
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        const left = Math.min(currentX, startX);
        const top = Math.min(currentY, startY);
        
        // 選択ボックスを更新
        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';
        
        showDebug(`サイズ: ${Math.round(width)} × ${Math.round(height)}`);
    }, { passive: false });
    
    // タッチ終了
    bodyView.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        
        isDragging = false;
        
        // ボックスのサイズを取得
        const width = parseInt(selectionBox.style.width);
        const height = parseInt(selectionBox.style.height);
        
        showDebug(`ドラッグ終了: ${width} × ${height}px`);
        
        // 3秒後に選択ボックスを非表示
        setTimeout(() => {
            selectionBox.style.display = 'none';
            showDebug('ボックス非表示');
        }, 3000);
    });
    
    // タッチキャンセル
    bodyView.addEventListener('touchcancel', function() {
        isDragging = false;
        selectionBox.style.display = 'none';
        showDebug('タッチキャンセル');
    });
    
    showDebug('タッチドラッグ有効化完了');
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 画面サイズ表示
    if (!document.getElementById('screenSize')) {
        const screenSizeDiv = document.createElement('div');
        screenSizeDiv.id = 'screenSize';
        screenSizeDiv.className = 'screen-size';
        document.body.appendChild(screenSizeDiv);
    }
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    // 少し待ってから初期化（メインのHTMLが読み込まれるのを待つ）
    setTimeout(() => {
        enableTouchDragBox();
    }, 1000);
});