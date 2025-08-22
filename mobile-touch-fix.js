// モバイルタッチ対応の改善コード
// 画面サイズ表示機能を追加

// 画面サイズ表示を更新
function updateScreenSize() {
    const screenSize = document.getElementById('screenSize');
    if (screenSize) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        
        // デバイスタイプの判定
        let deviceType = 'Desktop';
        if (width <= 414) deviceType = 'iPhone';
        else if (width <= 768) deviceType = 'Mobile';
        else if (width <= 1024) deviceType = 'Tablet';
        
        screenSize.innerHTML = `📀 ${width} × ${height}px (${deviceType})`;
    }
}

// タッチイベントの改善
function improveTouch() {
    const bodyView = document.querySelector('.body-view');
    if (!bodyView) return;
    
    let touchStartX, touchStartY;
    let touchStartTime;
    let isLongPress = false;
    
    // タッチ開始
    bodyView.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        isLongPress = false;
        
        // 長押し判定（500ms）
        setTimeout(() => {
            if (touchStartTime && Date.now() - touchStartTime >= 500) {
                isLongPress = true;
                // バイブレーション（対応端末のみ）
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
        }, 500);
    }, { passive: true });
    
    // タッチ終了
    bodyView.addEventListener('touchend', function(e) {
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
                // 長押しの場合は複数選択モード
                if (isLongPress) {
                    // Ctrl+クリックと同じ動作
                    element.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        ctrlKey: true
                    }));
                } else {
                    // 通常タップ
                    element.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true
                    }));
                }
            }
        }
        
        touchStartTime = null;
    }, { passive: true });
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
    improveTouch();
    
    // リサイズ時に更新
    window.addEventListener('resize', updateScreenSize);
    
    // デバイス情報をコンソールに出力
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen:', window.innerWidth, 'x', window.innerHeight);
});