function createGame()
{
	let startStopButton = document.getElementById('startStopButton');
	let turnLeftButton = document.getElementById("turnLeftButton");
	let turnRightButton = document.getElementById("turnRightButton");
	let lengthHolder = document.getElementById("lengthHolder");
	let canvas = document.getElementById("snakeCanvas");

	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let timer;
	let snake = new Snake();
	lengthHolder.textContent = snake.length;
	let food = new Food(snake, canvas);
	food.setNewLocation();

	snake.drawSnake(ctx);
	food.drawFood(ctx);
	let timePerTurn = 150;
	let speedIncreasement = 0.25;
	let advanceOneTurn = function() {
		ctx.clearRect(snake.tail.x, snake.tail.y, snake.width, snake.width);

		let nextMovement = snake.getNextMovement();
		if (snake.head.x + nextMovement.x === food.x && snake.head.y + nextMovement.y === food.y)
		{
			// no need to clear food because the snake has already done that
			snake.addBodyPart();
			food.consume();
			food.drawFood(ctx);
			clearInterval(timer);
			timer = undefined;
			timePerTurn -= speedIncreasement;
			timer = setInterval(advanceOneTurn, timePerTurn);
			lengthHolder.textContent = snake.length;
		}
		snake.advanceSnake(nextMovement);
		snake.drawSnake(ctx);
		if (snake.head.x < 0 || canvas.width < snake.head.x + snake.width ||
			snake.head.y < 0 || canvas.height < snake.head.y + snake.width || snake.containsPoint(snake.head.x, snake.head.y))
		{
			stopGame();
			createRestartButton();
			snake.drawCrash(ctx);
		}
	};

	let turn = function(degree) {
		if (timer !== undefined)
			snake.turn(degree)
	};
	turnLeftButton.onclick = () => turn(-1);
	turnRightButton.onclick = () => turn(1);
	document.body.addEventListener('keydown', function(e) {
		switch (e.key)
		{
			case "ArrowLeft":
				turn(-1);
				break;
			case "ArrowRight":
				turn(1);
				break;

		}
	});


	let startGame = function()
	{
		timer = setInterval(advanceOneTurn, timePerTurn);
		startStopButton.removeEventListener('click', startGame);
		startStopButton.addEventListener('click', stopGame);
		startStopButton.textContent = "Stop";
	};
	let stopGame = function()
	{
		clearInterval(timer);
		timer = undefined;
		startStopButton.removeEventListener('click', stopGame);
		startStopButton.addEventListener('click', startGame);
		startStopButton.textContent = "Start";
	};
	let createRestartButton = function()
	{
		startStopButton.textContent = "Restart";
		startStopButton.removeEventListener('click', startGame);
		startStopButton.addEventListener('click', createGame);
	};

	startStopButton.removeEventListener('click', createGame);
	startStopButton.addEventListener('click', startGame);
	startGame();
}

class Snake
{
	constructor()
	{
		this.head = new BodyPart(0, 0, undefined, undefined);
		this.tail = this.head;
		this.length = 1;
		this.width = 10;
		this.ORIENTATIONS = {
			right: 0,
			down: 1,
			left: 2,
			up: 3,
		};
		this.orientation = this.ORIENTATIONS.right;
	}

	/**
	 * @param {Vector} nextMovement
	 */
	advanceSnake(nextMovement)
	{
		this.hasTurned = false;
		this.moveBy(nextMovement.x, nextMovement.y);
	}

	moveBy(x, y)
	{
		this.makeTailHead();
		this.head.x = this.head.x + x;
		this.head.y = this.head.y + y;
	}

	/**
	 * @returns {Vector}
	 */
	getNextMovement()
	{
		switch (this.orientation)
		{
			case this.ORIENTATIONS.right:
				return new Vector(this.width, 0);
			case this.ORIENTATIONS.down:
				return new Vector(0, this.width);
			case this.ORIENTATIONS.left:
				return new Vector(-this.width, 0);
			case this.ORIENTATIONS.up:
				return new Vector(0, -this.width);
		}
	}

	containsPoint(x, y)
	{
		let next = this.head.next;
		while (next !== undefined)
		{
			if (x === next.x && y === next.y)
			{
				return true;
			}
			next = next.next;
		}
		return false;
	}

	makeTailHead()
	{
		if (this.length > 1)
		{
			this.head.previous = this.tail;
			this.tail.next = this.head;
			this.head = this.tail;
			this.tail = this.head.previous;
			this.head.previous = undefined;
			this.tail.next = undefined;
			this.head.x = this.head.next.x;
			this.head.y = this.head.next.y;
		}
	}

