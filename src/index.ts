import { Colors, fromHsv, fromRgb, Key, RNG, Terminal } from 'wglt';

const WIDTH = 80;
const HEIGHT = 45;

const term = new Terminal(document.querySelector('canvas') as HTMLCanvasElement, WIDTH, HEIGHT);
term.fillRect(0, 0, WIDTH, HEIGHT, 0, fromRgb(18, 53, 36), Colors.BLACK);

term.drawString(1, 1, '#', Colors.WHITE);

const rng = new RNG();

type star = {
	x: number;
	y: number;
	color: number;
	speed: number;
}

const stars: star[] = [];
for (let i = 0; i < 50; i++) {
	const b: number = rng.nextRange(64, 192);
	stars.push({
		x: rng.nextRange(0, WIDTH),
		y: rng.nextRange(0, HEIGHT),
		color: fromRgb(b, b, b),
		speed: rng.nextFloat() / 2
	});
}

const player = {
	x: Math.floor(WIDTH / 2),
	y: Math.floor(HEIGHT / 2),
	character: '@'
}

type tile = {
	character: string;
	walkable: boolean;
	transparent: boolean;
}

const WallTile: tile = {
	character: '#',
	walkable: false,
	transparent: false
}

const FloorTile: tile = {
	character: '.',
	walkable: true,
	transparent: true
}

const NullTile: tile = {
	character: ' ',
	walkable: false,
	transparent: false
}

const JettisonTile: tile = {
	character: '_',
	walkable: true,
	transparent: true
}

const roomWidth = 20;

const map = new Map<string, tile>();

for (let i = 0; i < roomWidth; i++) {
	for (let j = 0; j < roomWidth; j++) {
		const x = i + Math.floor(WIDTH / 2 - roomWidth / 2);
		const y = j + Math.floor(HEIGHT / 2 - roomWidth / 2);
		const key = x + "," + y;
		map.set(key, WallTile);
	}
}

for (let i = 1; i < roomWidth - 1; i++) {
	for (let j = 1; j < roomWidth - 1; j++) {
		const x = i + Math.floor(WIDTH / 2 - roomWidth / 2);
		const y = j + Math.floor(HEIGHT / 2 - roomWidth / 2);
		const key = x + "," + y;
		map.set(key, FloorTile);
	}
}

map.set(30 + "," + 20, FloorTile);
map.set(30 + "," + 21, FloorTile);
map.set(30 + "," + 22, FloorTile);
map.set(30 + "," + 23, FloorTile);

map.set(29 + "," + 20, JettisonTile);
map.set(29 + "," + 21, JettisonTile);
map.set(29 + "," + 22, JettisonTile);
map.set(29 + "," + 23, JettisonTile);

const boxes = new Map<string, string>();

let x = player.x + 3;
let y = player.y + 3;
boxes.set(x + "," + y, "X");

x = player.x - 2;
y = player.y;
boxes.set(x + "," + y, "X");

const jetsam: any[] = [];

let paused = false;
let alive = true;

let shipSpeed = 0;

term.update = function () {

	if (alive) {
		const moveKey = term.getMovementKey();
		if (moveKey) {
			const destX = player.x + moveKey.x;
			const destY = player.y + moveKey.y;

			if (canWalk(destX, destY)) {

				let playerCanMove = false;

				if (hasBox(destX, destY)) {
					if (pushBox(destX, destY, moveKey.x, moveKey.y)) {
						playerCanMove = true;
					}
				} else {
					playerCanMove = true;
				}

				if (playerCanMove) {
					player.x = destX;
					player.y = destY;

					const key = player.x + "," + player.y;
					if (map.get(key) === JettisonTile) {
						jetsam.push({
							x: player.x,
							y: player.y,
							character: player.character
						});
						alive = false;
					}
				}
			}
		}
	}

	for (let [key, box] of boxes) {
		if (map.get(key) === JettisonTile) {
			boxes.delete(key);
			const [keyX, keyY] = key.split(',');
			const x = parseInt(keyX);
			const y = parseInt(keyY);
			jetsam.push({
				x: x,
				y: y,
				character: box
			});

			shipSpeed += 1;
		}
	}

	if (term.isKeyPressed(Key.VK_P)) {
		paused = !paused;
	}

	// if (term.isKeyPressed(Key.VK_LEFT)) {
	// 	shipSpeed -= 0.1;
	// }

	// if (term.isKeyPressed(Key.VK_RIGHT)) {
	// 	shipSpeed += 0.1;
	// }

	term.clear();


	for (let i = 0; i < stars.length; i++) {
		const star = stars[i];

		const tailLength = Math.floor(star.speed * 20 * shipSpeed);

		let string = '.';

		if (tailLength > 1) {
			string = '_'.repeat(tailLength);
		}

		term.drawString(star.x, star.y, string, star.color);

		if (!paused) {
			star.x -= (star.speed * 1 * shipSpeed);
			if (star.x < (0 - string.length)) {
				star.x += (WIDTH + string.length);
				star.y = rng.nextRange(0, HEIGHT);
			}
		}
	}

	for (let [key, tile] of map) {
		const [keyX, keyY] = key.split(',');
		const x = parseInt(keyX);
		const y = parseInt(keyY);

		const r = 18;
		const g = 53;
		const b = 36;

		const color = fromRgb(r, g, b);

		term.drawString(x, y, tile.character, color);
	}

	for (let [key, box] of boxes) {
		const [keyX, keyY] = key.split(',');
		const x = parseInt(keyX);
		const y = parseInt(keyY);
		term.drawString(x, y, box, Colors.WHITE);
	}

	for (let i = 0; i < jetsam.length; i++) {
		const jet = jetsam[i];
		term.drawString(jet.x, jet.y, jet.character, Colors.DARK_GRAY);

		if (!paused) {
			jet.x -= 0.1;
		}
	}

	if (alive) {
		term.drawString(player.x, player.y, player.character, Colors.WHITE);
	}
};

function canWalk(x: number, y: number): boolean {
	const key = x + "," + y;
	const tile = map.get(key) || NullTile;
	return tile.walkable;
}

function hasBox(x: number, y: number): boolean {
	const key = x + "," + y;
	return boxes.has(key);
}

function pushBox(x: number, y: number, xDir: number, yDir: number): boolean {
	const destX = x + xDir;
	const destY = y + yDir;

	if (canWalk(destX, destY)) {
		if (!hasBox(destX, destY) || pushBox(destX, destY, xDir, yDir)) {
			boxes.delete(x + "," + y);
			boxes.set(destX + "," + destY, "X");

			return true;
		}
	}

	return false;
}
