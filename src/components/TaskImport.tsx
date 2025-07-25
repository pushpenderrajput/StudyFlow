"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ClipboardPaste, Loader2 } from "lucide-react";
import { handleImport } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/lib/types";

interface TaskImportProps {
  onTasksImported: (tasks: Omit<Task, 'id' | 'completed'>[]) => void;
}

export function TaskImport({ onTasksImported }: TaskImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleTextChange = (e: React.ChangeEvent<Textarea>) => {
    setText(e.target.value);
  };

  const handleSubmit = async (type: 'file' | 'text') => {
    setIsLoading(true);

    let result;
    if (type === 'file' && file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (loadEvent) => {
        const dataUri = loadEvent.target?.result as string;
        result = await handleImport({ source: { type: 'file', dataUri }});
        processResult(result);
      };
      reader.onerror = () => {
        processResult({ success: false, tasks: [], error: "Failed to read file."});
      }
    } else if (type === 'text' && text.trim().length > 0) {
      result = await handleImport({ source: { type: 'text', content: text } });
      processResult(result);
    } else {
        processResult({ success: false, tasks: [], error: "No content provided."});
    }
  };

  const processResult = (result: { success: boolean; tasks: Omit<Task, 'id' | 'completed'>[]; error?: string }) => {
     if (result.success) {
      onTasksImported(result.tasks);
      toast({
        title: "Success!",
        description: `Imported ${result.tasks.length} tasks.`,
      });
      setFile(null);
      setText("");
      setOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Import Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Study Plan</DialogTitle>
          <DialogDescription>
            Upload a file or paste text to automatically extract tasks and deadlines.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file"><Upload className="mr-2 h-4 w-4" /> File</TabsTrigger>
            <TabsTrigger value="paste"><ClipboardPaste className="mr-2 h-4 w-4" /> Paste</TabsTrigger>
          </TabsList>
          <TabsContent value="file">
            <div className="grid gap-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="study-plan-file">PDF or TXT File</Label>
                <Input id="study-plan-file" type="file" accept=".pdf,.txt" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSubmit('file')} disabled={isLoading || !file}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import from File
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="paste">
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="study-plan-text">Paste your plan</Label>
                <Textarea placeholder="Paste your study plan text here." id="study-plan-text" value={text} onChange={handleTextChange} rows={8}/>
              </div>
            </div>
             <DialogFooter>
              <Button onClick={() => handleSubmit('text')} disabled={isLoading || !text.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import from Text
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
