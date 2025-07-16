import { useTheme } from "@/contexts/ThemeContext"; // Passe den Pfad ggf. an
import React, { useEffect, useState } from "react";

const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

function getValidTodayIndex() {
  // Wandelt JS-Wochentag (So=0, Mo=1, ...) auf dein Array (Mo=0, Di=1, ...)
  const jsDay = new Date().getDay();
  const idx = (jsDay + 6) % 7;
  return idx > 4 ? 0 : idx; // Nur Montag bis Freitag, sonst Montag
}

export default function Timetable() {
  const [timetable, setTimetable] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem("timetable");
    return saved ? JSON.parse(saved) : {};
  });

  const [customTimes] = useState([
    "08:05 - 08:50",
    "08:50 - 09:35",
    "09:55 - 10:40",
    "10:40 - 11:25",
    "11:45 - 12:30",
    "12:30 - 13:15",
  ]);

  // Hole den globalen Darkmode-Status
  const { theme } = useTheme();
  const darkTheme = theme === "dark";

  const todayIndex = getValidTodayIndex();
  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex);
  const [viewMode, setViewMode] = useState("day");
  const [selectedDay, setSelectedDay] = useState(weekdays[todayIndex]);
  const [startTime, setStartTime] = useState("08:05");
  const [endTime, setEndTime] = useState("08:50");
  const [className, setClassName] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(timetable));
  }, [timetable]);

  const addClass = () => {
    if (!className.trim()) return;
    if (selectedDay && startTime && endTime) {
      const timeSlot = `${startTime} - ${endTime}`;
      setTimetable((prev) => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [timeSlot]: className,
        },
      }));
    }
    setClassName("");
  };

  const handleSwipe = (dir: "left" | "right"): void => {
    if (dir === "left" && currentDayIndex < weekdays.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    } else if (dir === "right" && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - (touchStartX || 0);
    if (deltaX > 50) handleSwipe("right");
    if (deltaX < -50) handleSwipe("left");
  };

  const activeDay = weekdays[currentDayIndex];
  const currentStyles = darkTheme ? darkStyles : styles;

  return (
    <div style={currentStyles.container}>
      <div style={currentStyles.toggleRow}>
        <button
          style={viewMode === "day" ? currentStyles.toggleActive : currentStyles.toggle}
          onClick={() => setViewMode("day")}
        >
          Tagesansicht
        </button>
        <button
          style={viewMode === "week" ? currentStyles.toggleActive : currentStyles.toggle}
          onClick={() => setViewMode("week")}
        >
          Wochenansicht
        </button>
        <button
          onClick={() => {setCurrentDayIndex(todayIndex); setSelectedDay(weekdays[todayIndex]); setViewMode("day");}}
          style={currentStyles.todayButton}
        >
          📅 Heute
        </button>
        {/* Theme-Button entfernt, da global */}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ width: "100%" }}
      >
        {viewMode === "day" ? (
          <div>
            <h2 style={currentStyles.dayHeader}>{activeDay}</h2>
            {customTimes.map((time) => (
              <div key={time} style={currentStyles.card}>
                <div style={currentStyles.time}>{time}</div>
                <div style={currentStyles.subject}>{timetable[activeDay]?.[time] || "Frei"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
              marginBottom: 16,
            }}
          >
            {weekdays.map((day) => (
              <div key={day} style={{ minWidth: 170 }}>
                <h3 style={{ textAlign: "center", marginBottom: 8 }}>{day}</h3>
                {customTimes.map((time) => (
                  <div key={time} style={currentStyles.card}>
                    <div style={currentStyles.time}>{time}</div>
                    <div style={currentStyles.subject}>{timetable[day]?.[time] || "Frei"}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={currentStyles.section}>
        <h2>Fach hinzufügen</h2>
        <div style={currentStyles.inputRow}>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={currentStyles.input}
          >
            {weekdays.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={`${startTime} - ${endTime}`}
            onChange={(e) => {
              const [start, end] = e.target.value.split(" - ");
              setStartTime(start);
              setEndTime(end);
            }}
            style={currentStyles.input}
          >
            {customTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <input
          placeholder="Fach eingeben"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={currentStyles.inputFull}
        />
        <button onClick={addClass} style={currentStyles.button}>
          Fach speichern
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 24,
    maxWidth: 900,
    margin: "40px auto",
    background: "#f2f2f2",
    borderRadius: 24,
    color: "#000",
    boxSizing: "border-box" as const,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: 10,
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap" as const,
  },
  toggle: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#ddd",
    border: "none",
    cursor: "pointer",
  },
  toggleActive: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    fontWeight: "bold",
  },
  todayButton: {
  padding: 10,
  borderRadius: 20,
  backgroundColor: "#ffc107",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer", // <--- hinzufügen!
},
  themeToggle: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#6c757d",
    border: "none",
    color: "white",
    fontWeight: "bold",
  },
  dayHeader: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginTop: 30,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  time: {
    fontSize: 14,
    color: "#666",
  },
  subject: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  inputFull: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: "1px solid #ccc",
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: "none",
    backgroundColor: "#28a745",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
  },
  buttonSmall: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid #ccc",
    backgroundColor: "#eee",
    fontSize: 14,
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: "1px solid #ccc",
    fontSize: 14,
  },
};

const darkStyles = {
  ...styles,
  container: {
    ...styles.container,
    background: "#222",
    color: "#eee",
    boxShadow: "0 4px 24px rgba(0,0,0,0.32)",
  },
  card: {
    ...styles.card,
    background: "#333",
  },
  toggle: {
    ...styles.toggle,
    backgroundColor: "#555",
    color: "#eee",
  },
  toggleActive: {
    ...styles.toggleActive,
    backgroundColor: "#0056b3",
  },
  todayButton: {
    ...styles.todayButton,
    backgroundColor: "#ffca2c",
    cursor: "pointer", // <--- hinzufügen!
  },
  input: {
    ...styles.input,
    backgroundColor: "#444",
    color: "#eee",
  },
  inputFull: {
    ...styles.inputFull,
    backgroundColor: "#444",
    color: "#eee",
  },
  button: {
    ...styles.button,
    backgroundColor: "#218838",
  },
  buttonSmall: {
    ...styles.buttonSmall,
    backgroundColor: "#666",
    color: "#eee",
  },
  textarea: {
    ...styles.textarea,
    backgroundColor: "#444",
    color: "#eee",
  },
};