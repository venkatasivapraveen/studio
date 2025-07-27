'use client';

import type { ProjectionEntry } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProjectionTableProps {
  data: ProjectionEntry[];
}

export default function ProjectionTable({ data }: ProjectionTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  };

  const firstDepletedYear = data.find(d => d.closingBalance <= 0)?.year;

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        {firstDepletedYear && (
            <TableCaption>
              Your corpus is projected to be depleted in year {firstDepletedYear}.
            </TableCaption>
        )}
        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[60px]">Year</TableHead>
            <TableHead className="text-right">Opening (L)</TableHead>
            <TableHead className="text-right text-green-500">Interest (L)</TableHead>
            <TableHead className="text-right text-red-500">Expense (L)</TableHead>
            <TableHead className="text-right">Closing (L)</TableHead>
            <TableHead className="text-right">Debt (L)</TableHead>
            <TableHead className="text-right">Passive MF (L)</TableHead>
            <TableHead className="text-right">Hybrid MF (L)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.year} className={cn(entry.closingBalance <= 0 && "bg-destructive/10")}>
              <TableCell className="font-medium">{entry.year}</TableCell>
              <TableCell className="text-right">{formatCurrency(entry.openingBalance)}</TableCell>
              <TableCell className="text-right text-green-600 dark:text-green-500">{formatCurrency(entry.totalInterest)}</TableCell>
              <TableCell className="text-right text-red-600 dark:text-red-500">{formatCurrency(entry.yearlyExpenses)}</TableCell>
              <TableCell className={cn("text-right font-semibold", entry.closingBalance <= 0 && "text-destructive")}>
                {formatCurrency(entry.closingBalance)}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(entry.debtFundBalance)}</TableCell>
              <TableCell className="text-right">{formatCurrency(entry.passiveMFBalance)}</TableCell>
              <TableCell className="text-right">{formatCurrency(entry.hybridMFBalance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
