import React, { useEffect, useState } from "react";

const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

export default function Timetable() {
  const [timetable, setTimetable] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem("timetable");
    return saved ? JSON.parse(saved) : {};
  });

  const [homework, setHomework] = useState<Record<string, Record<string, string[]>>>(() => {
    const saved = localStorage.getItem("homework");
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

  const [darkTheme, setDarkTheme] = useState(false);
  const todayIndex = Math.max(0, new Date().getDay() - 1);
  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex);
  const [viewMode, setViewMode] = useState("day");
  const [selectedDay, setSelectedDay] = useState(weekdays[todayIndex]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:45");
  const [className, setClassName] = useState("");
  const [homeworkText, setHomeworkText] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem("timetable", JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem("homework", JSON.stringify(homework));
  }, [homework]);

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

  const addHomework = (): void => {
    if (!homeworkText.trim()) return;
    const timeSlot = `${startTime} - ${endTStundenplanAppime}`;
    setHomework((prev) => {
      const existingDay = prev[selectedDay] || {};
      const existingTime = existingDay[timeSlot] || [];
      return {
        ...prev,
        [selectedDay]: {
          ...existingDay,02.0-175
          [timeSlot]: [...existingTime, homeworkText],
        },
      };
    });
    setHomeworkText("");
  };

  const deleteHomework = (day: string, time: string, index: number): void => {
    setHomework((prev) => {
      const updated = [...(prev[day]?.[time] || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [time]: updated,
        },
      };
    });
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
      <h1 style={currentStyles.header}>📘 Die Schul App.</h1>

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
          onClick={() => setCurrentDayIndex(todayIndex)}
          style={currentStyles.todayButton}
        >
          📅 Heute
        </button>
        <button
          onClick={() => setDarkTheme(!darkTheme)}
          style={currentStyles.themeToggle}
        >
          {darkTheme ? "☀️ Hell" : "🌙 Dunkel"}
        </button>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {viewMode === "day" ? (
          <div>
            <h2 style={currentStyles.dayHeader}>{activeDay}</h2>
            {customTimes.map((time) => (
              <div key={time} style={currentStyles.card}>
                <div style={currentStyles.time}>{time}</div>
                <div style={currentStyles.subject}>{timetable[activeDay]?.[time] || "Frei"}</div>
                <div style={currentStyles.homework}>
                  📝 {Array.isArray(homework[activeDay]?.[time]) && homework[activeDay][time].length > 0 ? (
                    homework[activeDay][time].map((hw, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>• {hw}</span>
                        <button onClick={() => deleteHomework(activeDay, time, i)} style={{ background: "none", border: "none", color: "red" }}>❌</button>
                      </div>
                    ))
                  ) : (
                    "Keine Hausaufgabe"
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {weekdays.map((day) => (
              <div key={day}>
                <h3>{day}</h3>
                {customTimes.map((time) => (
                  <div key={time} style={currentStyles.card}>
                    <div style={currentStyles.time}>{time}</div>
                    <div style={currentStyles.subject}>{timetable[day]?.[time] || "Frei"}</div>
                    <div style={currentStyles.homework}>
                      📝 {Array.isArray(homework[day]?.[time]) && homework[day][time].length > 0 ? (
                        homework[day][time].map((hw, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>• {hw}</span>
                            <button onClick={() => deleteHomework(day, time, i)} style={{ background: "none", border: "none", color: "red" }}>❌</button>
                          </div>
                        ))
                      ) : (
                        "Keine Hausaufgabe"
                      )}
                    </div>
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
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} style={currentStyles.input}>
            {weekdays.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={`${startTime} - ${endTime}`} onChange={(e) => {
            const [start, end] = e.target.value.split(" - ");
            setStartTime(start);
            setEndTime(end);
          }} style={currentStyles.input}>
            {customTimes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <input
          placeholder="Fach eingeben"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={currentStyles.inputFull}
        />
        <button onClick={addClass} style={currentStyles.button}>Fach speichern</button>
      </div>

      <div style={currentStyles.section}>
        <h2>Hausaufgabe</h2>
        <textarea
          placeholder="Hausaufgabe eingeben"
          value={homeworkText}
          onChange={(e) => setHomeworkText(e.target.value)}
          rows={3}
          style={currentStyles.textarea}
        />
        <button onClick={addHomework} style={currentStyles.button}>Hausaufgabe speichern</button>
      </div>
    </div>
  );
}


const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: 16,
    maxWidth: 500,
    margin: "0 auto",
    background: "#f2f2f2",
    borderRadius: 20,
    color: "#000",
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
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
  homework: {
    fontSize: 14,
    marginTop: 5,
    color: "#333",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
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
  homework: {
    ...styles.homework,
    color: "#fff",
  },
};
