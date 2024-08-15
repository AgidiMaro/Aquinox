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

// export interface Query {
//   answer: string;
//   criteria: string;
//   details: string;
//   details_from_example: string;
//   details_references:Reference[];
// }

export interface Query {
  tailored_procedure_design: string;
  design_details: string;
  design_details_from_example: string;
  design_reference :Reference[]

  tailored_procedure_implementation: string;
  implementation_details: string;
  implementation_details_from_example: string;
  implementation_reference: Reference[];
  answer:string
}

