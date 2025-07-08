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
      // Simple HTML parsing - in a real implementation you might want to use a proper HTML parser
      const date = new Date().toISOString().split('T')[0];
      const items: ScheduleItem[] = [];

      // Parse HTML table data - this is a simplified version
      // You'll need to adapt this based on the actual HTML structure from DSB
      const tableRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gs;
      
      let match;
      let id = 1;
      
      while ((match = tableRegex.exec(htmlData)) !== null) {
        const rowHtml = match[1];
        const cells: string[] = [];
        let cellMatch;
        
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          // Remove HTML tags and decode entities
          const cellContent = cellMatch[1]
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
          cells.push(cellContent);
        }
        
        // Skip header rows or empty rows
        if (cells.length >= 4 && cells[0] && cells[1] && !cells[0].includes('Stunde')) {
          const item: ScheduleItem = {
            id: id.toString(),
            period: parseInt(cells[0]) || id,
            time: cells[1] || '',
            subject: cells[2] || '',
            room: cells[3] || '',
            teacher: cells[4] || '',
            class: cells[5] || '',
            day: new Date().toLocaleDateString('de-DE', { weekday: 'long' })
          };
          
          items.push(item);
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
    const today = new Date().toLocaleDateString('de-DE', { weekday: 'long' });
    return this.getItemsForDay(today);
  }
}
