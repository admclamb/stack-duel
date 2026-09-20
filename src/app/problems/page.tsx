import type { Metadata } from "next";
import SiteLayout from "~/components/layout/site-layout";
import { ProblemsList } from "~/components/problems/problems-list";

export const metadata: Metadata = {
  title: "Problems",
};

export default function ProblemsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 pt-32 pb-24">
        <h1 className="mb-8 text-3xl font-bold">Problems</h1>
        <ProblemsList />
      </div>
    </SiteLayout>
  );
}
