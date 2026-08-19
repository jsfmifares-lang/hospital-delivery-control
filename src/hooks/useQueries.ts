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

const pendingUpdaters = new Map<string, string>();

export function trackUpdate(entregaId: string, username: string) {
  pendingUpdaters.set(entregaId, username);
}

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
    const channelId = `hospitais-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hospitais" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hospitais"] });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime hospitais conectado");
        }
      });

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
    const channelId = `entregas-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "entregas" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["entregas"] });
          const entrega = payload.new as Entrega;
          const currentUser = getCurrentUsername();
          if (entrega.created_by !== currentUser) {
            notifyCreated(
              entrega.created_by || "Alguem",
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
          if (entrega.status === entregaOld?.status) return;
          const currentUser = getCurrentUsername();
          const pendingUser = pendingUpdaters.get(entrega.id);
          pendingUpdaters.delete(entrega.id);
          const updater = pendingUser || (entrega as any).updated_by || "Alguem";
          if (updater !== currentUser) {
            notifyStatusUpdated(updater, entrega.nome_hospital, entrega.status, 1);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime entregas conectado");
        }
      });

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
    }) => {
      const username = getCurrentUsername();
      trackUpdate(id, username);
      return entregaService.updateStatus(id, input, username);
    },
    onSuccess: () => {
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
    }) => {
      const username = getCurrentUsername();
      return entregaService.updateStatusByHospital(hospitalId, newStatus, username);
    },
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
