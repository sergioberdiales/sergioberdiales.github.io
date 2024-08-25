let score = 0;
let timeLeft;
let timer;
let currentQuestion;
let difficulty;
let playerName = '';
let totalTime;

const feedbackMessages = {
    low: [
        "¡Buen intento! Sigue practicando para mejorar.",
        "No te desanimes, la práctica hace al maestro.",
        "Cada error es una oportunidad para aprender. ¡Sigue adelante!"
    ],
    medium: [
        "¡Bien hecho! Estás mejorando con cada intento.",
        "Buen trabajo, estás en el camino correcto.",
        "¡Sigue así! Estás demostrando un buen progreso."
    ],
    high: [
        "¡Excelente trabajo! Eres un maestro de las multiplicaciones.",
        "¡Impresionante! Tu habilidad con los números es admirable.",
        "¡Fantástico! Has demostrado un dominio excepcional."
    ]
};

function startGame() {
    score = 0;
    playerName = document.getElementById('playerName').value || 'Jugador';
    difficulty = document.getElementById('difficulty').value;
    timeLeft = parseInt(document.getElementById('timeSelect').value);
    totalTime = timeLeft; // Guardar el tiempo total seleccionado
    document.getElementById('score').textContent = score;
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('ranking-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    nextQuestion();
    startTimer();
}

function nextQuestion() {
    let num1, num2;
    if (difficulty === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === 'medium') {
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
    } else {  // difficult
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;
    }
    currentQuestion = { num1, num2, answer: num1 * num2 };
    document.getElementById('question').textContent = `${num1} x ${num2} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('answer').focus();
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    if (userAnswer === currentQuestion.answer) {
        score++;
        document.getElementById('score').textContent = score;
        document.getElementById('correctSound').volume = 0.5;  // Ajuste de volumen
        document.getElementById('correctSound').play().catch(e => console.log("Error playing sound:", e));
        document.getElementById('feedback').textContent = "¡Correcto!";
        document.getElementById('feedback').style.color = "#17bf63";
    } else {
        document.getElementById('incorrectSound').volume = 0.5;  // Ajuste de volumen
        document.getElementById('incorrectSound').play().catch(e => console.log("Error playing sound:", e));
        document.getElementById('feedback').textContent = "Incorrecto, sigue intentando.";
        document.getElementById('feedback').style.color = "#e0245e";
    }
    nextQuestion();
}

function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft === 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timeSpan = document.getElementById('time');
    timeSpan.textContent = timeLeft;
    if (timeLeft >= 16) {
        timeSpan.className = 'green';
    } else if (timeLeft >= 6) {
        timeSpan.className = 'orange';
    } else {
        timeSpan.className = 'red';
    }
}

function endGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';

    let message;
    if (score < 8) {
        message = feedbackMessages.low[Math.floor(Math.random() * feedbackMessages.low.length)];
    } else if (score < 15) {
        message = feedbackMessages.medium[Math.floor(Math.random() * feedbackMessages.medium.length)];
    } else {
        message = feedbackMessages.high[Math.floor(Math.random() * feedbackMessages.high.length)];
    }

    document.getElementById('final-message').textContent = `${message} Tu puntuación final es: ${score}, ${playerName}.`;

    // Guardar la partida en el ranking
    saveToRanking(playerName, score, difficulty, totalTime - timeLeft); // Tiempo jugado
}

function restartGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('ranking-screen').style.display = 'none';
    document.getElementById('welcome-screen').style.display = 'block';
}

function saveToRanking(name, score, difficulty, time) {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    ranking.push({ name, score, difficulty, time });
    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

function showRanking() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('ranking-screen').style.display = 'block';
    loadRanking();
}

function loadRanking() {
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';
    ranking.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.score}</td>
            <td>${record.difficulty}</td>
            <td>${record.time}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterRanking() {
    const nameFilter = document.getElementById('filterName').value.toLowerCase();
    const difficultyFilter = document.getElementById('filterDifficulty').value;
    const timeFilter = document.getElementById('filterTime').value;
    
    const ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    const filteredRanking = ranking.filter(record => {
        return (
            (nameFilter === '' || record.name.toLowerCase().includes(nameFilter)) &&
            (difficultyFilter === '' || record.difficulty === difficultyFilter) &&
            (timeFilter === '' || record.time.toString() === timeFilter)
        );
    });

    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';
    filteredRanking.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.name}</td>
            <td>${record.score}</td>
            <td>${record.difficulty}</td>
            <td>${record.time}</td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('answer').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});
