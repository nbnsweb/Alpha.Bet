import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

const SOCKET_URL = import.meta.env.PROD
    ? window.location.origin
    : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomCode, setRoomCode] = useState('');

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setGameState(null);
            console.log('Disconnected from server');
        });

        newSocket.on('state_update', (state) => {
            setGameState(state);
        });

        return () => newSocket.close();
    }, []);

    // Actions
    const actions = React.useMemo(() => ({
        joinRoom: (code, role) => {
            setRoomCode(code);
            socket?.emit('join_room', { roomCode: code, role });
        },
        enableGrid: (enabled) => socket?.emit('enable_grid', { roomCode, enabled }),
        resetGrid: () => socket?.emit('reset_grid', { roomCode }),
        changeRound: (roundName) => socket?.emit('change_round', { roomCode, roundName }),
        endTieBreaker: () => socket?.emit('end_tie_breaker', { roomCode }),
        startTieBreakerRound: (config) => socket?.emit('start_tie_breaker_round', { ...config, roomCode }),
        startNewParticipant: (name) => socket?.emit('start_new_participant', { roomCode, name }),
        closeScoreScreen: () => socket?.emit('close_score_screen', { roomCode }),
        processAnswer: (status) => socket?.emit('process_answer', { roomCode, status }),
        selectBox: (boxNo) => socket?.emit('select_box', { roomCode, boxNo }),
        selectorBox: (boxNo) => socket?.emit('select_box', { roomCode, boxNo }),
        shuffleGrid: () => socket?.emit('shuffle_grid', { roomCode }),
        uploadQuestions: (questions) => socket?.emit('upload_questions', { roomCode, questionsByRound: questions }),
        playAudio: () => socket?.emit('play_audio', { roomCode })
    }), [socket, roomCode]);

    const value = React.useMemo(() => ({
        socket,
        isConnected,
        gameState,
        roomCode,
        actions
    }), [socket, isConnected, gameState, roomCode, actions]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
