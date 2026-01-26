const { getRoomState, updateGameState, resetRoundState, shuffleCurrentRound } = require('./gameState');

function registerSocketHandlers(io, socket) {
    // --- JOIN EVENTS ---
    socket.on('join_room', ({ roomCode, role }) => {
        if (!roomCode) return;

        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room ${roomCode} as ${role}`);

        // Send current full state to the joined user
        // Ensure default Tie Breaker state if missing (migration/safety)
        const currentState = getRoomState(roomCode);
        if (currentState && !currentState.tieBreakerState) {
            updateGameState(roomCode, {
                tieBreakerState: {
                    roundNumber: 1,
                    totalPlayers: 2,
                    questionsPerPlayer: 1,
                    questionsAskedInCurrentRound: 0,
                    isRoundActive: false
                }
            });
        }
        socket.emit('state_update', getRoomState(roomCode));
    });

    // --- HOST ACTIONS ---

    socket.on('start_tie_breaker_round', ({ roomCode, totalPlayers, questionsPerPlayer, roundNumber }) => {
        const state = getRoomState(roomCode);
        const updates = {
            isGridEnabled: false, // Grid disabled initially, wait for scoreboard close
            isScoreScreenActive: true, // Show Round Title immediately
            tieBreakerState: {
                ...state.tieBreakerState,
                totalPlayers,
                questionsPerPlayer,
                roundNumber,
                questionsAskedInCurrentRound: 0,
                isRoundActive: true
            }
        };
        const newState = updateGameState(roomCode, updates);
        io.to(roomCode).emit('state_update', newState);
    });

    socket.on('enable_grid', ({ roomCode, enabled }) => {
        const state = updateGameState(roomCode, { isGridEnabled: enabled });
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('reset_grid', ({ roomCode }) => {
        const cleanGrid = {};
        for (let i = 1; i <= 50; i++) {
            cleanGrid[i] = 'neutral';
        }
        const state = updateGameState(roomCode, {
            gridState: cleanGrid,
            isGridEnabled: false,
            score: 0,
            questionsAnswered: 0,
            currentQuestion: null
        });
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('change_round', ({ roomCode, roundName }) => {
        const state = resetRoundState(roomCode, roundName);
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('shuffle_grid', ({ roomCode }) => {
        const state = shuffleCurrentRound(roomCode);
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('start_new_participant', ({ roomCode, name }) => {
        const state = updateGameState(roomCode, {
            currentParticipant: name,
            score: 0,
            questionsAnswered: 0,
            currentQuestion: null,
            isScoreScreenActive: false
        });
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('close_score_screen', ({ roomCode }) => {
        const currentState = getRoomState(roomCode);
        const updates = {
            isScoreScreenActive: false,
            // score: 0, // Don't reset score blindly if we want to track it? But existing logic resets it.
            // questionsAnswered: 0,
            currentQuestion: null
        };

        // If Tie Breaker Round is ACTIVE, closing the screen means "Start the Grid"
        if (currentState.currentRound.includes('Tie Breaker') && currentState.tieBreakerState?.isRoundActive) {
            updates.isGridEnabled = true;
        } else if (!currentState.currentRound.includes('Tie Breaker')) {
            // User Request: Reset score AFTER every 5 questions for normal rounds
            updates.score = 0;
            // Optionally reset questionsAnswered if we want "1/5" logic visually? 
            // But leaving it allows "Total questions asked" to track.
            // The score will be "0" for the next batch.
        }

        const state = updateGameState(roomCode, updates);
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('process_answer', ({ roomCode, status }) => {
        const currentState = getRoomState(roomCode);
        const currentQuestion = currentState.currentQuestion;

        if (!currentQuestion) return;

        const newGridState = { ...currentState.gridState };
        newGridState[currentQuestion.boxNo] = status;

        let newScore = currentState.score;
        if (status === 'correct') {
            newScore += 1;
        }
        const newQuestionsAnswered = currentState.questionsAnswered + 1;

        let showScoreScreen = false;
        let gridEnabled = currentState.isGridEnabled;

        if (currentState.currentRound.includes('Tie Breaker')) {
            // Check dynamic Tie Breaker limits
            const tbState = currentState.tieBreakerState;
            const totalQuestionsForRound = tbState.totalPlayers * tbState.questionsPerPlayer;
            // note: questionsAskedInCurrentRound is updated in updateGameState, but we are calculating logic here.
            // We need to know if we JUST hit the limit.
            // currentState.tieBreakerState.questionsAskedInCurrentRound is the OLD value.
            // The NEW value will be currentState.tieBreakerState.questionsAskedInCurrentRound + 1

            if (tbState.isRoundActive && (tbState.questionsAskedInCurrentRound + 1) >= totalQuestionsForRound) {
                showScoreScreen = true;
                gridEnabled = false;

                // End the round state so Host Dashboard can propose next round
                // We will handle this update in the updateGameState call below
            }
        } else if (newQuestionsAnswered > 0 && newQuestionsAnswered % 5 === 0) {
            showScoreScreen = true;
            gridEnabled = false;
        }

        const newUsedWords = { ...currentState.usedWords };
        const roundUsed = [...(newUsedWords[currentState.currentRound] || [])];
        if (!roundUsed.includes(currentQuestion.word)) {
            roundUsed.push(currentQuestion.word);
        }
        newUsedWords[currentState.currentRound] = roundUsed;

        // Prepare updates
        const updates = {
            gridState: newGridState,
            score: newScore,
            questionsAnswered: newQuestionsAnswered,
            isScoreScreenActive: showScoreScreen,
            isGridEnabled: gridEnabled,
            currentQuestion: null,
            usedWords: newUsedWords
        };

        // If we determined the Tie Breaker round should end, update that state too
        if (showScoreScreen && currentState.currentRound.includes('Tie Breaker')) {
            updates.tieBreakerState = {
                ...currentState.tieBreakerState,
                isRoundActive: false
            };
        }

        const state = updateGameState(roomCode, updates);

        io.to(roomCode).emit('state_update', state);
    });

    // --- PARTICIPANT ACTIONS ---

    socket.on('end_tie_breaker', ({ roomCode }) => {
        const state = updateGameState(roomCode, {
            isScoreScreenActive: true,
            isGridEnabled: false
        });
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('select_box', ({ roomCode, boxNo }) => {
        const currentState = getRoomState(roomCode);

        if (!currentState.isGridEnabled) return;
        if (currentState.gridState[boxNo] !== 'neutral') return;
        if (currentState.isScoreScreenActive) return;

        const question = currentState.questions.find(q => q.boxNo == boxNo);
        const questionData = question || { boxNo, word: `Word ${boxNo}`, meaning: `Meaning ${boxNo}` };

        const state = updateGameState(roomCode, { currentQuestion: questionData });
        io.to(roomCode).emit('state_update', state);
        // Force audio trigger to ensure playback
        io.to(roomCode).emit('trigger_audio', questionData.word);
    });

    socket.on('upload_questions', ({ roomCode, questionsByRound }) => {
        const currentState = getRoomState(roomCode);
        const activeQuestions = questionsByRound[currentState.currentRound] || currentState.questions;

        const state = updateGameState(roomCode, {
            questionsByRound: questionsByRound,
            questions: activeQuestions
        });
        io.to(roomCode).emit('state_update', state);
    });

    socket.on('play_audio', ({ roomCode }) => {
        const currentState = getRoomState(roomCode);
        const word = currentState.currentQuestion?.word;
        if (word) {
            io.to(roomCode).emit('trigger_audio', word);
        }
    });
}

module.exports = { registerSocketHandlers };
