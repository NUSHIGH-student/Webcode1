export function startSpaceGame(container) {
    container.innerHTML = `
        <div style="color:white; padding:30px;">
            <h1>SPACE GAME</h1>
            <p>The game module is working!</p>
        </div>
    `;

    return function stopSpaceGame() {
        container.innerHTML = "";
    };
}
