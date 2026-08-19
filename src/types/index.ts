export interface Hospital {
  id: string;
  nome: string;
  cidade: string | null;
  observacao: string | null;
  created_at: string;
}

export interface Entrega {
  id: string;
  hospital_id: string;
  nome_hospital: string;
  nome_paciente: string | null;
  status: "Pendente" | "Autorizado" | "Saiu para entrega";
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type StatusEntrega = "Pendente" | "Autorizado" | "Saiu para entrega";

export interface CreateEntregaInput {
  hospital_id: string;
  nome_hospital: string;
  nome_paciente?: string;
  status?: StatusEntrega;
  created_by?: string;
}

export interface UpdateEntregaInput {
  status: StatusEntrega;
}

export interface CreateHospitalInput {
  nome: string;
  observacao?: string;
}

export interface UpdateHospitalInput {
  nome: string;
  observacao?: string;
}
