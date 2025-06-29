// DOM要素取得
const birthdayInput = document.getElementById('birthday');
const lifespanInput = document.getElementById('lifespan');
const grid = document.getElementById('grid');

// ローカルストレージから設定を読み込む
function loadSettings() {
    const savedBirthday = localStorage.getItem('birthday');
    const savedLifespan = localStorage.getItem('lifespan');
    if (savedBirthday) birthdayInput.value = savedBirthday;
    if (savedLifespan) lifespanInput.value = savedLifespan;
    window.addEventListener('resize', drawGrid);
}

// 設定を保存する
function saveSettings() {
    localStorage.setItem('birthday', birthdayInput.value);
    localStorage.setItem('lifespan', lifespanInput.value);
}

// グリッドを描画する
function drawGrid() {
    grid.innerHTML = '';
    const birthday = new Date(birthdayInput.value);
    const lifespan = parseInt(lifespanInput.value, 10);
    const totalWeeks = lifespan * 52;

    // 親要素の幅を基準に
    const gridWidth = grid.parentElement.clientWidth || window.innerWidth;
    const maxBlockSize = 20;
    const minBlockSize = 12;

    // columns候補生成: 52, 104, 156... 26, 13, 4, 2, 1
    function getCandidates(base, maxLimit) {
        const arr = [];
        for (let n = base; n <= maxLimit; n += base) arr.unshift(n);
        [26, 13, 4, 2, 1].forEach(x => { if (!arr.includes(x)) arr.push(x); });
        return arr;
    }
    const candidateColumns = getCandidates(52, 520); // 例: 520まで対応

    let columns = 52;
    let blockSize = minBlockSize;
    let gap = 2.4;

    for (let c of candidateColumns) {
        // 最大サイズで試す
        let size = maxBlockSize;
        let tmpGap = size * 0.2;
        let total = c * size + (c - 1) * tmpGap;

        // gridが親より大きい場合はブロック小さく
        if (total > gridWidth) {
            // 収まるサイズを計算（gapも2割として再計算）
            size = (gridWidth - (c - 1) * 0.2 * maxBlockSize) / c;
            if (size > maxBlockSize) size = maxBlockSize;
            if (size < minBlockSize) continue;
            tmpGap = size * 0.2;
            total = c * size + (c - 1) * tmpGap;
            if (total > gridWidth + 0.01) continue;
        }

        columns = c;
        blockSize = size;
        gap = tmpGap;
        break;
    }

    // grid本体をピッタリサイズで中央寄せ
    const gridTotalWidth = columns * blockSize + (columns - 1) * gap;
    grid.style.width = `${gridTotalWidth}px`;
    grid.style.maxWidth = "100%";
    grid.style.gridTemplateColumns = `repeat(${columns}, ${blockSize}px)`;
    grid.style.columnGap = `${gap}px`;
    grid.style.rowGap = `${gap}px`;
    grid.style.margin = "0 auto";

    // grid直下の余白を消したい場合はpadding:0, border:noneも推奨

    // block描画
    const now = new Date();
    const diff = now - birthday;
    const currentWeekIndex = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));

    for (let i = 0; i < totalWeeks; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        block.style.width = `${blockSize}px`;
        block.style.height = `${blockSize}px`;
        if (i < currentWeekIndex) block.classList.add('past');
        else if (i === currentWeekIndex) block.classList.add('current');
        grid.appendChild(block);
    }
}



// 入力変更時の処理
birthdayInput.addEventListener('change', () => {
    saveSettings();
    drawGrid();
});

lifespanInput.addEventListener('change', () => {
    saveSettings();
    drawGrid();
});

// 初期化
loadSettings();
drawGrid();
