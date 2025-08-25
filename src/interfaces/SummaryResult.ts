export interface SummaryResult {
  totalSessions: number;
  totalMinutes: number;
  totalHours: string;
  uniqueParticipants: string[];
  participantStats: Array<{
    name: string;
    sessions: number;
    minutes: number;
    hours: string;
  }>;
  dateRange: {
    from: Date;
    to: Date;
  };
}
