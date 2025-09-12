
import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function speak(text, volume = 1) {
  if ('speechSynthesis' in window) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.volume = volume;
    window.speechSynthesis.speak(utter);
  }
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(5 * 60 * 1000); // default 5 min
  const [remaining, setRemaining] = useState(duration);
  const [theme, setTheme] = useState('dark');
  const [volume, setVolume] = useState(1);
  const intervalRef = useRef(null);
  const lastMinuteRef = useRef(0);

  useEffect(() => {
    setRemaining(duration);
    lastMinuteRef.current = 0;
    setRunning(false);
  }, [duration]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => Math.max(prev - 1000, 0));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const prevMinute = lastMinuteRef.current;
    const minutesPassed = Math.floor((duration - remaining) / 60000);
    // Announce only after a full minute has passed
    if (minutesPassed > prevMinute && (duration - remaining) % 60000 === 0) {
      speak('Next bite', volume);
      lastMinuteRef.current = minutesPassed;
    }
    if (remaining === 0 && running) {
      speak('Timer finished', volume);
      setRunning(false);
    }
  }, [remaining, running, duration, volume]);

  const handleStart = () => setRunning(true);
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setRemaining(duration);
    lastMinuteRef.current = 0;
  };

  const handleDurationChange = (e) => {
    const min = Math.max(1, Number(e.target.value));
    setDuration(min * 60 * 1000);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const handleVolumeChange = () => setVolume((v) => (v === 1 ? 0.3 : v === 0.3 ? 0 : 1));

  // Circular progress for minute
  const percent = ((remaining % 60000) / 60000) * 100;
  const totalPercent = (remaining / duration) * 100;

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <h1>Next Bite Timer</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </header>
      <div className="timer-section">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle
            cx="110"
            cy="110"
            r="100"
            stroke="#6c4cff"
            strokeWidth="10"
            fill="none"
            opacity="0.2"
          />
          {/* Minute progress */}
          <circle
            cx="110"
            cy="110"
            r="100"
            stroke="#6c4cff"
            strokeWidth="10"
            fill="none"
            strokeDasharray={2 * Math.PI * 100}
            strokeDashoffset={2 * Math.PI * 100 * (1 - percent / 100)}
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
          {/* Total timer progress */}
          <circle
            cx="110"
            cy="110"
            r="85"
            stroke="#b8b8ff"
            strokeWidth="6"
            fill="none"
            strokeDasharray={2 * Math.PI * 85}
            strokeDashoffset={2 * Math.PI * 85 * (1 - totalPercent / 100)}
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
        </svg>
        <div className="timer-text">
          <div className="label">COUNTDOWN</div>
          <div className="time">{formatTime(remaining)}</div>
          {remaining > 0 ? (
            <div className="next-bite">Next bite in {String(60 - Math.floor((duration - remaining) % 60000 / 1000)).padStart(2, '0')}s</div>
          ) : (
            <div className="next-bite">Finished!</div>
          )}
        </div>
      </div>
      <div className="controls">
        <input
          type="number"
          min="1"
          max="120"
          value={Math.ceil(duration / 60000)}
          onChange={handleDurationChange}
          disabled={running}
          style={{ width: '60px', fontSize: '1rem', marginRight: '1rem' }}
        />
        <span>min</span>
        {!running ? (
          <button onClick={handleStart}>Start</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleVolumeChange} title="Volume">
          {volume === 1 ? '🔊' : volume === 0.3 ? '🔉' : '🔇'}
        </button>
      </div>
    </div>
  );
}
