export interface ScheduleItem {
    id: string;
    class: string;
    periodStart: number;
    periodEnd: number;
    teacher: string;
    subject: string;
    room: string;
    message: string;
}

export class TimeTable {
    date: string = "";  // Plan date in ISO format (YYYY-MM-DD)
    planCreated: Date = new Date();  // Plan creation time in ISO format (YYYY-MM-DDTHH:mm)
    items: ScheduleItem[] = [];  // List of schedule items

    constructor(date: string, items: ScheduleItem[], planCreated: Date) {
        this.date = date;  // Extract date part
        this.items = items;
        this.planCreated = planCreated;
    }

    public static fromJson(jsonData: string): TimeTable {
        const timetableData = JSON.parse(jsonData);
        return new TimeTable(timetableData.date, timetableData.items, timetableData.planCreated);
    }

    public static fromHtml(htmlData: string): TimeTable {
        const today = new Date();
        let timetable = new TimeTable(today.toISOString().split('T')[0], [], today);

        // Extract plan date from .mon_title (e.g., "15.7.2025 Dienstag")
        const titleMatch = htmlData.match(/<div class="mon_title">(.*?)<\/div>/);
        if (titleMatch) {
            const datePart = titleMatch[1].split(' ')[0];
            const [d, m, y] = datePart.split('.');
            timetable.date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        // Extract plan creation time from "Stand: ..." (e.g., "Stand: 15.07.2025 11:37")
        const standMatch = htmlData.match(/Stand: ([0-9]{2})\.([0-9]{2})\.([0-9]{4}) ([0-9]{2}:[0-9]{2})/);
        if (standMatch) {
            timetable.planCreated = new Date(`${standMatch[3]}-${standMatch[2]}-${standMatch[1]}T${standMatch[4]}`);
        }

        // Match all rows in the mon_list table
        const tableMatch = htmlData.match(/<table class="mon_list"[\s\S]*?<\/table>/);
        if (!tableMatch) return timetable;
        const tableHtml = tableMatch[0];
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
        rowRegex.exec(tableHtml);  // Skip the first match (header row)

        let rowMatch;
        let id = 1;
        let currentClass = '';
        while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
            const rowHtml = rowMatch[1];

            // Get all cells in the current row
            const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
            let cellMatch;
            const cells: string[] = [];
            while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
                const cellContent = cellMatch[1]
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\s+/g, ' ')
                    .trim();
                cells.push(cellContent);
            }

            // Parse the cells
            if (cells.length === 1) {
                currentClass = cells[0].replace(/<[^>]*>/g, '').trim();
            } else {
                const periodRegex = /\d+/;
                timetable.items.push({
                    id: id.toString(),
                    class: currentClass,
                    periodStart: parseInt(periodRegex.exec(cells[0])?.[0] || '0'),
                    periodEnd: parseInt(periodRegex.exec(cells[0])?.[0] || '0'),
                    teacher: cells[1],
                    subject: cells[2],
                    room: cells[3],
                    message: cells[4],
                });
                id++;
            }
        }

        return timetable;
    }
}
