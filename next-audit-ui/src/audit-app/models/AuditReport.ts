export interface AuditReport {
  domains: Domain [];
  overview: string;
  summary: string;
  yesFrac: number;
  noFrac: number;
  unknownFrac: number;
  showOverview?: boolean
}

export interface Domain {
  name: string;
  questions: Query [];
  isExpanded?: boolean;
  yesCount: number;
  noCount: number;
  unknown: number;
}

export interface Query {
  answer: string;
  criteria: string;
  details: string;
}