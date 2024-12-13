const goose = document.getElementById('goose');
const gameContainer = document.getElementById('game-container');
const viewport = document.getElementById('viewport');
const message = document.getElementById('message');
const reward_overlay = document.createElement('div');
const rewardImg = document.createElement('img');
const rewardText = document.createElement('p');
const merchantOverlay = document.getElementById('merchant-overlay');
const yesButton = document.querySelector('#merchant-buttons .yes');
const noButton = document.querySelector('#merchant-buttons .no');

const mapWidth = 5000;
const mapHeight = 3000;
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

let mouseX = viewportWidth / 2; // 預設鼠標位置為視窗中央
let mouseY = viewportHeight / 2;
let gooseX = mapWidth / 2 - 230;
let gooseY = mapHeight / 2 - 170;

const speed = 7;
let movingForward = false; // 是否正在前進
const balls = [];

let normalBalls = 1;
let superBalls = 1;
let coinsnum = 10;
const eggs = [];
const coins = [];
const merchants = [];

const mapScaleX = 225 / 5000; // 小地图宽度 / 地图实际宽度
const mapScaleY = 135 / 3000; // 小地图高度 / 地图实际高度
const cursor = document.querySelector('#mini-map .cursor');



function updateGoosePosition() {
    gooseX = Math.max(0, Math.min(gooseX, mapWidth - 100));
    gooseY = Math.max(0, Math.min(gooseY, mapHeight - 100));

    goose.style.left = `${gooseX}px`;
    goose.style.top = `${gooseY}px`;

    const offsetX = Math.max(0, Math.min(gooseX - viewportWidth / 2 + 50, mapWidth - viewportWidth));
    const offsetY = Math.max(0, Math.min(gooseY - viewportHeight / 2 + 50, mapHeight - viewportHeight));

    gameContainer.style.left = `${-offsetX}px`;
    gameContainer.style.top = `${-offsetY}px`;

    cursor.style.left = `${gooseX * mapScaleX}px`;
    cursor.style.top = `${gooseY * mapScaleY}px`;

    // 檢查碰撞邏輯
    checkCollision();
    checkEggCollision();
    checkCoinCollision();
    checkMerchantCollision();
}

function getMouseDirection() {
    const rect = viewport.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    const length = Math.sqrt(dx * dx + dy * dy) || 1; // 避免除以0
    return { x: dx / length, y: dy / length };
}

// 更新鼠標位置
document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        movingForward = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === ' ') {
        movingForward = false;
    }
});

