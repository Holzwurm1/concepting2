import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { PluginData, PluginPermission } from "@/types/plugin";

interface PermissionsTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

function createPermission(): PluginPermission {
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: "",
    description: "",
    default: "op",
  };
}

export function PermissionsTab({ plugin, onUpdate }: PermissionsTabProps) {
  const [editing, setEditing] = useState<string | null>(null);

  const addPermission = () => {
    const perm = createPermission();
    onUpdate({ permissions: [...plugin.permissions, perm] });
    setEditing(perm.id);
  };

  const updatePermission = (id: string, updates: Partial<PluginPermission>) => {
    onUpdate({
      permissions: plugin.permissions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const deletePermission = (id: string) => {
    onUpdate({ permissions: plugin.permissions.filter((p) => p.id !== id) });
    if (editing === id) setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Permissions ({plugin.permissions.length})</h2>
        <Button onClick={addPermission} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Permission hinzufügen
        </Button>
      </div>

      {plugin.permissions.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Noch keine Permissions. Füge deine erste Berechtigung hinzu.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plugin.permissions.map((perm) => (
          <Card
            key={perm.id}
            className={`bg-card border-border transition-all ${editing === perm.id ? "ring-1 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={perm.name}
                    onChange={(e) => updatePermission(perm.id, { name: e.target.value })}
                    placeholder="plugin.permission.name"
                    className="h-7 bg-secondary border-border font-mono text-sm max-w-[300px]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(editing === perm.id ? null : perm.id)}
                  >
                    {editing === perm.id ? "Schließen" : "Bearbeiten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deletePermission(perm.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editing === perm.id && (
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Beschreibung</Label>
                    <Input
                      value={perm.description}
                      onChange={(e) => updatePermission(perm.id, { description: e.target.value })}
                      placeholder="Was erlaubt diese Permission?"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Default</Label>
                    <Select
                      value={perm.default}
                      onValueChange={(v) => updatePermission(perm.id, { default: v as PluginPermission["default"] })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">true (alle)</SelectItem>
                        <SelectItem value="false">false (niemand)</SelectItem>
                        <SelectItem value="op">op (nur OPs)</SelectItem>
                        <SelectItem value="not_op">not_op (nicht OPs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}