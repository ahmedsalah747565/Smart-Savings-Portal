import { Separator } from "@/components/ui/separator";

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 px-4 text-center">
        <div className="container max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold">The Retail Rebellion</h1>
          <p className="text-xl opacity-90 leading-relaxed">
            We're not just selling products. We're dismantling an outdated system that overcharges you for a brand name.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl mx-auto space-y-8 text-lg leading-relaxed text-muted-foreground">
          <h2 className="text-3xl font-heading font-bold text-foreground">The Problem: The Middleman Markup</h2>
          <p>
            Traditionally, a product travels from a factory, to a sourcing agent, to a brand headquarters, to a distributor, and finally to a retail store. 
            At every step, someone adds a markup. By the time it reaches you, you're paying 8x-10x what it cost to make.
          </p>
          <p>
            You aren't paying for quality. You're paying for their marketing, their real estate, and their inefficiency.
          </p>
          
          <Separator className="my-8" />
          
          <h2 className="text-3xl font-heading font-bold text-foreground">Our Solution: Direct from Source</h2>
          <p>
            Win-Store goes directly to the world's best manufacturers—the same ones producing for luxury brands. 
            We buy directly from them and sell directly to you.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground font-medium">
            <li>No sourcing agents.</li>
            <li>No brand markups.</li>
            <li>No physical retail overhead.</li>
          </ul>
          <p>
            Just honest, premium quality goods at fair prices. That's a win for the factory, and a win for you.
          </p>
        </div>
      </section>
    </div>
  );
}
