'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RetirementPlanFormData, ProjectionEntry } from "@/lib/types";
import { RetirementPlanFormSchema } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProjectionTable from "@/components/projection-table";
import ProjectionChart from "@/components/projection-chart";
import { generatePersonalizedAdvice } from "@/ai/flows/generate-personalized-advice";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Bot, Calendar, Landmark, Loader2, Percent, PiggyBank, Save, Trash, TrendingUp, Wallet } from "lucide-react";

const LOCAL_STORAGE_KEY = 'retirement-plan-data';

export default function RetirementPlanner() {
  const [projection, setProjection] = useState<ProjectionEntry[]>([]);
  const [advice, setAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const { toast } = useToast();

  const form = useForm<RetirementPlanFormData>({
    resolver: zodResolver(RetirementPlanFormSchema),
    defaultValues: {
      inflationRate: 6,
      retirementCorpus: 200,
      debtFundYield: 7,
      passiveMFYield: 12,
      hybridMFYield: 13,
      yearsPlanned: 40,
      debtFundAllocation: 50,
      passiveMFAllocation: 20,
      hybridMFAllocation: 30,
      yearlyExpenses: 6,
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const validatedData = RetirementPlanFormSchema.parse(parsedData);
        form.reset(validatedData);
        toast({ title: "Plan Loaded", description: "Your previously saved plan has been loaded." });
      } catch (error) {
        console.error("Failed to load or validate saved plan:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, [form, toast]);


  const calculateProjection = (data: RetirementPlanFormData): ProjectionEntry[] => {
    const results: ProjectionEntry[] = [];
    let openingBalance = data.retirementCorpus;
    let currentYearlyExpenses = data.yearlyExpenses;

    const weightedReturn =
      (data.debtFundAllocation / 100) * (data.debtFundYield / 100) +
      (data.passiveMFAllocation / 100) * (data.passiveMFYield / 100) +
      (data.hybridMFAllocation / 100) * (data.hybridMFYield / 100);

    for (let year = 1; year <= data.yearsPlanned; year++) {
      if (openingBalance <= 0) {
        results.push({ year, openingBalance: 0, investmentReturns: 0, yearlyExpenses: 0, closingBalance: 0 });
        continue;
      }
      
      const investmentReturns = openingBalance * weightedReturn;
      const closingBalance = openingBalance + investmentReturns - currentYearlyExpenses;

      results.push({
        year,
        openingBalance: parseFloat(openingBalance.toFixed(2)),
        investmentReturns: parseFloat(investmentReturns.toFixed(2)),
        yearlyExpenses: parseFloat(currentYearlyExpenses.toFixed(2)),
        closingBalance: parseFloat(closingBalance.toFixed(2)),
      });

      openingBalance = closingBalance > 0 ? closingBalance : 0;
      currentYearlyExpenses *= (1 + data.inflationRate / 100);
    }
    return results;
  };

  const onSubmit = (data: RetirementPlanFormData) => {
    const projectionResult = calculateProjection(data);
    setProjection(projectionResult);
    setAdvice('');
    toast({ title: "Projection Calculated", description: "Your retirement projection is ready." });
  };
  
  const handleGetAdvice = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({ variant: "destructive", title: "Invalid Form", description: "Please fix the errors before getting advice." });
      return;
    }
    setIsLoadingAdvice(true);
    setAdvice('');
    try {
      const values = form.getValues();
      const result = await generatePersonalizedAdvice(values);
      setAdvice(result.advice);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not fetch advice. Please try again later." });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleSavePlan = () => {
    const values = form.getValues();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
    toast({ title: "Plan Saved", description: "Your retirement plan has been saved to this browser." });
  };
  
  const handleReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    form.reset({
      inflationRate: 6, retirementCorpus: 200, debtFundYield: 7, passiveMFYield: 12, hybridMFYield: 13,
      yearsPlanned: 40, debtFundAllocation: 50, passiveMFAllocation: 20, hybridMFAllocation: 30, yearlyExpenses: 6
    });
    setProjection([]);
    setAdvice('');
    toast({ title: "Plan Reset", description: "The form has been reset to default values." });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Financial Inputs</CardTitle>
          <CardDescription>Enter your financial details below.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="retirementCorpus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retirement Corpus (Lacs)</FormLabel>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl><Input type="number" placeholder="200" {...field} className="pl-9" /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="yearlyExpenses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Expenses (Lacs)</FormLabel>
                     <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl><Input type="number" placeholder="6" {...field} className="pl-9" /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="inflationRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inflation Rate (%)</FormLabel>
                     <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl><Input type="number" placeholder="6" {...field} className="pl-9" /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsPlanned" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planning Horizon (Years)</FormLabel>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl><Input type="number" placeholder="40" {...field} className="pl-9" /></FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
               </div>

              <Separator />
              <p className="text-sm font-medium">Fund Allocation & Yields</p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <FormField control={form.control} name="debtFundAllocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Debt Fund (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="50" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="debtFundYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="7" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="passiveMFAllocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passive MF (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="passiveMFYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="hybridMFAllocation" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hybrid MF (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="30" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="hybridMFYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield (%)</FormLabel>
                    <FormControl><Input type="number" placeholder="13" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" size="lg">
                <PiggyBank className="mr-2 h-5 w-5"/> Calculate Projection
              </Button>
              <div className="flex w-full gap-2">
                <Button variant="outline" className="w-full" onClick={handleSavePlan}><Save /> Save</Button>
                <Button variant="ghost" className="w-full" onClick={handleReset}><Trash /> Reset</Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="lg:col-span-3 space-y-8">
        {projection.length > 0 && (
          <Card>
             <CardHeader>
                <CardTitle>Retirement Projection</CardTitle>
                <CardDescription>
                  Your projected retirement funds over {form.getValues('yearsPlanned')} years.
                </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                </TabsList>
                <TabsContent value="table">
                  <ProjectionTable data={projection} />
                </TabsContent>
                <TabsContent value="chart">
                  <ProjectionChart data={projection} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
               <Button onClick={handleGetAdvice} disabled={isLoadingAdvice} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoadingAdvice ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                {isLoadingAdvice ? 'Getting Advice...' : 'Get AI-Powered Advice'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {advice && (
          <Card className="animate-in fade-in-50" key={advice}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot /> Personalized Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{advice}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
