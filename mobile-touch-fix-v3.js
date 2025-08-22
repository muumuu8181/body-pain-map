// モバイルタッチ対応の改善コード v3
// シンプルで確実な方法

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

// デバッグメッセージ表示
let debugCount = 0;
function showDebug(message) {
    debugCount++;
    console.log(`[${debugCount}] ${message}`);
    
    // 左上の画面サイズ表示の下に追加表示
    let debugDiv = document.getElementById('touchDebug');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'touchDebug';
        debugDiv.style.cssText = `
            position: fixed;
            top: 50px;
            left: 10px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1001;
            max-width: 300px;
        `;
        document.body.appendChild(debugDiv);
    }
    debugDiv.innerHTML = `[${debugCount}] ${message}`;
}

// グローバル変数で長押し状態を管理
window.mobileLongPress = false;
window.mobileTouchTimer = null;

// タッチイベントの追加（既存のイベントは残す）
function addMobileTouchSupport() {
    showDebug('タッチサポート初期化開始');
    
    // すべてのグリッドセルにタッチイベントを追加
    const cells = document.querySelectorAll('.head-cell, .body-part');
    showDebug(`検出されたセル数: ${cells.length}`);
    
    cells.forEach((cell, index) => {
        // 最初の5個だけログ出力
        if (index < 5) {
            showDebug(`セル ${index}: ${cell.dataset.part}`);
        }
        
        let cellTouchStart = 0;
        let cellLongPressTimer = null;
        
        // タッチ開始
        cell.addEventListener('touchstart', function(e) {
            e.stopPropagation(); // 他のイベントとの競合を防ぐ
            
            cellTouchStart = Date.now();
            const partName = this.dataset.part;
            showDebug(`タッチ開始: ${partName}`);
            
            // 長押しタイマー設定
            cellLongPressTimer = setTimeout(() => {
                showDebug(`長押し成功: ${partName}`);
                window.mobileLongPress = true;
                
                // 視覚的フィードバック
                this.style.transform = 'scale(1.2)';
                this.style.transition = 'transform 0.2s';
                
                // バイブレーション
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }, 500);
        }, { passive: true });
        
        // タッチ終了
        cell.addEventListener('touchend', function(e) {
            e.stopPropagation();
            e.preventDefault(); // デフォルト動作を防ぐ
            
            // タイマークリア
            if (cellLongPressTimer) {
                clearTimeout(cellLongPressTimer);
            }
            
            const touchDuration = Date.now() - cellTouchStart;
            const partName = this.dataset.part;
            
            // 視覚的フィードバックをリセット
            this.style.transform = '';
            
            if (window.mobileLongPress || touchDuration > 500) {
                // 長押し → 複数選択
                showDebug(`長押しタップ終了: ${partName} (${touchDuration}ms)`);
                
                if (window.selectedParts && window.selectedParts.has(partName)) {
                    // 選択解除
                    window.selectedParts.delete(partName);
                    this.classList.remove('selected');
                    showDebug(`選択解除: ${partName}`);
                } else {
                    // 選択追加
                    if (window.selectedParts) {
                        window.selectedParts.add(partName);
                    }
                    this.classList.add('selected');
                    showDebug(`選択追加: ${partName}`);
                }
            } else {
                // 通常タップ → 単一選択
                showDebug(`通常タップ: ${partName} (${touchDuration}ms)`);
                
                // 既存の選択をクリア
                if (window.selectedParts) {
                    window.selectedParts.clear();
                }
                document.querySelectorAll('.head-cell.selected, .body-part.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // 新規選択
                if (window.selectedParts) {
                    window.selectedParts.add(partName);
                }
                this.classList.add('selected');
            }
            
            // UI更新
            if (window.updatePainButtonSelection) {
                if (window.selectedParts && window.selectedParts.size > 0) {
                    let totalPain = 0;
                    window.selectedParts.forEach(part => {
                        totalPain += (window.painData && window.painData[part]) || 0;
                    });
                    const avgPain = totalPain / window.selectedParts.size;
                    window.updatePainButtonSelection(Math.round(avgPain));
                }
            }
            
            window.mobileLongPress = false;
        }, { passive: false });
        
        // タッチキャンセル
        cell.addEventListener('touchcancel', function() {
            if (cellLongPressTimer) {
                clearTimeout(cellLongPressTimer);
            }
            window.mobileLongPress = false;
            this.style.transform = '';
            showDebug('タッチキャンセル');
        });
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    showDebug('DOM読み込み完了');
    
    // 画面サイズ表示要素を追加
    if (!document.getElementById('screenSize')) {
        const screenSizeDiv = document.createElement('div');
        screenSizeDiv.id = 'screenSize';
        screenSizeDiv.className = 'screen-size';
        document.body.appendChild(screenSizeDiv);
    }
    
    updateScreenSize();
    
    // メインのJSが読み込まれるのを待つ
    setTimeout(() => {
        showDebug('タッチイベント設定開始');
        addMobileTouchSupport();
    }, 2000);
    
    // リサイズ時に更新
    window.addEventListener('resize', updateScreenSize);
});