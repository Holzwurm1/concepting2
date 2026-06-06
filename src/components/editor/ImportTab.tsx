import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Check, AlertCircle, Terminal, Shield } from "lucide-react";
import { detectFormat, parseText, mergePluginData } from "@/lib/pluginParser";
import type { PluginData } from "@/types/plugin";

interface ImportTabProps {
  plugin: PluginData;
  onUpdate: (data: Partial<PluginData>) => void;
}

export function ImportTab({ plugin, onUpdate }: ImportTabProps) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Partial<PluginData> | null>(null);
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [imported, setImported] = useState(false);

  const handleDetect = useCallback(() => {
    if (!text.trim()) {
      setPreview(null);
      return;
    }
    const parsed = parseText(text);
    setPreview(parsed);
  }, [text]);

  const handleImport = () => {
    if (!preview) return;
    const merged = mergePluginData(plugin, preview, mode);
    onUpdate(merged);
    setImported(true);
    setTimeout(() => setImported(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      const parsed = parseText(content);
      setPreview(parsed);
    };
    reader.readAsText(file);
  };

  const detectedFormat = text.trim() ? detectFormat(text) : null;

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Text Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-2" asChild>
              <label>
                <Upload className="w-4 h-4" />
                Datei laden
                <input type="file" className="hidden" accept=".md,.txt,.yml,.json" onChange={handleFileUpload} />
              </label>
            </Button>
            {detectedFormat && (
              <Badge variant="outline" className="text-xs">
                Format: {detectedFormat.toUpperCase()}
              </Badge>
            )}
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste deine plugin.yml, Markdown-Spec, JSON oder Freitext hier..."
            rows={10}
            className="bg-secondary border-border font-mono text-sm resize-none"
          />

          <div className="flex items-center gap-4">
            <Button onClick={handleDetect} variant="secondary" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            {imported && (
              <span className="text-xs text-primary flex items-center gap-1">
                <Check className="w-3 h-3" />
                Importiert!
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {preview.name && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-mono">{preview.name}</span>
                </div>
              )}
              {preview.version && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground font-mono">{preview.version}</span>
                </div>
              )}
              {preview.author && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Author</span>
                  <span className="text-foreground font-mono">{preview.author}</span>
                </div>
              )}
              {preview.main && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Main</span>
                  <span className="text-foreground font-mono">{preview.main}</span>
                </div>
              )}
              {preview.apiVersion && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">API</span>
                  <span className="text-foreground font-mono">{preview.apiVersion}</span>
                </div>
              )}
              {preview.commands && preview.commands.length > 0 && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Commands</span>
                  <span className="text-foreground font-mono">{preview.commands.length}</span>
                </div>
              )}
              {preview.permissions && preview.permissions.length > 0 && (
                <div className="flex justify-between bg-secondary rounded px-2 py-1">
                  <span className="text-muted-foreground">Permissions</span>
                  <span className="text-foreground font-mono">{preview.permissions.length}</span>
                </div>
              )}
            </div>

            {preview.commands && preview.commands.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <Terminal className="w-3.5 h-3.5" />
                  Commands ({preview.commands.length})
                </div>
                <ScrollArea className="h-40 rounded border border-border bg-secondary/50">
                  <div className="p-2 space-y-1">
                    {preview.commands.map((cmd) => (
                      <div key={cmd.id} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-background/50">
                        <code className="text-primary font-mono">/{cmd.name}</code>
                        <span className="text-muted-foreground truncate max-w-[180px]">{cmd.description || "—"}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {preview.permissions && preview.permissions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <Shield className="w-3.5 h-3.5" />
                  Permissions ({preview.permissions.length})
                </div>
                <ScrollArea className="h-40 rounded border border-border bg-secondary/50">
                  <div className="p-2 space-y-1">
                    {preview.permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-background/50">
                        <code className="text-primary font-mono">{perm.name}</code>
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{perm.default}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Import-Modus</Label>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as "merge" | "replace")} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="merge" id="merge" />
                  <Label htmlFor="merge" className="text-xs">Merge (anhängen)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="text-xs">Replace (überschreiben)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleImport} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Import übernehmen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}