function startGameLoop() {
    function gameLoop() {
        console.log('Game loop running');
        console.log(movingForward);
        if (movingForward) {
            const direction = getMouseDirection();
            gooseX += direction.x * speed;
            gooseY += direction.y * speed;
            updateGoosePosition();
        }
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}



function updateInventory() {
    document.getElementById('normal-count').textContent = normalBalls;
    document.getElementById('super-count').textContent = superBalls;
    document.getElementById('coin-count').textContent = coinsnum;
}

function initializeMerchants() {
    for (let i = 0; i < 3; i++) {
        createMerchant();
    }
}

function initializeEggs() {
    while (eggs.length < 5) {
        createEgg();
    }
}

function initializeCoins() {
    while (coins.length < 20) {
        createCoin();
    }
}

function initializeBalls() {
    while (balls.length < 10) {
        createBall();
    }
}

function checkEggCollision() {
    eggs.forEach((eggObj, index) => {
        const eggElement = eggObj.egg; // 取出 egg 元素
        const eggX = parseInt(eggElement.style.left, 10);
        const eggY = parseInt(eggElement.style.top, 10);

        if (
            gooseX < eggX + 50 &&
            gooseX + 100 > eggX &&
            gooseY < eggY + 50 &&
            gooseY + 100 > eggY
        ) {
            const difficulty = Math.floor(Math.random() * 5) + 1;

            gameContainer.removeChild(eggElement);
            eggs.splice(index, 1);

            askPlayerToCapture(difficulty, eggObj.randomId);

            createEgg();
        }
    });
}

function checkCoinCollision() {
    coins.forEach((coin, index) => {
        const coinX = parseInt(coin.style.left, 10);
        const coinY = parseInt(coin.style.top, 10);

        if (
            gooseX < coinX + 50 &&
            gooseX + 100 > coinX &&
            gooseY < coinY + 50 &&
            gooseY + 100 > coinY
        ) {
            gameContainer.removeChild(coin);
            coins.splice(index, 1);
            handleReward(true);
            createCoin();
        }
    });
}

function checkCollision() {
    balls.forEach((ball, index) => {
        const ballX = parseInt(ball.style.left, 10);
        const ballY = parseInt(ball.style.top, 10);

        if (
            gooseX < ballX + 50 &&
            gooseX + 100 > ballX &&
            gooseY < ballY + 50 &&
            gooseY + 100 > ballY
        ) {
            gameContainer.removeChild(ball);
            balls.splice(index, 1);
            handleReward(false);
            createBall();
        }
    });
}

function checkMerchantCollision() {
    merchants.forEach((merchant, index) => {
        const merchantX = parseInt(merchant.style.left, 10);
        const merchantY = parseInt(merchant.style.top, 10);

        if (
            gooseX < merchantX + 80 &&
            gooseX + 80 > merchantX &&
            gooseY < merchantY + 200 &&
            gooseY + 30 > merchantY
        ) {
            gameContainer.removeChild(merchant);
            merchants.splice(index, 1);         
            createMerchant();
            merchantOverlay.style.display = 'flex';
        }
    });
}

function createMerchant() {
    const merchant = document.createElement('div');
    merchant.classList.add('merchant');
    merchant.style.left = `${Math.random() * (mapWidth - 100)}px`;
    merchant.style.top = `${Math.random() * (mapHeight - 100)}px`;
    gameContainer.appendChild(merchant);
    merchants.push(merchant);
}

function createEgg() {
    const egg = document.createElement('div');
    egg.classList.add('egg');

    const randomId = Math.floor(Math.random() * 14) + 1; // 隨機選擇寶可夢
    const selectedPokemon = `./pokemon/${randomId.toString().padStart(3, '0')}.gif`;

    egg.style.backgroundImage = `url(${selectedPokemon})`;

    egg.style.left = `${Math.random() * (mapWidth - 50)}px`;
    egg.style.top = `${Math.random() * (mapHeight - 50)}px`;
    gameContainer.appendChild(egg);
    eggs.push({egg, randomId});
}

function createCoin() {
    const coin = document.createElement('div');
    coin.classList.add('coin');
    coin.style.left = `${Math.random() * (mapWidth - 50)}px`;
    coin.style.top = `${Math.random() * (mapHeight - 50)}px`;
    gameContainer.appendChild(coin);
    coins.push(coin);
}

function createBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    ball.style.left = `${Math.random() * (mapWidth - 50)}px`;
    ball.style.top = `${Math.random() * (mapHeight - 50)}px`;
    gameContainer.appendChild(ball);
    balls.push(ball);
}

function moveMerchants() {
    merchants.forEach(merchant => {
        const newX = parseInt(merchant.style.left, 10) + (Math.random() * 2 - 1) * 5;
        const newY = parseInt(merchant.style.top, 10) + (Math.random() * 2 - 1) * 5;

        merchant.style.left = `${Math.max(0, Math.min(mapWidth - 100, newX))}px`;
        merchant.style.top = `${Math.max(0, Math.min(mapHeight - 100, newY))}px`;
    });
}

function handleReward(isCoin) {
    if (isCoin) {
        coinsnum+=10;
        updateInventory();
        return;
    }
    const isSuper = Math.random() <= 0.25;
    rewardImg.src = isSuper ? './img/super.png' : './img/normal.png';
    rewardText.textContent = isSuper ? 'Congratulatuion! 你找到 ”大師球“ 了' : 'Congratulatuion! 你找到 “精靈球” 了';
    if (isSuper) {
        superBalls++;
    } else {
        normalBalls++;
    }
    updateInventory();
    reward_overlay.style.display = 'flex';
    setTimeout(() => {
        reward_overlay.style.display = 'none';
    }, 2000);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            gooseY -= speed;
            break;
        case 'ArrowDown':
            gooseY += speed;
            break;
        case 'ArrowLeft':
            gooseX -= speed;
            break;
        case 'ArrowRight':
            gooseX += speed;
            break;
    }
    updateGoosePosition();
});

function askPlayerToCapture(difficulty, randomId) {
    const ballButtons = document.getElementById('ball-overlay');
    const normalButton = document.getElementById('normal-ball-img');
    const superButton = document.getElementById('super-ball-img');
    const difficultyText = document.getElementById('difficulty-text');

    // 更新難度文本
    difficultyText.textContent = `!!! 收服難度：${difficulty} !!!`;

    // 顯示按鈕時檢查球數量
    if (normalBalls >= 1) {
        normalButton.parentElement.style.display = 'block';
    } else {
        normalButton.parentElement.style.display = 'none';
    }

    if (superBalls >= 1) {
        superButton.parentElement.style.display = 'block';
    } else {
        superButton.parentElement.style.display = 'none';
    }

    // 顯示按鈕界面
    ballButtons.style.display = 'flex';

    // 為按鈕添加點擊事件
    normalButton.onclick = function () {
        if (normalBalls > 0) {
            normalBalls--;
            capturePokemon(1, difficulty, randomId);
        } else {
            alert('精靈球不足！');
        }
        closeBallSelection();
    };

    superButton.onclick = function () {
        if (superBalls > 0) {
            superBalls--;
            capturePokemon(2, difficulty, randomId);
        } else {
            alert('大師球不足！');
        }
        closeBallSelection();
    };

    function closeBallSelection() {
        ballButtons.style.display = 'none';
        updateInventory();
    }
}

