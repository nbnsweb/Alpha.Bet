// Helper to handle Android's async voice loading
let voicesLoaded = false;
let availableVoices = [];

const loadVoices = () => {
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
        voicesLoaded = true;
    }
};

// Initial load attempt
if (window.speechSynthesis) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// Android often suspends audio context until user interaction.
// Call this function on a user click (e.g. Unmute button or anywhere on screen).
export const unlockAudio = () => {
    if (!window.speechSynthesis) return;

    // 1. Resume context if suspended
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }

    // 2. Play a silent utterance to "warm up" the engine
    // We cancel first to clear any stuck queue from previous failed attempts
    window.speechSynthesis.cancel();

    const silent = new SpeechSynthesisUtterance("");
    silent.volume = 0;
    silent.rate = 1;
    silent.pitch = 1;
    window.speechSynthesis.speak(silent);
};

export const speakText = (text, rate = 0.7) => {
    if (!window.speechSynthesis) {
        console.error("Web Speech API not supported");
        return;
    }

    // Ensure we aren't paused
    window.speechSynthesis.resume();

    // Cancel previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to get voices again if we missed them
    if (!voicesLoaded || availableVoices.length === 0) loadVoices();

    // Voice Selection Strategy:
    // 1. Preferred: Google UK English Female (Very common on Android)
    // 2. Fallback: Any "GB" or "British" voice
    // 3. Fallback: Any English voice
    // 4. Default: The first available voice
    const britishVoice = availableVoices.find(v => v.name.includes("Google UK English Female")) ||
        availableVoices.find(v => v.lang === 'en-GB' || v.name.includes('UK') || v.name.includes('British')) ||
        availableVoices.find(v => v.lang.startsWith('en')) ||
        availableVoices[0];

    if (britishVoice) {
        utterance.voice = britishVoice;
    }

    // Android WebView specific: Ensure volume is explicit
    utterance.volume = 1;
    utterance.rate = rate;
    utterance.pitch = 1;

    // Error handling
    utterance.onerror = (e) => {
        console.error("Speech Error:", e);
        // On Android, sometimes just retrying works or cancelling helps recover
        window.speechSynthesis.cancel();
    };

    window.speechSynthesis.speak(utterance);
};

// Simple synthesized sound effects avoiding external files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSound = (type) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const t = audioCtx.currentTime;

    if (type === 'correct') {
        // --- PLEASANT SUCCESS CHORD (C Major 7) ---
        // A gentle, uplifting arpeggio (C5, E5, G5, B5)
        // Sine waves for a soft, flute/chime-like tone
        const notes = [523.25, 659.25, 783.99, 987.77]; // C5, E5, G5, B5
        const startTimes = [0, 0.05, 0.1, 0.15]; // Staggered start (Arpeggio)
        const duration = 0.8;

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine'; // Soft tone
            osc.frequency.setValueAtTime(freq, t);

            // Envelope: Soft attack, graceful decay
            gain.gain.setValueAtTime(0, t + startTimes[i]);
            gain.gain.linearRampToValueAtTime(0.2, t + startTimes[i] + 0.05); // Fade in
            gain.gain.exponentialRampToValueAtTime(0.001, t + startTimes[i] + duration); // Long tail

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(t + startTimes[i]);
            osc.stop(t + startTimes[i] + duration);
        });

    } else if (type === 'wrong') {
        // --- CLASSIC GAME SHOW "WRONG" (Buzzer) ---
        // Two detuned sawtooth waves for that harsh dissonance
        const freqs = [150, 100];
        const duration = 0.4;

        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, t);
            // Slide down slightly for effect
            osc.frequency.linearRampToValueAtTime(f - 20, t + duration);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.linearRampToValueAtTime(0, t + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(t);
            osc.stop(t + duration);
        });
    }
};
