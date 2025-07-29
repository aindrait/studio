
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getModules, deleteModule } from "@/ai/flows/module-crud";
import { Module } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedModules = await getModules();
      setModules(fetchedModules);
    } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch modules",
          description: "Could not load the list of modules.",
        });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);


  const handleDelete = async (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      try {
        await deleteModule(moduleId);
        toast({
          title: "Module Deleted",
          description: "The module has been successfully deleted.",
        });
        fetchModules();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: "Could not delete the module.",
        });
      }
    }
  };

  const handleEdit = (moduleId: string) => {
    router.push(`/admin/modules/edit/${moduleId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Modules</CardTitle>
            <CardDescription>
              Create, edit, and manage your documentation modules.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/modules/new">
              <PlusCircle className="mr-2" />
              New Module
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading modules...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  <TableCell>{module.category}</TableCell>
                  <TableCell>{module.tags.join(", ")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEdit(module.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(module.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
