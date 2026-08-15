import { useState } from "react";
import { Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { useEntregas, useUpdateEntregaStatus } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Entrega, StatusEntrega } from "@/types";

export function MonitorEntregas() {
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [newStatus, setNewStatus] = useState<StatusEntrega>("Pendente");

  const { data: entregas = [], isLoading, refetch } = useEntregas();
  const updateStatus = useUpdateEntregaStatus();
  const { user } = useAuth();

  const canEdit = user?.isAnderson ?? false;

  const handleRowClick = (entrega: Entrega) => {
    if (!canEdit) return;
    setSelectedEntrega(entrega);
    setNewStatus(entrega.status);
  };

  const handleSave = async () => {
    if (!selectedEntrega) return;

    await updateStatus.mutateAsync({
      id: selectedEntrega.id,
      input: { status: newStatus },
    });

    setSelectedEntrega(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Hoje, ${date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedEntregas = [...entregas].sort((a, b) => {
    if (a.status === "Pendente" && b.status !== "Pendente") return -1;
    if (a.status !== "Pendente" && b.status === "Pendente") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Monitor de Entregas
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe o status de todas as entregas em tempo real
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Entregas</CardTitle>
            {!canEdit && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Somente visualizacao
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && sortedEntregas.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sortedEntregas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Monitor className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhuma entrega registrada ainda
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 border-b pb-3 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hospital
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Paciente
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Inserido por
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Data/Hora
                  </span>
                </div>

                <div className="space-y-1">
                  {sortedEntregas.map((entrega) => (
                    <div
                      key={entrega.id}
                      className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-4 items-center rounded-lg p-3 transition-colors ${
                        canEdit
                          ? "hover:bg-muted/50 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => handleRowClick(entrega)}
                    >
                      <span className="font-medium truncate">
                        {entrega.nome_hospital}
                      </span>
                      <span className="text-sm text-muted-foreground truncate">
                        {entrega.nome_paciente || "—"}
                      </span>
                      <StatusBadge status={entrega.status} />
                      <span className="text-sm text-muted-foreground truncate">
                        {entrega.created_by || "—"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entrega.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {sortedEntregas.map((entrega) => (
                  <div
                    key={entrega.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      canEdit
                        ? "hover:bg-muted/50 cursor-pointer"
                        : "cursor-default"
                    }`}
                    onClick={() => handleRowClick(entrega)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="space-y-1">
                        <p className="font-medium">{entrega.nome_hospital}</p>
                        {entrega.nome_paciente && (
                          <p className="text-sm text-muted-foreground">
                            Paciente: {entrega.nome_paciente}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={entrega.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por: {entrega.created_by || "—"}</span>
                      <span>{formatDate(entrega.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog - only for Anderson */}
      {canEdit && (
        <Dialog
          open={!!selectedEntrega}
          onOpenChange={(open) => !open && setSelectedEntrega(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Atualizar Status</DialogTitle>
              <DialogDescription>
                {selectedEntrega?.nome_hospital}
                {selectedEntrega?.nome_paciente && ` — ${selectedEntrega.nome_paciente}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as StatusEntrega)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Saiu para entrega">
                      Saiu para entrega
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedEntrega(null)}
                disabled={updateStatus.isPending}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={updateStatus.isPending}>
                {updateStatus.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
