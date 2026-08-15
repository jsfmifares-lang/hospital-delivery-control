import { supabase } from "@/lib/supabase";
import type {
  Hospital,
  Entrega,
  CreateEntregaInput,
  UpdateEntregaInput,
  CreateHospitalInput,
  UpdateHospitalInput,
} from "@/types";

export const hospitalService = {
  async getAll(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from("hospitais")
      .select("*")
      .order("nome");

    if (error) throw error;
    return data as Hospital[];
  },

  async search(query: string): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from("hospitais")
      .select("*")
      .ilike("nome", `%${query}%`)
      .order("nome");

    if (error) throw error;
    return data as Hospital[];
  },

  async create(input: CreateHospitalInput): Promise<Hospital> {
    const { data, error } = await supabase
      .from("hospitais")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as Hospital;
  },

  async update(id: string, input: UpdateHospitalInput): Promise<Hospital> {
    const { data, error } = await supabase
      .from("hospitais")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Hospital;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("hospitais").delete().eq("id", id);

    if (error) throw error;
  },
};

export const entregaService = {
  async getAll(): Promise<Entrega[]> {
    const { data, error } = await supabase
      .from("entregas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Entrega[];
  },

  async create(input: CreateEntregaInput): Promise<Entrega> {
    const { data, error } = await supabase
      .from("entregas")
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as Entrega;
  },

  async updateStatus(
    id: string,
    input: UpdateEntregaInput
  ): Promise<Entrega> {
    const { data, error } = await supabase
      .from("entregas")
      .update({ status: input.status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Entrega;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("entregas").delete().eq("id", id);

    if (error) throw error;
  },
};
