
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import 'react-quill/dist/quill.snow.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getModule, updateModule, getCategories } from '@/ai/flows/module-crud';
import type { Module, Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { QuillEditor } from '@/components/admin/quill-editor';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [module, setModule] = useState<Module | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      tags: [],
      content: '',
    },
  });

   useEffect(() => {
    if (id) {
      const fetchModuleAndCategories = async () => {
        try {
          setLoading(true);
          const [fetchedModule, fetchedCategories] = await Promise.all([
            getModule(id),
            getCategories()
          ]);
          
          if (fetchedModule) {
            setModule(fetchedModule);
            form.reset({
                name: fetchedModule.name,
                description: fetchedModule.description,
                category: fetchedModule.category,
                tags: fetchedModule.tags,
                content: fetchedModule.content,
            });
          } else {
             toast({ variant: "destructive", title: "Module not found" });
             router.push('/admin/modules');
          }
          setCategories(fetchedCategories);
        } catch (error) {
          toast({ variant: "destructive", title: "Failed to load data" });
        } finally {
          setLoading(false);
        }
      };
      fetchModuleAndCategories();
    }
  }, [id, router, toast, form]);

  const handleAddTag = () => {
    if (tagInput && !form.getValues('tags').includes(tagInput)) {
      form.setValue('tags', [...form.getValues('tags'), tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', form.getValues('tags').filter(tag => tag !== tagToRemove));
  };


  const onSubmit = async (values: FormValues) => {
    if (!module) return;
    try {
        const updatedModuleData = {
            ...module,
            ...values,
        };
      await updateModule(updatedModuleData);
      toast({ title: "Module Updated", description: "The module has been saved successfully." });
      router.push('/admin/modules');
    } catch (error) {
      toast({ variant: "destructive", title: "Update failed", description: "Could not save the module." });
    }
  };

  if (loading) {
    return <p className="p-4">Loading module...</p>;
  }
  
  if (!module) {
    return <p className="p-4">Module not found.</p>;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Edit Module</CardTitle>
            <CardDescription>Update the details for the &quot;{module.name}&quot; module.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Module Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input placeholder="Module Description" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Add a tag"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                     onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
                                </div>
                            </FormControl>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {field.value.map(tag => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                    <button type="button" className="ml-2" onClick={() => handleRemoveTag(tag)}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                                ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Module Manual Content</FormLabel>
                                <FormControl>
                                   <div className="h-96 pb-12">
                                        <QuillEditor {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.push('/admin/modules')}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
};
