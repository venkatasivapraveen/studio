'use client';

import type { ProjectionEntry } from "@/lib/types";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPassive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorHybrid" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
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
                        stackAll
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
                        formatter={(value: number, name: string) => [`${value.toFixed(2)} Lacs`, name]}
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}}/>
                    <Area type="monotone" dataKey="debtFundBalance" name="Debt Fund" stackId="1" stroke="hsl(var(--chart-1))" fill="url(#colorDebt)" />
                    <Area type="monotone" dataKey="passiveMFBalance" name="Passive MF" stackId="1" stroke="hsl(var(--chart-2))" fill="url(#colorPassive)" />
                    <Area type="monotone" dataKey="hybridMFBalance" name="Hybrid MF" stackId="1" stroke="hsl(var(--chart-3))" fill="url(#colorHybrid)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}