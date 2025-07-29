
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from "date-fns";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getModules, updateModule } from '@/ai/flows/module-crud';
import type { Module, Version, VersionChange } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';

const versionChangeSchema = z.object({
  type: z.enum(["new", "improvement", "fix"]),
  description: z.string().min(1, "Description is required"),
});

const formSchema = z.object({
  moduleId: z.string().min(1, "Please select a module."),
  version: z.string().min(1, "Version number is required (e.g., 1.2.3)."),
  changes: z.array(versionChangeSchema).min(1, "At least one change is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VersionsPage() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleId: '',
      version: '',
      changes: [{ type: 'improvement', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "changes",
  });

  useEffect(() => {
    async function fetchModulesData() {
      try {
        setLoading(true);
        const fetchedModules = await getModules();
        setModules(fetchedModules);
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to load modules" });
      } finally {
        setLoading(false);
      }
    }
    fetchModulesData();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    const targetModule = modules.find(m => m.id === values.moduleId);
    if (!targetModule) {
      toast({ variant: "destructive", title: "Module not found" });
      return;
    }

    const newVersion: Version = {
      version: values.version,
      date: format(new Date(), "yyyy-MM-dd"),
      changes: values.changes,
    };

    const updatedModule = {
      ...targetModule,
      versions: [newVersion, ...targetModule.versions],
    };

    try {
      await updateModule(updatedModule);
      toast({ title: "Version Added", description: `Successfully added v${values.version} to ${targetModule.name}.` });
      form.reset({
        moduleId: '',
        version: '',
        changes: [{ type: 'improvement', description: '' }],
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not add the new version." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Version</CardTitle>
        <CardDescription>Add a new version or changelog entry to an existing module.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a module..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1.2.3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Changes</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1">
                      <FormField
                        control={form.control}
                        name={`changes.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="sr-only">Change Type</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="improvement">Improvement</SelectItem>
                                <SelectItem value="fix">Fix</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`changes.${index}.description`}
                        render={({ field }) => (
                           <FormItem className="md:col-span-4">
                              <FormLabel className="sr-only">Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the change..." {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                       className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ type: 'improvement', description: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Change
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Version"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
