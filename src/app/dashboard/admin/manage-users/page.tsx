"use client";

import { useState } from "react";
import { FiTrash2, FiUsers } from "react-icons/fi";
import type { AppUser, Role } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Image";
import {
  Button,
  EmptyState,
  LoadingScreen,
  Modal,
  PageHeading,
  Select,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits } from "@/lib/utils";

const ROLES: Role[] = ["supporter", "creator", "admin"];

export default function ManageUsers() {
  const { dbUser } = useAuth();
  const { data, loading, refetch } = useApi<AppUser[]>("/users");
  const [removing, setRemoving] = useState<AppUser | null>(null);
  const [busy, setBusy] = useState(false);
  const users = data ?? [];

  async function changeRole(user: AppUser, role: Role) {
    await apiReq(`/users/${user.id}/role`, { method: "PATCH", body: { role } });
    await refetch();
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    await apiReq(`/users/${removing.id}`, { method: "DELETE" });
    setBusy(false);
    setRemoving(null);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Manage users"
        subtitle="Change roles or remove accounts across the platform."
      />

      {loading ? (
        <LoadingScreen label="Loading users…" />
      ) : users.length === 0 ? (
        <EmptyState icon={<FiUsers />} title="No users found" />
      ) : (
        <TableCard minWidth={720}>
          <thead>
            <tr className="border-b border-border">
              <TH>User</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Credits</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.email === dbUser?.email;
              return (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.photoURL} name={u.name} email={u.email} size={34} />
                      <span className="font-medium text-heading">
                        {u.name}
                        {isSelf && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                      </span>
                    </div>
                  </TD>
                  <TD className="text-muted">{u.email}</TD>
                  <TD>
                    <Select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                      className="w-32 py-1.5 text-sm capitalize"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r} className="capitalize">
                          {r}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>{formatCredits(u.credits)}</TD>
                  <TD>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isSelf}
                        onClick={() => setRemoving(u)}
                      >
                        <FiTrash2 /> Remove
                      </Button>
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}

      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove user"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={busy}>
              Remove user
            </Button>
          </>
        }
      >
        <p className="text-sm text-body">
          Remove{" "}
          <span className="font-semibold text-heading">{removing?.name}</span> (
          {removing?.email})? They will lose access to their account.
        </p>
      </Modal>
    </div>
  );
}
