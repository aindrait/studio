
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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAppSettings, updateAppSettings } from "@/ai/flows/module-crud";
import type { AppSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/session-client";

const settingsSchema = z.object({
  appName: z.string().min(1, "App name is required."),
  appSubtitle: z.string().optional(),
});

type FormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { session, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isEditor = session?.role === 'editor';

  const form = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: "",
      appSubtitle: "",
    },
  });

  async function fetchSettings() {
    if (isEditor) return;
    try {
      setLoading(true);
      const fetchedSettings = await getAppSettings();
      if (fetchedSettings) {
        form.reset(fetchedSettings);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch settings",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading) {
        fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, isEditor]);

  const onSubmit = async (values: FormValues) => {
    if (isEditor) return;
    try {
      await updateAppSettings(values);
      toast({ title: "Settings Updated", description: "Your application settings have been saved." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    }
  };

  if (sessionLoading || loading) {
    return <p>Loading settings...</p>;
  }

  if (isEditor) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>You do not have permission to manage application settings.</CardDescription>
              </CardHeader>
          </Card>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Application Settings</CardTitle>
            <CardDescription>
              Manage general application settings and branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mukti Manual System" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appSubtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., MDS Plantation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
