'use server';

/**
 * @fileOverview Generates a table of contents for module documentation, summarizing sections with missing headers.
 *
 * - generateTableOfContents - A function that generates a table of contents for module documentation.
 * - GenerateTableOfContentsInput - The input type for the generateTableOfContents function.
 * - GenerateTableOfContentsOutput - The return type for the generateTableOfContents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTableOfContentsInputSchema = z.object({
  documentationContent: z
    .string()
    .describe('The module documentation content to generate a table of contents for.'),
});
export type GenerateTableOfContentsInput = z.infer<typeof GenerateTableOfContentsInputSchema>;

const GenerateTableOfContentsOutputSchema = z.object({
  tableOfContents: z
    .string()
    .describe('The generated table of contents for the module documentation.'),
});
export type GenerateTableOfContentsOutput = z.infer<typeof GenerateTableOfContentsOutputSchema>;

export async function generateTableOfContents(
  input: GenerateTableOfContentsInput
): Promise<GenerateTableOfContentsOutput> {
  return generateTableOfContentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTableOfContentsPrompt',
  input: {schema: GenerateTableOfContentsInputSchema},
  output: {schema: GenerateTableOfContentsOutputSchema},
  prompt: `You are an expert technical writer. Generate a table of contents for the following module documentation. Summarize sections with missing headers.

Documentation Content: {{{documentationContent}}}`,
});

const generateTableOfContentsFlow = ai.defineFlow(
  {
    name: 'generateTableOfContentsFlow',
    inputSchema: GenerateTableOfContentsInputSchema,
    outputSchema: GenerateTableOfContentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
