//used to define positions
const gridSize = 4; //Use this to change grid size
let playerPos = {x: 0, y: 0}; //Initial Position
let facing = "up"; //Facing up
let wumpusPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)}; //Wumpus position (random)
let pitPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)}; //Position of pit
let goldPos = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)}; //Positioin of gold
let arrow = 1;
//used for game state
let finishPos = {x: 0, y: 0};
let gameOver = false;
let hasGold = false;
let perception = [];
let score = 0; //Initial score
let point = {
	//Points get for actions
	Gold: 1000,
	Death: -1000,
	Move: -1,
	Arrow: -10,
	Release_Gold: -1000,
};

function facingDirection(face) {
	facing = face;
	let img = document.getElementById("agent");
	img.setAttribute("class", "");
	img.classList.add("agent-" + face);
}
// Ensure gold, Wumpus, and pit aren't at the same location
function randomizePosition(existingPositions) {
	let position;
	do {
		position = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
	} while (existingPositions.some((p) => p.x === position.x && p.y === position.y));
	return position;
}

function updateScore(action) {
	score += point[action];
	$("#score").text(score);
}
// Re-assign new random positions to avoid overlap
wumpusPos = randomizePosition([playerPos]);
pitPos = randomizePosition([playerPos, wumpusPos]);
goldPos = randomizePosition([playerPos, wumpusPos, pitPos]);

function initGrid() {
	console.log(JSON.stringify(wumpusPos));
	const grid = document.getElementById("grid");
	grid.innerHTML = ""; // Clear previous grid

	for (let y = 0; y < gridSize; y++) {
		let row = document.createElement("div");
		row.classList.add("row");
		for (let x = 0; x < gridSize; x++) {
			let cell = document.createElement("div");
			cell.classList.add("cell");
			if (x === playerPos.x && y === playerPos.y) {
				let img = document.createElement("img"); // Player position
				img.src = "agent.svg";
				img.id = "agent";
				cell.appendChild(img);
			} else if (x === goldPos.x && y === goldPos.y && !hasGold) {
				cell.textContent = ""; // Gold position
			}
			row.appendChild(cell);
		}
		grid.appendChild(row);
	}
	facingDirection(facing);
}

function updateStatus(message) {
	document.getElementById("game-status").textContent = message;
}

function movePlayer(direction) {
	if (gameOver) return;
	const coordinates = {
		left: {x: -1, y: 0},
		right: {x: 1, y: 0},
		up: {x: 0, y: -1},
		down: {x: 0, y: 1},
	};
	let dx = coordinates[direction].x;
	let dy = coordinates[direction].y;
	// Calculate new position
	const newX = Math.min(Math.max(playerPos.x + dx, 0), gridSize - 1);
	const newY = Math.min(Math.max(playerPos.y + dy, 0), gridSize - 1);

	// Check if the new position is the same as the current position
	if (newX === playerPos.x && newY === playerPos.y) return;

	// Update player position
	playerPos.x = newX;
	playerPos.y = newY;
	console.log(JSON.stringify(playerPos));
	updateScore("Move");
	checkPosition();
	initGrid();
}

function shootArrow(face) {
	if (arrow >= 1) {
		arrow -= 1;
		const direction = {
			left: {x: -1, y: 0},
			right: {x: 1, y: 0},
			up: {x: 0, y: -1},
			down: {x: 0, y: 1},
		};
		document.getElementById("arrow").textContent = arrow;
		let coordinate = direction[face];
		if (playerPos.x + coordinate.x == wumpusPos.x && playerPos.y + coordinate.y == wumpusPos.y) {
			wumpusPos.x = -Infinity;
			wumpusPos.y = -Infinity;
			checkPosition();
			initGrid();
		}
	}
}
function checkPosition() {
	let message = "";
	perception = [];
	// Check if the player lands on Wumpus or pit
	if (playerPos.x === wumpusPos.x && playerPos.y === wumpusPos.y) {
		//If player is in the same room as Wumpus
		message = "You've been eaten by the Wumpus!";
		updateScore("Death");
		gameOver = true;
	} else if (playerPos.x === pitPos.x && playerPos.y === pitPos.y) {
		//If player is in the same room as the pit
		message = "You fell into a pit!";
		updateScore("Death");
		gameOver = true;
	} else if (playerPos.x === goldPos.x && playerPos.y === goldPos.y && !hasGold) {
		//If plalyer isin the same room as the gold
		message += "[You found something glittering]";
		perception.push("Glitter");
	} else if (hasGold == true && playerPos.x == finishPos.x && playerPos.y == finishPos.y) {
		message = "You win!";
		updateScore("Death");
		gameOver = true;
	} else {
		message = "You are safe... for now.";
	}
	// Check for breeze (adjacent to pit)
	if (isAdjacent(playerPos, pitPos)) {
		message += " [You feel a breeze.]";
		perception.push("Breeze");
	}

	// Check for scent (adjacent to Wumpus)
	if (isAdjacent(playerPos, wumpusPos)) {
		message += " [You smell something foul]";
		perception.push("Scent");
	}

	updateStatus(message);
}

function takeGold() {
	if (!hasGold && playerPos.x === goldPos.x && playerPos.y === goldPos.y) {
		updateScore("Gold");
		hasGold = true;
		updateStatus("You took the gold");
	} else if (hasGold && playerPos.x === goldPos.x && playerPos.y === goldPos.y) {
		hasGold = false;
		updateScore("Release_Gold");
		updateStatus("You released the gold");
	}
}
// Check if two positions are adjacent
function isAdjacent(pos1, pos2) {
	const dx = Math.abs(pos1.x - pos2.x);
	const dy = Math.abs(pos1.y - pos2.y);
	return (dx === 1 && dy === 0) || (dx === 0 && dy === 1); // Horizontal or vertical adjacency
}

document.addEventListener("keydown", function (event) {
	if (event.key === "w") facing != "up" ? facingDirection("up") : movePlayer("up");
	if (event.key === "a") facing != "left" ? facingDirection("left") : movePlayer("left"); // Left
	if (event.key === "s") facing != "down" ? facingDirection("down") : movePlayer("down"); // Down
	if (event.key === "d") facing != "right" ? facingDirection("right") : movePlayer("right"); // Right
	if (event.key === " ") shootArrow(facing);
	if (event.key === "Enter") takeGold();
});

// Initialize game
initGrid();
updateStatus("Move carefully... find the gold or kill the Wumpus.");
checkPosition();
