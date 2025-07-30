
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getModules, updateModule, getModule } from '@/ai/flows/module-crud';
import type { Module, Version } from '@/lib/types';
import { PlusCircle, Trash2, Pencil, MoreHorizontal, ArrowUpCircle, Wrench } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';


const versionChangeSchema = z.object({
  type: z.enum(["new", "improvement", "fix"]),
  description: z.string().min(1, "Description is required"),
  image: z.string().optional(),
});

const formSchema = z.object({
  moduleId: z.string().min(1, "Please select a module."),
  version: z.string().min(1, "Version number is required (e.g., 1.2.3)."),
  date: z.date({ required_error: "A date is required." }),
  changes: z.array(versionChangeSchema).min(1, "At least one change is required."),
});

type FormValues = z.infer<typeof formSchema>;

const editFormSchema = z.object({
    version: z.string().min(1, "Version number is required."),
    date: z.date({ required_error: "A date is required." }),
    changes: z.array(versionChangeSchema).min(1, "At least one change is required."),
});

type EditFormValues = z.infer<typeof editFormSchema>;

const versionIcons = {
  new: <PlusCircle className="h-4 w-4 text-green-500" />,
  improvement: <ArrowUpCircle className="h-4 w-4 text-blue-500" />,
  fix: <Wrench className="h-4 w-4 text-orange-500" />,
};

export default function VersionsPage() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleId: '',
      version: '',
      date: new Date(),
      changes: [{ type: 'improvement', description: '', image: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "changes",
  });

  // Form for editing a version
  const editForm = useForm<EditFormValues>({
     resolver: zodResolver(editFormSchema),
     defaultValues: {
      version: '',
      date: new Date(),
      changes: [],
    },
  });

  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
      control: editForm.control,
      name: "changes"
  });

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

  useEffect(() => {
    fetchModulesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleModuleSelect = (moduleId: string) => {
    form.setValue('moduleId', moduleId);
    const module = modules.find(m => m.id === moduleId);
    setSelectedModule(module || null);
  }

  const onSubmit = async (values: FormValues) => {
    const targetModule = modules.find(m => m.id === values.moduleId);
    if (!targetModule) {
      toast({ variant: "destructive", title: "Module not found" });
      return;
    }

    const newVersion: Version = {
      version: values.version,
      date: format(values.date, "yyyy-MM-dd"),
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
        moduleId: values.moduleId,
        version: '',
        date: new Date(),
        changes: [{ type: 'improvement', description: '', image: '' }],
      });
      await fetchModulesData(); // Refetch to update the list
      const updatedMod = await getModules().then(mods => mods.find(m => m.id === values.moduleId));
      setSelectedModule(updatedMod || null);
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not add the new version." });
    }
  };

  const handleOpenEditDialog = (version: Version) => {
    setEditingVersion(version);
    editForm.reset({
        version: version.version,
        date: new Date(version.date), // Make sure date string is converted to Date object
        changes: version.changes
    });
    setIsEditDialogOpen(true);
  }
  
  const handleEditSubmit = async (values: EditFormValues) => {
    if (!selectedModule || !editingVersion) return;

    const updatedVersion: Version = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
    };

    const updatedVersions = selectedModule.versions.map(v => 
      v.version === editingVersion.version ? updatedVersion : v
    );

    const updatedModule = {
      ...selectedModule,
      versions: updatedVersions,
    };

     try {
      await updateModule(updatedModule);
      toast({ title: "Version Updated" });
      setIsEditDialogOpen(false);
      setEditingVersion(null);
      await fetchModulesData();
      const updatedMod = await getModules().then(mods => mods.find(m => m.id === selectedModule.id));
      setSelectedModule(updatedMod || null);
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  }

  const confirmDeleteVersion = (versionNumber: string) => {
    setVersionToDelete(versionNumber);
    setIsAlertOpen(true);
  };
  
  const handleDeleteVersion = async () => {
    if (!selectedModule || !versionToDelete) return;

    const updatedVersions = selectedModule.versions.filter(v => v.version !== versionToDelete);
    const updatedModule = { ...selectedModule, versions: updatedVersions };

    try {
      await updateModule(updatedModule);
      toast({ title: "Version Deleted" });
      await fetchModulesData();
      const reloadedModule = await getModule(selectedModule.id);
      setSelectedModule(reloadedModule || null);
    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the version." });
    } finally {
        setIsAlertOpen(false);
        setVersionToDelete(null);
    }
  };


  return (
    <div className="space-y-8">
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
                    <Select onValueChange={handleModuleSelect} value={field.value} disabled={loading}>
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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Release Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
                        <div className="md:col-span-4 space-y-4">
                            <FormField
                            control={form.control}
                            name={`changes.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">Description</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="Describe the change..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                             <FormField
                              control={form.control}
                              name={`changes.${index}.image`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="sr-only">Image URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Optional image URL (e.g. https://placehold.co/400.png)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
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
                  onClick={() => append({ type: 'improvement', description: '', image: '' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Change
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting || !selectedModule}>
                {form.formState.isSubmitting ? "Saving..." : "Save Version"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {selectedModule && (
        <Card>
            <CardHeader>
                <CardTitle>Existing Versions for {selectedModule.name}</CardTitle>
                <CardDescription>View, edit, or delete existing versions for this module.</CardDescription>
            </CardHeader>
            <CardContent>
                {selectedModule.versions.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                    {selectedModule.versions.map((version) => (
                        <AccordionItem key={version.version} value={`item-${version.version}`}>
                            <div className="flex items-center justify-between w-full">
                                <AccordionTrigger className="flex-1">
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold">v{version.version}</span>
                                        <span className="text-xs text-muted-foreground">{version.date}</span>
                                    </div>
                                </AccordionTrigger>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="mr-2">
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleOpenEditDialog(version)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => confirmDeleteVersion(version.version)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <AccordionContent>
                                <ul className="space-y-2 pl-2">
                                    {version.changes.map((change, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {versionIcons[change.type]}
                                            </div>
                                             <div>
                                                <p>{change.description}</p>
                                                 {change.image && (
                                                    <img src={change.image} alt="Changelog image" className="mt-2 rounded-md border max-w-xs" />
                                                 )}
                                              </div>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                ) : (
                    <p className="text-muted-foreground text-center">No versions found for this module.</p>
                )}
            </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Version {editingVersion?.version}</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={editForm.control}
                        name="version"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Version Number</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                      control={editForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Release Date</FormLabel>
                           <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div>
                    <FormLabel>Changes</FormLabel>
                    <div className="space-y-4 mt-2">
                        {editFields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-4 p-4 border rounded-md">
                           <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1">
                             <FormField
                                control={editForm.control}
                                name={`changes.${index}.type`}
                                render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="sr-only">Change Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="improvement">Improvement</SelectItem>
                                            <SelectItem value="fix">Fix</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                                )}
                            />
                            <div className="md:col-span-4 space-y-4">
                                <FormField
                                    control={editForm.control}
                                    name={`changes.${index}.description`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the change..." {...field} />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={editForm.control}
                                    name={`changes.${index}.image`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional image URL" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                           </div>
                           <Button type="button" variant="destructive" size="icon" onClick={() => editRemove(index)} className="mt-1">
                               <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => editAppend({ type: 'improvement', description: '', image: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Change
                    </Button>
                </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete version
                      &quot;{versionToDelete}&quot; from {selectedModule?.name}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteVersion}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
    
