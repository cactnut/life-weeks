// 要素取得
const birthdayInput = document.getElementById('birthday');
const deathdayInput = document.getElementById('deathday');
const grid = document.getElementById('grid');

// 「寿命を手動で変更したか」フラグ
let deathdayManuallyChanged = false;

// 日付をyyyy-mm-dd形式で出力
function formatYMD(date) {
    // 月日が1桁の時にゼロ埋め
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`;
}

// 入力値が有効な日付かチェック
function isValidDate(str) {
    const d = new Date(str);
    // 無効な日付（4/31等）はNaN
    return !isNaN(d.getTime()) && str === formatYMD(d);
}

// ローカルストレージから設定を読み込む
function loadSettings() {
    const savedBirthday = localStorage.getItem('birthday');
    const savedDeathday = localStorage.getItem('deathday');
    if (savedBirthday && isValidDate(savedBirthday)) birthdayInput.value = savedBirthday;
    if (savedDeathday && isValidDate(savedDeathday)) deathdayInput.value = savedDeathday;
    deathdayManuallyChanged = false;
    window.addEventListener('resize', drawGrid);
}

// 設定を保存する
function saveSettings() {
    localStorage.setItem('birthday', birthdayInput.value);
    localStorage.setItem('deathday', deathdayInput.value);
}

// グリッドを描画する
const GAP_RATIO = 0.3;

function drawGrid() {
    grid.innerHTML = '';
    const birthday = new Date(birthdayInput.value);
    const deathday = new Date(deathdayInput.value);

    // 不正日付は表示せずreturn
    if (isNaN(birthday.getTime()) || isNaN(deathday.getTime())) return;

    // 合計週数（切り捨て）
    const totalWeeks = Math.floor((deathday - birthday) / (7 * 24 * 60 * 60 * 1000));
    if (totalWeeks <= 0) return;

    const gridParentWidth = grid.parentElement.clientWidth || window.innerWidth;
    const gridWidth = gridParentWidth * 0.8;
    const maxBlockSize = 20;
    const minBlockSize = 8;

    function getCandidates(base, maxLimit) {
        const arr = [];
        for (let n = base; n <= maxLimit; n += base) arr.unshift(n);
        [26, 13, 4, 2, 1].forEach(x => { if (!arr.includes(x)) arr.push(x); });
        return arr;
    }
    const candidateColumns = getCandidates(52, 520);

    let columns = 52;
    let blockSize = minBlockSize;
    let gap = 2.4;

    for (let c of candidateColumns) {
        let size = maxBlockSize;
        let tmpGap = size * GAP_RATIO;
        let total = c * size + (c - 1) * tmpGap;

        if (total > gridWidth) {
            size = (gridWidth - (c - 1) * GAP_RATIO * maxBlockSize) / c;
            if (size > maxBlockSize) size = maxBlockSize;
            if (size < minBlockSize) continue;
            tmpGap = size * GAP_RATIO;
            total = c * size + (c - 1) * tmpGap;
            if (total > gridWidth + 0.01) continue;
        }

        columns = c;
        blockSize = size;
        gap = tmpGap;
        break;
    }

    const gridTotalWidth = columns * blockSize + (columns - 1) * gap;
    grid.style.width = `${gridTotalWidth}px`;
    grid.style.maxWidth = "100%";
    grid.style.gridTemplateColumns = `repeat(${columns}, ${blockSize}px)`;
    grid.style.columnGap = `${gap}px`;
    grid.style.rowGap = `${gap}px`;
    grid.style.margin = "0 auto";

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

// --- イベントハンドラ ---

// 誕生日変更時
birthdayInput.addEventListener('change', () => {
    if (!deathdayManuallyChanged) {
        const bday = new Date(birthdayInput.value);
        if (isNaN(bday.getTime())) return;
        const newDeath = new Date(bday);
        newDeath.setFullYear(bday.getFullYear() + 80);
        deathdayInput.value = formatYMD(newDeath);
    }
    // 誕生日 > 寿命なら自動修正
    if (new Date(birthdayInput.value) >= new Date(deathdayInput.value)) {
        const bday = new Date(birthdayInput.value);
        const newDeath = new Date(bday);
        newDeath.setFullYear(bday.getFullYear() + 80);
        deathdayInput.value = formatYMD(newDeath);
        deathdayManuallyChanged = false;
    }
    saveSettings();
    drawGrid();
});

// 寿命変更時
// 手動入力検知
deathdayInput.addEventListener('input', () => {
    deathdayManuallyChanged = true;
});

// フォーカスを外した時のみ自動補正
deathdayInput.addEventListener('blur', () => {
    // 無効日付なら自動補正
    if (!isValidDate(deathdayInput.value)) {
        const bday = new Date(birthdayInput.value);
        const newDeath = new Date(bday);
        newDeath.setFullYear(bday.getFullYear() + 80);
        deathdayInput.value = formatYMD(newDeath);
        deathdayManuallyChanged = false;
    } else {
        // 寿命が誕生日より前なら自動修正
        if (new Date(deathdayInput.value) <= new Date(birthdayInput.value)) {
            const bday = new Date(birthdayInput.value);
            const newDeath = new Date(bday);
            newDeath.setFullYear(bday.getFullYear() + 80);
            deathdayInput.value = formatYMD(newDeath);
            deathdayManuallyChanged = false;
        }
    }
    saveSettings();
    drawGrid();
});

// 初期化
loadSettings();
drawGrid();
