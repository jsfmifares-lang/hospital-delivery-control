import { useEffect, useRef } from "react";
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

function getCurrentUsername(): string {
  try {
    const stored = localStorage.getItem("hd_current_user");
    if (stored) {
      const user = JSON.parse(stored);
      return user.username || "";
    }
  } catch {}
  return "";
}

export function useHospitais() {
  const queryClient = useQueryClient();
  const lastUserRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ["hospitais"],
    queryFn: hospitalService.getAll,
  });

  useEffect(() => {
    const channel = supabase
      .channel("hospitais-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hospitais" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["hospitais"] });
          const hospital = payload.new as Hospital;
          const currentUser = getCurrentUsername();
          if (hospital.nome !== currentUser) {
            notifyHospitalCreated("Alguém", hospital.nome);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "hospitais" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["hospitais"] });
          const hospital = payload.new as Hospital;
          const currentUser = getCurrentUsername();
          if (hospital.nome !== currentUser) {
            notifyHospitalUpdated("Alguém", hospital.nome);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "hospitais" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hospitais"] });
          notifyHospitalDeleted("Alguém", "um hospital");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
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
        { event: "INSERT", schema: "public", table: "entregas" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["entregas"] });
          const entrega = payload.new as Entrega;
          const currentUser = getCurrentUsername();
          if (entrega.created_by !== currentUser) {
            notifyCreated(
              entrega.created_by || "Alguém",
              entrega.nome_hospital
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "entregas" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["entregas"] });
          const entrega = payload.new as Entrega;
          const entregaOld = payload.old as Entrega;
          const currentUser = getCurrentUsername();
          if (entrega.created_by !== currentUser && entrega.status !== entregaOld?.status) {
            notifyStatusUpdated(
              entrega.created_by || "Alguém",
              entrega.nome_hospital,
              entrega.status,
              1
            );
          }
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
