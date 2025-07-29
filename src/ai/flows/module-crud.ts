'use server';

/**
 * @fileOverview Module CRUD operations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { modules as allModules } from '@/lib/data';
import { Module, ModuleCategory, Version } from '@/lib/types';

const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["Core Systems", "User Interface", "Data Management"]),
  tags: z.array(z.string()),
  description: z.string(),
  content: z.string(),
  image: z.string().optional(),
  versions: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.array(z.object({
      type: z.enum(["new", "improvement", "fix"]),
      description: z.string(),
    })),
  })),
});

export const getModulesFlow = ai.defineFlow(
  {
    name: 'getModulesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(ModuleSchema),
  },
  async () => {
    return allModules;
  }
);

export const getModuleFlow = ai.defineFlow(
  {
    name: 'getModuleFlow',
    inputSchema: z.string(),
    outputSchema: ModuleSchema.optional(),
  },
  async (id) => {
    return allModules.find(m => m.id === id);
  }
);

export const createModuleFlow = ai.defineFlow(
  {
    name: 'createModuleFlow',
    inputSchema: ModuleSchema,
    outputSchema: ModuleSchema,
  },
  async (module) => {
    // In a real app, you'd save this to a database.
    // For this example, we'll just push it to the in-memory array.
    allModules.push(module);
    return module;
  }
);

export const updateModuleFlow = ai.defineFlow(
  {
    name: 'updateModuleFlow',
    inputSchema: ModuleSchema,
    outputSchema: ModuleSchema.optional(),
  },
  async (module) => {
    const index = allModules.findIndex(m => m.id === module.id);
    if (index !== -1) {
      allModules[index] = module;
      return module;
    }
    return undefined;
  }
);

export const deleteModuleFlow = ai.defineFlow(
  {
    name: 'deleteModuleFlow',
    inputSchema: z.string(), // module id
    outputSchema: z.boolean(),
  },
  async (id) => {
    const index = allModules.findIndex(m => m.id === id);
    if (index !== -1) {
      allModules.splice(index, 1);
      return true;
    }
    return false;
  }
);

export async function getModules(): Promise<Module[]> {
    return await getModulesFlow();
}

export async function getModule(id: string): Promise<Module | undefined> {
    return await getModuleFlow(id);
}

export async function createModule(module: Module): Promise<Module> {
    return await createModuleFlow(module);
}

export async function updateModule(module: Module): Promise<Module | undefined> {
    return await updateModuleFlow(module);
}

export async function deleteModule(id: string): Promise<boolean> {
    return await deleteModuleFlow(id);
}
