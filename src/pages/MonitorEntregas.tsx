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
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import {
  useEntregas,
  useUpdateEntregaStatus,
  useUpdateStatusByHospital,
} from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Entrega, StatusEntrega } from "@/types";

export function MonitorEntregas() {
  const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
  const [newStatus, setNewStatus] = useState<StatusEntrega>("Pendente");
  const [updateAllPending, setUpdateAllPending] = useState(false);

  const { data: entregas = [], isLoading, refetch } = useEntregas();
  const updateStatus = useUpdateEntregaStatus();
  const updateAllByHospital = useUpdateStatusByHospital();
  const { user } = useAuth();

  const canEdit = user?.isAdmin || user?.isAnderson;

  const handleRowClick = (entrega: Entrega) => {
    if (!canEdit) return;
    setSelectedEntrega(entrega);
    setNewStatus(entrega.status);
    setUpdateAllPending(false);
  };

  const handleSave = async () => {
    if (!selectedEntrega) return;

    if (updateAllPending && newStatus !== "Pendente") {
      await updateAllByHospital.mutateAsync({
        hospitalId: selectedEntrega.hospital_id,
        newStatus,
        hospitalName: selectedEntrega.nome_hospital,
        count: pendingCount,
      });
    } else {
      await updateStatus.mutateAsync({
        id: selectedEntrega.id,
        input: { status: newStatus },
        hospitalName: selectedEntrega.nome_hospital,
      });
    }

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

  const pendingCount = selectedEntrega
    ? entregas.filter(
        (e) =>
          e.hospital_id === selectedEntrega.hospital_id &&
          e.status === "Pendente"
      ).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Monitor de Entregas
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Acompanhe o status das entregas em tempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.username}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-1 sm:mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Entregas</CardTitle>
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
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b pb-3 mb-2">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">Hospital</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">Paciente</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4">Inserido por</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {sortedEntregas.map((entrega) => (
                      <tr
                        key={entrega.id}
                        className={`rounded-lg transition-colors ${
                          canEdit
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "cursor-default"
                        }`}
                        onClick={() => handleRowClick(entrega)}
                      >
                        <td className="font-medium py-3 pr-4 whitespace-nowrap">{entrega.nome_hospital}</td>
                        <td className="text-sm text-muted-foreground py-3 pr-4 whitespace-nowrap">{entrega.nome_paciente || "—"}</td>
                        <td className="py-3 pr-4"><StatusBadge status={entrega.status} /></td>
                        <td className="text-sm text-muted-foreground py-3 pr-4 whitespace-nowrap">{entrega.updated_by || entrega.created_by || "—"}</td>
                        <td className="text-sm text-muted-foreground py-3 whitespace-nowrap">{formatDate(entrega.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet - 3 columns */}
              <div className="hidden md:block lg:hidden">
                <div className="space-y-1">
                  {sortedEntregas.map((entrega) => (
                    <div
                      key={entrega.id}
                      className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center rounded-lg p-3 transition-colors ${
                        canEdit
                          ? "hover:bg-muted/50 cursor-pointer"
                          : "cursor-default"
                      }`}
                      onClick={() => handleRowClick(entrega)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{entrega.nome_hospital}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {entrega.nome_paciente || "—"} · {entrega.updated_by || entrega.created_by || "—"}
                        </p>
                      </div>
                      <StatusBadge status={entrega.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(entrega.created_at)}</span>
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
                      <p className="font-medium pr-2">{entrega.nome_hospital}</p>
                      <StatusBadge status={entrega.status} />
                    </div>
                    {entrega.nome_paciente && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Paciente: {entrega.nome_paciente}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por: {entrega.updated_by || entrega.created_by || "—"}</span>
                      <span>{formatDate(entrega.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
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
                <Label>Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as StatusEntrega)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Autorizado">Autorizado</SelectItem>
                    <SelectItem value="Saiu para entrega">
                      Saiu para entrega
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pendingCount > 1 && (
                <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/50">
                  <input
                    type="checkbox"
                    id="updateAll"
                    checked={updateAllPending}
                    onChange={(e) => setUpdateAllPending(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <Label htmlFor="updateAll" className="text-sm cursor-pointer">
                    Aplicar a todos pendentes deste hospital ({pendingCount})
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedEntrega(null)}
                disabled={updateStatus.isPending || updateAllByHospital.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateStatus.isPending || updateAllByHospital.isPending}
              >
                {updateStatus.isPending || updateAllByHospital.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
