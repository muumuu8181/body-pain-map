// iPhoneでドラッグ選択ボックス - 複数選択モード時のみ有効版
// Version: 0.30 - 複数選択モード時のみドラッグ、モードボタン上部配置

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
        
        screenSize.innerHTML = `📀 ${width} × ${height}px (${deviceType}) | v0.30`;
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

// モード切り替えボタンを上部に移動
function moveModeBtnsToTop() {
    // 既存のモードボタンを探す
    const modeToggle = document.querySelector('.mode-toggle');
    const personControl = document.querySelector('.control-group');
    
    if (modeToggle && personControl) {
        // 人物選択の前に移動
        personControl.parentNode.insertBefore(modeToggle, personControl);
        showDebug('モードボタンを上部に移動');
    }
}

// タッチドラッグで選択機能
function enableTouchDragSelection() {
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
    }
    
    let isDragging = false;
    let startX, startY;
    
    // タッチイベントのハンドラ
    function handleTouchStart(e) {
        // 複数選択モードかチェック
        if (!window.multiSelectMode) {
            showDebug('単一選択モード - ドラッグ無効');
            return;
        }
        
        // スクロールを防ぐ（複数選択モード時のみ）
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
        
        showDebug(`複数選択ドラッグ開始: ${Math.round(startX)}, ${Math.round(startY)}`);
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        // スクロールを防ぐ（ドラッグ中のみ）
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
    }
    
    function handleTouchEnd(e) {
        if (!isDragging) return;
        
        isDragging = false;
        
        // ボックスのサイズを取得
        const boxRect = selectionBox.getBoundingClientRect();
        const width = parseInt(selectionBox.style.width);
        const height = parseInt(selectionBox.style.height);
        
        // 選択ボックスを非表示
        selectionBox.style.display = 'none';
        
        // 5px以上のドラッグの場合のみ選択処理
        if (width > 5 && height > 5) {
            let selectedCount = 0;
            
            // ボックス内の要素を選択
            document.querySelectorAll('.body-part, .head-cell').forEach(part => {
                const partRect = part.getBoundingClientRect();
                const partCenterX = partRect.left + partRect.width / 2;
                const partCenterY = partRect.top + partRect.height / 2;
                
                if (partCenterX >= boxRect.left && partCenterX <= boxRect.right &&
                    partCenterY >= boxRect.top && partCenterY <= boxRect.bottom) {
                    // 選択に追加
                    if (window.selectedParts) {
                        window.selectedParts.add(part.dataset.part);
                    }
                    part.classList.add('selected');
                    selectedCount++;
                }
            });
            
            if (selectedCount > 0) {
                showDebug(`${selectedCount}個の部位を選択`);
                
                // UI更新
                if (window.selectedParts && window.updatePainButtonSelection) {
                    let totalPain = 0;
                    window.selectedParts.forEach(partName => {
                        totalPain += (window.painData && window.painData[partName]) || 0;
                    });
                    const avgPain = totalPain / window.selectedParts.size;
                    window.updatePainButtonSelection(Math.round(avgPain));
                }
                
                // 通知表示
                if (window.showNotification) {
                    window.showNotification(`${selectedCount}個の部位を選択しました`);
                }
            }
        }
    }
    
    // イベントリスナー登録
    bodyView.addEventListener('touchstart', handleTouchStart, { passive: false });
    bodyView.addEventListener('touchmove', handleTouchMove, { passive: false });
    bodyView.addEventListener('touchend', handleTouchEnd);
    bodyView.addEventListener('touchcancel', function() {
        isDragging = false;
        selectionBox.style.display = 'none';
    });
    
    showDebug('タッチドラッグ選択有効化完了');
}

// モード切り替えを監視
function watchModeChange() {
    // 既存のボタンにイベントを追加
    const multiBtn = document.getElementById('multiModeBtn');
    const singleBtn = document.getElementById('singleModeBtn');
    
    if (multiBtn) {
        multiBtn.addEventListener('click', function() {
            showDebug('複数選択モード有効');
            // 既に元のコードでmultiSelectModeが設定されているはず
        });
    }
    
    if (singleBtn) {
        singleBtn.addEventListener('click', function() {
            showDebug('単一選択モード有効');
        });
    }
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
    
    // 少し待ってから初期化
    setTimeout(() => {
        moveModeBtnsToTop();
        enableTouchDragSelection();
        watchModeChange();
    }, 1000);
});