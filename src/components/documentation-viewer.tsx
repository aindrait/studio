
"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Module } from "@/lib/types";
import {
  ArrowUpCircle,
  FileText,
  PlusCircle,
  Tag,
  Wrench,
  BookOpen,
} from "lucide-react";
import Image from "next/image";

interface DocumentationViewerProps {
  module: Module | null;
}

const versionIcons = {
  new: <PlusCircle className="h-4 w-4 text-green-500" />,
  improvement: <ArrowUpCircle className="h-4 w-4 text-blue-500" />,
  fix: <Wrench className="h-4 w-4 text-orange-500" />,
};

export function DocumentationViewer({ module }: DocumentationViewerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!module) {
    return (
      <Card className="flex flex-col items-center justify-center text-center p-8 h-[calc(100vh-10rem)]">
        <CardHeader>
          <div className="mx-auto bg-primary/20 p-4 rounded-full">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">
            Welcome to ModuleMaestro
          </CardTitle>
          <CardDescription>
            Select a module from the sidebar to view its documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can search for modules by name, description, or tags.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              {module.name}
            </CardTitle>
            <CardDescription>{module.description}</CardDescription>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {module.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {module.image && (
              <div className="mb-6">
                <Image
                  src={module.image}
                  alt={module.name}
                  width={800}
                  height={400}
                  className="rounded-lg border object-cover"
                  data-ai-hint="abstract illustration"
                />
              </div>
            )}
            {isClient && (
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: module.content }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">
              Version History
            </CardTitle>
            <CardDescription>
              Updates, improvements, and fixes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {module.versions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                {module.versions.map((version) => (
                    <AccordionItem
                    key={version.version}
                    value={`item-${version.version}`}
                    >
                    <AccordionTrigger>
                        <div className="flex flex-col items-start">
                        <span className="font-semibold">v{version.version}</span>
                        <span className="text-xs text-muted-foreground">
                            {version.date}
                        </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-2">
                        {version.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-3">
                            <div className="mt-1">
                                {versionIcons[change.type]}
                            </div>
                            <span className="text-sm">{change.description}</span>
                            </li>
                        ))}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
             ) : (
                <p className="text-sm text-center text-muted-foreground py-4">No version history found.</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
