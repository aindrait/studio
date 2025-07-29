"use client";

import { useState, useEffect } from "react";
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
import { PlusCircle, MoreHorizontal } from "lucide-react";
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

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function fetchModules() {
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
  }

  useEffect(() => {
    fetchModules();
  }, []);

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
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/modules/edit/${module.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(module.id)}>
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
