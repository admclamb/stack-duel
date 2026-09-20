import SiteLayout from "~/components/layout/site-layout";
import { ProblemDetail } from "~/components/problems/problem-detail";

type ProblemPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-24">
        <ProblemDetail slug={slug} />
      </div>
    </SiteLayout>
  );
}