function capturePokemon(ball_type, difficulty, pokemon_id) {
    if (ball_type == 1 && Math.random() <= 0.3) {
        const selectedPokemon = `./gif/empty.gif`;
        reward_overlay.style.display = 'flex';
        rewardText.textContent = '寶可夢跑走了！';
        rewardImg.src = selectedPokemon;

        setTimeout(() => {
            reward_overlay.style.display = 'none';
        }, 2000);

        return;
    }
    else if (ball_type == 2 && Math.random() <= 0.1) {
        const selectedPokemon = `./gif/empty.gif`;
        reward_overlay.style.display = 'flex';
        rewardText.textContent = '寶可夢跑走了！';
        rewardImg.src = selectedPokemon;

        setTimeout(() => {
            reward_overlay.style.display = 'none';
        }, 2000);

        return;
    }
    const randomId = pokemon_id;
    const selectedPokemon = `./pokemon/${randomId.toString().padStart(3, '0')}.gif`;
    addPokemonToCollection(randomId);
    reward_overlay.style.display = 'flex';
    rewardImg.src = selectedPokemon;
    if (ball_type == 3) {
        rewardText.textContent = '恭喜孵化出寶可夢 ' + randomId + ' !';
    }
    else {
        rewardText.textContent = '恭喜捕捉到寶可夢 ' + randomId + ' !';
    }

    setTimeout(() => {
        reward_overlay.style.display = 'none';
    }, 2500);
}

yesButton.addEventListener('click', () => {
    if (coinsnum >= 10) {
        coinsnum -= 10;
        updateInventory();
        startGame();
    } else {
        alert('金幣不足！');
    }
});

noButton.addEventListener('click', () => {
    merchantOverlay.style.display = 'none';
});

function renewmerchant() {
    merchantOverlay.innerHTML = ''; // 清空商人介面

    const gameText = document.createElement('p');
    gameText.textContent = '是否花費10金幣接受巫師的挑戰？';
    merchantOverlay.appendChild(gameText);

    const trainerImg = document.createElement('img');
    trainerImg.src = './gif/chi.gif';
    trainerImg.classList.add('trainer');
    trainerImg.alt = 'Player';
    merchantOverlay.appendChild(trainerImg);

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'merchant-buttons';

    const yesImg = document.createElement('img');
    yesImg.classList.add('yes');
    yesImg.src = './img/yes.png';
    yesImg.alt = 'Yes';
    yesImg.addEventListener('click', () => {
        if (coinsnum >= 10) {
            coinsnum -= 10;
            updateInventory();
            startGame();
        } else {
            alert('金幣不足！');
        }
    });

    const noImg = document.createElement('img');
    noImg.classList.add('no');
    noImg.src = './img/no.png';
    noImg.alt = 'No';
    noImg.addEventListener('click', () => {
        merchantOverlay.style.display = 'none';
    });

    buttonContainer.appendChild(yesImg);
    buttonContainer.appendChild(noImg);
    merchantOverlay.appendChild(buttonContainer);

}

function startGame() {
    merchantOverlay.innerHTML = '';
    const gameText = document.createElement('p');
    const gametype = Math.random() > 0.5 ? 1 : 2;
    if (gametype === 1) {
        gameText.textContent = '本回合：比大';
    } else {
        gameText.textContent = '本回合：比小';
    }
    merchantOverlay.appendChild(gameText);

    const startButton = document.createElement('img');
    startButton.src = './gif/start.gif    ';
    startButton.classList.add('start-button');
    startButton.alt = 'Yes';
    startButton.addEventListener('click', rollDice.bind(null, gametype));
    merchantOverlay.appendChild(startButton);
}

function rollDice(gametype) {
    merchantOverlay.innerHTML = '';

    const diceGif = document.createElement('img');
    diceGif.id = 'dice-gif';
    diceGif.classList.add('diceGif');

    // 重置 GIF 源，确保从第一帧播放
    diceGif.src = '';
    setTimeout(() => {
        diceGif.src = './gif/dice.gif'; // 重新加载 GIF
    }, 10); // 短暂延迟确保 src 重置生效

    merchantOverlay.appendChild(diceGif);

    setTimeout(() => {
        merchantOverlay.removeChild(diceGif); // 播放完成后移除 GIF
        merchantOverlay.innerHTML = '';
        rollDiceImages(gametype);
        merchantOverlay.style.display = 'none';
        renewmerchant();
    }, 1150); // GIF 播放完成后显示结果
}

