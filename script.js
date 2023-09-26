document.getElementById('startButton').addEventListener('click', function() {
    this.disabled = true;
    // Clear previous choices and display at the start of new game
    document.getElementById('choiceDisplay').innerHTML = '';
    document.getElementById('wordDisplay').innerText = '';
    document.getElementById('score').innerText = '';
    document.getElementById('timer').style.visibility = 'hidden';
    document.getElementById('validateButton').style.display = 'none';  // Hide the button

    let words = [];
    let initialWords = [];
    let timerId = null;
    let selectedWords = [];
    let validateButton = document.getElementById('validateButton');
    validateButton.className = "bottom-center";
    let wordButtons = [];
    let liveCounter = document.getElementById('liveCounter');  // New live counter element

    // Fisher-Yates (aka Knuth) Shuffle
    function shuffleArray(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    async function fetchWords() {
        const response = await fetch('https://firoseshafin.com/randomWords');
        const data = await response.json();
        words = data;
        initialWords = words.slice(0, 15); // Copy of the first 15 words
        return words;
    }

    async function displayWords() {
        try {
            await fetchWords();
            let wordDisplay = document.getElementById('wordDisplay');
            wordDisplay.style.fontSize = "120px";
            for (let i = 0; i < 15; i++) {
                setTimeout(function() {
                    wordDisplay.innerText = initialWords[i];
                }, i * 1000);
            }
            setTimeout(function() {
                wordDisplay.innerText = '';
                wordDisplay.style.fontSize = "16px";
                shuffleArray(words);
                displayChoices();
                startTimer();
            }, 15 * 1000);
        } catch(err) {
            console.error(err);
        }
    }

    function startTimer() {
        if (timerId) {
            clearInterval(timerId);
        }
        let timerDiv = document.getElementById('timer');
        timerDiv.style.visibility = 'visible';
        let timeLeft = 60;
        timerDiv.innerText = 'Time left: ' + timeLeft + ' seconds';
        timerId = setInterval(function() {
            timeLeft--;
            timerDiv.innerText = 'Time left: ' + timeLeft + ' seconds';
            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                validateButton.click();
                wordButtons.forEach(button => {
                    button.disabled = true;
                });
            }
        }, 1000);
    }

    function displayChoices() {
        let choiceDisplay = document.getElementById('choiceDisplay');
        choiceDisplay.innerHTML = ""; // clear the previous choices
        liveCounter.style.visibility = 'visible';  // Show the counter
        liveCounter.innerText = 'Selected: 0/15';  // Reset counter
        wordButtons = [];
        validateButton.style.display = 'none';  // Hide the button initially
        validateButton.onclick = function() {
            validateChoices(selectedWords, false);
            wordButtons.forEach(button => {
                button.disabled = true;
            });
        };
        words.forEach(word => {
            let wordDiv = document.createElement('div');
            wordDiv.className = "choice";
            let wordButton = document.createElement('button');
            wordButton.innerText = word;
            wordButton.onclick = function() {
                if (selectedWords.length < 15 || this.style.backgroundColor === 'green') {
                    this.style.backgroundColor = this.style.backgroundColor === 'green' ? '' : 'green';
                    if (selectedWords.includes(word)) {
                        selectedWords = selectedWords.filter(selectedWord => selectedWord !== word);
                    } else {
                        selectedWords.push(word);
                    }
                    wordButtons.forEach(button => {
                        if (selectedWords.length < 15 || button.style.backgroundColor === 'green') {
                            button.disabled = false;
                        } else {
                            button.disabled = true;
                        }
                    });
                    if (selectedWords.length === 15) {
                        validateButton.style.display = 'block';  // Show the button
                    } else {
                        validateButton.style.display = 'none';  // Hide the button
                    }
                    liveCounter.innerText = 'Selected: ' + selectedWords.length + '/15';  // Update counter
                }
            };
            wordButtons.push(wordButton);
            wordDiv.appendChild(wordButton);
            choiceDisplay.appendChild(wordDiv);
        });
    }

    function validateChoices(selectedWords, timeUp) {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        liveCounter.style.visibility = 'hidden';  // Hide the counter
        let wordDisplay = document.getElementById('wordDisplay');
        let scoreDisplay = document.getElementById('score');
        let correctCount = 0;
        let resultWords = [];
        initialWords.forEach(word => {
            if (selectedWords.includes(word)) {
                correctCount++;
                resultWords.push(`<span style="color:green;">${word}</span>`);
            } else {
                resultWords.push(word);
            }
        });
        scoreDisplay.innerText = 'You scored: ' + correctCount + '/15';
        if (timeUp && correctCount === 15) {
            wordDisplay.innerHTML = 'Time\'s up! You got them all correct!';
        } else if (timeUp) {
            wordDisplay.innerHTML = `Time's up! You didn't select all the correct words. The correct words were: ${resultWords.join(', ')}`;
        } else if (correctCount === 15) {
            wordDisplay.innerHTML = 'Correct!';
        } else {
            wordDisplay.innerHTML = `Incorrect. The correct words were: ${resultWords.join(', ')}`;
        }
        // Change incorrect selections to red
        wordButtons.forEach(button => {
            if (button.style.backgroundColor === 'green' && !initialWords.includes(button.innerText)) {
                button.style.backgroundColor = 'red';
            }
        });
        document.getElementById('startButton').disabled = false;
    }

    displayWords();
});
