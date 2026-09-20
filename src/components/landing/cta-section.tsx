import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

type CtaSectionProps = {
  variant?: "section" | "card";
};

export default function CtaSection({
  variant = "section",
}: Readonly<CtaSectionProps> = {}) {
  const content = (
    <>
      <h2 className="text-2xl font-bold md:text-3xl">Ready to compete?</h2>
      <p className="text-muted-foreground max-w-md">
        Create a free account and jump into your first game in minutes.
      </p>
      <div className="flex items-center gap-3">
        <Button asChild size="lg">
          <Link href="/sign-up">Get Started Free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/problems">Browse Problems</Link>
        </Button>
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center md:p-14">
        {content}
      </Card>
    );
  }

  return (
    <section className="border-t py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center">
        {content}
      </div>
    </section>
  );
}
