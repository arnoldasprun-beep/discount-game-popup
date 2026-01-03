class BouncingBallGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.bestScore = 0; // Track best score while popup is open
        
        // Read parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bgColor = urlParams.get('bg') || '#ffffff';
        const ballColor = urlParams.get('ball') || '#9162f0';
        const obstacleColor = urlParams.get('obstacle') || '#edd08a';
        const difficultyParam = urlParams.get('difficulty');
        const difficultyValue = (difficultyParam !== null && !isNaN(parseInt(difficultyParam))) 
            ? parseInt(difficultyParam) 
            : 50;
        const maxDiscountParam = urlParams.get('maxDiscount');
        this.maxDiscount = (maxDiscountParam !== null && !isNaN(parseInt(maxDiscountParam))) 
            ? parseInt(maxDiscountParam) 
            : 100; // Default to 100 if not provided
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
            instructionText: urlParams.get('instructionText') || 'Click to bounce',
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
        
        // Map difficulty slider (0-100) to 4 levels
        // 0-25 = EASY, 26-50 = MEDIUM, 51-75 = HARD, 76-100 = VERY HARD
        if (difficultyValue <= 25) {
            this.difficulty = 'EASY';
        } else if (difficultyValue <= 50) {
            this.difficulty = 'MEDIUM';
        } else if (difficultyValue <= 75) {
            this.difficulty = 'HARD';
        } else {
            this.difficulty = 'VERY_HARD';
        }
        
        // Ball properties - size scales with device
        this.isMobile = window.innerWidth <= 768; // Match CSS breakpoint
        this.ball = {
            x: 100,
            y: 300,
            radius: 15, // Will be updated in setupCanvas() based on scaleFactor
            velocityY: 0,
            gravity: 0.3, // Increased from 0.5 for faster movement
            bouncePower: -13, // Increased from -12 for faster bounce
            color: ballColor
        };
        
        // Ball idle animation (before game starts)
        this.idleAnimationTime = 0;
        this.idleAnimationAmplitude = 100; // How high the bounce trail goes (in pixels)
        this.idleAnimationSpeed = 0.004; // Animation speed (adjust for faster/slower)
        
        // Obstacles (vertical lines)
        this.obstacles = [];
        // Difficulty-based settings will be set in setupCanvas after difficulty is determined
        this.baseSpeed = 3; // Default, will be overridden by difficulty
        this.speedScale = 1; // Will be calculated based on canvas width
        this.obstacleSpeed = 3;
        this.spawnInterval = 2000; // Default, will be overridden by difficulty
        this.speedIncreaseMultiplier = 0.3; // Default, will be overridden by difficulty
        this.lastSpawnTime = 0;
        
        // Trampolines
        this.trampolines = [];
        this.obstacleSpawnCount = 0; // Track obstacles to spawn trampoline every 3
        this.obstacleVisibleAmount = 50; // How many pixels should be visible before game starts
        
        // Particle explosion effect
        this.particles = [];
        this.explosionActive = false;
        
        // Confetti effect for max discount celebration
        this.confetti = [];
        this.confettiActive = false;
        
        // Bottom line properties - adjusted for mobile (smallest sizes)
        this.bottomLineActive = true; // Always active, fully filled from start
        this.bottomLineWidth = 0; // Will be set to canvas.width in setupCanvas
        // Will be calculated based on canvas width in resizeCanvas/updateIsMobile
        this.bottomLineHeight = 10;
        this.firstObstaclePassed = false;
        this.firstObstacleStartX = null;
        
        // Delta time for frame-rate independent animation
        this.lastTime = null;
        
        // Game area
        this.setupCanvas();
        this.init();
        this.applyTextSettings();
    }
    
    applyTextSettings() {
        // Apply secondary text settings (Discount:)
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            const discountText = this.textSettings.secondaryText;
            scoreDisplay.innerHTML = `<span>${discountText} <span id="score">0</span>%</span>`;
            scoreDisplay.style.color = this.textSettings.secondaryTextColor;
            scoreDisplay.style.fontSize = this.textSettings.secondaryTextSize + 'px';
            scoreDisplay.style.fontWeight = this.textSettings.secondaryTextWeight;
            
            // Initialize scoreDisplay reference after replacing innerHTML
            this.scoreDisplay = document.getElementById('score');
        }
        
        // Apply rules text settings (1 Score - 1% Discount)
        const instructionTextEl = document.getElementById('instructionText');
        if (instructionTextEl) {
            instructionTextEl.textContent = this.textSettings.rulesText;
            instructionTextEl.style.color = this.textSettings.rulesTextColor;
            instructionTextEl.style.fontSize = this.textSettings.rulesTextSize + 'px';
            instructionTextEl.style.fontWeight = this.textSettings.rulesTextWeight;
        }
        
        // Apply instruction text settings (Click to bounce)
        const startMessage = document.getElementById('startMessage');
        if (startMessage) {
            startMessage.textContent = this.textSettings.instructionText;
            startMessage.style.color = this.textSettings.instructionTextColor;
            startMessage.style.fontSize = this.textSettings.instructionTextSize + 'px';
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
            gameOverTitle.style.fontSize = this.textSettings.gameEndTextSize + 'px';
            gameOverTitle.style.fontWeight = this.textSettings.gameEndTextWeight;
        }
        
        // Apply game end percentage text (0%)
        const finalScore = document.getElementById('finalScore');
        if (finalScore) {
            finalScore.style.color = this.textSettings.gameEndTextColor;
            finalScore.style.fontSize = this.textSettings.gameEndTextSize + 'px';
            finalScore.style.fontWeight = this.textSettings.gameEndTextWeight;
            
            // Also style the parent <p> element to match the percentage symbol
            const parentP = finalScore.parentElement;
            if (parentP && parentP.tagName === 'P') {
                parentP.style.color = this.textSettings.gameEndTextColor;
                parentP.style.fontSize = this.textSettings.gameEndTextSize + 'px';
                parentP.style.fontWeight = this.textSettings.gameEndTextWeight;
            }
        }
        
        // Apply button text settings (Play Again)
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.textContent = this.textSettings.buttonText;
            restartBtn.style.color = this.textSettings.buttonTextColor;
            restartBtn.style.fontSize = this.textSettings.buttonTextSize + 'px';
            restartBtn.style.fontWeight = this.textSettings.buttonTextWeight;
            restartBtn.style.backgroundColor = this.textSettings.buttonBgColor;
            restartBtn.style.borderRadius = this.gameEndBorderRadius + 'px';
        }
        
        // Apply button text settings (Claim Best)
        const claimBestBtn = document.getElementById('claimBestBtn');
        if (claimBestBtn) {
            claimBestBtn.textContent = `${this.textSettings.claimBestButtonText} ${this.bestScore}%`;
            claimBestBtn.style.color = this.textSettings.claimBestButtonTextColor;
            claimBestBtn.style.fontSize = this.textSettings.claimBestButtonTextSize + 'px';
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
    
    setupDifficultySettings() {
        // Set difficulty-based values
        switch(this.difficulty) {
            case 'EASY':
                this.baseSpeed = 2;
                this.spawnInterval = 3000;
                this.speedIncreaseMultiplier = 0.1;
                break;
            case 'MEDIUM':
                this.baseSpeed = 2.5;
                this.spawnInterval = 2500;
                this.speedIncreaseMultiplier = 0.2;
                break;
            case 'HARD':
                this.baseSpeed = 3;
                this.spawnInterval = 2000;
                this.speedIncreaseMultiplier = 0.3;
                break;
            case 'VERY_HARD':
                this.baseSpeed = 3.5;
                this.spawnInterval = 1500;
                this.speedIncreaseMultiplier = 0.4;
                break;
            default:
                // Default to MEDIUM if difficulty not set
                this.baseSpeed = 2.5;
                this.spawnInterval = 2500;
                this.speedIncreaseMultiplier = 0.2;
        }
    }
    
    setupCanvas() {
        // Get container dimensions - CSS handles all responsive sizing
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Simple check: if dimensions are ready, use them; otherwise retry
        if (containerRect.width > 0 && containerRect.height > 0) {
            // Set canvas internal dimensions to match CSS size (prevents scaling issues)
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
            
            // Set difficulty-based settings
            this.setupDifficultySettings();
            
            // Reset difficulty settings after resize
            this.setupDifficultySettings();
            
            // Calculate speed scale - only apply on mobile (width <= 768), desktop stays at 1.0
            if (this.canvas.width <= 768) {
            this.speedScale = this.canvas.width / 800;
            } else {
                this.speedScale = 1.0; // No scaling on desktop
            }
            this.obstacleSpeed = this.calculateObstacleSpeed();
            
            // Update sizes with fluid scaling (after canvas width is set)
            this.updateIsMobile();
            
            // Update ball radius based on scale factor
            const scaleFactor = this.getScaleFactor();
            this.ball.radius = 17 + (scaleFactor * 7); // 15px to 20px
            
            // Set bottom line to full width from start
            this.bottomLineActive = true;
            this.bottomLineWidth = this.canvas.width;
            
            // Update ball starting position (centered horizontally, slightly above center vertically)
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2 - 30; // Move up by 30px
            
            // Handle window resize to update canvas size
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            
            // Handle orientation change (mobile devices)
            window.addEventListener('orientationchange', () => {
                // Delay to let browser finish orientation change
                setTimeout(() => {
                    this.resizeCanvas();
                }, 200);
            });
        } else {
            // CSS hasn't set dimensions yet, retry
            requestAnimationFrame(() => this.setupCanvas());
        }
    }
    
    updateIsMobile() {
        this.isMobile = window.innerWidth <= 768;
        // Update bottom line height with fluid scaling
        const scaleFactor = this.getScaleFactor();
        this.bottomLineHeight = 10 + (scaleFactor * 10); // 10px to 20px
    }
    
    calculateObstacleSpeed() {
        const currentScore = this.score || 0;
        return (this.baseSpeed + (currentScore * this.speedIncreaseMultiplier)) * this.speedScale; // Scale on mobile, desktop stays unchanged
    }
    
    clampBallBounds() {
        if (this.ball.x < this.ball.radius) {
            this.ball.x = this.ball.radius;
        } else if (this.ball.x > this.canvas.width - this.ball.radius) {
            this.ball.x = this.canvas.width - this.ball.radius;
        }
        if (this.ball.y < this.ball.radius) {
            this.ball.y = this.ball.radius;
        } else if (this.ball.y > this.canvas.height - this.ball.radius) {
            this.ball.y = this.canvas.height - this.ball.radius;
        }
    }
    
    resizeCanvas() {
        // Get current container dimensions - CSS handles all responsive sizing
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Only resize if dimensions are valid
        if (containerRect.width > 0 && containerRect.height > 0) {
            // Store ball position as ratio before resize
            const ballXRatio = this.ball.x / this.canvas.width;
            const ballYRatio = this.ball.y / this.canvas.height;
            
            // Update canvas dimensions to match CSS
            this.canvas.width = containerRect.width;
            this.canvas.height = containerRect.height;
            
            // Update mobile detection and sizes after canvas width is set (for fluid scaling)
            this.updateIsMobile();
            
            // Update ball radius based on scale factor
            const scaleFactor = this.getScaleFactor();
            this.ball.radius = 17 + (scaleFactor * 7); // 15px to 20px
            
            // Update bottom line to full width after resize
            this.bottomLineActive = true;
            this.bottomLineWidth = this.canvas.width;
            
            // Calculate speed scale - only apply on mobile (width <= 768), desktop stays at 1.0
            if (this.canvas.width <= 768) {
            this.speedScale = this.canvas.width / 800;
            } else {
                this.speedScale = 1.0; // No scaling on desktop
            }
            
            // Update obstacle speed with new scale (preserve difficulty level)
            this.obstacleSpeed = this.calculateObstacleSpeed();
            
            // Restore ball position based on ratio
            this.ball.x = this.canvas.width * ballXRatio;
            this.ball.y = this.canvas.height * ballYRatio;
            
            // Ensure ball stays within bounds
            this.clampBallBounds();
            
            // Re-spawn preview obstacle on resize if game hasn't started
            if (!this.gameStarted) {
                this.obstacles = [];
                // Keep bottom line active and full width
                this.bottomLineActive = true;
                this.bottomLineWidth = this.canvas.width;
                this.firstObstacleStartX = null;
                // Don't spawn preview obstacle
            }
        }
    }
    
    init() {
        this.scoreDisplay = document.getElementById('score');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.startMessage = document.getElementById('startMessage');
        this.instructionText = document.getElementById('instructionText');
        
        
        // Click/tap to bounce - use pointerdown for immediate response (works on both desktop and mobile)
        this.canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.onBounce();
        }, { passive: false });
        
        // Prevent double-tap zoom by also handling touchstart/touchend
        this.lastTouchTime = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            const now = Date.now();
            // If two touches within 300ms, prevent default to stop zoom
            if (now - this.lastTouchTime < 300) {
                e.preventDefault();
            }
            this.lastTouchTime = now;
            // Only prevent if single touch (not pinch zoom)
            if (e.touches.length === 1) {
            e.preventDefault();
            this.onBounce();
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Only add click fallback if pointerdown is not supported (prevents double bounce)
        if (!window.PointerEvent) {
            this.canvas.addEventListener('click', (e) => this.onBounce());
        }
        
        // Start button
        this.restartBtn.addEventListener('click', () => this.restart());
        
        // Ensure canvas is properly sized after DOM is ready
        // Use double requestAnimationFrame to ensure CSS has applied
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.resizeCanvas();
                // resizeCanvas() already spawns the preview obstacle, no need to spawn again
            });
        });
        
        // Start the game loop
        this.gameLoop();
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacleSpawnCount = 0; // Reset trampoline counter
        this.trampolines = []; // Clear trampolines
        
        // Reset confetti
        this.confetti = [];
        this.confettiActive = false;
        this.maxDiscountReached = false;
        
        // Keep preview obstacle - don't clear obstacles array
        // If restarting (obstacles already cleared), they'll spawn normally during gameplay
        if (this.obstacles.length === 0) {
            // This is a restart, obstacles will spawn normally during gameplay
            // Keep bottom line active and full width (don't reset it)
            // this.bottomLineActive = false; // Removed - bottom line should stay visible
            // this.bottomLineWidth = 0; // Removed - bottom line should stay full width
            this.firstObstacleStartX = null;
        }
        // Bottom line stays active and fully filled throughout the game
        
        // Calculate speed scale - only apply on mobile (width <= 768), desktop stays at 1.0
        if (this.canvas.width <= 768) {
        this.speedScale = this.canvas.width / 800;
        } else {
            this.speedScale = 1.0; // No scaling on desktop
        }
        // Reset spawn interval to difficulty-based value
        this.setupDifficultySettings();
        this.obstacleSpeed = this.calculateObstacleSpeed();
        this.lastSpawnTime = Date.now();
        this.updateScore();
        this.gameOverScreen.classList.remove('show');
        
        // Hide start message and instruction text when game starts (only shown in preview)
        if (this.startMessage) {
            this.startMessage.classList.add('hide');
        }
        if (this.instructionText) {
            this.instructionText.classList.add('hide');
        }
        
        this.firstObstaclePassed = false;
        
        // Reset particles
        this.particles = [];
        this.explosionActive = false;
        
        // Update mobile status
        this.updateIsMobile();
        
        // Reset ball (centered horizontally, slightly above center vertically)
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2 - 30; // Move up by 30px
        // Don't reset velocityY to 0 - we want it to bounce up immediately
        // this.ball.velocityY = 0; // Removed - bounce will be set below
        // Update ball radius based on scale factor
        const scaleFactor = this.getScaleFactor();
        this.ball.radius = 17 + (scaleFactor * 7); // 15px to 20px
        
        // Apply bounce immediately so ball bounces up instead of falling (same as preview click)
        this.ball.velocityY = this.ball.bouncePower * this.speedScale;
        this.ball.y += this.ball.velocityY;
    }
    
    onBounce() {
        if (!this.gameStarted) {
            this.startGame();
            // Apply bounce immediately on first click so ball bounces up instead of falling
            this.ball.velocityY = this.ball.bouncePower * this.speedScale;
            this.ball.y += this.ball.velocityY;
            // Render immediately to show the bounce
            this.render();
            return;
        }
        
        if (this.gameOver) return;
        
        // Apply bounce force immediately - scale on mobile, desktop stays unchanged
        // Set velocity and immediately apply it for instant visual feedback (no frame delay)
        this.ball.velocityY = this.ball.bouncePower * this.speedScale;
        this.ball.y += this.ball.velocityY;
        
        // Render immediately to show the bounce without waiting for next frame
        this.render();
    }
    
    getScaleFactor() {
        // Calculate fluid scale factor based on canvas width
        // 400px = mobile (scale 0.0), 1200px = desktop (scale 1.0)
        const mobileWidth = 400;
        const desktopWidth = 1200;
        const canvasWidth = this.canvas.width;
        
        // Clamp canvas width between mobile and desktop references
        const clampedWidth = Math.max(mobileWidth, Math.min(canvasWidth, desktopWidth));
        
        // Calculate scale factor (0.0 = mobile, 1.0 = desktop)
        return (clampedWidth - mobileWidth) / (desktopWidth - mobileWidth);
    }
    
    getSpikeSize() {
        const scaleFactor = this.getScaleFactor();
        // Difficulty-based spike sizes (proportional to obstacle height)
        switch(this.difficulty) {
            case 'EASY':
                return 6 + (scaleFactor * 6);
            case 'MEDIUM':
                return 7 + (scaleFactor * 7);
            case 'HARD':
                return 8 + (scaleFactor * 8);
            case 'VERY_HARD':
                return 9 + (scaleFactor * 9);
            default:
                return 7 + (scaleFactor * 7); // Default to MEDIUM
        }
    }
    
    spawnObstacle() {
        // Fluid scaling: sizes scale smoothly between mobile and desktop
        const scaleFactor = this.getScaleFactor();
        // Interpolate between mobile and desktop sizes
        const obstacleWidth = 12 + (scaleFactor * 14); // 10px to 20px (unchanged for all difficulties)
        // Difficulty-based obstacle heights
        let obstacleHeight;
        switch(this.difficulty) {
            case 'EASY':
                obstacleHeight = 60 + (scaleFactor * 60);
                break;
            case 'MEDIUM':
                obstacleHeight = 70 + (scaleFactor * 70);
                break;
            case 'HARD':
                obstacleHeight = 80 + (scaleFactor * 80);
                break;
            case 'VERY_HARD':
                obstacleHeight = 90 + (scaleFactor * 90);
                break;
            default:
                obstacleHeight = 70 + (scaleFactor * 70); // Default to MEDIUM
        }
        const minY = 10;
        const maxY = this.canvas.height - obstacleHeight - 50;
        
        // Minimum distance from recent obstacles (in pixels)
        const minDistance = obstacleHeight * 1; // At least 1.5x obstacle height apart
        
        // Get Y positions of recent obstacles (last 5 obstacles)
        const recentYs = this.obstacles.slice(-5).map(obs => obs.y);
        
        // Try to find a valid Y position (max 20 attempts to avoid infinite loop)
        let y;
        let attempts = 0;
        do {
            y = Math.random() * (maxY - minY) + minY;
            attempts++;
            
            // Check if this Y is far enough from recent obstacles
            const tooClose = recentYs.some(recentY => Math.abs(y - recentY) < minDistance);
            
            if (!tooClose || attempts >= 20) {
                break; // Found valid position or gave up after 20 tries
            }
        } while (attempts < 20);
        
        // Obstacles always start completely off-screen (from the right)
        const startX = this.canvas.width;
        
        this.obstacles.push({
            x: startX,
            y: y,
            height: obstacleHeight,
            width: obstacleWidth,
            passed: false
        });
        
        // Spawn trampoline every 3 obstacles
        this.obstacleSpawnCount++;
        if (this.obstacleSpawnCount >= 3) {
            this.obstacleSpawnCount = 0; // Reset counter
            
            // Trampoline dimensions
            const trampolineWidth = 22 + (scaleFactor * 12); // 60px to 100px
            const trampolineHeight = 10 + (scaleFactor * 8); // 15px to 25px
            
            this.trampolines.push({
                x: this.canvas.width, // Start off-screen right
                y: this.canvas.height - trampolineHeight, // At ground level
                width: trampolineWidth,
                height: trampolineHeight,
                baseHeight: trampolineHeight, // Store original height
                currentHeight: trampolineHeight, // Current animated height
                animating: false, // Animation state
                animationTime: 0, // Animation progress (0 to 1)
                used: false // Track if ball already bounced on it
            });
        }
    }
    
    update(delta = 1) {
        // Update particles even if game is over (for explosion effect)
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
        
        // Stop game updates if game over, but continue rendering for explosion/confetti
        if (!this.gameStarted || this.gameOver) return;
        
        // Update ball physics - scale gravity on mobile, desktop stays unchanged
        // Multiply by delta for frame-rate independent movement
        this.ball.velocityY += this.ball.gravity * this.speedScale * delta;
        this.ball.y += this.ball.velocityY * delta;
        
        // Bounce off top
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.velocityY *= -0.7; // Damping
        }
        
        // Use canvas bottom as boundary (normal bounce)
        if (this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.velocityY *= -0.7; // Damping
        }
        
        // Spawn obstacles
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = currentTime;
        }
        
        // Bottom line is static and fully filled from start - no sync logic needed
        
        // Update trampolines
        for (let i = this.trampolines.length - 1; i >= 0; i--) {
            const trampoline = this.trampolines[i];
            trampoline.x -= this.obstacleSpeed * delta;
            
            // Remove trampolines that are off screen
            if (trampoline.x + trampoline.width < 0) {
                this.trampolines.splice(i, 1);
                continue;
            }
            
            // Update trampoline animation if active
            if (trampoline.animating) {
                trampoline.animationTime += delta * 0.1; // Animation speed (adjust 0.1 for faster/slower)
                
                if (trampoline.animationTime >= 1) {
                    // Animation complete
                    trampoline.animating = false;
                    trampoline.animationTime = 0;
                    trampoline.currentHeight = trampoline.baseHeight; // Reset to base
                } else {
                    // Animate height from baseHeight to 2x baseHeight and back
                    // Uses sine wave for smooth bounce effect
                    const bounce = Math.sin(trampoline.animationTime * Math.PI);
                    trampoline.currentHeight = trampoline.baseHeight + (trampoline.baseHeight * bounce);
                }
                
                // Adjust Y position so trampoline stays at ground level
                trampoline.y = this.canvas.height - trampoline.currentHeight;
            }
            
            // Check collision with trampoline
            const ballBottom = this.ball.y + this.ball.radius;
            const ballLeft = this.ball.x - this.ball.radius;
            const ballRight = this.ball.x + this.ball.radius;
            
            const trampolineTop = trampoline.y;
            const trampolineLeft = trampoline.x;
            const trampolineRight = trampoline.x + trampoline.width;
            
            // Check if ball's X overlaps trampoline's X range
            const xOverlap = ballRight > trampolineLeft && ballLeft < trampolineRight;
            
            // Ball is on trampoline if:
            // - Ball's X overlaps trampoline's X range
            // - Ball is at ground level (ballBottom >= canvas.height - small tolerance) OR
            //   Ball's bottom is at or near trampoline's top
            const ballAtGround = ballBottom >= this.canvas.height - 5;
            const ballOnTrampoline = ballBottom >= trampolineTop - 5 && ballBottom <= trampolineTop + 20;
            
            if (xOverlap && (ballAtGround || ballOnTrampoline) && !trampoline.used) {
                // Apply strong upward bounce
                this.ball.velocityY = -20 * this.speedScale; // Strong bounce (scaled on mobile)
                this.ball.y = trampolineTop - this.ball.radius; // Position ball on top of trampoline
                trampoline.used = true; // Mark as used
                trampoline.animating = true; // Start animation
                trampoline.animationTime = 0; // Reset animation
            }
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.obstacleSpeed * delta;
            
            // Check if obstacle passed the ball (score point)
            if (!obstacle.passed && obstacle.x + obstacle.width < this.ball.x - this.ball.radius) {
                obstacle.passed = true;
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
                
                // Increase difficulty (faster speed increase) - scale with canvas width
                this.obstacleSpeed = this.calculateObstacleSpeed();
                // Spawn interval decreases based on score, but minimum is 800ms
                // Get base spawn interval from difficulty settings
                let baseSpawnInterval;
                switch(this.difficulty) {
                    case 'EASY':
                        baseSpawnInterval = 3000;
                        break;
                    case 'MEDIUM':
                        baseSpawnInterval = 2500;
                        break;
                    case 'HARD':
                        baseSpawnInterval = 2000;
                        break;
                    case 'VERY_HARD':
                        baseSpawnInterval = 1500;
                        break;
                    default:
                        baseSpawnInterval = 2500;
                }
                this.spawnInterval = Math.max(800, baseSpawnInterval - (this.score * 30));
            }
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Collision detection
            const ballLeft = this.ball.x - this.ball.radius;
            const ballRight = this.ball.x + this.ball.radius;
            const ballTop = this.ball.y - this.ball.radius;
            const ballBottom = this.ball.y + this.ball.radius;
            
            const obstacleLeft = obstacle.x;
            const obstacleRight = obstacle.x + obstacle.width;
            const obstacleTop = obstacle.y;
            const obstacleBottom = obstacle.y + obstacle.height;
            
            // Collision if ball overlaps obstacle
            if (ballRight > obstacleLeft && 
                ballLeft < obstacleRight &&
                ballBottom > obstacleTop &&
                ballTop < obstacleBottom) {
                this.createExplosion(this.ball.x, this.ball.y);
                this.gameOver = true; // Set flag but don't show screen yet
                // Delay showing game over screen to allow explosion animation
                setTimeout(() => {
                    this.endGame();
                }, 500); // 0.5 second delay
                return;
            }
        }
    }
    
    render() {
        // Clear canvas and fill with background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw explosion particles even if game not started (for explosion effect)
        if (this.explosionActive) {
            this.drawParticles();
        }
        
        // Draw confetti even if game not started (for max discount celebration)
        if (this.confettiActive) {
            this.drawConfetti();
        }
        
        if (!this.gameStarted && !this.gameOver) {
            // Calculate bounce trail position
            const bounceOffset = Math.abs(Math.sin(this.idleAnimationTime * this.idleAnimationSpeed)) * this.idleAnimationAmplitude;
            const trailY = this.ball.y - bounceOffset;
            
            // Draw semi-transparent bouncing trail ball (40% opacity)
            this.ctx.save();
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, trailY, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
            this.ctx.restore();
            
            // Draw main ball in center before game starts
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
            
            // Draw preview obstacles if they exist
            this.ctx.fillStyle = this.obstacleColor;
            for (const obstacle of this.obstacles) {
                this.drawObstacleWithSpikes(obstacle);
            }
            
            // Start message is now shown via HTML overlay (not drawn on canvas)
            return;
        }
        
        // Draw obstacles (solid lines, no gradient) with spikes integrated
        this.ctx.fillStyle = this.obstacleColor;
        for (const obstacle of this.obstacles) {
            this.drawObstacleWithSpikes(obstacle);
        }
        
        // Draw trampolines
        this.ctx.fillStyle = this.ball.color; // Match ball color
        for (const trampoline of this.trampolines) {
            this.ctx.fillRect(trampoline.x, trampoline.y, trampoline.width, trampoline.currentHeight);
        }
        
        // Draw ball (solid, no motion effect) - only if explosion not active and game not over
        if (!this.explosionActive && !this.gameOver) {
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
        }
    }
    
    createExplosion(x, y) {
        this.explosionActive = true;
        this.particles = [];
        const particleCount = 30;
        
        // Use ball's color for all particles
        const particleColor = this.ball.color;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.5);
            const speed = 3 + Math.random() * 5;
            const size = 3 + Math.random() * 5;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: particleColor, // Use ball's color
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02
            });
        }
    }
    
    updateParticles(delta = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position - multiply by delta for frame-rate independence
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            
            // Apply gravity to particles
            particle.vy += 0.2 * delta;
            
            // Fade out
            particle.life -= particle.decay;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // If all particles are gone, stop explosion
        if (this.particles.length === 0) {
            this.explosionActive = false;
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            const alpha = particle.life;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    createConfetti() {
        this.confettiActive = true;
        this.confetti = [];
        const confettiCount = 150; // More confetti for celebration
        
        // Colorful confetti colors
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C'];
        
        for (let i = 0; i < confettiCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = -10 - Math.random() * 100; // Start above canvas
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const size = 4 + Math.random() * 6;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const rotation = Math.random() * Math.PI * 2;
            const rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            this.confetti.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: speed + Math.random() * 2,
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
    
    drawSpikedShape(x, y, width, height, direction) {
        const spikeSize = this.getSpikeSize();
        const spikeSpacing = spikeSize;
        const numSpikes = direction === 'left' 
            ? Math.floor(height / spikeSpacing)
            : Math.floor(width / spikeSpacing);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        if (direction === 'left') {
            // Draw left side with spikes integrated
            for (let i = 0; i < numSpikes; i++) {
                const spikeY = y + (i * spikeSpacing);
                this.ctx.lineTo(x - spikeSize, spikeY + spikeSize / 2);
                this.ctx.lineTo(x, spikeY + spikeSize);
            }
            // Complete the rectangle shape
            this.ctx.lineTo(x, y + height); // Bottom-left
            this.ctx.lineTo(x + width, y + height); // Bottom-right
            this.ctx.lineTo(x + width, y); // Top-right
        } else {
            // Draw top edge with spikes integrated
            for (let i = 0; i < numSpikes; i++) {
                const spikeX = x + (i * spikeSpacing);
                this.ctx.lineTo(spikeX + spikeSize / 2, y - spikeSize);
                this.ctx.lineTo(spikeX + spikeSize, y);
            }
            // Complete the rectangle shape
            this.ctx.lineTo(x + width, y); // Top-right
            this.ctx.lineTo(x + width, y + height); // Bottom-right
            this.ctx.lineTo(x, y + height); // Bottom-left
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawObstacleWithSpikes(obstacle) {
        this.drawSpikedShape(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 'left');
    }
    
    drawBottomLineWithSpikes(x, y, width, height) {
        this.drawSpikedShape(x, y, width, height, 'top');
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        // Show maxDiscount if reached, otherwise show current score
        const finalScore = this.maxDiscountReached ? this.maxDiscount : this.score;
        this.finalScoreDisplay.textContent = finalScore;
        
        // Update best score if current score is higher
        if (finalScore > this.bestScore) {
            this.bestScore = finalScore;
        }
        
        // Update claim best button text
        const claimBestBtn = document.getElementById('claimBestBtn');
        if (claimBestBtn) {
            claimBestBtn.textContent = `${this.textSettings.claimBestButtonText} ${this.bestScore}%`;
        }
        
        this.gameOverScreen.classList.add('show');
        // Don't clear obstacles - keep them visible after collision
        // this.obstacles = [];
        // Don't reset bottom line - keep it visible after collision
        // this.bottomLineActive = false;
        // this.bottomLineWidth = 0;
        this.firstObstacleStartX = null;
    }
    
    restart() {
        // Clear obstacles on restart (they were kept visible after game over)
        this.obstacles = [];
        // Keep bottom line active and full width
        this.bottomLineActive = true;
        this.bottomLineWidth = this.canvas.width;
        this.obstacleSpawnCount = 0; // Reset trampoline counter
        this.trampolines = []; // Clear trampolines
        
        // Reset confetti
        this.confetti = [];
        this.confettiActive = false;
        this.maxDiscountReached = false;
        
        // Show start message again (but NOT instruction text since game starts immediately)
        if (this.startMessage) {
            this.startMessage.classList.remove('hide');
        }
        // Don't show instruction text here - it will be hidden immediately when startGame() is called
        this.endGame();
        setTimeout(() => {
            // Don't spawn preview obstacle
            this.startGame();
        }, 100);
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
    
    applyEmailModalSettings() {
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
            emailModalHeading.style.fontSize = this.textSettings.emailModalHeadingSize + 'px';
            emailModalHeading.style.fontWeight = this.textSettings.emailModalHeadingWeight;
        }
        
        if (emailModalDescription) {
            emailModalDescription.textContent = this.textSettings.emailModalDescriptionText;
            emailModalDescription.style.color = this.textSettings.emailModalDescriptionColor;
            emailModalDescription.style.fontSize = this.textSettings.emailModalDescriptionSize + 'px';
            emailModalDescription.style.fontWeight = this.textSettings.emailModalDescriptionWeight;
        }
        
        if (emailSubmitBtn) {
            emailSubmitBtn.textContent = this.textSettings.emailModalSubmitText;
            emailSubmitBtn.style.color = this.textSettings.emailModalSubmitColor;
            emailSubmitBtn.style.fontSize = this.textSettings.emailModalSubmitSize + 'px';
            emailSubmitBtn.style.fontWeight = this.textSettings.emailModalSubmitWeight;
            emailSubmitBtn.style.backgroundColor = this.textSettings.emailModalSubmitBgColor;
            emailSubmitBtn.style.borderRadius = this.emailModalBorderRadius + 'px';
        }
        
        if (emailCancelBtn) {
            emailCancelBtn.textContent = this.textSettings.emailModalCancelText;
            emailCancelBtn.style.color = this.textSettings.emailModalCancelColor;
            emailCancelBtn.style.fontSize = this.textSettings.emailModalCancelSize + 'px';
            emailCancelBtn.style.fontWeight = this.textSettings.emailModalCancelWeight;
            emailCancelBtn.style.backgroundColor = this.textSettings.emailModalCancelBgColor;
            emailCancelBtn.style.borderRadius = this.emailModalBorderRadius + 'px';
        }
    }

    applyDiscountModalSettings() {
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
            discountModalHeading.style.fontSize = this.textSettings.discountModalHeadingSize + 'px';
            discountModalHeading.style.fontWeight = this.textSettings.discountModalHeadingWeight;
        }
        
        const discountCodeDescription = document.getElementById('discountCodeDescription');
        if (discountCodeDescription) {
            discountCodeDescription.style.color = this.textSettings.discountModalDescriptionColor;
            discountCodeDescription.style.fontSize = this.textSettings.discountModalDescriptionSize + 'px';
            discountCodeDescription.style.fontWeight = this.textSettings.discountModalDescriptionWeight;
        }
        
        if (discountCodeCloseBtn) {
            discountCodeCloseBtn.textContent = this.textSettings.discountModalCloseText;
            discountCodeCloseBtn.style.color = this.textSettings.discountModalCloseColor;
            discountCodeCloseBtn.style.fontSize = this.textSettings.discountModalCloseSize + 'px';
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
                        // Email validation with simple regex and safeguards
                        // 1. Length validation
                        if (!email || email.length === 0) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        if (email.length > 254) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // 2. Basic format checks
                        if (email.includes(' ')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        if (email.startsWith('.') || email.startsWith('@')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        if (email.endsWith('.') || email.endsWith('@')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        if (email.includes('..')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // 3. Ensure exactly ONE @ symbol
                        if (email.split('@').length !== 2) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // 4. Basic regex check (simple and safe)
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                        if (!emailRegex.test(email)) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // 5. Split and validate parts
                        const [local, domain] = email.split('@');
                        
                        // Local part checks
                        if (!local || local.startsWith('.') || local.endsWith('.')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // Domain checks
                        if (!domain || domain.startsWith('.') || domain.endsWith('.')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        if (!domain.includes('.')) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                        
                        // TLD check
                        const domainParts = domain.split('.');
                        const tld = domainParts[domainParts.length - 1];
                        if (!tld || tld.length < 2) {
                            alert('Please enter a valid email address.');
                            return;
                        }
                    }
                    
                    // Hide modal
                    emailModal.style.display = 'none';
                    
                    // Process discount (use empty email if not required)
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
                    percentage: this.bestScore,
                }),
            });
            
            const data = await response.json();
            
            if (data.success && data.discountCode) {
                // Show discount code in custom modal
                const discountModal = document.getElementById('discountCodeModal');
                const discountCodeText = document.getElementById('discountCodeText');
                const discountCodeCloseBtn = document.getElementById('discountCodeCloseBtn');
                
                if (discountModal && discountCodeText) {
                    // Apply discount modal settings
                    this.applyDiscountModalSettings();
                    
                    discountCodeText.value = data.discountCode;
                    const discountCodeDescription = document.getElementById('discountCodeDescription');
                    if (discountCodeDescription) {
                        discountCodeDescription.textContent = this.textSettings.discountModalDescriptionText;
                    }
                    discountModal.style.display = 'flex';
                    
                    if (discountCodeCloseBtn) {
                        discountCodeCloseBtn.onclick = () => {
                            discountModal.style.display = 'none';
                        };
                    }
                }
            } else {
                alert('Failed to generate discount code. Please try again.');
                console.error('Discount generation error:', data.error);
            }
        } catch (error) {
            console.error('Error calling discount API:', error);
            alert('An error occurred while generating your discount code. Please try again.');
        }
    }

}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new BouncingBallGame();
});
