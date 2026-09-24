"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function WorkspaceSettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState<string | null>(null);

  const [isDevMode, setIsDevMode] = useState(false);
  const [isTogglingDev, setIsTogglingDev] = useState(false);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspace");
        if (res.ok) {
          const data = await res.json();
          setWorkspace(data.workspace);
          setName(data.workspace.name);
          setIsDevMode(Boolean(data.workspace.devModeEnabled));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  const handleToggleDev = async () => {
    setIsTogglingDev(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const next = !isDevMode;
      const res = await fetch("/api/workspace/dev-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devModeEnabled: next }),
      });
      if (res.ok) {
        setIsDevMode(next);
        setSuccessMsg(
          next
            ? "Developer Sandbox Mode activated. Plan limits are bypassed."
            : "Switched to Live Production Mode. Quotas are active."
        );
      }
    } catch {
      setErrorMsg("Failed to update Developer Mode status.");
    } finally {
      setIsTogglingDev(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to update workspace name");
      setSuccessMsg("Workspace profile updated.");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAllData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== "DELETE_ALL_DATA") {
      setErrorMsg("Type 'DELETE_ALL_DATA' exactly to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/workspace/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to purge data");

      setDeletionSuccess(data.message);
      setDeleteConfirmation("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-xs font-mono text-[#777268]">Loading workspace parameters...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#DCD5C8] pb-4">
        <span className="text-[11px] font-mono text-[#B8892D] uppercase tracking-wider">
          Administration
        </span>
        <h1 className="text-2xl font-serif font-bold text-[#121210] tracking-tight mt-0.5">
          Workspace Settings
        </h1>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#F3F0E8] border border-[#DCD5C8] text-xs font-mono text-[#121210] rounded">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-[#fdf8f8] border border-[#f1c2c2] text-xs font-mono text-[#8f2020] rounded">
          {errorMsg}
        </div>
      )}

      {/* General Settings */}
      <Card className="bg-[#FBFAF6]">
        <CardHeader className="border-b border-[#DCD5C8]">
          <CardTitle className="font-serif">Workspace Profile</CardTitle>
          <CardDescription>
            The commercial entity name associated with your contracted rate cards and audits.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
            <Input
              label="Brand / Commercial Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Workspace Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Developer Sandbox Card */}
      <Card className="bg-[#FBFAF6]">
        <CardHeader className="border-b border-[#DCD5C8]">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#B8892D] uppercase tracking-wider mb-0.5">
            <span>Engineering &amp; Testing</span>
            <span>•</span>
            <span>Simulation Environment</span>
          </div>
          <CardTitle className="font-serif">Developer / Sandbox Mode</CardTitle>
          <CardDescription>
            Enable sandbox mode to simulate complex rate cards and test unlimited invoice line items without consuming production quota.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded bg-[#F3F0E8] border border-[#DCD5C8]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isDevMode ? "bg-[#B8892D] animate-pulse" : "bg-[#777268]"}`} />
                <span className="font-mono text-xs font-bold text-[#121210]">
                  {isDevMode ? "SANDBOX MODE IS ACTIVE" : "PRODUCTION LIVE MODE"}
                </span>
              </div>
              <p className="text-xs text-[#777268]">
                {isDevMode
                  ? "Audit row limits are bypassed. Custom fields and calculation traces are logged with zero restrictions."
                  : "Standard contract enforcement and subscription quota limits are applied."}
              </p>
            </div>
            <Button
              type="button"
              variant={isDevMode ? "gold" : "outline"}
              onClick={handleToggleDev}
              isLoading={isTogglingDev}
            >
              {isDevMode ? "Deactivate Sandbox" : "Activate Developer Mode"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-[#777268]">
            <div className="p-3 rounded bg-white border border-[#DCD5C8]">
              <span className="text-[10px] uppercase font-bold text-[#121210]">No Plan Limits</span>
              <p className="text-[11px] mt-1 text-[#777268] font-sans">
                Audit files containing thousands of lines without consuming monthly allowances.
              </p>
            </div>
            <div className="p-3 rounded bg-white border border-[#DCD5C8]">
              <span className="text-[10px] uppercase font-bold text-[#121210]">Custom Field Ingestion</span>
              <p className="text-[11px] mt-1 text-[#777268] font-sans">
                Simulate arbitrary CSV columns (SKU, PO, Dimensions, Bin IDs) without restrictions.
              </p>
            </div>
            <div className="p-3 rounded bg-white border border-[#DCD5C8]">
              <span className="text-[10px] uppercase font-bold text-[#121210]">Audit Telemetry</span>
              <p className="text-[11px] mt-1 text-[#777268] font-sans">
                Full deterministic execution logs and rule assertion traces available in detail views.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-[#FBFAF6]">
        <CardHeader className="border-b border-[#DCD5C8]">
          <CardTitle className="font-serif">Authorized Members</CardTitle>
          <CardDescription>
            Personnel with permissions to review audits and adjust rate card schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#DCD5C8] text-xs">
              <thead className="bg-[#F3F0E8]">
                <tr>
                  <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">User</th>
                  <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Email</th>
                  <th className="px-5 py-2.5 text-left font-mono font-medium text-[#777268]">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD5C8]/60 bg-white">
                {workspace?.members?.map((m: any) => (
                  <tr key={m.id}>
                    <td className="px-5 py-3 font-medium text-[#121210]">{m.user.name || "User"}</td>
                    <td className="px-5 py-3 font-mono text-[#777268]">{m.user.email}</td>
                    <td className="px-5 py-3 font-mono">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#F3F0E8] text-[#121210] border border-[#DCD5C8]">
                        {m.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention & Privacy Deletion */}
      <Card className="border-[#f1c2c2] bg-[#fdf8f8]">
        <CardHeader className="border-b border-[#f1c2c2]">
          <CardTitle className="text-[#8f2020] font-serif">Tenant Isolation &amp; Data Deletion</CardTitle>
          <CardDescription className="text-[#8f2020]">
            Permanent cascading purge of all invoices, line items, audit assertions, and rate cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <p className="text-xs text-[#777268] leading-relaxed">
            In compliance with our workspace isolation protocols, you maintain sovereign rights to delete all financial records and rate data associated with this tenant.
          </p>

          {deletionSuccess && (
            <div className="p-3 bg-[#F3F0E8] border border-[#DCD5C8] text-xs font-mono text-[#121210] rounded">
              {deletionSuccess}
            </div>
          )}

          <form onSubmit={handleDeleteAllData} className="space-y-3 max-w-md pt-2">
            <Input
              label="Type 'DELETE_ALL_DATA' to confirm permanent purge:"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE_ALL_DATA"
            />
            <Button
              type="submit"
              variant="danger"
              disabled={deleteConfirmation !== "DELETE_ALL_DATA" || isDeleting}
              isLoading={isDeleting}
            >
              Permanently Purge Workspace Data
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
