// src/ai/flows/generate-personalized-advice.ts
'use server';

/**
 * @fileOverview Provides personalized advice on adjusting investment allocations for retirement planning.
 *
 * - generatePersonalizedAdvice - A function that generates personalized advice based on retirement plan data.
 * - PersonalizedAdviceInput - The input type for the generatePersonalizedAdvice function.
 * - PersonalizedAdviceOutput - The return type for the generatePersonalizedAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAdviceInputSchema = z.object({
  inflationRate: z.number().describe('The inflation rate in percentage.'),
  retirementCorpus: z.number().describe('The retirement corpus in Lacs.'),
  debtFundYield: z.number().describe('The yield from debt fund in percentage.'),
  passiveMFYield: z.number().describe('The yield from passive MF in percentage.'),
  hybridMFYield: z.number().describe('The yield from hybrid MF in percentage.'),
  yearsPlanned: z.number().describe('The number of years for the retirement plan.'),
  debtFundAllocation: z.number().describe('The percentage of investment in debt fund.'),
  passiveMFAllocation: z.number().describe('The percentage of investment in passive MF.'),
  hybridMFAllocation: z.number().describe('The percentage of investment in hybrid MF.'),
  yearlyExpenses: z.number().describe('The yearly expenses in Lacs.'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const PersonalizedAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized advice on adjusting investment allocations.'),
});
export type PersonalizedAdviceOutput = z.infer<typeof PersonalizedAdviceOutputSchema>;

export async function generatePersonalizedAdvice(input: PersonalizedAdviceInput): Promise<PersonalizedAdviceOutput> {
  return generatePersonalizedAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedAdvicePrompt',
  input: {schema: PersonalizedAdviceInputSchema},
  output: {schema: PersonalizedAdviceOutputSchema},
  prompt: `You are a financial advisor specializing in retirement planning. Based on the following retirement plan data, provide personalized advice on adjusting investment allocations to optimize the plan.

Retirement Plan Data:
- Inflation Rate: {{inflationRate}}%
- Retirement Corpus: {{retirementCorpus}} Lacs
- Debt Fund Yield: {{debtFundYield}}%
- Passive MF Yield: {{passiveMFYield}}%
- Hybrid MF Yield: {{hybridMFYield}}%
- Years Planned: {{yearsPlanned}} years
- Debt Fund Allocation: {{debtFundAllocation}}%
- Passive MF Allocation: {{passiveMFAllocation}}%
- Hybrid MF Allocation: {{hybridMFAllocation}}%
- Yearly Expenses: {{yearlyExpenses}} Lacs

Consider the user's goal to optimize their retirement plan and provide specific, actionable advice on whether they should adjust their investment allocations in debt funds, passive MFs, and hybrid MFs. Explain the reasoning behind your advice.
`,
});

const generatePersonalizedAdviceFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedAdviceFlow',
    inputSchema: PersonalizedAdviceInputSchema,
    outputSchema: PersonalizedAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
