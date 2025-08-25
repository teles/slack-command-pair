export interface PairRow {
  date: string; // "12 de agosto de 2025"
  start: string; // "12 de agosto de 2025 às 9h BRT"
  end: string; // "12 de agosto de 2025 às 11h30 BRT"
  participants: string[]; // ["Mewtwo", "Treecko"]
  goal: string; // "Implementar cache de PokéAPI..."
  duration: { text: string; minutes: number }; // { "02h30min", 150 }
  slackIds: string[]; // ["UN3WD25RQ4F", "U5ZR37E3P3E"]
}
