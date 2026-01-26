let rooms = {};

// Initial Questions Seed (Fallback)
const INITIAL_QUESTIONS = Array.from({ length: 50 }, (_, i) => ({
    boxNo: i + 1,
    word: `Word${i + 1}`,
    meaning: `Meaning of Word${i + 1}`
}));

function getInitialState() {
    return {
        currentRound: 'SPELL IT', // 'SPELL IT', 'SPELL IT Tie Breaker', 'Meaning', 'Meaning Tie Breaker'
        currentParticipant: 'Participant 1',
        score: 0,
        questionsAnswered: 0,
        gridState: Array.from({ length: 50 }, (_, i) => ({ [i + 1]: 'neutral' })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        isScoreScreenActive: false,
        currentQuestion: null,
        questions: INITIAL_QUESTIONS,
        questionsByRound: {
            'SPELL IT': INITIAL_QUESTIONS,
            'SPELL IT Tie Breaker': INITIAL_QUESTIONS,
            'Meaning': INITIAL_QUESTIONS,
            'Meaning Tie Breaker': INITIAL_QUESTIONS
        },
        isGridEnabled: false,
        usedWords: {
            'SPELL IT': [],
            'SPELL IT Tie Breaker': [],
            'Meaning': [],
            'Meaning Tie Breaker': []
        },
        // NEW: Tie Breaker specific state
        tieBreakerState: {
            roundNumber: 1,
            totalPlayers: 2,
            questionsPerPlayer: 1,
            questionsAskedInCurrentRound: 0,
            isRoundActive: false
        }
    };
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function initGameState(roomCode) {
    if (roomCode) {
        rooms[roomCode] = getInitialState();
        return rooms[roomCode];
    }
}

function getRoomState(roomCode) {
    if (!rooms[roomCode]) {
        rooms[roomCode] = getInitialState();
    }
    return rooms[roomCode];
}

function updateGameState(roomCode, updates) {
    const state = getRoomState(roomCode);

    // Check if we need to update Tie Breaker progress
    if (updates.questionsAnswered && state.currentRound.includes('Tie Breaker')) {
        if (state.tieBreakerState.isRoundActive) {
            state.tieBreakerState.questionsAskedInCurrentRound += 1;
        }
    }

    rooms[roomCode] = { ...state, ...updates };

    // Ensure tieBreakerState is preserved/merged correctly if updates contain it
    if (updates.tieBreakerState) {
        rooms[roomCode].tieBreakerState = { ...state.tieBreakerState, ...updates.tieBreakerState };
    }

    return rooms[roomCode];
}

function shuffleCurrentRound(roomCode) {
    const state = getRoomState(roomCode);
    const roundName = state.currentRound;

    if (state.questionsByRound && state.questionsByRound[roundName]) {
        const pool = state.questionsByRound[roundName];
        let used = state.usedWords[roundName] || [];

        // Filter out used words
        let available = pool.filter(q => !used.includes(q.word));

        let selected = [];

        // If we have enough words to fill the grid (50), just take them
        if (available.length >= 50) {
            selected = shuffle(available).slice(0, 50);
        } else {
            // Not enough words! Take ALL available words first.
            selected = [...available];

            // Now we need (50 - available.length) more words.
            const needed = 50 - available.length;

            // Reset used words because we've exhausted the pool
            state.usedWords[roundName] = [];
            used = [];

            // Refill available from the full pool, excluding the ones we just picked
            // (Note: 'pool' is the full list. We effectively want a fresh shuffle of everything)
            // But we must NOT pick the words we just put in 'selected' to avoid immediate repeats in the same grid.
            const currentlySelectedWords = selected.map(q => q.word);
            let freshPool = pool.filter(q => !currentlySelectedWords.includes(q.word));

            const refill = shuffle(freshPool).slice(0, needed);
            selected = [...selected, ...refill];
        }

        // Assign box numbers 1-50
        state.questions = shuffle(selected).map((q, i) => ({
            ...q,
            boxNo: i + 1
        }));

        // Reset Grid
        for (let i = 1; i <= 50; i++) {
            state.gridState[i] = 'neutral';
        }
        state.currentQuestion = null;
    }
    return state;
}

function resetRoundState(roomCode, roundName) {
    const state = getRoomState(roomCode);

    // If we are switching TO a non-Tie Breaker round, reset Tie Breaker state completely
    // BUT if we are just verifying 'resetRoundState' calls for normal rounds, we usually reset everything.
    // However, for Tie Breaker "Next Round", we might handle it differently. 
    // Let's assume this is a full reset typical for changing major rounds.

    state.currentRound = roundName;
    state.score = 0;
    state.questionsAnswered = 0;
    state.isScoreScreenActive = false;
    state.currentQuestion = null;
    state.isGridEnabled = false;

    if (!roundName.includes('Tie Breaker')) {
        // Reset TB state if leaving TB
        state.tieBreakerState = {
            roundNumber: 1,
            totalPlayers: 2,
            questionsPerPlayer: 1,
            questionsAskedInCurrentRound: 0,
            isRoundActive: false
        };
    } else {
        // If entering/resetting Tie Breaker, we might want to keep config but reset progress
        // strict reset:
        state.tieBreakerState.questionsAskedInCurrentRound = 0;
        state.tieBreakerState.isRoundActive = false;
    }

    // Load and Shuffle Questions (Avoiding used words)
    if (state.questionsByRound && state.questionsByRound[roundName]) {
        const pool = state.questionsByRound[roundName];
        const used = state.usedWords[roundName] || [];

        // Filter out used words
        let available = pool.filter(q => !used.includes(q.word));

        // If pool is exhausted, reset used words for this round
        if (available.length < 50) {
            state.usedWords[roundName] = [];
            available = pool;
        }

        // Shuffle and take 50
        const selected = shuffle(available).slice(0, 50);

        // Assign box numbers 1-50 for consistent grid mapping
        state.questions = selected.map((q, i) => ({
            ...q,
            boxNo: i + 1
        }));
    }

    // Reset Grid
    for (let i = 1; i <= 50; i++) {
        state.gridState[i] = 'neutral';
    }
    return state;
}

module.exports = {
    initGameState,
    getRoomState,
    updateGameState,
    resetRoundState,
    shuffleCurrentRound
};
