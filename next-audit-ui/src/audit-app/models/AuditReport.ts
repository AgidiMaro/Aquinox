export interface AuditReport {
  domains: Domain [];
}

export interface Domain {
  name: string;
  questions: Query [];
  yesCount?: number;
  noCount?: number;
  unknown?: number;
}

export interface Query {
  answer: string;
  criteria: string;
  details: string;
}