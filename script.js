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

    const now = new Date();
    const diff = now - birthday;
    const currentWeekIndex = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));

    for (let i = 0; i < totalWeeks; i++) {
        const block = document.createElement('div');
        block.classList.add('block');
        if (i < currentWeekIndex) {
            block.classList.add('past');
        } else if (i === currentWeekIndex) {
            block.classList.add('current');
        }
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
