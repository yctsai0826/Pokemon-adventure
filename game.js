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

const speed = 25;
let movingForward = false; // 是否正在前進
const balls = [];

//b\




let normalBalls = parseInt(getCookie('normalballs') || 0, 10);
let superBalls = parseInt(getCookie('superballs') || 0, 10);
let coinsnum = parseInt(getCookie('coins') || 0, 10);
let curtrainer = 'none';
const eggs = [];
const coins = [];
const merchants = [];
let pokemons = getCookie('collected_pokemon');
console.log('Raw cookie value:', pokemons);

// 解碼後再解析
pokemons = pokemons ? JSON.parse(decodeURIComponent(pokemons)) : [];
console.log('Parsed pokemons array:', pokemons);

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
    setCookie('coins', coinsnum, 60 * 60 * 24 * 30); // 30 days
    setCookie('normalballs', normalBalls, 60 * 60 * 24 * 30); // 30 days
    setCookie('superballs', superBalls, 60 * 60 * 24 * 30); // 30 days
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
let isSelectingBall = false;
let selectedBall = null;

// 選擇寶貝球 UI
function createBallSelectionUI(difficulty, randomId) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: rgba(255, 255, 255, 0.9);
        padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;
    `;

    const title = document.createElement('h2');
    title.textContent = '選擇要使用的寶貝球';
    title.style.marginBottom = '20px';

    const ballsContainer = document.createElement('div');
    ballsContainer.style.cssText = `
        display: flex; justify-content: center; gap: 30px; margin-bottom: 20px;
    `;

    function createBallOption(type, count, imageSrc) {
        const container = document.createElement('div');
        container.style.cssText = `
            cursor: ${count > 0 ? 'pointer' : 'not-allowed'};
            padding: 15px; border-radius: 10px; transition: transform 0.2s, background 0.2s;
            display: flex; flex-direction: column; align-items: center;
            background: ${count > 0 ? '#f0f0f0' : '#ddd'};
            opacity: ${count > 0 ? '1' : '0.6'};
        `;

        container.addEventListener('mouseover', () => {
            if (count > 0) {
                container.style.transform = 'scale(1.05)';
                container.style.background = '#e0e0e0';
            }
        });

        container.addEventListener('mouseout', () => {
            if (count > 0) {
                container.style.transform = 'scale(1)';
                container.style.background = '#f0f0f0';
            }
        });

        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `width: 60px; height: 60px; margin-bottom: 10px;`;

        const text = document.createElement('div');
        text.textContent = `${type}\n(${count}個)`;
        text.style.textAlign = 'center';
        text.style.whiteSpace = 'pre-line';

        container.appendChild(img);
        container.appendChild(text);

        if (count > 0) {
            container.addEventListener('click', () => {
                document.body.removeChild(overlay);
                if (type === '精靈球') {
                    startCaptureBattle(difficulty, randomId, 1);
                } else if (type === '大師球') {
                    startCaptureBattle(difficulty, randomId, 2);
                }
            });
        }

        return container;
    }

    ballsContainer.appendChild(createBallOption('精靈球', normalBalls, './img/normal.png'));
    ballsContainer.appendChild(createBallOption('大師球', superBalls, './img/super.png'));

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.cssText = `
        padding: 8px 20px; border: none; border-radius: 5px;
        background: #ff4444; color: white; cursor: pointer; font-size: 16px;
        transition: background 0.2s;
    `;

    cancelButton.addEventListener('mouseover', () => {
        cancelButton.style.background = '#ff6666';
    });

    cancelButton.addEventListener('mouseout', () => {
        cancelButton.style.background = '#ff4444';
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    content.appendChild(title);
    content.appendChild(ballsContainer);
    content.appendChild(cancelButton);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

function autogenerateBall(gameArea, ballSrc) {
    if (isSelectingBall) return;
    selectedBall = document.createElement('img');
    selectedBall.src = ballSrc;
    selectedBall.style.cssText = `
        position: absolute;
        bottom: 150px; left: 50%;
        transform: translateX(-50%);
        width: 100px; height: 100px;
        transition: transform 5s linear;
    `;
    gameArea.appendChild(selectedBall);
    isSelectingBall = true;
}
// 開始捕捉戰鬥
function movePokemon(overlay, pokemon, gameAreaWidth, gameAreaHeight, moveSpeed) {
    let pokemonX = gameAreaWidth / 2 - 50; 
    let pokemonY = gameAreaHeight * 0.3 - 50; 
    let directionX = 1;
    let directionY = 1;

    function animate() {
        if (!document.body.contains(overlay)) return; // overlay 不在文件中則停止
        pokemonX += directionX * moveSpeed;
        pokemonY += directionY * moveSpeed;

        // 邊界檢查
        if (pokemonX <= 0 || pokemonX >= gameAreaWidth - 100) directionX *= -1;
        if (pokemonY <= 0 || pokemonY >= gameAreaHeight - 100) directionY *= -1;

        pokemon.style.left = `${pokemonX}px`;
        pokemon.style.top = `${pokemonY}px`;

        requestAnimationFrame(animate);
    }
    animate();
}

function startCaptureBattle(difficulty, randomId, ballType) {
    const { overlay, startBattle } = createCaptureBattleUI(difficulty, randomId, ballType);
    // 先將 overlay 加入文件
    document.body.appendChild(overlay);
    // overlay 存在於文件之後再開始戰鬥邏輯
    startBattle();
}

function createCaptureBattleUI(difficulty, randomId, ballType) {
    const gameAreaWidth = 700;
    const gameAreaHeight = 600;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999;
        font-family: 'cnfont', 'enfont', sans-serif;
        cursor: crosshair;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: rgba(0, 0, 0, 0.7);
        padding: 20px; border-radius: 10px;
        text-align: center; color: white; position: relative;
        width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: flex-end;
        overflow: hidden;
    `;

    const gameArea = document.createElement('div');
    gameArea.style.cssText = `
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
    `;

    const pokemon = document.createElement('img');
    pokemon.src = `./pokemon/${String(randomId).padStart(3, '0')}.gif`;
    pokemon.style.cssText = `
        position: absolute; top: 15%; left: 46%;
        width: 200px; height: 200px;
        transition: transform 0.3s;
    `;

    const difficultyText = document.createElement('div');
    difficultyText.style.cssText = `
        position: absolute; top: 10%; left: 50%;
        transform: translateX(-50%);
        color: #FFD700; font-size: 24px; z-index: 1000;
    `;
    difficultyText.textContent = `難度：${difficulty}`;

    content.appendChild(gameArea);
    overlay.appendChild(content);
    gameArea.appendChild(pokemon);
    gameArea.appendChild(difficultyText);

    // 將這些變數與函式都放在 createCaptureBattleUI 的閉包中
    let isSelectingBall = false;
    let selectedBall = null;
    const ballSrc = (ballType === 1) ? './img/normal.png' : './img/super.png';

    function autogenerateBall() {
        if (isSelectingBall) return;
        selectedBall = document.createElement('img');
        selectedBall.src = ballSrc;
        selectedBall.style.cssText = `
            position: absolute;
            bottom: 150px; left: 50%;
            transform: translateX(-50%);
            width: 100px; height: 100px;
            transition: transform 5s linear;
        `;
        gameArea.appendChild(selectedBall);
        isSelectingBall = true;
    }

    function throwBall(event) {
        if (!isSelectingBall || !selectedBall) return;

        const rect = gameArea.getBoundingClientRect();
        const targetX = event.clientX - rect.left - 15;
        const targetY = event.clientY - rect.top - 15;

        const startX = gameArea.offsetWidth / 2 - 15;
        const startY = gameArea.offsetHeight - 150;
        let currentX = startX;
        let currentY = startY;

        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocity = 10; 
        const directionX = dx / distance;
        const directionY = dy / distance;

        function animate() {
            currentX += directionX * velocity;
            currentY += directionY * velocity;
            selectedBall.style.left = `${currentX}px`;
            selectedBall.style.top = `${currentY}px`;

            const pokemonRect = pokemon.getBoundingClientRect();
            const ballRect = selectedBall.getBoundingClientRect();

            if (
                ballRect.left < pokemonRect.right &&
                ballRect.right > pokemonRect.left &&
                ballRect.top < pokemonRect.bottom &&
                ballRect.bottom > pokemonRect.top
            ) {
                endThrow(true);
                return;
            }

            if (
                currentX < 0 ||
                currentX > gameArea.offsetWidth - 30 ||
                currentY < 0 ||
                currentY > gameArea.offsetHeight - 30
            ) {
                endThrow(false);
                return;
            }

            requestAnimationFrame(animate);
        }

        function endThrow(hit) {
            if (selectedBall && selectedBall.parentNode) {
                selectedBall.remove();
            }
            isSelectingBall = false;
            selectedBall = null;

            if (hit) {
                if (ballType === 1) {
                    normalBalls--;
                    capturePokemon(1, difficulty, randomId);
                } else if (ballType === 2) {
                    superBalls--;
                    capturePokemon(2, difficulty, randomId);
                }
            } else {
                reward_overlay.style.display = 'flex';
                rewardText.textContent = '球飛出去了！';
                rewardImg.src = `./gif/empty.gif`;
                setTimeout(() => { reward_overlay.style.display = 'none'; }, 2000);
            }

            updateInventory();

            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }

        animate();
    }

    gameArea.addEventListener('click', throwBall);

    function movePokemon() {
        let pokemonX = gameAreaWidth / 2 - 50;
        let pokemonY = gameAreaHeight * 0.3 - 50; 
        let directionX = 1;
        let directionY = 1;
        const moveSpeed = difficulty * 1;

        function animate() {
            if (!document.body.contains(overlay)) return;

            pokemonX += directionX * moveSpeed;
            pokemonY += directionY * moveSpeed;

            if (pokemonX <= 0 || pokemonX >= gameAreaWidth * 2) directionX *= -1;
            if (pokemonY <= 0 || pokemonY >= gameAreaHeight - 200) directionY *= -1;

            pokemon.style.left = `${pokemonX}px`;
            pokemon.style.top = `${pokemonY}px`;

            requestAnimationFrame(animate);
        }
        animate();
    }

    function startBattle() {
        autogenerateBall();
        movePokemon();
    }

    return { overlay, startBattle };
}


