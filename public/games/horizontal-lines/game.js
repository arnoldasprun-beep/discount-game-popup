class HorizontalLinesGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.justStarted = false; // Flag to skip first frame after game start
        this.bestScore = 0; // Track best score while popup is open
        
        // Read color parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bgColor = urlParams.get('bg') || '#ffffff';
        const ballColor = urlParams.get('ball') || '#4facfe';
        const obstacleColor = urlParams.get('obstacle') || '#fc6158';
        const maxDiscountParam = urlParams.get('maxDiscount');
        this.maxDiscount = (maxDiscountParam !== null && !isNaN(parseInt(maxDiscountParam))) 
            ? parseInt(maxDiscountParam) 
            : 100; // Default to 100 if not provided
        const difficultyParam = urlParams.get('difficulty');
        const difficultyValue = (difficultyParam !== null && !isNaN(parseInt(difficultyParam))) 
            ? parseInt(difficultyParam) 
            : 50; // Default to Medium if not provided
        const borderRadiusParam = urlParams.get('borderRadius');
        this.borderRadius = (borderRadiusParam !== null && !isNaN(parseInt(borderRadiusParam))) 
            ? parseInt(borderRadiusParam) 
            : 10; // Default to 10 if not provided
        const gameEndBorderRadiusParam = urlParams.get('gameEndBorderRadius');
        this.gameEndBorderRadius = (gameEndBorderRadiusParam !== null && !isNaN(parseInt(gameEndBorderRadiusParam))) 
            ? parseInt(gameEndBorderRadiusParam) 
            : 10; // Default to 10 if not provided
        const emailModalBorderRadiusParam = urlParams.get('emailModalBorderRadius');
        this.emailModalBorderRadius = (emailModalBorderRadiusParam !== null && !isNaN(parseInt(emailModalBorderRadiusParam))) 
            ? parseInt(emailModalBorderRadiusParam) 
            : 10; // Default to 10 if not provided
        const discountModalBorderRadiusParam = urlParams.get('discountModalBorderRadius');
        this.discountModalBorderRadius = (discountModalBorderRadiusParam !== null && !isNaN(parseInt(discountModalBorderRadiusParam))) 
            ? parseInt(discountModalBorderRadiusParam) 
            : 10; // Default to 10 if not provided
        this.requireEmailToClaim = urlParams.get('requireEmailToClaim') === 'true';
        this.requireName = urlParams.get('requireName') === 'true';
        this.shop = urlParams.get('shop') || '';
        this.sessionId = urlParams.get('sessionId') || '';
        this.device = urlParams.get('device') || (window.innerWidth <= 768 ? 'Mobile' : 'Desktop');
        this.gameType = 'horizontal-lines'; // Pass the Gaps
        this.appUrl = 'https://trialapp.traffishow.com'; // Will be replaced with deployed URL
        
        // Read text settings from URL
        this.textSettings = {
            secondaryText: urlParams.get('secondaryText') || 'Discount:',
            secondaryTextColor: urlParams.get('secondaryTextColor') || '#000000',
            secondaryTextSize: urlParams.get('secondaryTextSize') || '18',
            secondaryTextWeight: urlParams.get('secondaryTextWeight') || '400',
            rulesText: urlParams.get('rulesText') || '1 Score - 1% Discount',
            rulesTextColor: urlParams.get('rulesTextColor') || '#000000',
            rulesTextSize: urlParams.get('rulesTextSize') || '14',
            rulesTextWeight: urlParams.get('rulesTextWeight') || '400',
            instructionText: urlParams.get('instructionText') || 'Move left or right',
            instructionTextColor: urlParams.get('instructionTextColor') || '#000000',
            instructionTextSize: urlParams.get('instructionTextSize') || '16',
            instructionTextWeight: urlParams.get('instructionTextWeight') || '400',
            gameEndText: urlParams.get('gameEndText') || 'Your Discount',
            gameEndTextColor: urlParams.get('gameEndTextColor') || '#000000',
            gameEndTextSize: urlParams.get('gameEndTextSize') || '20',
            gameEndTextWeight: urlParams.get('gameEndTextWeight') || '400',
            buttonText: urlParams.get('buttonText') || 'Play Again',
            buttonTextColor: urlParams.get('buttonTextColor') || '#ffffff',
            buttonTextSize: urlParams.get('buttonTextSize') || '16',
            buttonTextWeight: urlParams.get('buttonTextWeight') || '500',
            claimBestButtonText: urlParams.get('claimBestButtonText') || 'Claim Best Discount',
            claimBestButtonTextColor: urlParams.get('claimBestButtonTextColor') || '#ffffff',
            claimBestButtonTextSize: urlParams.get('claimBestButtonTextSize') || '16',
            claimBestButtonTextWeight: urlParams.get('claimBestButtonTextWeight') || '500',
            gameEndTabBgColor: urlParams.get('gameEndTabBgColor') || '#ffffff',
            buttonBgColor: urlParams.get('buttonBgColor') || '#000000',
            claimBestButtonBgColor: urlParams.get('claimBestButtonBgColor') || '#000000',
            // Email Modal Settings
            emailModalHeadingText: urlParams.get('emailModalHeadingText') || 'Enter Your Email',
            emailModalHeadingColor: urlParams.get('emailModalHeadingColor') || '#333333',
            emailModalHeadingSize: urlParams.get('emailModalHeadingSize') || '20',
            emailModalHeadingWeight: urlParams.get('emailModalHeadingWeight') || '600',
            emailModalDescriptionText: urlParams.get('emailModalDescriptionText') || 'Please enter your email to claim your discount:',
            emailModalDescriptionColor: urlParams.get('emailModalDescriptionColor') || '#333333',
            emailModalDescriptionSize: urlParams.get('emailModalDescriptionSize') || '14',
            emailModalDescriptionWeight: urlParams.get('emailModalDescriptionWeight') || '400',
            emailModalSubmitText: urlParams.get('emailModalSubmitText') || 'Submit',
            emailModalSubmitColor: urlParams.get('emailModalSubmitColor') || '#ffffff',
            emailModalSubmitSize: urlParams.get('emailModalSubmitSize') || '16',
            emailModalSubmitWeight: urlParams.get('emailModalSubmitWeight') || '500',
            emailModalCancelText: urlParams.get('emailModalCancelText') || 'Cancel',
            emailModalCancelColor: urlParams.get('emailModalCancelColor') || '#333333',
            emailModalCancelSize: urlParams.get('emailModalCancelSize') || '16',
            emailModalCancelWeight: urlParams.get('emailModalCancelWeight') || '500',
            emailModalBgColor: urlParams.get('emailModalBgColor') || '#ffffff',
            emailModalSubmitBgColor: urlParams.get('emailModalSubmitBgColor') || '#000000',
            emailModalCancelBgColor: urlParams.get('emailModalCancelBgColor') || '#cccccc',
            // Discount Code Modal Settings
            discountModalHeadingText: urlParams.get('discountModalHeadingText') || 'Your Discount Code',
            discountModalHeadingColor: urlParams.get('discountModalHeadingColor') || '#333333',
            discountModalHeadingSize: urlParams.get('discountModalHeadingSize') || '20',
            discountModalHeadingWeight: urlParams.get('discountModalHeadingWeight') || '600',
            discountModalCloseText: urlParams.get('discountModalCloseText') || 'Close',
            discountModalCloseColor: urlParams.get('discountModalCloseColor') || '#ffffff',
            discountModalCloseSize: urlParams.get('discountModalCloseSize') || '16',
            discountModalCloseWeight: urlParams.get('discountModalCloseWeight') || '500',
            discountModalBgColor: urlParams.get('discountModalBgColor') || '#ffffff',
            discountModalCloseBgColor: urlParams.get('discountModalCloseBgColor') || '#000000',
            discountModalDescriptionText: urlParams.get('discountModalDescriptionText') || 'Copy your code and use it at checkout',
            discountModalDescriptionColor: urlParams.get('discountModalDescriptionColor') || '#333333',
            discountModalDescriptionSize: urlParams.get('discountModalDescriptionSize') || '14',
            discountModalDescriptionWeight: urlParams.get('discountModalDescriptionWeight') || '400',
        };
        
        // Store colors
        this.backgroundColor = bgColor;
        this.obstacleColor = obstacleColor;
        
        // Track if max discount was reached
        this.maxDiscountReached = false;
        
        // Map difficulty slider (0-100) to 5 levels
        // 0-20 = VERY_EASY, 21-40 = EASY, 41-60 = MEDIUM, 61-80 = HARD, 81-100 = VERY_HARD
        if (difficultyValue <= 20) {
            this.difficulty = 'VERY_EASY';
        } else if (difficultyValue <= 40) {
            this.difficulty = 'EASY';
        } else if (difficultyValue <= 60) {
            this.difficulty = 'MEDIUM';
        } else if (difficultyValue <= 80) {
            this.difficulty = 'HARD';
        } else {
            this.difficulty = 'VERY_HARD';
        }
        
        // Ball properties
        this.isMobile = window.innerWidth <= 768;
        this.ball = {
            x: 400,
            y: 550,
            radius: 20,
            color: ballColor
        };
        
        // Obstacles (horizontal lines coming from above)
        this.obstacles = [];
        this.baseSpeed = 1;
        this.speedScale = 1;
        this.obstacleSpeed = 3;
        this.obstacleHeight = 20;
        this.obstacleGap = 80; // Gap width for ball to pass through
        this.minGap = 60; // Halfway between original and harder
        this.maxGap = 80; // Halfway between original and harder
        this.minSpawnInterval = 2500; // Halfway between original and harder
        this.maxSpawnInterval = 3000; // Halfway between original and harder
        this.lastSpawnTime = 0;
        this.gameStartTime = 0; // Track game time for continuous speed increase
        
        // Preview obstacle visible amount
        this.previewVisibleAmount = 90; // How many pixels should be visible
        this.endGameTimeout = null; // Track timeout for endGame
        
        // Control
        this.mouseX = 400;
        
        // Particle explosion effect
        this.particles = [];
        this.explosionActive = false;
        this.fadeAlpha = 1.0;
        
        // Confetti effect for max discount celebration
        this.confetti = [];
        this.confettiActive = false;
        
        // Delta time for frame-rate independent animation
        this.lastTime = null;
        
        // Ball idle animation (before game starts)
        this.idleAnimationTime = 0;
        this.idleAnimationAmplitude = 40; // How far the ball moves horizontally (in pixels)
        this.idleAnimationSpeed = 0.005; // Animation speed (adjust for faster/slower)
        
        // Game area
        this.setupCanvas();
        this.init();
        this.applyTextSettings();
    }
    
    applyTextSettings() {
        // Apply mobile scaling factor (0.85) for all text sizes
        const mobileScaleFactor = 0.85;
        const scaleTextSize = (size) => {
            const baseSize = parseFloat(size) || 16;
            return this.isMobile ? baseSize * mobileScaleFactor : baseSize;
        };
        
        // Apply secondary text settings (Discount:)
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            const discountText = this.textSettings.secondaryText;
            scoreDisplay.innerHTML = `<span>${discountText} <span id="score">0</span>%</span>`;
            scoreDisplay.style.color = this.textSettings.secondaryTextColor;
            scoreDisplay.style.fontSize = scaleTextSize(this.textSettings.secondaryTextSize) + 'px';
            scoreDisplay.style.fontWeight = this.textSettings.secondaryTextWeight;
        }
        
        // Apply rules text settings (1 Score - 1% Discount)
        const instructionTextEl = document.getElementById('instructionText');
        if (instructionTextEl) {
            instructionTextEl.textContent = this.textSettings.rulesText;
            instructionTextEl.style.color = this.textSettings.rulesTextColor;
            instructionTextEl.style.fontSize = scaleTextSize(this.textSettings.rulesTextSize) + 'px';
            instructionTextEl.style.fontWeight = this.textSettings.rulesTextWeight;
        }
        
        // Apply instruction text settings (Move left or right)
        const startMessage = document.getElementById('startMessage');
        if (startMessage) {
            startMessage.textContent = this.textSettings.instructionText;
            startMessage.style.color = this.textSettings.instructionTextColor;
            startMessage.style.fontSize = scaleTextSize(this.textSettings.instructionTextSize) + 'px';
            startMessage.style.fontWeight = this.textSettings.instructionTextWeight;
        }
        
        // Apply game end tab background color and border radius
        const gameOverDiv = document.querySelector('.game-over');
        if (gameOverDiv) {
            gameOverDiv.style.backgroundColor = this.textSettings.gameEndTabBgColor;
            gameOverDiv.style.borderRadius = this.gameEndBorderRadius + 'px';
        }
        
        // Apply game end text settings (Your Discount)
        const gameOverTitle = document.querySelector('.game-over h2');
        if (gameOverTitle) {
            gameOverTitle.textContent = this.textSettings.gameEndText;
            gameOverTitle.style.color = this.textSettings.gameEndTextColor;
            gameOverTitle.style.fontSize = scaleTextSize(this.textSettings.gameEndTextSize) + 'px';
            gameOverTitle.style.fontWeight = this.textSettings.gameEndTextWeight;
        }
        
        // Apply game end percentage text (0%)
        const finalScore = document.getElementById('finalScore');
        if (finalScore) {
            finalScore.style.color = this.textSettings.gameEndTextColor;
            finalScore.style.fontSize = scaleTextSize(this.textSettings.gameEndTextSize) + 'px';
            finalScore.style.fontWeight = this.textSettings.gameEndTextWeight;
            
            // Also style the parent <p> element to match the percentage symbol
            const parentP = finalScore.parentElement;
            if (parentP && parentP.tagName === 'P') {
                parentP.style.color = this.textSettings.gameEndTextColor;
                parentP.style.fontSize = scaleTextSize(this.textSettings.gameEndTextSize) + 'px';
                parentP.style.fontWeight = this.textSettings.gameEndTextWeight;
            }
        }
        
        // Apply button text settings (Play Again)
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.textContent = this.textSettings.buttonText;
            restartBtn.style.color = this.textSettings.buttonTextColor;
            restartBtn.style.fontSize = scaleTextSize(this.textSettings.buttonTextSize) + 'px';
            restartBtn.style.fontWeight = this.textSettings.buttonTextWeight;
            restartBtn.style.backgroundColor = this.textSettings.buttonBgColor;
            restartBtn.style.borderRadius = this.gameEndBorderRadius + 'px';
        }
        
        // Apply button text settings (Claim Best)
        const claimBestBtn = document.getElementById('claimBestBtn');
        if (claimBestBtn) {
            claimBestBtn.textContent = `${this.textSettings.claimBestButtonText} ${this.bestScore}%`;
            claimBestBtn.style.color = this.textSettings.claimBestButtonTextColor;
            claimBestBtn.style.fontSize = scaleTextSize(this.textSettings.claimBestButtonTextSize) + 'px';
            claimBestBtn.style.fontWeight = this.textSettings.claimBestButtonTextWeight;
            claimBestBtn.style.backgroundColor = this.textSettings.claimBestButtonBgColor;
            claimBestBtn.style.borderRadius = this.gameEndBorderRadius + 'px';
            // Handle claim button click
            claimBestBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleClaimDiscount();
            });
        }
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        if (containerRect.width > 0 && containerRect.height > 0) {
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
            
            this.obstacleSpeed = this.baseSpeed;
            
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2 + 30; // Move down by 30px
            this.mouseX = this.ball.x;
            
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.resizeCanvas();
                }, 200);
            });
        } else {
            requestAnimationFrame(() => this.setupCanvas());
        }
    }
    
    clampBallX() {
        if (this.ball.x < this.ball.radius) {
            this.ball.x = this.ball.radius;
        } else if (this.ball.x > this.canvas.width - this.ball.radius) {
            this.ball.x = this.canvas.width - this.ball.radius;
        }
    }
    
    getGapBounds(obstacle) {
        return {
            left: obstacle.gapCenter - obstacle.gapWidth / 2,
            right: obstacle.gapCenter + obstacle.gapWidth / 2
        };
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        if (containerRect.width > 0 && containerRect.height > 0) {
            const ballXRatio = this.ball.x / this.canvas.width;
            const ballYRatio = this.ball.y / this.canvas.height;
            
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
            
            // Update mobile detection
            this.isMobile = window.innerWidth <= 768;
            
            // Reapply text settings with updated mobile state
            this.applyTextSettings();
            
            this.obstacleSpeed = this.baseSpeed;
            
            this.ball.x = this.canvas.width * ballXRatio;
            this.ball.y = this.canvas.height * ballYRatio;
            
            this.clampBallX();
            
            this.mouseX = this.ball.x;
        }
    }
    
    init() {
        // Mouse control
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameStarted && !this.gameOver) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
            }
        });
        
        // Touch control
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.gameStarted && !this.gameOver) {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                if (touch) {
                    this.mouseX = touch.clientX - rect.left;
                }
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.gameStarted && !this.gameOver) {
                e.preventDefault();
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                if (touch) {
                    this.mouseX = touch.clientX - rect.left;
                }
            }
        });
        
        // Start button
        const restartBtn = document.getElementById('restartBtn');
        restartBtn.addEventListener('click', () => this.restart());
        restartBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.restart();
        });
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.resizeCanvas();
                // Spawn preview obstacle partially visible from top
                if (this.canvas.width > 0 && this.canvas.height > 0) {
                    this.spawnPreviewObstacle();
                }
            });
        });
        
        this.gameLoop();
    }
    
    startGame() {
        // Track game play
        this.trackGamePlay();
        
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2 + 30; // Move down by 30px
        this.mouseX = this.ball.x;
        // Don't clear obstacles - keep preview obstacle
        // this.obstacles = [];
        this.obstacleSpeed = this.baseSpeed;
        this.obstacleGap = this.maxGap;
        this.lastSpawnTime = Date.now() - 300; // Start timer from now, not 0
        
        this.gameStartTime = Date.now(); // Track game start time
        this.particles = [];
        
        // Reset confetti
        this.confetti = [];
        this.confettiActive = false;
        this.maxDiscountReached = false;
        
        // Show score display again when game restarts
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.style.display = '';
        }
        
        // Hide start message and instruction text when game starts
        const startMessage = document.getElementById('startMessage');
        if (startMessage) {
            startMessage.classList.add('hide');
        }
        const instructionText = document.getElementById('instructionText');
        if (instructionText) {
            instructionText.classList.add('hide');
        }
        this.explosionActive = false;
        this.fadeAlpha = 1.0;
        
        // Reset timing for smooth start
        this.lastTime = null;
        this.justStarted = true;
        
        document.getElementById('gameOver').classList.remove('show');
        
        // Show "Play Again" button again when game restarts
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.style.display = '';
        }
    }
    
    spawnPreviewObstacle() {
        // Spawn first obstacle partially visible from top
        this.obstacles.push({
            y: -this.obstacleHeight + this.previewVisibleAmount, // 50px visible
            gapCenter: this.canvas.width / 2, // Center gap
            gapWidth: this.maxGap,
            passed: false
        });
    }
    
    spawnObstacle() {
        // More random gap width - varies between min and max with some randomness
        const scoreFactor = Math.min(this.score / 40, 1); // Halfway between original (50) and harder (30)
        const baseGap = this.maxGap - (this.maxGap - this.minGap) * scoreFactor;
        // Add randomness: ±20% variation
        const gapVariation = baseGap * 0.2;
        const currentGap = Math.max(this.minGap, baseGap + (Math.random() - 0.5) * gapVariation * 2);
        
        // More random gap position - can be anywhere on screen
        const minGapCenter = currentGap / 2;
        const maxGapCenter = this.canvas.width - currentGap / 2;
        const gapCenter = minGapCenter + Math.random() * (maxGapCenter - minGapCenter);
        
        this.obstacles.push({
            y: -this.obstacleHeight,
            gapCenter: gapCenter,
            gapWidth: currentGap,
            passed: false
        });
    }
    
    update(delta = 1) {
        // Update particles even if game is over (for fadeaway effect)
        if (this.explosionActive) {
            this.updateParticles(delta);
        }
        
        // Update confetti even if game is over
        if (this.confettiActive) {
            this.updateConfetti(delta);
        }
        
        // Update idle animation when game hasn't started
        if (!this.gameStarted && !this.gameOver) {
            this.idleAnimationTime += delta * 10; // Increment animation time
        }
        
        if (!this.gameStarted || this.gameOver) return;
        
        // Update ball position (follows mouse/touch)
        // Lerp is already frame-rate independent (percentage-based), no delta needed
        const targetX = this.mouseX;
        const lerpSpeed = 0.15;
        this.ball.x += (targetX - this.ball.x) * lerpSpeed;
        
        // Keep ball within canvas bounds
        this.clampBallX();
        
        // Spawn obstacles with random intervals
        const currentTime = Date.now();
        // Random spawn interval for more unpredictability
        const randomSpawnInterval = this.minSpawnInterval + 
            Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
        // Decrease spawn interval over time (spawn faster as game progresses)
        const timeElapsed = (currentTime - this.gameStartTime) / 1000; // seconds
        const timeFactor = Math.min(timeElapsed / 30, 1); // Max effect after 30 seconds
        const adjustedSpawnInterval = randomSpawnInterval * (1 - timeFactor * 0.5); // Up to 50% faster
        
        if (currentTime - this.lastSpawnTime > adjustedSpawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = currentTime;
        }
        
        // Move obstacles down - multiply by delta for frame-rate independence
        this.obstacles.forEach(obstacle => {
            obstacle.y += this.obstacleSpeed * delta;
        });
        
        // Remove obstacles that are off screen
        this.obstacles = this.obstacles.filter(obstacle => obstacle.y < this.canvas.height + 100);
        
        // Update score - count obstacles that have passed the ball
        for (let obstacle of this.obstacles) {
            if (!obstacle.passed && obstacle.y > this.ball.y + this.ball.radius) {
                // Check if ball passed through the gap
                const gap = this.getGapBounds(obstacle);
                
                if (this.ball.x >= gap.left && this.ball.x <= gap.right) {
                    this.score++;
                    this.updateScore();
                    
                    // Check if max discount reached
                    if (this.score >= this.maxDiscount) {
                        this.maxDiscountReached = true;
                        this.gameOver = true; // Stop game updates immediately
                        this.createConfetti();
                        // Delay showing game over screen to allow confetti animation
                        setTimeout(() => {
                            this.endGame();
                        }, 500);
                        return; // Stop game updates
                    }
                }
                obstacle.passed = true;
            }
        }
        
        // Continuous speed increase: based on both score AND time
        const scoreSpeed = this.baseSpeed + (this.score * 0.035);
        
        // Get timeSpeed multiplier based on difficulty
        let timeSpeedMultiplier;
        switch(this.difficulty) {
            case 'VERY_EASY':
                timeSpeedMultiplier = 0.010;
                break;
            case 'EASY':
                timeSpeedMultiplier = 0.045;
                break;
            case 'MEDIUM':
                timeSpeedMultiplier = 0.080;
                break;
            case 'HARD':
                timeSpeedMultiplier = 0.115;
                break;
            case 'VERY_HARD':
                timeSpeedMultiplier = 0.150;
                break;
            default:
                timeSpeedMultiplier = 0.080; // Default to Medium
                break;
        }
        const timeSpeed = timeElapsed * timeSpeedMultiplier;
        this.obstacleSpeed = scoreSpeed + timeSpeed;
        
        // Check collision
        this.checkCollision();
    }
    
    checkCollision() {
        const collisionRadius = this.ball.radius * 0.9; // 90% of visual radius for more forgiving collision
        
        for (let obstacle of this.obstacles) {
            // Check if ball's vertical range overlaps with obstacle's vertical range
            const obstacleTop = obstacle.y;
            const obstacleBottom = obstacle.y + this.obstacleHeight;
            const ballTop = this.ball.y - collisionRadius; // Use collisionRadius instead
            const ballBottom = this.ball.y + collisionRadius; // Use collisionRadius instead
            
            if (ballBottom > obstacleTop && ballTop < obstacleBottom) {
                // Ball is at the obstacle's height, check if it's in the gap
                const gap = this.getGapBounds(obstacle);
                
                // Check if ball touches the obstacle (not in gap)
                if (this.ball.x - collisionRadius < gap.left || 
                    this.ball.x + collisionRadius > gap.right) {
                    this.endGame();
                    return;
                }
            }
        }
    }
    
    endGame() {
        this.gameOver = true;
        
        // Only create explosion if max discount wasn't reached (normal collision)
        if (!this.maxDiscountReached) {
        this.createExplosion(this.ball.x, this.ball.y);
        }
        
        // Clear any existing timeout
        if (this.endGameTimeout) {
            clearTimeout(this.endGameTimeout);
        }
        
        this.endGameTimeout = setTimeout(() => {
            // Show maxDiscount if reached, otherwise show current score
            const finalScore = this.maxDiscountReached ? this.maxDiscount : this.score;
            document.getElementById('finalScore').textContent = finalScore;
            
            // Update best score if current score is higher
            if (finalScore > this.bestScore) {
                this.bestScore = finalScore;
            }
            
            // Update claim best button text
            const claimBestBtn = document.getElementById('claimBestBtn');
            if (claimBestBtn) {
                claimBestBtn.textContent = `${this.textSettings.claimBestButtonText} ${this.bestScore}%`;
            }
            
            // Hide "Play Again" button if max discount was reached
            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                if (this.maxDiscountReached) {
                    restartBtn.style.display = 'none';
                } else {
                    restartBtn.style.display = '';
                }
            }
            
            document.getElementById('gameOver').classList.add('show');
        }, 500);
        
        // Don't clear obstacles - keep them visible after collision
        // this.obstacles = [];
    }
    
    createExplosion(x, y) {
        this.explosionActive = true;
        this.fadeAlpha = 1.0; // Start fully visible
    }
    
    updateParticles(delta = 1) {
        // Simple fadeaway - decrease alpha from 100% to 50%
        // Multiply decay by delta for frame-rate independence
        if (this.explosionActive && this.fadeAlpha > 0.3) {
            this.fadeAlpha = Math.max(0.3, this.fadeAlpha - 0.015 * delta);
        }
    }
    
    createConfetti() {
        this.confettiActive = true;
        this.confetti = [];
        const confettiCount = 500; // More confetti for celebration
        
        // Hide score display during confetti
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.style.display = 'none';
        }
        
        // Colorful confetti colors
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'];
        
        const leftEdgeX = 0;
        const rightEdgeX = this.canvas.width;
        
        for (let i = 0; i < confettiCount; i++) {
            const isLeftSide = i < confettiCount / 2;
            
            // Start position: left or right edge with random vertical position
            const y = Math.random() * this.canvas.height;
            const x = isLeftSide 
                ? leftEdgeX + Math.random() * 30  // Start from left, slightly offset
                : rightEdgeX - Math.random() * 30; // Start from right, slightly offset
            
            // Angle calculation:
            // Left side: explode INWARD (rightward) with vertical spread
            // Right side: explode INWARD (leftward) with vertical spread
            let angle;
            if (isLeftSide) {
                // Left side: pointing right (0) with vertical spread - moves INTO canvas
                angle = (Math.random() - 0.5) * Math.PI; // Between -π/2 and π/2 (rightward with up/down)
            } else {
                // Right side: pointing left (π) with vertical spread - moves INTO canvas
                angle = Math.PI + (Math.random() - 0.5) * Math.PI; // Between π/2 and 3π/2 (leftward with up/down)
            }
            
            const speed = 3 + Math.random() * 5;
            const size = 4 + Math.random() * 6;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rotation = Math.random() * Math.PI * 2;
            const rotationSpeed = (Math.random() - 0.5) * 0.3;
            
            this.confetti.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: color,
                rotation: rotation,
                rotationSpeed: rotationSpeed,
                life: 1.0,
                decay: 0.002 + Math.random() * 0.003
            });
        }
    }
    
    updateConfetti(delta = 1) {
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const confettiPiece = this.confetti[i];
            
            // Update position
            confettiPiece.x += confettiPiece.vx * delta;
            confettiPiece.y += confettiPiece.vy * delta;
            
            // Apply gravity
            confettiPiece.vy += 0.3 * delta;
            
            // Update rotation
            confettiPiece.rotation += confettiPiece.rotationSpeed * delta;
            
            // Fade out
            confettiPiece.life -= confettiPiece.decay * delta;
            
            // Remove dead confetti or confetti that's off screen
            if (confettiPiece.life <= 0 || confettiPiece.y > this.canvas.height + 50) {
                this.confetti.splice(i, 1);
            }
        }
        
        // If all confetti is gone, stop confetti effect
        if (this.confetti.length === 0) {
            this.confettiActive = false;
        }
    }
    
    drawConfetti() {
        for (const confettiPiece of this.confetti) {
            const alpha = confettiPiece.life;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.translate(confettiPiece.x, confettiPiece.y);
            this.ctx.rotate(confettiPiece.rotation);
            
            // Draw confetti as rectangles (more festive than circles)
            this.ctx.fillStyle = confettiPiece.color;
            this.ctx.fillRect(-confettiPiece.size / 2, -confettiPiece.size / 2, confettiPiece.size, confettiPiece.size);
            
            this.ctx.restore();
        }
    }
    
    render() {
        // Clear canvas and fill with background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw confetti even if game is over (for max discount celebration)
        if (this.confettiActive) {
            this.drawConfetti();
        }
        
        // Don't draw game elements when confetti is active OR when game is over with max discount reached
        if (this.confettiActive || (this.gameOver && this.maxDiscountReached)) {
            return;
        }
        
        // Draw obstacles
        this.drawObstacles();
        
        // Calculate ball position (with idle animation if game hasn't started)
        let ballX = this.ball.x;
        let ballY = this.ball.y;
        
        if (!this.gameStarted && !this.gameOver) {
            // Main ball stays in center (moved down by 30px)
            ballX = this.canvas.width / 2;
            ballY = this.canvas.height / 2 + 30; // Move down by 30px
            
            // Calculate trail ball position (moving back and forth horizontally)
            const centerX = this.canvas.width / 2;
            const trailX = centerX + Math.sin(this.idleAnimationTime * this.idleAnimationSpeed) * this.idleAnimationAmplitude;
            
            // Draw semi-transparent trail ball (40% opacity) moving back and forth
            this.ctx.save();
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.arc(trailX, ballY, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Draw ball with fadeaway effect
        if (this.explosionActive) {
            // Draw fading ball
            this.ctx.save();
            this.ctx.globalAlpha = this.fadeAlpha;
            this.ctx.fillStyle = this.ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ballX, ballY, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        } else if (!this.gameOver) {
            // Draw normal ball (main ball in center)
            this.ctx.fillStyle = this.ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ballX, ballY, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        document.getElementById('score').textContent = this.score;
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    drawObstacles() {
        this.ctx.fillStyle = this.obstacleColor;
        
        for (let obstacle of this.obstacles) {
            const gap = this.getGapBounds(obstacle);
            const notchSize = 5; // How many pixels to indent the corner
            
            // Draw left part of obstacle with bottom-right corner indented to the left
            if (gap.left > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, obstacle.y);
                this.ctx.lineTo(gap.left, obstacle.y);
                this.ctx.lineTo(gap.left - notchSize, obstacle.y + this.obstacleHeight);
                this.ctx.lineTo(0, obstacle.y + this.obstacleHeight);
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            // Draw right part of obstacle with bottom-left corner indented to the right
            if (gap.right < this.canvas.width) {
                this.ctx.beginPath();
                this.ctx.moveTo(gap.right, obstacle.y);
                this.ctx.lineTo(this.canvas.width, obstacle.y);
                this.ctx.lineTo(this.canvas.width, obstacle.y + this.obstacleHeight);
                this.ctx.lineTo(gap.right + notchSize, obstacle.y + this.obstacleHeight);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    gameLoop(timestamp) {
        // Initialize lastTime on first frame
        if (!this.lastTime) {
            this.lastTime = timestamp;
            requestAnimationFrame((ts) => this.gameLoop(ts));
            return;
        }
        
        // Calculate delta time
        let deltaTime = timestamp - this.lastTime;
        
        // Skip first frame after game start to prevent large delta
        if (this.justStarted) {
            this.lastTime = timestamp;
            this.justStarted = false;
            requestAnimationFrame((ts) => this.gameLoop(ts));
            return;
        }
        
        this.lastTime = timestamp;
        
        // Cap delta to prevent large jumps (max 100ms = ~10 frames at 100fps)
        // This prevents issues when tab is hidden/backgrounded
        deltaTime = Math.min(deltaTime, 100);
        
        // Normalize to 100fps (10ms per frame)
        const delta = deltaTime / 10;
        
        this.update(delta);
        this.render();
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    restart() {
        // Clear the endGame timeout if it exists
        if (this.endGameTimeout) {
            clearTimeout(this.endGameTimeout);
            this.endGameTimeout = null;
        }
        
        // Hide game over screen immediately
        document.getElementById('gameOver').classList.remove('show');
        
        // Show start message and instruction text again
        const startMessage = document.getElementById('startMessage');
        if (startMessage) {
            startMessage.classList.remove('hide');
        }
        const instructionText = document.getElementById('instructionText');
        if (instructionText) {
            instructionText.classList.remove('hide');
        }
        
        // Reset state
        this.gameOver = false;
        this.gameStarted = false;
        this.obstacles = [];
        
        // Reset confetti
        this.confetti = [];
        this.confettiActive = false;
        this.maxDiscountReached = false;
        
        // Reset everything immediately
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2 + 30; // Move down by 30px
        this.mouseX = this.ball.x;
        
        // Spawn new preview obstacle
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.spawnPreviewObstacle();
        }
        
        // Start game immediately (no delay)
        this.startGame();
    }
    
    applyEmailModalSettings() {
        // Apply mobile scaling factor (0.85) for all text sizes
        const mobileScaleFactor = 0.85;
        const scaleTextSize = (size) => {
            const baseSize = parseFloat(size) || 16;
            return this.isMobile ? baseSize * mobileScaleFactor : baseSize;
        };
        
        const emailModal = document.getElementById('emailModal');
        const emailModalContent = emailModal?.querySelector('.email-modal-content');
        const emailModalHeading = emailModalContent?.querySelector('h3');
        const emailModalDescription = emailModalContent?.querySelector('p');
        const emailSubmitBtn = document.getElementById('emailSubmitBtn');
        const emailCancelBtn = document.getElementById('emailCancelBtn');
        
        if (emailModalContent) {
            emailModalContent.style.backgroundColor = this.textSettings.emailModalBgColor;
            emailModalContent.style.borderRadius = this.emailModalBorderRadius + 'px';
        }
        
        if (emailModalHeading) {
            emailModalHeading.textContent = this.textSettings.emailModalHeadingText;
            emailModalHeading.style.color = this.textSettings.emailModalHeadingColor;
            emailModalHeading.style.fontSize = scaleTextSize(this.textSettings.emailModalHeadingSize) + 'px';
            emailModalHeading.style.fontWeight = this.textSettings.emailModalHeadingWeight;
        }
        
        if (emailModalDescription) {
            emailModalDescription.textContent = this.textSettings.emailModalDescriptionText;
            emailModalDescription.style.color = this.textSettings.emailModalDescriptionColor;
            emailModalDescription.style.fontSize = scaleTextSize(this.textSettings.emailModalDescriptionSize) + 'px';
            emailModalDescription.style.fontWeight = this.textSettings.emailModalDescriptionWeight;
        }
        
        if (emailSubmitBtn) {
            emailSubmitBtn.textContent = this.textSettings.emailModalSubmitText;
            emailSubmitBtn.style.color = this.textSettings.emailModalSubmitColor;
            emailSubmitBtn.style.fontSize = scaleTextSize(this.textSettings.emailModalSubmitSize) + 'px';
            emailSubmitBtn.style.fontWeight = this.textSettings.emailModalSubmitWeight;
            emailSubmitBtn.style.backgroundColor = this.textSettings.emailModalSubmitBgColor;
            emailSubmitBtn.style.borderRadius = this.emailModalBorderRadius + 'px';
        }
        
        if (emailCancelBtn) {
            emailCancelBtn.textContent = this.textSettings.emailModalCancelText;
            emailCancelBtn.style.color = this.textSettings.emailModalCancelColor;
            emailCancelBtn.style.fontSize = scaleTextSize(this.textSettings.emailModalCancelSize) + 'px';
            emailCancelBtn.style.fontWeight = this.textSettings.emailModalCancelWeight;
            emailCancelBtn.style.backgroundColor = this.textSettings.emailModalCancelBgColor;
            emailCancelBtn.style.borderRadius = this.emailModalBorderRadius + 'px';
        }
    }

    applyDiscountModalSettings() {
        // Apply mobile scaling factor (0.85) for all text sizes
        const mobileScaleFactor = 0.85;
        const scaleTextSize = (size) => {
            const baseSize = parseFloat(size) || 16;
            return this.isMobile ? baseSize * mobileScaleFactor : baseSize;
        };
        
        const discountModal = document.getElementById('discountCodeModal');
        const discountModalContent = discountModal?.querySelector('.discount-code-modal-content');
        const discountModalHeading = discountModalContent?.querySelector('h3');
        const discountCodeText = document.getElementById('discountCodeText');
        const discountCodeCloseBtn = document.getElementById('discountCodeCloseBtn');
        
        if (discountModalContent) {
            discountModalContent.style.backgroundColor = this.textSettings.discountModalBgColor;
            discountModalContent.style.borderRadius = this.discountModalBorderRadius + 'px';
        }
        
        if (discountModalHeading) {
            discountModalHeading.textContent = this.textSettings.discountModalHeadingText;
            discountModalHeading.style.color = this.textSettings.discountModalHeadingColor;
            discountModalHeading.style.fontSize = scaleTextSize(this.textSettings.discountModalHeadingSize) + 'px';
            discountModalHeading.style.fontWeight = this.textSettings.discountModalHeadingWeight;
        }
        
        const discountCodeDescription = document.getElementById('discountCodeDescription');
        if (discountCodeDescription) {
            discountCodeDescription.style.color = this.textSettings.discountModalDescriptionColor;
            discountCodeDescription.style.fontSize = scaleTextSize(this.textSettings.discountModalDescriptionSize) + 'px';
            discountCodeDescription.style.fontWeight = this.textSettings.discountModalDescriptionWeight;
        }
        
        if (discountCodeCloseBtn) {
            discountCodeCloseBtn.textContent = this.textSettings.discountModalCloseText;
            discountCodeCloseBtn.style.color = this.textSettings.discountModalCloseColor;
            discountCodeCloseBtn.style.fontSize = scaleTextSize(this.textSettings.discountModalCloseSize) + 'px';
            discountCodeCloseBtn.style.fontWeight = this.textSettings.discountModalCloseWeight;
            discountCodeCloseBtn.style.backgroundColor = this.textSettings.discountModalCloseBgColor;
            discountCodeCloseBtn.style.borderRadius = this.discountModalBorderRadius + 'px';
        }
    }

    async handleClaimDiscount() {
        // Don't process if best score is less than 1%
        if (this.bestScore < 1) {
            return; // Do nothing, just return silently
        }
        
        // If email OR name is required, show custom modal
        if (this.requireEmailToClaim || this.requireName) {
            return new Promise((resolve) => {
                const emailModal = document.getElementById('emailModal');
                const emailInput = document.getElementById('emailInput');
                const emailSubmitBtn = document.getElementById('emailSubmitBtn');
                const emailCancelBtn = document.getElementById('emailCancelBtn');
                
                if (!emailModal || !emailSubmitBtn || !emailCancelBtn) {
                    console.error('Email modal elements not found');
                    return;
                }
                
                // Apply email modal settings
                this.applyEmailModalSettings();
                
                // Show/hide name fields based on requireName
                const nameFieldsContainer = document.getElementById('nameFieldsContainer');
                const firstNameInput = document.getElementById('firstNameInput');
                const lastNameInput = document.getElementById('lastNameInput');
                
                if (nameFieldsContainer) {
                    nameFieldsContainer.style.display = this.requireName ? 'flex' : 'none';
                }
                
                // Show/hide email input based on requireEmailToClaim
                if (emailInput) {
                    emailInput.style.display = this.requireEmailToClaim ? 'block' : 'none';
                }
                
                if (firstNameInput) firstNameInput.value = '';
                if (lastNameInput) lastNameInput.value = '';
                
                // Show modal
                emailModal.style.display = 'flex';
                if (emailInput) emailInput.value = '';
                
                // Focus on first name if required, otherwise email (if email is required)
                if (this.requireName && firstNameInput) {
                    firstNameInput.focus();
                } else if (this.requireEmailToClaim && emailInput) {
                    emailInput.focus();
                }
                
                const handleSubmit = async () => {
                    // Clear any existing error messages
                    const existingErrorMsg = document.getElementById('emailErrorMsg');
                    if (existingErrorMsg) {
                        existingErrorMsg.style.display = 'none';
                        existingErrorMsg.textContent = '';
                    }
                    
                    // Get fresh reference to input elements
                    const currentEmailInput = document.getElementById('emailInput');
                    const currentFirstNameInput = document.getElementById('firstNameInput');
                    const currentLastNameInput = document.getElementById('lastNameInput');
                    
                    const email = currentEmailInput ? currentEmailInput.value.trim() : '';
                    const firstName = currentFirstNameInput ? currentFirstNameInput.value.trim() : '';
                    const lastName = currentLastNameInput ? currentLastNameInput.value.trim() : '';
                    
                    // Validate name fields if required
                    if (this.requireName) {
                        if (!firstName || firstName.length === 0) {
                            alert('Please enter your first name.');
                            return;
                        }
                        if (firstName.length > 50) {
                            alert('First name must be 50 characters or less.');
                            return;
                        }
                        if (!lastName || lastName.length === 0) {
                            alert('Please enter your last name.');
                            return;
                        }
                        if (lastName.length > 50) {
                            alert('Last name must be 50 characters or less.');
                            return;
                        }
                    }
                    
                    // Email validation only if email is required
                    if (this.requireEmailToClaim) {
                        // Helper function to show email error in modal
                        const showEmailError = (message) => {
                            const emailModal = document.getElementById('emailModal');
                            const emailInput = document.getElementById('emailInput');
                            
                            // Ensure modal is visible
                            if (emailModal) {
                                emailModal.style.display = 'flex';
                            }
                            
                            // Get or create error message element
                            let emailErrorMsg = document.getElementById('emailErrorMsg');
                            if (!emailErrorMsg && emailInput && emailInput.parentNode) {
                                const errorDiv = document.createElement('div');
                                errorDiv.id = 'emailErrorMsg';
                                errorDiv.style.color = '#d32f2f';
                                errorDiv.style.fontSize = '14px';
                                errorDiv.style.marginTop = '8px';
                                errorDiv.style.textAlign = 'center';
                                errorDiv.style.padding = '0 20px';
                                emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
                                emailErrorMsg = errorDiv;
                            }
                            
                            // Display error message
                            if (emailErrorMsg) {
                                emailErrorMsg.textContent = message;
                                emailErrorMsg.style.display = 'block';
                            } else {
                                // Fallback to alert if element creation failed
                                alert(message);
                            }
                        };
                        
                        // Email validation with simple regex and safeguards
                        // 1. Length validation
                        if (!email || email.length === 0) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        if (email.length > 254) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // 2. Basic format checks
                        if (email.includes(' ')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        if (email.startsWith('.') || email.startsWith('@')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        if (email.endsWith('.') || email.endsWith('@')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        if (email.includes('..')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // 3. Ensure exactly ONE @ symbol
                        if (email.split('@').length !== 2) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // 4. Basic regex check (simple and safe)
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                        if (!emailRegex.test(email)) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // 5. Split and validate parts
                        const [local, domain] = email.split('@');
                        
                        // Local part checks
                        if (!local || local.startsWith('.') || local.endsWith('.')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // Domain checks
                        if (!domain || domain.startsWith('.') || domain.endsWith('.')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        if (!domain.includes('.')) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                        
                        // TLD check
                        const domainParts = domain.split('.');
                        const tld = domainParts[domainParts.length - 1];
                        if (!tld || tld.length < 2) {
                            showEmailError('Please enter a valid email address.');
                            return;
                        }
                    }
                    
                    // Process discount (use empty email if not required)
                    // Note: Don't close modal here - it will be closed on success in processDiscountClaim
                    await this.processDiscountClaim(
                        this.requireEmailToClaim ? email : '', 
                        firstName, 
                        lastName
                    );
                    resolve();
                };
                
                const handleCancel = () => {
                    emailModal.style.display = 'none';
                    resolve();
                };
                
                // Remove existing listeners to prevent duplicates
                emailSubmitBtn.replaceWith(emailSubmitBtn.cloneNode(true));
                emailCancelBtn.replaceWith(emailCancelBtn.cloneNode(true));
                if (emailInput) emailInput.replaceWith(emailInput.cloneNode(true));
                if (firstNameInput) firstNameInput.replaceWith(firstNameInput.cloneNode(true));
                if (lastNameInput) lastNameInput.replaceWith(lastNameInput.cloneNode(true));
                
                // Re-get elements after cloning
                const newEmailSubmitBtn = document.getElementById('emailSubmitBtn');
                const newEmailCancelBtn = document.getElementById('emailCancelBtn');
                const newEmailInput = document.getElementById('emailInput');
                const newFirstNameInput = document.getElementById('firstNameInput');
                const newLastNameInput = document.getElementById('lastNameInput');
                
                newEmailSubmitBtn.addEventListener('click', handleSubmit);
                newEmailCancelBtn.addEventListener('click', handleCancel);
                if (newEmailInput) {
                    newEmailInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    });
                }
                if (newFirstNameInput) {
                    newFirstNameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            if (newLastNameInput) {
                                newLastNameInput.focus();
                            } else if (newEmailInput && this.requireEmailToClaim) {
                                newEmailInput.focus();
                            } else {
                                handleSubmit();
                            }
                        }
                    });
                }
                if (newLastNameInput) {
                    newLastNameInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            if (newEmailInput && this.requireEmailToClaim) {
                                newEmailInput.focus();
                            } else {
                                handleSubmit();
                            }
                        }
                    });
                }
            });
        } else {
            // No email or name required, process directly
            await this.processDiscountClaim('', '', '');
        }
    }
    
    trackGamePlay() {
        if (!this.shop || !this.sessionId) return;
        
        fetch(this.appUrl + '/api/track-game-play', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                shop: this.shop,
                sessionId: this.sessionId,
                device: this.device,
                gameType: this.gameType,
            })
        }).catch(error => {
            console.error('Failed to track game play:', error);
        });
    }
    
    getDifficultyLevel() {
        const levelMap = {
            'VERY_EASY': 1,
            'EASY': 2,
            'MEDIUM': 3,
            'HARD': 4,
            'VERY_HARD': 5
        };
        return levelMap[this.difficulty] || null;
    }
    
    async processDiscountClaim(email, firstName = '', lastName = '') {
        try {
            const response = await fetch(this.appUrl + '/api/generate-discount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shop: this.shop,
                    email: email || 'no-email@example.com',
                    firstName: firstName || '',
                    lastName: lastName || '',
                    device: this.device,
                    gameType: this.gameType,
                    percentage: this.bestScore,
                    difficulty: this.difficulty ? `Level ${this.getDifficultyLevel()}` : null,
                }),
            });
            
            const data = await response.json();
            
            if (data.success && data.discountCode) {
                // Hide email modal first (before showing discount modal)
                const emailModal = document.getElementById('emailModal');
                if (emailModal) {
                    emailModal.style.display = 'none';
                }
                
                // Show discount code in custom modal
                const discountModal = document.getElementById('discountCodeModal');
                const discountCodeText = document.getElementById('discountCodeText');
                const discountCodeCloseBtn = document.getElementById('discountCodeCloseBtn');
                
                if (discountModal && discountCodeText) {
                    // Apply discount modal settings
                    this.applyDiscountModalSettings();
                    
                    discountCodeText.value = data.discountCode;
                    
                    // Adjust font size based on actual text width
                    const adjustFontSize = () => {
                        // Apply mobile scaling factor (0.85) for discount code input
                        const mobileScaleFactor = 0.85;
                        const baseFontSize = 18;
                        const baseMinFontSize = 12;
                        const defaultFontSize = this.isMobile ? baseFontSize * mobileScaleFactor : baseFontSize;
                        const minFontSize = this.isMobile ? baseMinFontSize * mobileScaleFactor : baseMinFontSize;
                        
                        // Reset to default size first
                        discountCodeText.style.fontSize = defaultFontSize + 'px';
                        
                        // Wait for browser to render and recalculate
                        setTimeout(() => {
                            const input = discountCodeText;
                            let fontSize = defaultFontSize;
                            
                            // Force a reflow to ensure accurate measurement
                            void input.offsetHeight;
                            
                            // Only reduce if text doesn't fit at default size
                            if (input.scrollWidth > input.clientWidth) {
                                // Reduce font size until text fits
                                while (input.scrollWidth > input.clientWidth && fontSize > minFontSize) {
                                    fontSize -= 0.5;
                                    input.style.fontSize = fontSize + 'px';
                                    // Force reflow after each change for accurate measurement
                                    void input.offsetHeight;
                                }
                                
                                // Ensure minimum font size
                                if (fontSize < minFontSize) {
                                    input.style.fontSize = minFontSize + 'px';
                                }
                            }
                            // If text fits at default size, fontSize stays at default size (already set above)
                        }, 10);
                    };
                    adjustFontSize();
                    
                    const discountCodeDescription = document.getElementById('discountCodeDescription');
                    if (discountCodeDescription) {
                        discountCodeDescription.textContent = this.textSettings.discountModalDescriptionText;
                    }
                    discountModal.style.display = 'flex';
                    
                    // Add copy functionality
                    const copyBtn = document.getElementById('discountCodeCopyBtn');
                    if (copyBtn) {
                        copyBtn.onclick = async () => {
                            try {
                                await navigator.clipboard.writeText(discountCodeText.value);
                                // Visual feedback
                                const svg = copyBtn.querySelector('svg');
                                if (svg) {
                                    const originalColor = svg.style.stroke || 'currentColor';
                                    svg.style.stroke = '#4caf50';
                                    setTimeout(() => {
                                        svg.style.stroke = originalColor;
                                    }, 500);
                                }
                            } catch (err) {
                                // Fallback for older browsers
                                discountCodeText.select();
                                document.execCommand('copy');
                            }
                        };
                    }
                    
                    if (discountCodeCloseBtn) {
                        discountCodeCloseBtn.onclick = () => {
                            discountModal.style.display = 'none';
                            // Send message to parent to close popup
                            if (window.parent && window.parent !== window) {
                                window.parent.postMessage('closeGamePopup', '*');
                            }
                        };
                    }
                }
            } else {
                // Check if it's a duplicate email error
                const isDuplicateEmail = data.error && (
                    data.error.includes('already claimed') || 
                    data.error.includes('duplicate')
                );
                
                if (isDuplicateEmail) {
                    // Show error in email modal instead of alert
                    const emailModal = document.getElementById('emailModal');
                    const emailInput = document.getElementById('emailInput');
                    
                    // Show modal first (so DOM is ready for element creation)
                    if (emailModal) {
                        emailModal.style.display = 'flex';
                    }
                    
                    // Get or create error message element
                    let emailErrorMsg = document.getElementById('emailErrorMsg');
                    if (!emailErrorMsg && emailInput && emailInput.parentNode) {
                        const errorDiv = document.createElement('div');
                        errorDiv.id = 'emailErrorMsg';
                        errorDiv.style.color = '#d32f2f';
                        errorDiv.style.fontSize = '14px';
                        errorDiv.style.marginTop = '8px';
                        errorDiv.style.textAlign = 'center';
                        errorDiv.style.padding = '0 20px';
                        emailInput.parentNode.insertBefore(errorDiv, emailInput.nextSibling);
                        emailErrorMsg = errorDiv; // Use the created element directly
                    }
                    
                    // Display error message
                    if (emailErrorMsg) {
                        emailErrorMsg.textContent = 'You have already claimed discount with this email';
                        emailErrorMsg.style.display = 'block';
                    } else {
                        // Fallback to alert if element creation failed
                        alert('You have already claimed discount with this email');
                    }
                } else {
                    // Other errors - use alert
                    alert(data.error || 'Failed to generate discount code. Please try again.');
                }
                
                console.error('Discount generation error:', data.error);
            }
        } catch (error) {
            console.error('Error calling discount API:', error);
            alert('An error occurred while generating your discount code. Please try again.');
            return { duplicateEmail: false, error: 'An error occurred while generating your discount code. Please try again.' };
        }
    }

}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new HorizontalLinesGame();
    
    const startHandler = () => {
        if (!game.gameStarted) {
            game.startGame();
        }
    };
    
    game.canvas.addEventListener('click', startHandler);
    game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startHandler();
    });
});
