import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

type TimerMode = "work" | "break";

function App() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const switchMode = useCallback(() => {
    if (mode === "work") {
      setSessionsCompleted((prev) => prev + 1);
      setMode("break");
      setTimeLeft(breakDuration * 60);
    } else {
      setMode("work");
      setTimeLeft(workDuration * 60);
    }
    playNotificationSound();
  }, [mode, workDuration, breakDuration, playNotificationSound]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      switchMode();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, switchMode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    switchMode();
  };

  const handleSettingsSave = (work: number, breakTime: number) => {
    setWorkDuration(work);
    setBreakDuration(breakTime);
    if (!isRunning) {
      setTimeLeft(mode === "work" ? work * 60 : breakTime * 60);
    }
    setShowSettings(false);
  };

  const progress = mode === "work"
    ? ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  return (
    <main className="container">
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAMNVrrU2aqCCABQs9Xjvpgf/kye0+C8mhYBTqzV47qREQZTptDfsYYKElum0t+0jBcJWKLP3bSNGQ5Yn83fsJIaCFSey9+xkxcLU5/L4K+QEg5Tn8zes48PEFJ/xNutiwoRUH+/16uIChBPfsHarosLEE5/wtusiwsRTn/C26yLCxFOgMLcrIsLEU5/wtusiwsQT3/C3KyLCxBPf8LbrIwLD1B/wtutjAsQUH/C26yLDA9Qf8Lcq4sLD1B/wtytiwwPUH/C262LCw9Qf8LcrYsMD1B/wdytiwsPUH/C3K2LDA9Pf8HcrYsLD09/wdytiwsPT3/B3K2LCw9Pf8HcrYsLEFB/wdytjAsPT3/B262LCw9Pf8HcrYsLD0+AwdytigsQT3/B3K2LCw9Pf8HcrYsLD09/wdyujAoPUH/B3K2MCg9Qf8HcrYwKD1B/wdyuiwsQUH/B3K6LCxBQf8HcrosLEFB/wdyuiwsQUH/B3K6LCw9Qf8HcrosLD1B/wdyuiwsPUH/B3K6LCw9Qf8HcrosLEFB/wdyuiwsQUH/B3K6LCxBQf8HcrosLEFB/wdyuiwsQT3/B3K6LCxBPf8HcrosLEE9/wdyuiwsQT3/B3K2LCxBPf8GbrooLD09/wZuuigsQT3/Bm66KCw9Pf8GbrokKD09/wVquiQoPT3/BWq6JCg9Pf8FarkkKD09/wVquSQoPT3/BWm5JCg9Pf8Fabkk"
      />

      {showSettings ? (
        <Settings
          workDuration={workDuration}
          breakDuration={breakDuration}
          onSave={handleSettingsSave}
          onCancel={() => setShowSettings(false)}
        />
      ) : (
        <>
          <div className="mode-indicator">
            <span className={mode === "work" ? "active" : ""}>Work</span>
            <span className={mode === "break" ? "active" : ""}>Break</span>
          </div>

          <div className="timer-container">
            <svg className="progress-ring" viewBox="0 0 200 200">
              <circle
                className="progress-ring-bg"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                strokeWidth="8"
              />
              <circle
                className="progress-ring-fill"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                strokeWidth="8"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progress) / 100}
                style={{
                  stroke: mode === "work" ? "#e74c3c" : "#2ecc71",
                }}
              />
            </svg>
            <div className="timer-display">{formatTime(timeLeft)}</div>
          </div>

          <div className="controls">
            <button onClick={handleReset} className="btn btn-secondary">
              Reset
            </button>
            <button onClick={handleStartPause} className="btn btn-primary">
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={handleSkip} className="btn btn-secondary">
              Skip
            </button>
          </div>

          <div className="sessions">
            Sessions completed: <strong>{sessionsCompleted}</strong>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-settings"
          >
            Settings
          </button>
        </>
      )}
    </main>
  );
}

function Settings({
  workDuration,
  breakDuration,
  onSave,
  onCancel,
}: {
  workDuration: number;
  breakDuration: number;
  onSave: (work: number, breakTime: number) => void;
  onCancel: () => void;
}) {
  const [work, setWork] = useState(workDuration);
  const [breakTime, setBreakTime] = useState(breakDuration);

  return (
    <div className="settings">
      <h2>Settings</h2>
      <div className="setting-item">
        <label>Work Duration (minutes)</label>
        <input
          type="number"
          value={work}
          onChange={(e) => setWork(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          max="60"
        />
      </div>
      <div className="setting-item">
        <label>Break Duration (minutes)</label>
        <input
          type="number"
          value={breakTime}
          onChange={(e) =>
            setBreakTime(Math.max(1, parseInt(e.target.value) || 1))
          }
          min="1"
          max="30"
        />
      </div>
      <div className="settings-buttons">
        <button onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button onClick={() => onSave(work, breakTime)} className="btn btn-primary">
          Save
        </button>
      </div>
    </div>
  );
}

export default App;
