import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import type { PluginData, PluginRecipe } from "@/types/plugin";

interface RecipesTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

function createRecipe(): PluginRecipe {
  return {
    id: Math.random().toString(36).substring(2, 15),
    name: "",
    type: "shaped",
    result: "",
    resultAmount: 1,
    ingredients: [],
  };
}

export function RecipesTab({ plugin, onUpdate }: RecipesTabProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [ingItem, setIngItem] = useState("");
  const [ingAmount, setIngAmount] = useState("1");
  const [ingSlot, setIngSlot] = useState("");

  const addRecipe = () => {
    const recipe = createRecipe();
    onUpdate({ recipes: [...plugin.recipes, recipe] });
    setEditing(recipe.id);
  };

  const updateRecipe = (id: string, updates: Partial<PluginRecipe>) => {
    onUpdate({
      recipes: plugin.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const deleteRecipe = (id: string) => {
    onUpdate({ recipes: plugin.recipes.filter((r) => r.id !== id) });
    if (editing === id) setEditing(null);
  };

  const addIngredient = (recipeId: string) => {
    if (!ingItem.trim()) return;
    const recipe = plugin.recipes.find((r) => r.id === recipeId);
    if (!recipe) return;
    const amount = parseInt(ingAmount) || 1;
    updateRecipe(recipeId, {
      ingredients: [...recipe.ingredients, { item: ingItem.trim(), amount, slot: ingSlot.trim() || undefined }],
    });
    setIngItem("");
    setIngAmount("1");
    setIngSlot("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recipes ({plugin.recipes.length})</h2>
        <Button onClick={addRecipe} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Recipe hinzufügen
        </Button>
      </div>

      {plugin.recipes.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Noch keine Recipes. Füge dein erstes Crafting-Rezept hinzu.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {plugin.recipes.map((recipe) => (
          <Card
            key={recipe.id}
            className={`bg-card border-border transition-all ${editing === recipe.id ? "ring-1 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={recipe.name}
                    onChange={(e) => updateRecipe(recipe.id, { name: e.target.value })}
                    placeholder="Recipe Name"
                    className="h-7 bg-secondary border-border text-sm max-w-[200px]"
                  />
                  <Select
                    value={recipe.type}
                    onValueChange={(v) => updateRecipe(recipe.id, { type: v as PluginRecipe["type"] })}
                  >
                    <SelectTrigger className="h-7 bg-secondary border-border text-xs w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shaped">Shaped</SelectItem>
                      <SelectItem value="shapeless">Shapeless</SelectItem>
                      <SelectItem value="furnace">Furnace</SelectItem>
                      <SelectItem value="smithing">Smithing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(editing === recipe.id ? null : recipe.id)}
                  >
                    {editing === recipe.id ? "Schließen" : "Bearbeiten"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteRecipe(recipe.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editing === recipe.id && (
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Result</Label>
                    <Input
                      value={recipe.result}
                      onChange={(e) => updateRecipe(recipe.id, { result: e.target.value })}
                      placeholder="DIAMOND_SWORD"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                      type="number"
                      value={recipe.resultAmount}
                      onChange={(e) => updateRecipe(recipe.id, { resultAmount: parseInt(e.target.value) || 1 })}
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Shape (für Shaped)</Label>
                    <Input
                      value={recipe.shape?.join(", ") || ""}
                      onChange={(e) => updateRecipe(recipe.id, { shape: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      placeholder="ABC, DEF, GHI"
                      className="bg-secondary border-border font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Ingredients</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ingItem}
                      onChange={(e) => setIngItem(e.target.value)}
                      placeholder="Item"
                      className="bg-secondary border-border font-mono"
                    />
                    <Input
                      type="number"
                      value={ingAmount}
                      onChange={(e) => setIngAmount(e.target.value)}
                      className="bg-secondary border-border font-mono w-20"
                    />
                    <Input
                      value={ingSlot}
                      onChange={(e) => setIngSlot(e.target.value)}
                      placeholder="Slot (A1, B2...)"
                      className="bg-secondary border-border font-mono w-24"
                    />
                    <Button onClick={() => addIngredient(recipe.id)} variant="secondary" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.ingredients.map((ing, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {ing.item} x{ing.amount} {ing.slot && `(${ing.slot})`}
                        <button
                          onClick={() =>
                            updateRecipe(recipe.id, { ingredients: recipe.ingredients.filter((_, i) => i !== idx) })
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