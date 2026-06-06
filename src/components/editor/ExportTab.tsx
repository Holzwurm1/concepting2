import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check, Package } from "lucide-react";
import { generatePluginYml, generateMarkdownSpec, generateJson } from "@/lib/pluginParser";
import type { PluginData } from "@/types/plugin";
import JSZip from "jszip";

interface ExportTabProps {
  plugin: PluginData;
}

export function ExportTab({ plugin }: ExportTabProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(plugin.name || "plugin");
    if (folder) {
      folder.file("plugin.yml", yml);
      folder.file(`${plugin.name || "plugin"}-spec.md`, md);
      folder.file(`${plugin.name || "plugin"}.json`, json);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${plugin.name || "plugin"}-export.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const yml = generatePluginYml(plugin);
  const md = generateMarkdownSpec(plugin);
  const json = generateJson(plugin);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" className="gap-2" onClick={downloadAllAsZip}>
          <Package className="w-4 h-4" />
          Alles als ZIP herunterladen
        </Button>
      </div>

      <Tabs defaultValue="yml" className="w-full">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="yml" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            plugin.yml
          </TabsTrigger>
          <TabsTrigger value="md" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Markdown
          </TabsTrigger>
          <TabsTrigger value="json" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yml" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">plugin.yml</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => copy(yml, "yml")}
                >
                  {copied === "yml" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "yml" ? "Kopiert" : "Kopieren"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => download(yml, "plugin.yml")}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary rounded-md p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
                {yml}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="md" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Markdown Spec</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => copy(md, "md")}
                >
                  {copied === "md" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "md" ? "Kopiert" : "Kopieren"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => download(md, `${plugin.name || "plugin"}-spec.md`)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary rounded-md p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
                {md}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">JSON (Roundtrip)</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => copy(json, "json")}
                >
                  {copied === "json" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "json" ? "Kopiert" : "Kopieren"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1"
                  onClick={() => download(json, `${plugin.name || "plugin"}.json`)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary rounded-md p-4 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
                {json}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}