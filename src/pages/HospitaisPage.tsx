import { useState } from "react";
import {
  Plus,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  useHospitais,
  useCreateHospital,
  useUpdateHospital,
  useDeleteHospital,
} from "@/hooks/useQueries";
import type { Hospital, CreateHospitalInput } from "@/types";

const emptyForm: CreateHospitalInput = {
  nome: "",
  observacao: "",
};

export function HospitaisPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [deletingHospital, setDeletingHospital] = useState<Hospital | null>(
    null
  );
  const [form, setForm] = useState<CreateHospitalInput>(emptyForm);

  const { data: hospitals = [], isLoading } = useHospitais();
  const createHospital = useCreateHospital();
  const updateHospital = useUpdateHospital();
  const deleteHospital = useDeleteHospital();

  const openCreate = () => {
    setEditingHospital(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setForm({
      nome: hospital.nome,
      observacao: hospital.observacao ?? "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;

    if (editingHospital) {
      await updateHospital.mutateAsync({
        id: editingHospital.id,
        input: form,
      });
    } else {
      await createHospital.mutateAsync(form);
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingHospital(null);
  };

  const handleDelete = async () => {
    if (!deletingHospital) return;
    await deleteHospital.mutateAsync(deletingHospital.id);
    setDeletingHospital(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hospitais</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie o cadastro de hospitais
            </p>
          </div>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Hospital
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Cadastro de Hospitais ({hospitals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhum hospital cadastrado
              </p>
              <p className="text-sm text-muted-foreground/70">
                Clique em "Novo Hospital" para adicionar
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_2fr_100px] gap-4 border-b pb-3 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Observação
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Ações
                  </span>
                </div>

                <div className="space-y-1">
                  {hospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="grid grid-cols-[1fr_2fr_100px] gap-4 items-center rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium break-words">
                        {hospital.nome}
                      </span>
                      <span className="text-sm text-muted-foreground break-words">
                        {hospital.observacao || "—"}
                      </span>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(hospital)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingHospital(hospital)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium break-words">{hospital.nome}</p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(hospital)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingHospital(hospital)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {hospital.observacao && (
                      <p className="text-sm text-muted-foreground break-words">
                        {hospital.observacao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingHospital ? "Editar Hospital" : "Novo Hospital"}
            </DialogTitle>
            <DialogDescription>
              {editingHospital
                ? "Atualize as informações do hospital"
                : "Preencha os dados para cadastrar um novo hospital"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Hospital *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                placeholder="EX: HOSPITAL SANTA JOANA"
                style={{ textTransform: "uppercase" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value.toUpperCase() })
                }
                placeholder="OBSERVACOES ADICIONAIS..."
                style={{ textTransform: "uppercase" }}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={createHospital.isPending || updateHospital.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.nome.trim() || createHospital.isPending || updateHospital.isPending
              }
            >
              {createHospital.isPending || updateHospital.isPending
                ? "Salvando..."
                : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingHospital}
        onOpenChange={(open) => !open && setDeletingHospital(null)}
        title="Excluir Hospital"
        description={`Tem certeza que deseja excluir "${deletingHospital?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        loading={deleteHospital.isPending}
      />
    </div>
  );
}