function rollDiceImages(gametype) {
    const diceOverlay = document.getElementById('dice-overlay');
    const diceContainer = document.getElementById('dice-container');
    diceContainer.innerHTML = '';

    const merchantDice = rollThreeDice();
    const playerDice = rollThreeDice();

    const merchantSection = document.createElement('div');
    merchantSection.classList.add('merchant-dice');
    const merchantDiceText = document.createElement('p');
    merchantDiceText.textContent = '巫師的骰子：';
    merchantSection.appendChild(merchantDiceText);
    merchantDice.forEach(dice => {
        const diceImg = document.createElement('img');
        diceImg.src = `./dice/${dice}.png`;
        diceImg.classList.add('dice-img');
        merchantSection.appendChild(diceImg);
    });

    const playerSection = document.createElement('div');
    playerSection.classList.add('player-dice');
    const playerDiceText = document.createElement('p');
    playerDiceText.textContent = '玩家的骰子：';
    playerSection.appendChild(playerDiceText);
    playerDice.forEach(dice => {
        const diceImg = document.createElement('img');
        diceImg.src = `./dice/${dice}.png`;
        diceImg.classList.add('dice-img');
        playerSection.appendChild(diceImg);
    });

    const merchantSum = merchantDice.reduce((a, b) => a + b, 0);
    const playerSum = playerDice.reduce((a, b) => a + b, 0);

    const resultmessage = document.createElement('p');
    resultmessage.classList.add('resultmessage');
    if ((gametype === 1 && playerSum >= merchantSum) || (gametype === 2 && playerSum <= merchantSum)) {
        resultmessage.textContent = '訓練家獲勝！';
    }
    else {
        resultmessage.textContent = '商人獲勝！';
    }

    diceContainer.appendChild(merchantSection);
    diceContainer.appendChild(playerSection);
    diceContainer.appendChild(resultmessage);

    diceOverlay.style.display = 'flex';


    setTimeout(() => {
        diceOverlay.style.display = 'none';
        if ((gametype === 1 && playerSum >= merchantSum) || (gametype === 2 && playerSum <= merchantSum)) {
            showEggAndHatch();
        }
        movingForward = false;
    }, 5000);
}

function rollThreeDice() {
    return [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1);
}

function showEggAndHatch() {
    const eggOverlay = document.getElementById('reward-overlay');
    eggOverlay.innerHTML = '';

    // 显示蛋
    const eggImg = document.createElement('img');
    eggImg.src = './gif/egg.gif';
    eggImg.classList.add('egg-display');
    eggOverlay.appendChild(eggImg);
    eggOverlay.style.display = 'flex';
    const randomId = Math.floor(Math.random() * 14) + 1; // 隨機選擇寶可夢

    setTimeout(() => {
        eggOverlay.style.display = 'none';
        capturePokemon(3, 0, randomId);
    }, 3000);
}

function addPokemonToCollection(pokemonId) {
    const collected = JSON.parse(localStorage.getItem('collectedPokemon') || '[]');
    if (!collected.includes(pokemonId)) {
        collected.push(pokemonId);
        localStorage.setItem('collectedPokemon', JSON.stringify(collected));
    }
}

document.getElementById('pokedex-button').addEventListener('click', () => {
    window.location.href = './pokemon.html';
});

// 初始化角色選擇
document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("character-selection-overlay");
    const characterButtons = document.querySelectorAll(".character-button");

    characterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedCharacter = button.getAttribute("data-character");
            // 設定選擇的角色並隱藏選擇介面
            localStorage.setItem("selectedCharacter", selectedCharacter);
            document.getElementById("goose").style.backgroundImage = `url('./gif/${selectedCharacter}.gif')`;
            overlay.style.display = "none";
        });
    });

    // 如果未選擇角色，顯示選擇介面
    if (!localStorage.getItem("selectedCharacter")) {
        overlay.style.display = "flex";
    } else {
        // 已選擇角色，直接應用
        const selectedCharacter = localStorage.getItem("selectedCharacter");
        document.getElementById("goose").style.backgroundImage = `url('./gif/${selectedCharacter}.gif')`;
    }
});

document.getElementById("game-button").addEventListener("click", () => {
    window.location.href = "./boss.html";
});




reward_overlay.id = 'reward-overlay';
reward_overlay.appendChild(rewardImg);
reward_overlay.appendChild(rewardText);
document.body.appendChild(reward_overlay);

initializeBalls();
initializeEggs();
initializeCoins();
initializeMerchants();
setInterval(moveMerchants, 1000);
updateGoosePosition();
updateInventory();
// 在初始化時啟動遊戲迴圈
startGameLoop();