import { PairRow } from "../interfaces/PairRow";
import { SummaryResult } from "../interfaces/SummaryResult";

export class SummaryService {
  calculateSummary(pairs: PairRow[], from: Date, to: Date): SummaryResult {
    const totalSessions = pairs.length;
    const totalMinutes = pairs.reduce(
      (sum, pair) => sum + pair.duration.minutes,
      0
    );

    // Converter minutos para formato "XXhYYmin"
    const totalHours = this.formatMinutesToHours(totalMinutes);

    // Coletar participantes únicos
    const allParticipants = pairs.flatMap((pair) => pair.participants);
    const uniqueParticipants = [...new Set(allParticipants)];

    // Calcular estatísticas por participante
    const participantStats = uniqueParticipants
      .map((participant) => {
        const participantPairs = pairs.filter((pair) =>
          pair.participants.includes(participant)
        );
        const sessions = participantPairs.length;
        const minutes = participantPairs.reduce(
          (sum, pair) => sum + pair.duration.minutes,
          0
        );
        const hours = this.formatMinutesToHours(minutes);

        return {
          name: participant,
          sessions,
          minutes,
          hours,
        };
      })
      .sort((a, b) => b.minutes - a.minutes); // Ordenar por tempo decrescente

    return {
      totalSessions,
      totalMinutes,
      totalHours,
      uniqueParticipants,
      participantStats,
      dateRange: { from, to },
    };
  }

  private formatMinutesToHours(minutes: number): string {
    if (minutes === 0) return "0min";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${remainingMinutes.toString().padStart(2, "0")}min`;
    }
  }
}
