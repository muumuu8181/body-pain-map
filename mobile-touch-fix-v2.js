// モバイルタッチ対応の改善コード v2
// より確実な長押し検出とデバッグ情報表示

// 画面サイズ表示を更新
function updateScreenSize() {
    const screenSize = document.getElementById('screenSize');
    if (screenSize) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // デバイスタイプの判定
        let deviceType = 'Desktop';
        if (width <= 414) deviceType = 'iPhone';
        else if (width <= 768) deviceType = 'Mobile';
        else if (width <= 1024) deviceType = 'Tablet';
        
        screenSize.innerHTML = `📀 ${width} × ${height}px (${deviceType})`;
    }
}

// タッチイベントのデバッグ表示
function showTouchDebug(message) {
    console.log('[Touch]', message);
    
    // 画面にも表示（開発用）
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

// タッチイベントの改善
function improveTouch() {
    const bodyView = document.querySelector('.body-view');
    if (!bodyView) {
        console.error('body-view not found');
        return;
    }
    
    let touchStartTime = null;
    let touchStartElement = null;
    let longPressTimer = null;
    let isLongPress = false;
    let touchStartX, touchStartY;
    
    // 既存のタッチイベントを削除（競合回避）
    const newBodyView = bodyView.cloneNode(true);
    bodyView.parentNode.replaceChild(newBodyView, bodyView);
    
    // タッチ開始
    newBodyView.addEventListener('touchstart', function(e) {
        // デフォルトの動作を防ぐ（長押しメニューなど）
        e.preventDefault();
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        isLongPress = false;
        
        // タッチした要素を取得
        touchStartElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        showTouchDebug('タッチ開始');
        
        // 長押しタイマー開始（500ms）
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            showTouchDebug('長押し検出！複数選択モード');
            
            // 視覚的フィードバック
            if (touchStartElement && touchStartElement.dataset.part) {
                touchStartElement.style.opacity = '0.5';
                setTimeout(() => {
                    touchStartElement.style.opacity = '1';
                }, 200);
            }
            
            // バイブレーション
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }, 500);
        
    }, { passive: false });
    
    // タッチ移動（スクロールやドラッグ）
    newBodyView.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const moveX = Math.abs(touch.clientX - touchStartX);
        const moveY = Math.abs(touch.clientY - touchStartY);
        
        // 10px以上動いたら長押しキャンセル
        if (moveX > 10 || moveY > 10) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
                showTouchDebug('移動検出 - 長押しキャンセル');
            }
        }
    }, { passive: false });
    
    // タッチ終了
    newBodyView.addEventListener('touchend', function(e) {
        // タイマーをクリア
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        // 移動距離を計算
        const moveX = Math.abs(touchEndX - touchStartX);
        const moveY = Math.abs(touchEndY - touchStartY);
        
        // タップ判定（移動が10px以内）
        if (moveX < 10 && moveY < 10) {
            const element = document.elementFromPoint(touchEndX, touchEndY);
            
            if (element && element.dataset && element.dataset.part) {
                const partName = element.dataset.part;
                
                if (isLongPress) {
                    showTouchDebug(`長押しタップ: ${partName}`);
                    // 複数選択モードでの選択
                    handleMultiSelect(element, partName);
                } else {
                    showTouchDebug(`通常タップ: ${partName}`);
                    // 単一選択
                    handleSingleSelect(element, partName);
                }
            }
        }
        
        touchStartTime = null;
        isLongPress = false;
        
    }, { passive: false });
    
    // タッチキャンセル
    newBodyView.addEventListener('touchcancel', function() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        touchStartTime = null;
        isLongPress = false;
        showTouchDebug('タッチキャンセル');
    });
}

// 単一選択処理
function handleSingleSelect(element, partName) {
    // 既存の選択をクリア
    window.selectedParts.clear();
    document.querySelectorAll('.head-cell.selected, .body-part.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 新しく選択
    window.selectedParts.add(partName);
    element.classList.add('selected');
    
    // UI更新
    updateUIAfterSelection();
}

// 複数選択処理
function handleMultiSelect(element, partName) {
    if (window.selectedParts.has(partName)) {
        // 既に選択されている場合は解除
        window.selectedParts.delete(partName);
        element.classList.remove('selected');
    } else {
        // 選択に追加
        window.selectedParts.add(partName);
        element.classList.add('selected');
    }
    
    // UI更新
    updateUIAfterSelection();
}

// UI更新
function updateUIAfterSelection() {
    if (!window.selectedParts) return;
    
    if (window.selectedParts.size === 1) {
        const singlePart = Array.from(window.selectedParts)[0];
        const existingPain = window.painData[singlePart] || 0;
        window.updatePainButtonSelection(Math.round(existingPain));
    } else if (window.selectedParts.size > 1) {
        let totalPain = 0;
        window.selectedParts.forEach(part => {
            totalPain += window.painData[part] || 0;
        });
        const avgPain = totalPain / window.selectedParts.size;
        window.updatePainButtonSelection(Math.round(avgPain));
    } else {
        window.updatePainButtonSelection(0);
        document.getElementById('bodyPartSelect').value = '';
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 画面サイズ表示要素を追加
    if (!document.getElementById('screenSize')) {
        const screenSizeDiv = document.createElement('div');
        screenSizeDiv.id = 'screenSize';
        screenSizeDiv.className = 'screen-size';
        document.body.appendChild(screenSizeDiv);
    }
    
    updateScreenSize();
    
    // 少し遅らせて実行（メインのJSが読み込まれた後）
    setTimeout(() => {
        improveTouch();
        showTouchDebug('タッチイベント初期化完了');
    }, 1000);
    
    // リサイズ時に更新
    window.addEventListener('resize', updateScreenSize);
    
    // デバイス情報をコンソールに出力
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen:', window.innerWidth, 'x', window.innerHeight);
});