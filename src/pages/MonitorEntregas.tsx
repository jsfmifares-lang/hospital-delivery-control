import { useState, useMemo, useRef, useEffect } from "react";
import { Monitor, RefreshCw, Search, X, Calendar } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  const [observacao, setObservacao] = useState("");

  const [searchHospital, setSearchHospital] = useState("");
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showAll, setShowAll] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const { data: entregas = [], isLoading, refetch } = useEntregas();
  const updateStatus = useUpdateEntregaStatus();
  const updateAllByHospital = useUpdateStatusByHospital();
  const { user } = useAuth();

  const canEdit = user?.isAdmin || user?.isAnderson;

  const hospitalNames = useMemo(() => {
    const names = new Set(entregas.map((e) => e.nome_hospital));
    return [...names].sort();
  }, [entregas]);

  const filteredHospitalNames = useMemo(() => {
    if (!searchHospital) return hospitalNames;
    return hospitalNames.filter((name) =>
      name.toLowerCase().includes(searchHospital.toLowerCase())
    );
  }, [hospitalNames, searchHospital]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setAutocompleteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRowClick = (entrega: Entrega) => {
    if (!canEdit) return;
    setSelectedEntrega(entrega);
    setNewStatus(entrega.status);
    setObservacao(entrega.observacao || "");
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
        input: { status: newStatus, observacao },
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

  const statusOrder: Record<string, number> = {
    "Pendente": 0,
    "Autorizado": 1,
    "Saiu para entrega": 2,
  };

  const filteredEntregas = useMemo(() => {
    let result = [...entregas];

    if (!showAll) {
      result = result.filter((e) => {
        const d = new Date(e.created_at);
        return d.toISOString().split("T")[0] === searchDate;
      });
    }

    if (searchHospital) {
      result = result.filter((e) =>
        e.nome_hospital.toLowerCase().includes(searchHospital.toLowerCase())
      );
    }

    return result.sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 3;
      const orderB = statusOrder[b.status] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [entregas, showAll, searchDate, searchHospital]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">Entregas</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64" ref={autocompleteRef}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar hospital..."
                  value={searchHospital}
                  onChange={(e) => {
                    setSearchHospital(e.target.value);
                    setAutocompleteOpen(true);
                  }}
                  onFocus={() => setAutocompleteOpen(true)}
                  className="pl-8 h-9"
                />
                {autocompleteOpen && filteredHospitalNames.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
                    {filteredHospitalNames.map((name) => (
                      <button
                        key={name}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          setSearchHospital(name);
                          setAutocompleteOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    disabled={showAll}
                    className="pl-8 h-9 w-full sm:w-40"
                  />
                </div>
                <Button
                  variant={showAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="h-9 whitespace-nowrap"
                >
                  {showAll ? "Hoje" : "Todas"}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && filteredEntregas.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntregas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Monitor className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhuma entrega encontrada para este filtro
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b pb-3 mb-2">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 w-[28%]">Hospital</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 w-[16%]">Paciente</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 w-[14%]">Status</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 w-[12%]">Observação</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-4 w-[14%]">Atualizado por</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 w-[16%]">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {filteredEntregas.map((entrega) => (
                      <tr
                        key={entrega.id}
                        className={`rounded-lg transition-colors ${
                          canEdit
                            ? "hover:bg-muted/50 cursor-pointer"
                            : "cursor-default"
                        }`}
                        onClick={() => handleRowClick(entrega)}
                      >
                        <td className="font-medium py-3 pr-4 break-words">{entrega.nome_hospital}</td>
                        <td className="text-sm text-muted-foreground py-3 pr-4 truncate">{entrega.nome_paciente || "—"}</td>
                        <td className="py-3 pr-4 whitespace-nowrap"><StatusBadge status={entrega.status} /></td>
                        <td className="text-sm text-muted-foreground py-3 pr-4 break-words">{entrega.observacao || "—"}</td>
                        <td className="text-sm text-muted-foreground py-3 pr-4 truncate">{entrega.updated_by || entrega.created_by || "—"}</td>
                        <td className="text-sm text-muted-foreground py-3 truncate">{formatDate(entrega.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet - 3 columns */}
              <div className="hidden md:block lg:hidden">
                <div className="space-y-1">
                  {filteredEntregas.map((entrega) => (
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
                        {entrega.observacao && (
                          <p className="text-xs text-muted-foreground truncate italic">
                            Obs: {entrega.observacao}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={entrega.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(entrega.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredEntregas.map((entrega) => (
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
                    {entrega.observacao && (
                      <p className="text-sm text-muted-foreground mb-1 italic">
                        Obs: {entrega.observacao}
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
                    {user?.isAnderson ? (
                      <>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Saiu para entrega">
                          Saiu para entrega
                        </SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Autorizado">Autorizado</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Input
                  id="observacao"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value.toUpperCase())}
                  placeholder="EX: URGENTE, ENTREGAR ANTES DAS 14H"
                />
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
