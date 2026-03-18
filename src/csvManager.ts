export interface CSVTradeData {
  id: string;
  date: string;
  pair: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number;
  positionSize: number;
  result: number;
  rr: number;
  ruleViolation: string | null;
  notes?: string;
}

class CSVManager {
  private static readonly CSV_HEADERS = [
    'id',
    'date', 
    'pair',
    'direction',
    'entry',
    'exit',
    'positionSize',
    'result',
    'rr',
    'ruleViolation',
    'notes'
  ];

  static convertToCSV(trades: CSVTradeData[]): string {
    if (trades.length === 0) return '';

    const headers = this.CSV_HEADERS.join(',');
    const rows = trades.map(trade => [
      trade.id,
      trade.date,
      trade.pair,
      trade.direction,
      trade.entry.toString(),
      trade.exit.toString(),
      trade.positionSize.toString(),
      trade.result.toString(),
      trade.rr.toString(),
      trade.ruleViolation || '',
      trade.notes || ''
    ]);

    const csvContent = [
      headers,
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  static parseFromCSV(csvContent: string): CSVTradeData[] {
    if (!csvContent.trim()) return [];

    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const trades: CSVTradeData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length === headers.length) {
        const trade: CSVTradeData = {
          id: values[0] || `TR-${Date.now()}-${i}`,
          date: values[1] || new Date().toISOString().split('T')[0],
          pair: values[2] || '',
          direction: (values[3] as 'long' | 'short') || 'long',
          entry: parseFloat(values[4]) || 0,
          exit: parseFloat(values[5]) || 0,
          positionSize: parseFloat(values[6]) || 0,
          result: parseFloat(values[7]) || 0,
          rr: parseFloat(values[8]) || 0,
          ruleViolation: values[9] || null,
          notes: values[10] || ''
        };

        trades.push(trade);
      }
    }

    return trades;
  }

  static downloadCSV(trades: CSVTradeData[], filename: string = 'trades.csv'): void {
    const csvContent = this.convertToCSV(trades);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static saveToLocalStorage(trades: CSVTradeData[]): void {
    try {
      const csvContent = this.convertToCSV(trades);
      localStorage.setItem('tradient_trades_csv', csvContent);
      
      // Trigger storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'tradient_trades_csv',
        newValue: csvContent
      }));
      
      // Also trigger custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('tradesUpdated', {
        detail: { tradesCount: trades.length }
      }));
    } catch (error) {
      console.error('Error saving trades to localStorage:', error);
    }
  }

  static loadFromLocalStorage(): CSVTradeData[] {
    try {
      const csvContent = localStorage.getItem('tradient_trades_csv');
      if (csvContent) {
        return this.parseFromCSV(csvContent);
      }
    } catch (error) {
      console.error('Error loading trades from localStorage:', error);
    }
    return [];
  }

  static addTradeToCSV(trade: CSVTradeData): void {
    const existingTrades = this.loadFromLocalStorage();
    const updatedTrades = [...existingTrades, trade];
    this.saveToLocalStorage(updatedTrades);
  }

  static convertTradeToCSV(trade: Record<string, unknown>): CSVTradeData {
    return {
      id: (trade.id as string) || `TR-${Date.now()}`,
      date: (trade.date as string) || new Date().toISOString().split('T')[0],
      pair: (trade.pair as string) || '',
      direction: (trade.direction as 'long' | 'short') || 'long',
      entry: (trade.entryPrice as number) || (trade.entry as number) || 0,
      exit: (trade.exitPrice as number) || (trade.exit as number) || 0,
      positionSize: (trade.positionSize as number) || 0,
      result: (trade.result as number) || 0,
      rr: (trade.rr as number) || 0,
      ruleViolation: (trade.ruleViolation as string | null) || null,
      notes: (trade.notes as string) || ''
    };
  }
}

export default CSVManager;