	drawEyes(ctx)
	{
		let startX1;
		let startY1;
		let startX2;
		let startY2;
		let width;
		let height;

		let isVertical = () => {
			width = 2;
			height = 5;
		};
		let isHorizontal = () => {
			width = 5;
			height = 2;
		};

		switch (this.orientation)
		{
			case this.ORIENTATIONS.right:
				startX1 = this.head.x + this.width / 2;
				startX2 = startX1;
				startY1 = this.head.y + this.width * 0.2;
				startY2 = this.head.y + this.width * 0.6;
				isHorizontal();
				break;
			case this.ORIENTATIONS.down:
				startX1 = this.head.x + this.width * 0.2;
				startX2 = this.head.x + this.width * 0.6;
				startY1 = this.head.y + this.width / 2;
				startY2 = startY1;
				isVertical();
				break;
			case this.ORIENTATIONS.left:
				startX1 = this.head.x;
				startX2 = startX1;
				startY1 = this.head.y + this.width * 0.2;
				startY2 = this.head.y + this.width * 0.6;
				isHorizontal();
				break;
			case this.ORIENTATIONS.up:
				startX1 = this.head.x + this.width * 0.2;
				startX2 = this.head.x + this.width * 0.6;
				startY1 = this.head.y;
				startY2 = startY1;
				isVertical();
				break;
		}

		ctx.fillStyle = "black";
		ctx.fillRect(startX1, startY1, width, height);
		ctx.fillRect(startX2, startY2, width, height);
	}
	drawSnake(ctx)
	{
		ctx.fillStyle = 'red';
		let currentBodyPart = this.head;
		while (currentBodyPart !== undefined)
		{
			ctx.fillRect(currentBodyPart.x, currentBodyPart.y, this.width, this.width);

			currentBodyPart = currentBodyPart.next;
		}
		this.drawEyes(ctx);
	}
	drawCrash(ctx)
	{
		ctx.beginPath();
		let radius = this.width * 1.25;
		let originX = this.head.x + this.width / 2;
		let originY = this.head.y + this.width / 2;
		ctx.moveTo(originX, originY + this.width);
		let points = 7;
		for (let i = 1; i <= points; i++)
		{
			let endPointX = originX + radius * Math.sin((i / points) * (2 * Math.PI));
			let endPointY = originY + radius * Math.cos((i / points) * (2 * Math.PI));
			ctx.quadraticCurveTo(originX, originY, endPointX, endPointY);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	turn(degree)
	{
		if (!this.hasTurned)
		{
			this.hasTurned = true;
			this.orientation += degree;
			if (this.orientation < 0)
			{
				this.orientation = 3;
			}
			else if (this.orientation > 3)
			{
				this.orientation = 0;
			}
		}
	}

	addBodyPart()
	{
		let directionX = 0;
		let directionY = 0;
		if (this.length > 1)
		{
			directionX = this.tail.previous.x - this.tail.x;
			directionY = this.tail.previous.y - this.tail.y;
		}
		else
		{
			switch (this.orientation)
			{
				case this.ORIENTATIONS.right:
					directionX = this.width;
					break;
				case this.ORIENTATIONS.down:
					directionY = this.width;
					break;
				case this.ORIENTATIONS.left:
					directionX = -this.width;
					break;
				case this.ORIENTATIONS.up:
					directionY = -this.width;
					break;
			}
		}
		this.tail.next = new BodyPart(this.tail.x - directionX, this.tail.y - directionY, this.tail, undefined);
		this.tail = this.tail.next;
		++this.length;
	}
}
class BodyPart
{
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {BodyPart|undefined} previousBodyPart
	 * @param {BodyPart|undefined} nextBodyPart
	 */
	constructor(x, y, previousBodyPart, nextBodyPart)
	{
		this.x = x;
		this.y = y;
		this.previous = previousBodyPart;
		this.next = nextBodyPart;
	}
}
class Food
{
	constructor(snake, canvas)
	{
		this.x = undefined;
		this.y = undefined;
		this.snake = snake;
		this.canvas = canvas;
	}

	consume()
	{
		this.x = undefined;
		this.y = undefined;
		this.setNewLocation();
	}

	setNewLocation()
	{
		while (this.x === undefined && this.y === undefined)
		{
			let newX = Math.floor(Math.random() * this.canvas.width / this.snake.width) * this.snake.width;
			let newY = Math.floor(Math.random() * this.canvas.height / this.snake.width) * this.snake.width;
			if (!this.snake.containsPoint(newX, newY))
			{
				this.x = newX;
				this.y = newY;
			}
		}
	}

	drawFood(ctx)
	{
		ctx.fillStyle = 'blue';
		ctx.fillRect(this.x, this.y, this.snake.width, this.snake.width);
	}
}
class Vector
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
}