import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { PluginData } from "@/types/plugin";

interface OverviewTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

export function OverviewTab({ plugin, onUpdate }: OverviewTabProps) {
  const [tagInput, setTagInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [dependInput, setDependInput] = useState("");
  const [softDependInput, setSoftDependInput] = useState("");

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (plugin.tags.includes(tagInput.trim())) return;
    onUpdate({ tags: [...plugin.tags, tagInput.trim()] });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: plugin.tags.filter((t) => t !== tag) });
  };

  const addAuthor = () => {
    if (!authorInput.trim()) return;
    if (plugin.authors.includes(authorInput.trim())) return;
    const newAuthors = [...plugin.authors, authorInput.trim()];
    onUpdate({ authors: newAuthors, author: newAuthors[0] || "" });
    setAuthorInput("");
  };

  const removeAuthor = (author: string) => {
    const newAuthors = plugin.authors.filter((a) => a !== author);
    onUpdate({ authors: newAuthors, author: newAuthors[0] || "" });
  };

  const addDepend = () => {
    if (!dependInput.trim()) return;
    if (plugin.depend.includes(dependInput.trim())) return;
    onUpdate({ depend: [...plugin.depend, dependInput.trim()] });
    setDependInput("");
  };

  const addSoftDepend = () => {
    if (!softDependInput.trim()) return;
    if (plugin.softDepend.includes(softDependInput.trim())) return;
    onUpdate({ softDepend: [...plugin.softDepend, softDependInput.trim()] });
    setSoftDependInput("");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Plugin Metadaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={plugin.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Plugin-Name"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Version</Label>
              <Input
                value={plugin.version}
                onChange={(e) => onUpdate({ version: e.target.value })}
                placeholder="1.0.0"
                className="bg-secondary border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tagline</Label>
              <Input
                value={plugin.tagline}
                onChange={(e) => onUpdate({ tagline: e.target.value })}
                placeholder="Kurze Beschreibung..."
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API-Version</Label>
              <Input
                value={plugin.apiVersion}
                onChange={(e) => onUpdate({ apiVersion: e.target.value })}
                placeholder="1.20"
                className="bg-secondary border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Main Class</Label>
              <Input
                value={plugin.main}
                onChange={(e) => onUpdate({ main: e.target.value })}
                placeholder="com.example.plugin.Main"
                className="bg-secondary border-border font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prefix</Label>
              <Input
                value={plugin.prefix || ""}
                onChange={(e) => onUpdate({ prefix: e.target.value })}
                placeholder="Optional"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Beschreibung</Label>
            <Textarea
              value={plugin.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Ausführliche Beschreibung des Plugins..."
              rows={3}
              className="bg-secondary border-border resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Notizen</Label>
            <Textarea
              value={plugin.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Interne Notizen, TODOs, Ideen..."
              rows={3}
              className="bg-secondary border-border resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Tag hinzufügen..."
              className="bg-secondary border-border"
            />
            <Button onClick={addTag} variant="secondary" size="sm">
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plugin.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Authors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAuthor()}
              placeholder="Author hinzufügen..."
              className="bg-secondary border-border"
            />
            <Button onClick={addAuthor} variant="secondary" size="sm">
              Hinzufügen
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plugin.authors.map((author) => (
              <Badge key={author} variant="secondary" className="gap-1 pr-1">
                {author}
                <button onClick={() => removeAuthor(author)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Dependencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={dependInput}
                onChange={(e) => setDependInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDepend()}
                placeholder="Plugin-Name..."
                className="bg-secondary border-border"
              />
              <Button onClick={addDepend} variant="secondary" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plugin.depend.map((dep) => (
                <Badge key={dep} variant="secondary" className="gap-1 pr-1">
                  {dep}
                  <button
                    onClick={() => onUpdate({ depend: plugin.depend.filter((d) => d !== dep) })}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Soft Dependencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={softDependInput}
                onChange={(e) => setSoftDependInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSoftDepend()}
                placeholder="Plugin-Name..."
                className="bg-secondary border-border"
              />
              <Button onClick={addSoftDepend} variant="secondary" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plugin.softDepend.map((dep) => (
                <Badge key={dep} variant="secondary" className="gap-1 pr-1">
                  {dep}
                  <button
                    onClick={() => onUpdate({ softDepend: plugin.softDepend.filter((d) => d !== dep) })}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}