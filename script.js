const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');   
        const CELL_SIZE = 20;
        const CANVAS_WIDTH = canvas.width;
        const CANVAS_HEIGHT = canvas.height;

        let snake, direction, food, score, level, speed, isPaused, gameStarted, timer, elapsedTime, timerInterval;

        const SPEED_INCREMENT = 0.05; // 5% speed increase per level
        const LEVEL_COLORS = ['#f0f0f0', '#ffcccc', '#ccffcc', '#ccccff', '#ffffcc', '#ffccff', '#ccffff'];

        function initializeGame() {
            const savedGame = JSON.parse(localStorage.getItem('snakeGame'));

            if (savedGame) {
                snake = savedGame.snake;
                direction = savedGame.direction;
                food = savedGame.food;
                score = savedGame.score;
                level = savedGame.level;
                speed = savedGame.speed;
                isPaused = savedGame.isPaused;
                gameStarted = savedGame.gameStarted;
                elapsedTime = savedGame.elapsedTime;
                changeBackgroundColor(level);
            } else {
                resetGame();
            }

            draw();
            updateScoreboard();
            startTimer();
            if (!isPaused) {
                update();
            }
        }

        function resetGame() {
            snake = [{ x: 100, y: 100 }, { x: 80, y: 100 }, { x: 60, y: 100 }];
            direction = 'RIGHT';
            food = generateFood();
            score = 0;
            level = 1;
            speed = 250; // Initial speed in milliseconds
            isPaused = true;
            gameStarted = false;
            elapsedTime = 0;
            changeBackgroundColor(level);
            localStorage.removeItem('snakeGame');
        }

        function draw() {
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            snake.forEach(part => {
                ctx.fillStyle = 'green';
                ctx.fillRect(part.x, part.y, CELL_SIZE, CELL_SIZE);
            });

            ctx.fillStyle = 'red';
            ctx.fillRect(food.x, food.y, CELL_SIZE, CELL_SIZE);

            if (isPaused) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.fillStyle = 'black';
                ctx.font = '48px Arial';
                ctx.fillText(gameStarted ? 'Paused' : 'Press Arrow Key to Start', CANVAS_WIDTH / 2.2- 230, CANVAS_HEIGHT / 2);
            }
        }

        function update() {
            if (isPaused) {
                draw();
                return;
            }

            const head = { ...snake[0] };

            switch (direction) {
                case 'UP':
                    head.y -= CELL_SIZE;
                    break;
                case 'DOWN':
                    head.y += CELL_SIZE;
                    break;
                case 'LEFT':
                    head.x -= CELL_SIZE;
                    break;
                case 'RIGHT':
                    head.x += CELL_SIZE;
                    break;
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score += 1;
                food = generateFood();
                if (score % 30 === 0) {
                    level += 1;
                    speed = speed * (1 - SPEED_INCREMENT);
                    changeBackgroundColor(level);
                }
            } else {
                snake.pop();
            }

            if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT || collision(head, snake)) {
                alert(`Game Over! Your score: ${score}`);
                resetGame();
                draw();
                return;
            }

            draw();
            saveGame();
            updateScoreboard();
            setTimeout(update, speed);
        }

        function changeDirection(event) {
            const keyPressed = event.keyCode;
            const LEFT_KEY = 37;
            const UP_KEY = 38;
            const RIGHT_KEY = 39;
            const DOWN_KEY = 40;
            const PAUSE_KEY = 80; // 'P' key

            if (keyPressed === LEFT_KEY && direction !== 'RIGHT') {
                direction = 'LEFT';
            }
            if (keyPressed === UP_KEY && direction !== 'DOWN') {
                direction = 'UP';
            }
            if (keyPressed === RIGHT_KEY && direction !== 'LEFT') {
                direction = 'RIGHT';
            }
            if (keyPressed === DOWN_KEY && direction !== 'UP') {
                direction = 'DOWN';
            }
            if (keyPressed === PAUSE_KEY) {
                isPaused = !isPaused;
                saveGame();
                if (!isPaused) {
                    update();
                }
            }

            if (!gameStarted && [LEFT_KEY, UP_KEY, RIGHT_KEY, DOWN_KEY].includes(keyPressed)) {
                gameStarted = true;
                isPaused = false;
                update();
            }
        }

        function handleMouseClick(event) {
            const x = event.clientX - canvas.getBoundingClientRect().left;
            const y = event.clientY - canvas.getBoundingClientRect().top;

            if (x < canvas.width / 3) {
                if (direction !== 'RIGHT') {
                    direction = 'LEFT';
                }
            } else if (x > canvas.width * 2 / 3) {
                if (direction !== 'LEFT') {
                    direction = 'RIGHT';
                }
            } else if (y < canvas.height / 3) {
                if (direction !== 'DOWN') {
                    direction = 'UP';
                }
            } else if (y > canvas.height * 2 / 3) {
                if (direction !== 'UP') {
                    direction = 'DOWN';
                }
            }

            if (!gameStarted) {
                gameStarted = true;
                isPaused = false;
                update();
            }
        }

        function handleTouch(event) {
            event.preventDefault();
            const touch = event.touches[0];
            const x = touch.clientX - canvas.getBoundingClientRect().left;
            const y = touch.clientY - canvas.getBoundingClientRect().top;

            if (x < canvas.width / 3) {
                if (direction !== 'RIGHT') {
                    direction = 'LEFT';
                }
            } else if (x > canvas.width * 2 / 3) {
                if (direction !== 'LEFT') {
                    direction = 'RIGHT';
                }
            } else if (y < canvas.height / 3) {
                if (direction !== 'DOWN') {
                    direction = 'UP';
                }
            } else if (y > canvas.height * 2 / 3) {
                if (direction !== 'UP') {
                    direction = 'DOWN';
                }
            }

            if (!gameStarted) {
                gameStarted = true;
                isPaused = false;
                update();
            }
        }

        function generateFood() {
            let foodX, foodY;
            while (true) {
                foodX = Math.floor(Math.random() * (CANVAS_WIDTH / CELL_SIZE)) * CELL_SIZE;
                foodY = Math.floor(Math.random() * (CANVAS_HEIGHT / CELL_SIZE)) * CELL_SIZE;
                if (!snake.some(part => part.x === foodX && part.y === foodY)) {
                    break;
                }
            }
            return { x: foodX, y: foodY };
        }

        function collision(head, snake) {
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            return false;
        }

        function saveGame() {
            const gameState = {
                snake: snake,
                direction: direction,
                food: food,
                score: score,
                level: level,
                speed: speed,
                isPaused: isPaused,
                gameStarted: gameStarted,
                elapsedTime: elapsedTime,
            };
            localStorage.setItem('snakeGame', JSON.stringify(gameState));
        }

        function updateScoreboard() {
            document.getElementById('score').textContent = `Score: ${score}`;
            document.getElementById('level').textContent = `Level: ${level}`;
            document.getElementById('timer').textContent = `Time: ${elapsedTime}s`;
        }

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                if (!isPaused && gameStarted) {
                    elapsedTime += 1;
                    document.getElementById('timer').textContent = `Time: ${elapsedTime}s`;
                    saveGame();
                }
            }, 1000);
        }

        function changeBackgroundColor(level) {
            const colorIndex = (level - 1) % LEVEL_COLORS.length;
            canvas.style.backgroundColor = LEVEL_COLORS[colorIndex];
        }

        document.addEventListener('keydown', changeDirection);
        //canvas.addEventListener('click', handleMouseClick);
        canvas.addEventListener('touchstart', handleTouch);

        initializeGame();