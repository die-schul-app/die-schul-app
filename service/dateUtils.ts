export function getCurrentDate(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const day = tomorrow.getDate().toString().padStart(2, '0');
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const year = tomorrow.getFullYear();

    return `${year}-${month}-${day}`;
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
}

export function getDateString(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const input = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((input.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekday = weekdays[input.getDay()];
    const dd = String(input.getDate()).padStart(2, '0');
    const mm = String(input.getMonth() + 1).padStart(2, '0');
    const yy = String(input.getFullYear()).slice(-2);
    const dateStr = `${dd}.${mm}.${yy}`;

    // Get start and end of current week (Monday-Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (input >= weekStart && input <= weekEnd) {
        if (diffDays === 0) return `Today (${dateStr})`;
        if (diffDays === -1) return `Yesterday (${dateStr})`;
        if (diffDays === 1) return `Tomorrow (${dateStr})`;
        return `${weekday} (${dateStr})`;
    } else {
        return `${weekday}, ${dateStr}`;
    }
}