function askPlayerToCapture(difficulty, randomId) {
    if (superBalls === 0 && normalBalls === 0) {
        alert('精靈球不足！');
        return;
    }
    createBallSelectionUI(difficulty, randomId);
}

function capturePokemon(ball_type, difficulty, pokemon_id) {
    // 捕捉機率判定
    if (ball_type == 1 && Math.random() <= 0.3) {
        // 普通球有30%機率寶可夢跑走
        reward_overlay.style.display = 'flex';
        rewardText.textContent = '寶可夢跑走了！';
        rewardImg.src = `./gif/empty.gif`;
        setTimeout(() => { reward_overlay.style.display = 'none'; }, 2000);
        return;
    } else if (ball_type == 2 && Math.random() <= 0.1) {
        // 大師球有10%機率寶可夢跑走
        reward_overlay.style.display = 'flex';
        rewardText.textContent = '寶可夢跑走了！';
        rewardImg.src = `./gif/empty.gif`;
        setTimeout(() => { reward_overlay.style.display = 'none'; }, 2000);
        return;
    }

    const randomId = pokemon_id;
    const selectedPokemon = `./pokemon/${randomId.toString().padStart(3, '0')}.gif`;
    addPokemonToCollection(randomId);
    reward_overlay.style.display = 'flex';
    rewardImg.src = selectedPokemon;
    if (ball_type == 3) {
        rewardText.textContent = '恭喜孵化出寶可夢 ' + randomId + ' !';
    } else {
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
    startButton.src = './gif/start.gif';
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

    diceGif.src = '';
    setTimeout(() => {
        diceGif.src = './gif/dice.gif'; // 重新加载 GIF
    }, 10);

    merchantOverlay.appendChild(diceGif);

    setTimeout(() => {
        merchantOverlay.removeChild(diceGif);
        merchantOverlay.innerHTML = '';
        rollDiceImages(gametype);
        merchantOverlay.style.display = 'none';
        renewmerchant();
    }, 1150);
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
    if (!pokemons.includes(pokemonId)) {
        pokemons.push(pokemonId);
        localStorage.setItem('collectedPokemon', JSON.stringify(pokemons));
        setCookie('collected_pokemon', JSON.stringify(pokemons), 60 * 60 * 24 * 30); // 30 days
    }
}

document.getElementById('pokedex-button').addEventListener('click', () => {
    window.location.href = './pokemon.html';
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initialized');

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const initializeGame = () => {
        const currentCharacter = getCookie('trainer') || null;

        if (currentCharacter != 'none') {
            document.getElementById('goose').style.backgroundImage = `url('./gif/${currentCharacter}.gif')`;
            document.getElementById('character-selection-overlay').style.display = 'none';
            console.log(`Initialized with character: ${currentCharacter}`);
        } else {
            document.getElementById('character-selection-overlay').style.display = 'flex';
        }

        coinsnum = parseInt(getCookie('coins') || 0, 10);
        normalBalls = parseInt(getCookie('normalballs') || 0, 10);
        superBalls = parseInt(getCookie('superballs') || 0, 10);
        curtrainer = currentCharacter;
        let pokemons = getCookie('collected_pokemon');
        console.log('Raw cookie value:', pokemons);

        pokemons = pokemons ? JSON.parse(decodeURIComponent(pokemons)) : [];
        console.log('Parsed pokemons array:', pokemons);

        console.log('Loaded user data:', { coinsnum, normalBalls, superBalls, pokemons });
    };

    const characterButtons = document.querySelectorAll('.character-button');

    characterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCharacter = button.dataset.character;
            document.getElementById('goose').style.backgroundImage = `url('./gif/${selectedCharacter}.gif')`;
            saveUserData({ trainer: selectedCharacter });
            setCookie('trainer', selectedCharacter, 60 * 60 * 24 * 30);
            curtrainer = selectedCharacter;
            document.getElementById('character-selection-overlay').style.display = 'none';
            console.log(`Character selected: ${selectedCharacter}`);
        });
    });

    const saveUserData = async (data) => {
        try {
            const response = await fetch('game.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log('Save result:', result);
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    initializeGame();
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

function setCookie(name, value, maxAgeSeconds) {
    console.log(`Setting cookie: ${name}=${value}; path=/; max-age=${maxAgeSeconds}`);
    console.log(document.cookie);
    document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}`;

    const data = {
        trainer: getCookie('trainer') || 'none',
        coins: parseInt(getCookie('coins') || 0, 10),
        normalballs: parseInt(getCookie('normalballs') || 0, 10),
        superballs: parseInt(getCookie('superballs') || 0, 10),
        collected_pokemon: getCookie('collected_pokemon') || '[]'
    };

    fetch('game.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            console.log(`Data synced successfully: ${name}=${value}`);
        } else {
            console.error(`Failed to sync data: ${result.message}`);
        }
    })
    .catch(error => {
        console.error('Error syncing data to server:', error);
    });
}

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
startGameLoop();
