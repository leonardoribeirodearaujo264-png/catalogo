"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAdminStore } from "@/lib/admin-store-context";
import { useToast } from "@/lib/toast-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { deleteMember, fetchStoreMembers, updateMember } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";
import {
  DEFAULT_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  type MemberPermissions,
  type MemberRole,
  type StoreMember,
} from "@/types/store";
import { PageHeader, Panel } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Select } from "@/components/ui/field";
import { ConfirmDialog, EmptyState, Modal, Skeleton } from "@/components/ui/feedback";
import { LinkIcon, PlusIcon, UsersIcon } from "@/components/icons";

function randomCode(): string {
  return Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
}

export default function TeamPage() {
  const { store, role } = useAdminStore();
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<StoreMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<StoreMember | null>(null);
  const [removing, setRemoving] = useState<StoreMember | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!store) return;
    try {
      setMembers(await fetchStoreMembers(store.id));
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar a equipe.");
    } finally {
      setLoading(false);
    }
  }, [store, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca remota no mount; o estado só muda depois do await
    load();
  }, [load]);

  if (role === "collaborator") {
    return <EmptyState title="Sem permissão" description="Apenas administradores gerenciam a equipe." />;
  }

  async function handleRemove() {
    if (!removing) return;
    setBusy(true);
    try {
      await deleteMember(removing.id);
      setMembers((prev) => prev.filter((m) => m.id !== removing.id));
      toast.success("Colaborador removido.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível remover. O proprietário não pode ser removido.");
    } finally {
      setBusy(false);
      setRemoving(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Equipe"
        description="Convide vendedores e defina exatamente o que cada um pode fazer na loja."
        action={
          <Button onClick={() => setInviteOpen(true)}>
            <PlusIcon className="h-4 w-4" />
            Convidar colaborador
          </Button>
        }
      />

      <Panel>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="h-12 w-12" />}
            title="Só você por aqui"
            description="Convide sua equipe para dividir o cadastro de veículos e o atendimento dos leads."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member) => (
              <li
                key={member.id}
                className="surface-raised flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold text-cream">
                      {member.displayName || (member.userId === user?.id ? "Você" : "Colaborador")}
                    </span>
                    <Badge tone={member.role === "owner" ? "accent" : "neutral"}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                    {member.status === "suspended" && <Badge tone="danger">Suspenso</Badge>}
                  </div>
                  <p className="mt-0.5 text-[12px] text-graphite-500">
                    Na equipe desde {formatDate(member.createdAt)}
                  </p>
                </div>

                {member.role !== "owner" && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(member)}>
                      Permissões
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setRemoving(member)}>
                      Remover
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {inviteOpen && store && (
        <InviteModal storeId={store.id} onClose={() => setInviteOpen(false)} />
      )}

      {editing && (
        <PermissionsModal
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        title="Remover colaborador?"
        description="Ele perde o acesso ao painel desta loja imediatamente. Os veículos e leads cadastrados por ele permanecem."
        confirmLabel="Remover"
        loading={busy}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </>
  );
}

function InviteModal({ storeId, onClose }: { storeId: string; onClose: () => void }) {
  const toast = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [memberRole, setMemberRole] = useState<Exclude<MemberRole, "owner">>("collaborator");
  const [permissions, setPermissions] = useState<MemberPermissions>(DEFAULT_PERMISSIONS);
  const [code, setCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const client = getBrowserClient();
    if (!client) return;

    setSaving(true);
    const generated = randomCode();
    try {
      const { error } = await client.from("cs_store_invites").insert({
        store_id: storeId,
        code: generated,
        email: email.trim(),
        display_name: displayName.trim(),
        role: memberRole,
        permissions: memberRole === "admin" ? {} : permissions,
      });
      if (error) throw error;
      setCode(generated);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível gerar o convite.");
    } finally {
      setSaving(false);
    }
  }

  const inviteUrl = code ? `${window.location.origin}/convite?codigo=${code}` : "";

  return (
    <Modal open onClose={onClose} title="Convidar colaborador" size="md">
      {code ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-mute">
            Envie este link para a pessoa. Ela cria a própria conta e entra automaticamente na sua loja
            com as permissões que você definiu.
          </p>
          <div className="surface-raised flex items-center gap-3 rounded-xl p-4">
            <LinkIcon className="h-4 w-4 shrink-0 accent-text" />
            <code className="min-w-0 flex-1 break-all text-[13px] text-cream">{inviteUrl}</code>
          </div>
          <p className="text-[12px] text-graphite-500">
            Código: <span className="accent-text font-mono">{code}</span> · válido por 14 dias.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Link copiado.");
              }}
            >
              Copiar link
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Nome" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Field
            label="E-mail (só para você identificar)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Select
            label="Perfil"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as Exclude<MemberRole, "owner">)}
          >
            <option value="collaborator">Colaborador (permissões limitadas)</option>
            <option value="admin">Administrador (acesso total à loja)</option>
          </Select>

          {memberRole === "collaborator" && (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold tracking-wide text-mute">Permissões</span>
              {(Object.keys(PERMISSION_LABELS) as (keyof MemberPermissions)[]).map((key) => (
                <Checkbox
                  key={key}
                  label={PERMISSION_LABELS[key]}
                  checked={permissions[key]}
                  onChange={(e) => setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                />
              ))}
            </div>
          )}

          <Button onClick={handleCreate} loading={saving} full>
            Gerar convite
          </Button>
        </div>
      )}
    </Modal>
  );
}

function PermissionsModal({
  member,
  onClose,
  onSaved,
}: {
  member: StoreMember;
  onClose: () => void;
  onSaved: (member: StoreMember) => void;
}) {
  const toast = useToast();
  const [role, setRole] = useState<MemberRole>(member.role);
  const [permissions, setPermissions] = useState<MemberPermissions>(member.permissions);
  const [status, setStatus] = useState(member.status);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMember(member.id, { role, permissions, status });
      onSaved({ ...member, role, permissions, status });
      toast.success("Permissões atualizadas.");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar as permissões.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Permissões do colaborador" size="md">
      <div className="flex flex-col gap-4">
        <Select label="Perfil" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
          <option value="collaborator">Colaborador</option>
          <option value="admin">Administrador</option>
        </Select>

        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
        </Select>

        {role === "collaborator" && (
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-semibold tracking-wide text-mute">Pode</span>
            {(Object.keys(PERMISSION_LABELS) as (keyof MemberPermissions)[]).map((key) => (
              <Checkbox
                key={key}
                label={PERMISSION_LABELS[key]}
                checked={permissions[key]}
                onChange={(e) => setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
