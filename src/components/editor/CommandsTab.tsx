import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, X } from "lucide-react";
import type { PluginData, PluginCommand } from "@/types/plugin";

interface CommandsTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

function createCommand(): PluginCommand {
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: "",
    description: "",
    usage: "",
    aliases: [],
    permission: "",
    permissionMessage: "",
  };
}

export function CommandsTab({ plugin, onUpdate }: CommandsTabProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState("");

  const addCommand = () => {
    const cmd = createCommand();
    onUpdate({ commands: [...plugin.commands, cmd] });
    setEditing(cmd.id);
  };

  const updateCommand = (id: string, updates: Partial<PluginCommand>) => {
    onUpdate({
      commands: plugin.commands.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const deleteCommand = (id: string) => {
    onUpdate({ commands: plugin.commands.filter((c) => c.id !== id) });
    if (editing === id) setEditing(null);
  };

  const addAlias = (cmdId: string) => {
    if (!aliasInput.trim()) return;
    const cmd = plugin.commands.find((c) => c.id === cmdId);
    if (!cmd || cmd.aliases.includes(aliasInput.trim())) return;
    updateCommand(cmdId, { aliases: [...cmd.aliases, aliasInput.trim()] });
    setAliasInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Commands ({plugin.commands.length})</h2>
        <Button onClick={addCommand} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Command hinzufügen
        </Button>
      </div>

      {plugin.commands.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Noch keine Commands. Füge deinen ersten Befehl hinzu.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plugin.commands.map((cmd) => (
          <Card
            key={cmd.id}
            className={`bg-card border-border transition-all ${editing === cmd.id ? "ring-1 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-primary font-mono text-sm">/</span>
                  <Input
                    value={cmd.name}
                    onChange={(e) => updateCommand(cmd.id, { name: e.target.value })}
                    placeholder="befehl"
                    className="h-7 bg-secondary border-border font-mono text-sm max-w-[200px]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(editing === cmd.id ? null : cmd.id)}
                  >
                    {editing === cmd.id ? "Schließen" : "Bearbeiten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteCommand(cmd.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editing === cmd.id && (
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Beschreibung</Label>
                    <Input
                      value={cmd.description}
                      onChange={(e) => updateCommand(cmd.id, { description: e.target.value })}
                      placeholder="Was macht dieser Befehl?"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Usage</Label>
                    <Input
                      value={cmd.usage}
                      onChange={(e) => updateCommand(cmd.id, { usage: e.target.value })}
                      placeholder="/befehl <spieler>"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Permission</Label>
                    <Input
                      value={cmd.permission}
                      onChange={(e) => updateCommand(cmd.id, { permission: e.target.value })}
                      placeholder="plugin.command.befehl"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Permission Message</Label>
                    <Input
                      value={cmd.permissionMessage || ""}
                      onChange={(e) => updateCommand(cmd.id, { permissionMessage: e.target.value })}
                      placeholder="Du hast keine Berechtigung."
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Aliases</Label>
                  <div className="flex gap-2">
                    <Input
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAlias(cmd.id)}
                      placeholder="Alias..."
                      className="bg-secondary border-border"
                    />
                    <Button onClick={() => addAlias(cmd.id)} variant="secondary" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cmd.aliases.map((alias) => (
                      <Badge key={alias} variant="secondary" className="gap-1 pr-1">
                        {alias}
                        <button
                          onClick={() =>
                            updateCommand(cmd.id, { aliases: cmd.aliases.filter((a) => a !== alias) })
                          }
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
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