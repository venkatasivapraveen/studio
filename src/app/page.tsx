import RetirementPlanner from "@/components/retirement-planner";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline sm:text-5xl md:text-6xl">
          Retirement Planner
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Enter your financial details to project your retirement savings and get personalized AI-powered advice.
        </p>
      </div>
      <RetirementPlanner />
    </main>
  );
}
