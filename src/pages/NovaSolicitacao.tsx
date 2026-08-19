import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Autocomplete } from "@/components/Autocomplete";
import { useHospitais, useCreateEntrega } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";
import type { Hospital, StatusEntrega } from "@/types";

export function NovaSolicitacao() {
  const [search, setSearch] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [nomePaciente, setNomePaciente] = useState("");
  const [status, setStatus] = useState<StatusEntrega | "">("");

  const { data: hospitals = [] } = useHospitais();
  const createEntrega = useCreateEntrega();
  const { user } = useAuth();

  const handleSelect = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSearch(hospital.nome);
  };

  const handleSave = async () => {
    if (!selectedHospital) return;

    try {
      await createEntrega.mutateAsync({
        hospital_id: selectedHospital.id,
        nome_hospital: selectedHospital.nome,
        nome_paciente: nomePaciente || undefined,
        status,
        created_by: user?.username || "Desconhecido",
      });

      setSearch("");
      setSelectedHospital(null);
      setNomePaciente("");
      setStatus("");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nova Solicitacao
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre uma nova entrega para um hospital
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Hospital</Label>
            <Autocomplete
              hospitals={hospitals}
              value={search}
              onChange={setSearch}
              onSelect={handleSelect}
              placeholder="Digite o nome do hospital..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paciente">Nome do Paciente/Cliente</Label>
            <Input
              id="paciente"
              value={nomePaciente}
              onChange={(e) => setNomePaciente(e.target.value.toUpperCase())}
              placeholder="EX: JOAO DA SILVA"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusEntrega)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Autorizado">Autorizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedHospital && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedHospital.nome}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={!selectedHospital || !status || createEntrega.isPending}
            className="w-full"
            size="lg"
          >
            {createEntrega.isPending ? "Salvando..." : "Salvar Solicitacao"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
