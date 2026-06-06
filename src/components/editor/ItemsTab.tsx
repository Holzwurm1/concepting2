import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X } from "lucide-react";
import type { PluginData, PluginItem } from "@/types/plugin";

interface ItemsTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

function createItem(): PluginItem {
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: "",
    material: "DIAMOND_SWORD",
    displayName: "",
    lore: [],
    enchantments: [],
  };
}

export function ItemsTab({ plugin, onUpdate }: ItemsTabProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [loreInput, setLoreInput] = useState("");
  const [enchName, setEnchName] = useState("");
  const [enchLevel, setEnchLevel] = useState("1");

  const addItem = () => {
    const item = createItem();
    onUpdate({ items: [...plugin.items, item] });
    setEditing(item.id);
  };

  const updateItem = (id: string, updates: Partial<PluginItem>) => {
    onUpdate({
      items: plugin.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    });
  };

  const deleteItem = (id: string) => {
    onUpdate({ items: plugin.items.filter((i) => i.id !== id) });
    if (editing === id) setEditing(null);
  };

  const addLore = (itemId: string) => {
    if (!loreInput.trim()) return;
    const item = plugin.items.find((i) => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { lore: [...item.lore, loreInput.trim()] });
    setLoreInput("");
  };

  const addEnchantment = (itemId: string) => {
    if (!enchName.trim()) return;
    const item = plugin.items.find((i) => i.id === itemId);
    if (!item) return;
    const level = parseInt(enchLevel) || 1;
    updateItem(itemId, {
      enchantments: [...item.enchantments, { name: enchName.trim(), level }],
    });
    setEnchName("");
    setEnchLevel("1");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Items ({plugin.items.length})</h2>
        <Button onClick={addItem} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Item hinzufügen
        </Button>
      </div>

      {plugin.items.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Noch keine Items. Füge dein erstes Custom Item hinzu.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plugin.items.map((item) => (
          <Card
            key={item.id}
            className={`bg-card border-border transition-all ${editing === item.id ? "ring-1 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder="Item Key"
                    className="h-7 bg-secondary border-border font-mono text-sm max-w-[200px]"
                  />
                  <Input
                    value={item.displayName}
                    onChange={(e) => updateItem(item.id, { displayName: e.target.value })}
                    placeholder="Display Name"
                    className="h-7 bg-secondary border-border text-sm max-w-[200px]"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(editing === item.id ? null : item.id)}
                  >
                    {editing === item.id ? "Schließen" : "Bearbeiten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editing === item.id && (
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Material</Label>
                    <Input
                      value={item.material}
                      onChange={(e) => updateItem(item.id, { material: e.target.value })}
                      placeholder="DIAMOND_SWORD"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Custom Model Data</Label>
                    <Input
                      type="number"
                      value={item.customModelData || ""}
                      onChange={(e) => updateItem(item.id, { customModelData: parseInt(e.target.value) || undefined })}
                      placeholder="Optional"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={item.unbreakable || false}
                      onCheckedChange={(v) => updateItem(item.id, { unbreakable: !!v })}
                    />
                    <Label className="text-xs text-muted-foreground">Unbreakable</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={item.glow || false}
                      onCheckedChange={(v) => updateItem(item.id, { glow: !!v })}
                    />
                    <Label className="text-xs text-muted-foreground">Glow</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Lore</Label>
                  <div className="flex gap-2">
                    <Input
                      value={loreInput}
                      onChange={(e) => setLoreInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addLore(item.id)}
                      placeholder="Lore-Zeile..."
                      className="bg-secondary border-border"
                    />
                    <Button onClick={() => addLore(item.id)} variant="secondary" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.lore.map((line, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {line}
                        <button
                          onClick={() => updateItem(item.id, { lore: item.lore.filter((_, i) => i !== idx) })}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Enchantments</Label>
                  <div className="flex gap-2">
                    <Input
                      value={enchName}
                      onChange={(e) => setEnchName(e.target.value)}
                      placeholder="Enchantment"
                      className="bg-secondary border-border font-mono"
                    />
                    <Input
                      type="number"
                      value={enchLevel}
                      onChange={(e) => setEnchLevel(e.target.value)}
                      className="bg-secondary border-border font-mono w-20"
                    />
                    <Button onClick={() => addEnchantment(item.id)} variant="secondary" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.enchantments.map((ench, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {ench.name} {ench.level}
                        <button
                          onClick={() =>
                            updateItem(item.id, { enchantments: item.enchantments.filter((_, i) => i !== idx) })
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