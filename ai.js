let aiPlaying = false; // Variable to track if AI is playing

function evaluateBoard(playerPos, wumpusPos, pitPos, goldPos, hasGold) {
	let score = 0;

	if (playerPos.x === wumpusPos.x && playerPos.y === wumpusPos.y) {
		score += point.Death; // If player is on Wumpus, death penalty
	} else if (playerPos.x === pitPos.x && playerPos.y === pitPos.y) {
		score += point.Death; // If player falls into a pit
	} else if (playerPos.x === goldPos.x && playerPos.y === goldPos.y && !hasGold) {
		score += point.Gold; // Found the gold
	}

	// Adjust score for moves and actions
	score += point.Move; // Movement penalty
	return score;
}

// Alpha-Beta Pruning
function alphaBeta(playerPos, wumpusPos, pitPos, goldPos, hasGold, depth, alpha, beta, isMaximizingPlayer) {
	if (depth === 0 || gameOver) {
		return evaluateBoard(playerPos, wumpusPos, pitPos, goldPos, hasGold);
	}

	let bestValue;

	if (isMaximizingPlayer) {
		bestValue = -Infinity; // Maximizing player's best value
		const validMoves = getValidMoves(playerPos);

		for (const move of validMoves) {
			const newPlayerPos = {x: playerPos.x + move.x, y: playerPos.y + move.y};
			const newGoldStatus = newPlayerPos.x === goldPos.x && newPlayerPos.y === goldPos.y && !hasGold;
			bestValue = Math.max(bestValue, alphaBeta(newPlayerPos, wumpusPos, pitPos, goldPos, newGoldStatus, depth - 1, alpha, beta, false));

			// Alpha-Beta Pruning
			alpha = Math.max(alpha, bestValue);
			if (beta <= alpha) {
				break; // Prune the tree
			}
		}
	} else {
		bestValue = Infinity; // Minimizing player's best value
		const validMoves = getValidMoves(playerPos);

		for (const move of validMoves) {
			const newPlayerPos = {x: playerPos.x + move.x, y: playerPos.y + move.y};
			const newGoldStatus = newPlayerPos.x === goldPos.x && newPlayerPos.y === goldPos.y && !hasGold;
			bestValue = Math.min(bestValue, alphaBeta(newPlayerPos, wumpusPos, pitPos, goldPos, newGoldStatus, depth - 1, alpha, beta, true));

			// Alpha-Beta Pruning
			beta = Math.min(beta, bestValue);
			if (beta <= alpha) {
				break; // Prune the tree
			}
		}
	}

	return bestValue;
}

// Function to get valid moves for the agent
function getValidMoves(playerPos) {
	const directions = [
		{x: 1, y: 0}, // Right
		{x: -1, y: 0}, // Left
		{x: 0, y: 1}, // Down
		{x: 0, y: -1}, // Up
	];

	return directions.filter((move) => {
		const newX = playerPos.x + move.x;
		const newY = playerPos.y + move.y;
		return newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize;
	});
}

// AI decision-making to choose the best move
function getBestMove(playerPos, wumpusPos, pitPos, goldPos, hasGold) {
	let bestMove = null;
	let bestValue = -Infinity;
	const validMoves = getValidMoves(playerPos);

	let possibleMoves = [
		{direction: "up", dx: 0, dy: -1},
		{direction: "down", dx: 0, dy: 1},
		{direction: "left", dx: -1, dy: 0},
		{direction: "right", dx: 1, dy: 0},
	];

	if (hasGold) {
		// If holding gold, return to start (finish position)
		if (playerPos.x > finishPos.x) bestMove = {dx: -1, dy: 0}; // Move left
		else if (playerPos.x < finishPos.x) bestMove = {dx: 1, dy: 0}; // Move right
		else if (playerPos.y > finishPos.y) bestMove = {dx: 0, dy: -1}; // Move up
		else if (playerPos.y < finishPos.y) bestMove = {dx: 0, dy: 1}; // Move down
	} else {
		// Otherwise, move towards the gold
		if (playerPos.x < goldPos.x) bestMove = {dx: 1, dy: 0}; // Move right
		else if (playerPos.x > goldPos.x) bestMove = {dx: -1, dy: 0}; // Move left
		else if (playerPos.y < goldPos.y) bestMove = {dx: 0, dy: 1}; // Move down
		else if (playerPos.y > goldPos.y) bestMove = {dx: 0, dy: -1}; // Move up
	}

	for (const move of validMoves) {
		const newPlayerPos = {x: playerPos.x + move.x, y: playerPos.y + move.y};
		const newGoldStatus = newPlayerPos.x === goldPos.x && newPlayerPos.y === goldPos.y && !hasGold;

		const moveValue = alphaBeta(newPlayerPos, wumpusPos, pitPos, goldPos, newGoldStatus, 3, -Infinity, Infinity, true);
		if (moveValue > bestValue) {
			bestValue = moveValue;
			bestMove = move;
		}
	}

	return bestMove;
}

// Function to simulate the AI's move
function aiMove() {
	console.log(playerPos.x, playerPos.y);
	if (!aiPlaying || gameOver) return; // AI only moves if it's playing

	const bestMove = getBestMove(playerPos, wumpusPos, pitPos, goldPos, hasGold);

	if (bestMove) {
		movePlayer(bestMove.x, bestMove.y);
	}
}

// Start the AI when the button is clicked
document.getElementById("start-ai-button").addEventListener("click", function () {
	aiPlaying = true;
	document.getElementById("game-status").textContent = "AI is playing...";
	setInterval(aiMove, 1000); // AI makes a move every second
});
