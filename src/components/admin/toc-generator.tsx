"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Copy, Check } from "lucide-react";

import { generateTableOfContents } from "@/ai/flows/generate-table-of-contents";

const formSchema = z.object({
  documentationContent: z
    .string()
    .min(50, { message: "Documentation content must be at least 50 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export function TocGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedToc, setGeneratedToc] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentationContent: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedToc("");
    try {
      const result = await generateTableOfContents(values);
      setGeneratedToc(result.tableOfContents);
    } catch (error) {
      console.error("Error generating Table of Contents:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          "There was an error generating the table of contents. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedToc);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">
                AI Table of Contents Generator
              </CardTitle>
              <CardDescription>
                Paste your module documentation below to automatically generate
                a table of contents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="documentationContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter module documentation here..."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate TOC"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Output</CardTitle>
          <CardDescription>
            The generated table of contents will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {generatedToc && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-7 w-7"
              onClick={handleCopy}
            >
              {hasCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
          <pre className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm min-h-[300px] overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Wand2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              generatedToc || "..."
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
