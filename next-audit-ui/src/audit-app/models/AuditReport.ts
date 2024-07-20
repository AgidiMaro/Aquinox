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

export interface Reference {
  source: string;
  file_name: string;
  text: string;
}

export interface Query {
  answer: string;
  criteria: string;
  details: string;
  details_references:Reference[];
}