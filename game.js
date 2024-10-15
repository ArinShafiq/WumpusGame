const gridSize = 4;
        let playerPos = {x: 0, y: 0};
        let wumpusPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        let pitPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        let goldPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        let gameOver = false;
        let hasGold = false;

        // Ensure gold, Wumpus, and pit aren't at the same location
        function randomizePosition(existingPositions) {
            let position;
            do {
                position = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
            } while (existingPositions.some(p => p.x === position.x && p.y === position.y));
            return position;
        }

        // Re-assign new random positions to avoid overlap
        wumpusPos = randomizePosition([playerPos]);
        pitPos = randomizePosition([playerPos, wumpusPos]);
        goldPos = randomizePosition([playerPos, wumpusPos, pitPos]);

        function initGrid() {
            const grid = document.getElementById('grid');
            grid.innerHTML = '';  // Clear previous grid
            
            for (let y = 0; y < gridSize; y++) {
                let row = document.createElement('div');
                row.classList.add('row');
                for (let x = 0; x < gridSize; x++) {
                    let cell = document.createElement('div');
                    cell.classList.add('cell');
                    if (x === playerPos.x && y === playerPos.y) {
                        cell.textContent = 'A';  // Player position
                    } else if (x === goldPos.x && y === goldPos.y && !hasGold) {
                        cell.textContent = 'G';  // Gold position
                    }
                    row.appendChild(cell);
                }
                grid.appendChild(row);
            }
        }

        function updateStatus(message) {
            document.getElementById('game-status').textContent = message;
        }

        function movePlayer(dx, dy) {
            if (gameOver) return;

            playerPos.x = Math.min(Math.max(playerPos.x + dx, 0), gridSize - 1);
            playerPos.y = Math.min(Math.max(playerPos.y + dy, 0), gridSize - 1);
            
            checkPosition();
            initGrid();
        }

        function checkPosition() {
            let message = "";
            
            // Check if the player lands on Wumpus or pit
            if (playerPos.x === wumpusPos.x && playerPos.y === wumpusPos.y) {
                message = "You've been eaten by the Wumpus!";
                gameOver = true;
            } else if (playerPos.x === pitPos.x && playerPos.y === pitPos.y) {
                message = "You fell into a pit!";
                gameOver = true;
            } else if (playerPos.x === goldPos.x && playerPos.y === goldPos.y && !hasGold) {
                message = "You found the gold! You win!";
                hasGold = true;
                gameOver = true;
            } else {
                message = "You are safe... for now.";
            }

            // Check for breeze (adjacent to pit)
            if (isAdjacent(playerPos, pitPos)) {
                message += " You feel a breeze.";
            }

            // Check for scent (adjacent to Wumpus)
            if (isAdjacent(playerPos, wumpusPos)) {
                message += " You smell something foul.";
            }

            updateStatus(message);
        }

        // Check if two positions are adjacent
        function isAdjacent(pos1, pos2) {
            const dx = Math.abs(pos1.x - pos2.x);
            const dy = Math.abs(pos1.y - pos2.y);
            return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);  // Horizontal or vertical adjacency
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'w') movePlayer(0, -1);  // Up
            if (event.key === 'a') movePlayer(-1, 0);  // Left
            if (event.key === 's') movePlayer(0, 1);   // Down
            if (event.key === 'd') movePlayer(1, 0);   // Right
        });

        // Initialize game
        initGrid();
        updateStatus("Move carefully... find the gold or kill the Wumpus.");