
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "@/ai/flows/module-crud";
import { AdminUser } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().optional(),
  role: z.enum(["admin", "editor"]),
});

const editUserSchema = userSchema.extend({
    password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});


export default function UsersPage() {
  const [users, setUsers] = useState<Omit<AdminUser, 'password'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Omit<AdminUser, 'password'> | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Omit<AdminUser, 'password'> | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "editor",
    },
  });

  const editForm = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
        username: "",
        password: "",
        role: "editor",
    },
  });

  async function fetchUsers() {
    try {
      setLoading(true);
      const fetchedUsers = await getAdminUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user: Omit<AdminUser, 'password'> | null = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      editForm.reset({ username: user.username, role: user.role, password: "" });
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (values: z.infer<typeof userSchema>) => {
    try {
      if (isEditing && currentUser) {
         // In edit mode, password is optional. If not provided, it's not updated.
         const updateData: any = { ...currentUser, username: values.username, role: values.role };
         if (values.password) {
             updateData.password = values.password;
         }
        await updateAdminUser(updateData);
        toast({ title: "User Updated" });
      } else {
        if (!values.password || values.password.length < 6) {
             form.setError("password", { message: "Password must be at least 6 characters." });
             return;
        }
        await createAdminUser(values as Omit<AdminUser, 'id'>);
        toast({ title: "User Created" });
      }
      fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    }
  };

  const confirmDelete = (user: Omit<AdminUser, 'password'>) => {
    setUserToDelete(user);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === "user-root") {
        toast({ variant: "destructive", title: "Cannot delete root admin."});
        setIsAlertOpen(false);
        return;
    }
    try {
      await deleteAdminUser(userToDelete.id);
      toast({ title: "User Deleted" });
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message,
      });
    } finally {
      setIsAlertOpen(false);
      setUserToDelete(null);
    }
  };
  

  const DialogForm = isEditing ? editForm : form;
  const schema = isEditing ? editUserSchema : userSchema;
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline">Users</CardTitle>
              <CardDescription>
                Manage administrator and editor accounts.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2" />
              New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {user.id !== "user-root" && (
                            <DropdownMenuItem onClick={() => confirmDelete(user)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <form onSubmit={DialogForm.handleSubmit(handleSave)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "New User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                {...DialogForm.register("username")}
                className="col-span-3"
              />
            </div>
             {DialogForm.formState.errors.username && <p className="col-span-4 text-right text-sm text-destructive">{DialogForm.formState.errors.username.message}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...DialogForm.register("password")}
                className="col-span-3"
                placeholder={isEditing ? "Leave blank to keep current" : ""}
              />
            </div>
             {DialogForm.formState.errors.password && <p className="col-span-4 text-right text-sm text-destructive">{DialogForm.formState.errors.password.message}</p>}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Select onValueChange={(value) => DialogForm.setValue('role', value as 'admin' | 'editor')} defaultValue={DialogForm.getValues('role')}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the user
                      &quot;{userToDelete?.username}&quot;.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
