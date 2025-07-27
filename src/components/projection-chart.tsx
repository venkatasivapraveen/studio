'use client';

import type { ProjectionEntry } from "@/lib/types";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectionChartProps {
  data: ProjectionEntry[];
}

export default function ProjectionChart({ data }: ProjectionChartProps) {
    const formatTooltipCurrency = (value: number) => {
        return value.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR'
        }).replace('₹', '₹ ');
    };
    
    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                        dataKey="year" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                    />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${value} L`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                        }}
                        labelStyle={{
                           color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)} Lacs`, undefined]}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Line type="monotone" dataKey="closingBalance" name="Closing Balance (Lacs)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="yearlyExpenses" name="Yearly Expenses (Lacs)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
