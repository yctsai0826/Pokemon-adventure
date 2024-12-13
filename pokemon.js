const collected = JSON.parse(localStorage.getItem('collectedPokemon') || '[]');
const container = document.getElementById('pokedex-container');

for (let id = 1; id <= 14; id++) { // 假設寶可夢 ID 1 到 151
    const img = document.createElement('img');
    img.src = collected.includes(id) 
        ? `./pokemon/${id.toString().padStart(3, '0')}.gif`
        : './gif/back.gif';
    img.alt = `Pokemon ${id}`;
    container.appendChild(img);
}
