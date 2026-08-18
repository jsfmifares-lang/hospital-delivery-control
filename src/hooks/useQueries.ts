import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalService, entregaService } from "@/services";
import { supabase } from "@/lib/supabase";
import {
  notifyCreated,
  notifyStatusUpdated,
  notifyHospitalCreated,
  notifyHospitalUpdated,
  notifyHospitalDeleted,
} from "@/lib/notify";
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
      notifyHospitalCreated(
        localStorage.getItem("username") || "Usuário",
        variables.nome
      );
    },
  });
}

export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHospitalInput }) =>
      hospitalService.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
      notifyHospitalUpdated(
        localStorage.getItem("username") || "Usuário",
        variables.input.nome
      );
    },
  });
}

export function useDeleteHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; nome: string }) =>
      hospitalService.remove(input.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hospitais"] });
      notifyHospitalDeleted(
        localStorage.getItem("username") || "Usuário",
        variables.nome
      );
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      notifyCreated(
        variables.created_by || "Usuário",
        variables.nome_hospital
      );
    },
  });
}

export function useUpdateEntregaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
      hospitalName,
    }: {
      id: string;
      input: UpdateEntregaInput;
      hospitalName?: string;
    }) => entregaService.updateStatus(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      notifyStatusUpdated(
        localStorage.getItem("username") || "Usuário",
        variables.hospitalName || "Entrega",
        variables.input.status,
        1
      );
    },
  });
}

export function useUpdateStatusByHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hospitalId,
      newStatus,
      hospitalName,
      count,
    }: {
      hospitalId: string;
      newStatus: string;
      hospitalName: string;
      count: number;
    }) => entregaService.updateStatusByHospital(hospitalId, newStatus),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      notifyStatusUpdated(
        localStorage.getItem("username") || "Usuário",
        variables.hospitalName,
        variables.newStatus,
        variables.count
      );
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
