export interface ScheduleItem {
    id: string;
    subject: string;
    time: string;
    room: string;
    teacher?: string;
    class?: string;
    period: number;
    day: string;
}

export interface TimeTable {
    date: string;
    items: ScheduleItem[];
}

export class TimeTable {
    date: string;
    items: ScheduleItem[];

    constructor(date: string, items: ScheduleItem[]) {
        this.date = date;
        this.items = items;
    }

    static fromHtml(htmlData: string): TimeTable {
        try {
            const date = new Date().toISOString().split('T')[0];
            const items: ScheduleItem[] = [];
            let id = 1;
            let currentClass = '';

            // Match all rows in the mon_list table
            const tableMatch = htmlData.match(/<table class="mon_list"[\s\S]*?<\/table>/);
            if (!tableMatch) return new TimeTable(date, []);
            const tableHtml = tableMatch[0];
            const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
            let rowMatch;
            while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
                const rowHtml = rowMatch[1];
                // Check for class header row
                const classHeaderMatch = rowHtml.match(/class=["']list inline_header["'][^>]*colspan=["']5["'][^>]*>(.*?)<\/td>/);
                if (classHeaderMatch) {
                    currentClass = classHeaderMatch[1].replace(/<[^>]*>/g, '').trim();
                    continue;
                }
                // Parse lesson rows (skip header rows)
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
                // Only process rows with at least 5 cells and skip header
                if (cells.length === 5 && cells[0] !== 'Stunde') {
                    // Period can be a range (e.g., "8 - 9") or a single number
                    let period = 0;
                    const periodMatch = cells[0].match(/\d+/);
                    if (periodMatch) period = parseInt(periodMatch[0]);
                    items.push({
                        id: id.toString(),
                        period,
                        time: cells[0],
                        teacher: cells[1],
                        subject: cells[2],
                        room: cells[3],
                        class: currentClass,
                        day: date,
                    });
                    id++;
                }
            }
            return new TimeTable(date, items);
        } catch (error) {
            console.error('Error parsing HTML timetable:', error);
            throw new Error('Failed to parse timetable HTML');
        }
    }

    // Get items for a specific day
    getItemsForDay(day: string): ScheduleItem[] {
        return this.items.filter(item => item.day === day);
    }

    // Get items for today
    getTodaysItems(): ScheduleItem[] {
        const today = new Date().toLocaleDateString('de-DE', {weekday: 'long'});
        return this.getItemsForDay(today);
    }
}
