import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalService, entregaService } from "@/services";
import { supabase } from "@/lib/supabase";
import type {
  Hospital,
  Entrega,
  CreateEntregaInput,
  UpdateEntregaInput,
  CreateHospitalInput,
  UpdateHospitalInput,
} from "@/types";

export function useHospitais() {
  return useQuery({
    queryKey: ["hospitais"],
    queryFn: hospitalService.getAll,
  });
}

export function useSearchHospitais(query: string) {
  return useQuery({
    queryKey: ["hospitais", "search", query],
    queryFn: () => hospitalService.search(query),
    enabled: query.length >= 1,
  });
}

export function useCreateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHospitalInput) => hospitalService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
    },
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHospitalInput }) =>
      hospitalService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => hospitalService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
    },
  });
}

export function useEntregas() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["entregas"],
    queryFn: entregaService.getAll,
  });

  useEffect(() => {
    const channel = supabase
      .channel("entregas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entregas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["entregas"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useCreateEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEntregaInput) => entregaService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
    },
  });
}

export function useUpdateEntregaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEntregaInput }) =>
      entregaService.updateStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
    },
  });
}

export function useDeleteEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entregaService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
    },
  });
}
