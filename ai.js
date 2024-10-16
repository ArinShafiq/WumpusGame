let aiPlaying = false; // Track if AI is playing

// Evaluate the board based on player and other positions
function evaluateBoard(playerPos, wumpusPos, pitPos, goldPos, hasGold) {
	let score = 0;

	// Check for death or gold collection
	if ((playerPos.x === wumpusPos.x && playerPos.y === wumpusPos.y) || (playerPos.x === pitPos.x && playerPos.y === pitPos.y)) {
		score = -1000; // Death penalty
	} else if (playerPos.x === goldPos.x && playerPos.y === goldPos.y && !hasGold) {
		score = 1000; // Reward for finding gold
	}

	return score - 1; // Movement penalty
}

// Simplified AI decision-making
function getBestMove(playerPos, wumpusPos, pitPos, goldPos, hasGold) {
	let bestMove = null;
	let bestValue = -Infinity;

	// Define possible moves as {x, y} changes
	const moves = [
		{x: 0, y: -1}, // Up
		{x: 0, y: 1}, // Down
		{x: -1, y: 0}, // Left
		{x: 1, y: 0}, // Right
	];

	for (const move of moves) {
		const newPlayerPos = {x: playerPos.x + move.x, y: playerPos.y + move.y};

		// Ensure the move stays within grid bounds
		if (newPlayerPos.x >= 0 && newPlayerPos.x < gridSize && newPlayerPos.y >= 0 && newPlayerPos.y < gridSize) {
			const score = evaluateBoard(newPlayerPos, wumpusPos, pitPos, goldPos, hasGold);
			if (score > bestValue) {
				bestValue = score;
				bestMove = move;
			}
		}
	}

	return bestMove;
}

// Simulate the AI's move
function aiMove() {
	if (!aiPlaying || gameOver) return;

	const bestMove = getBestMove(playerPos, wumpusPos, pitPos, goldPos, hasGold);

	if (bestMove) {
		movePlayer(bestMove.x, bestMove.y); // Use bestMove's x and y directly
	}
}

// Start the AI when the button is clicked
document.getElementById("start-ai-button").addEventListener("click", function () {
	aiPlaying = true;
	document.getElementById("game-status").textContent = "AI is playing...";
	setInterval(aiMove, 1000); // AI moves every second
});
