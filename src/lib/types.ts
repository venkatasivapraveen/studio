import { z } from "zod";

export const RetirementPlanFormSchema = z.object({
  inflationRate: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  retirementCorpus: z.coerce.number().min(0, "Cannot be negative"),
  debtFundYield: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  passiveMFYield: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  hybridMFYield: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  yearsPlanned: z.coerce.number().int().min(1, "Must be at least 1 year").max(100, "Cannot exceed 100"),
  debtFundAllocation: z.coerce.number().min(0).max(100),
  passiveMFAllocation: z.coerce.number().min(0).max(100),
  hybridMFAllocation: z.coerce.number().min(0).max(100),
  yearlyExpenses: z.coerce.number().min(0, "Cannot be negative"),
}).refine(data => data.debtFundAllocation + data.passiveMFAllocation + data.hybridMFAllocation === 100, {
  message: "Total allocation must be exactly 100%",
  path: ["hybridMFAllocation"], // Field to display the error under
});

export type RetirementPlanFormData = z.infer<typeof RetirementPlanFormSchema>;

export interface ProjectionEntry {
  year: number;
  openingBalance: number;
  yearlyExpenses: number;
  closingBalance: number;
  debtFundBalance: number;
  passiveMFBalance: number;
  hybridMFBalance: number;
  totalInterest: number;
}