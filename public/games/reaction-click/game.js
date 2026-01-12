class ReactionGame {
    constructor() {
        // Read color parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bgColor = urlParams.get('bg') || '#021412';
        const ballColor = urlParams.get('ball') || '#00ce90';
        const countdownTimeParam = urlParams.get('countdownTime');
        this.countdownTime = (countdownTimeParam !== null && !isNaN(parseFloat(countdownTimeParam))) 
            ? parseFloat(countdownTimeParam) 
            : 10.0; // Default to 10 seconds if not provided
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
        this.isMobile = window.innerWidth <= 768; // Match CSS breakpoint
        this.gameType = 'reaction-click'; // Reaction Click
        this.appUrl = 'https://discount-game-popup-production.up.railway.app';
        
        // Store colors
        this.backgroundColor = bgColor;
        this.ballColor = ballColor;
        
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
            instructionText: urlParams.get('instructionText') || 'Click to Start',
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
        
        this.score = 0;
        this.gameStarted = false;
        this.currentCircle = null;
        this.mainTimerInterval = null;
        this.gameTimeLeft = this.countdownTime; // Use countdownTime instead of hardcoded 10.0
        this.lastCircleX = null;
        this.lastCircleY = null;
        this.bestScore = 0; // Track best score while popup is open
        
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
            
            // Re-initialize scoreDisplay reference after replacing innerHTML
            this.scoreDisplay = document.getElementById('score');
        }
        
        // Apply rules text settings (1 Score - 1% Discount)
        const instructionTextEl = document.getElementById('instructionText');
        if (instructionTextEl) {
            instructionTextEl.textContent = this.textSettings.rulesText;
            instructionTextEl.style.color = this.textSettings.rulesTextColor;
            instructionTextEl.style.fontSize = scaleTextSize(this.textSettings.rulesTextSize) + 'px';
            instructionTextEl.style.fontWeight = this.textSettings.rulesTextWeight;
        }
        
        // Apply instruction text settings (Click to Start)
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
    
    addClickAndTouch(element, handler) {
        element.addEventListener('click', handler);
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handler();
        });
    }
    
    init() {
        // Apply background color to .game-container (not body, since that's where the visible background is)
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.backgroundColor = this.backgroundColor;
        }
        
        this.gameArea = document.getElementById('gameArea');
        this.startCircle = document.getElementById('startCircle');
        this.scoreDisplay = document.getElementById('score');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreDisplay = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        this.instructionText = document.getElementById('instructionText');
        this.startMessage = document.getElementById('startMessage');
        
        // Apply ball color to start circle and pulse circle
        if (this.startCircle) {
            this.startCircle.style.backgroundColor = this.ballColor;
        }
        const pulseCircle = document.querySelector('.start-circle-pulse');
        if (pulseCircle) {
            pulseCircle.style.backgroundColor = this.ballColor;
        }
        
        // Click and touch support
        this.addClickAndTouch(this.startCircle, () => this.startGame());
        this.addClickAndTouch(this.restartBtn, () => this.restart());
        
        // Add resize and orientation change handlers to update text settings
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.applyTextSettings();
        });
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.isMobile = window.innerWidth <= 768;
                this.applyTextSettings();
            }, 200);
        });
    }
    
    startGame() {
        // Track game play
        this.trackGamePlay();
        
        this.gameStarted = true;
        this.score = 0;
        this.gameTimeLeft = this.countdownTime;
        this.lastCircleX = null;
        this.lastCircleY = null;
        this.updateScore();
        this.updateTimer();
        this.startCircle.style.display = 'none';
        this.gameOverScreen.classList.remove('show');
        
        // Hide instruction text and start message
        if (this.instructionText) {
            this.instructionText.classList.add('hide');
        }
        if (this.startMessage) {
            this.startMessage.classList.add('hide');
        }
        
        // Hide pulse circle
        const pulseCircle = document.querySelector('.start-circle-pulse');
        if (pulseCircle) {
            pulseCircle.style.display = 'none';
        }
        
        // Start main 10-second timer
        this.startMainTimer();
        
        // Spawn first circle
        this.spawnCircle();
    }
    
    startMainTimer() {
        const startTime = Date.now();
        
        this.mainTimerInterval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            this.gameTimeLeft = this.countdownTime - elapsed;
            
            if (this.gameTimeLeft <= 0) {
                this.gameTimeLeft = 0;
                this.updateTimer();
                this.gameOver();
                return;
            }
            
            this.updateTimer();
        }, 10);
    }
    
    updateTimer() {
        // Update timer in circle if it exists
        const circleTimer = this.currentCircle ? this.currentCircle.querySelector('.circle-timer') : null;
        if (circleTimer) {
            circleTimer.textContent = this.gameTimeLeft.toFixed(1) + 's';
        }
    }
    
    spawnCircle() {
        // Don't spawn if game is over
        if (!this.gameStarted || this.gameTimeLeft <= 0) {
            return;
        }
        
        // Remove previous circle if exists
        if (this.currentCircle) {
            this.currentCircle.remove();
        }
        
        // Create new circle with timer display inside
        this.currentCircle = document.createElement('div');
        this.currentCircle.className = 'circle target-circle';
        this.currentCircle.style.backgroundColor = this.ballColor;
        
        // Create timer display element inside circle
        const timerElement = document.createElement('span');
        timerElement.className = 'circle-timer';
        this.currentCircle.appendChild(timerElement);
        
        // Update timer immediately
        this.updateTimer();
        
        // Get actual game-area dimensions (not container, to account for header space)
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const containerWidth = gameAreaRect.width;
        const containerHeight = gameAreaRect.height;
        
        // Get circle size (responsive - smaller on mobile)
        const isMobile = window.innerWidth <= 768; // Match CSS breakpoint
        const circleSize = isMobile ? 70 : 80; // Smaller on mobile
        const circleRadius = circleSize / 2;
        const minDistance = 200; // Minimum distance from previous circle
        const margin = 20; // Margin from edges to ensure circle stays inside
        
        // Calculate safe spawn area (ensuring circle stays fully inside)
        const maxX = containerWidth - circleSize - margin;
        const maxY = containerHeight - circleSize - margin;
        const minX = margin;
        const minY = margin;
        
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            // Random position within safe bounds
            x = minX + Math.random() * (maxX - minX);
            y = minY + Math.random() * (maxY - minY);
            
            attempts++;
            
            // If no previous circle or far enough away, break
            if (this.lastCircleX === null || this.lastCircleY === null) {
                break;
            }
            
            // Calculate distance from last circle (center to center)
            const circleCenterX = x + circleRadius;
            const circleCenterY = y + circleRadius;
            const distance = Math.sqrt(
                Math.pow(circleCenterX - this.lastCircleX, 2) + 
                Math.pow(circleCenterY - this.lastCircleY, 2)
            );
            
            // If far enough away, use this position
            if (distance >= minDistance) {
                break;
            }
            
            // If too many attempts, just use the position anyway
            if (attempts >= maxAttempts) {
                break;
            }
        } while (true);
        
        // Store position for next spawn (center position)
        this.lastCircleX = x + circleRadius;
        this.lastCircleY = y + circleRadius;
        
        // Ensure final position is within bounds (safety check)
        x = Math.max(margin, Math.min(x, containerWidth - circleSize - margin));
        y = Math.max(margin, Math.min(y, containerHeight - circleSize - margin));
        
        this.currentCircle.style.left = x + 'px';
        this.currentCircle.style.top = y + 'px';
        
        // Add click and touch events
        this.addClickAndTouch(this.currentCircle, () => this.onCircleClick());
        
        this.gameArea.appendChild(this.currentCircle);
    }
    
    onCircleClick() {
        if (!this.gameStarted || this.gameTimeLeft <= 0) return;
        
        // Update score
        this.score++;
        this.updateScore();
        
        // Remove clicked circle immediately
        if (this.currentCircle) {
            this.currentCircle.remove();
            this.currentCircle = null;
        }
        
        // Spawn next circle immediately (if time remaining)
        if (this.gameTimeLeft > 0) {
            this.spawnCircle();
        }
    }
    
    gameOver() {
        this.gameStarted = false;
        clearInterval(this.mainTimerInterval);
        
        if (this.currentCircle) {
            this.currentCircle.remove();
            this.currentCircle = null;
        }
        
        this.finalScoreDisplay.textContent = this.score;
        
        // Update best score if current score is higher
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
        }
        
        // Update claim best button text
        const claimBestBtn = document.getElementById('claimBestBtn');
        if (claimBestBtn) {
            claimBestBtn.textContent = `${this.textSettings.claimBestButtonText} ${this.bestScore}%`;
        }
        
        this.gameOverScreen.classList.add('show');
        this.startCircle.style.display = 'flex';
        
        // Show start message again (but NOT instruction text - it should only show in preview)
        if (this.startMessage) {
            this.startMessage.classList.remove('hide');
        }
        // Show pulse circle again
        const pulseCircle = document.querySelector('.start-circle-pulse');
        if (pulseCircle) {
            pulseCircle.style.display = 'block';
        }
    }
    
    restart() {
        this.gameOver();
        setTimeout(() => {
            this.startGame();
        }, 100);
    }
    
    updateScore() {
        // Use cached reference if available, otherwise get from DOM
        const scoreElement = this.scoreDisplay || document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
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
                    difficulty: `${Math.round(this.countdownTime)} Seconds`,
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

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ReactionGame();
});

