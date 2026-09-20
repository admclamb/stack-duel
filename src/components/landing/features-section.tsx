import { WobbleCard } from "~/components/ui/wobble-card";

export default function FeaturesSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Built to compete</h2>
          <p className="text-muted-foreground mx-auto max-w-xl">
            Everything you need to compete and improve your coding skills.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <WobbleCard containerClassName="lg:col-span-2 bg-pink-600 dark:bg-pink-800 min-h-[16rem]">
            <div className="max-w-sm">
              <h3 className="text-left text-xl font-semibold text-balance text-white md:text-2xl">
                Leaderboards
              </h3>
              <p className="mt-3 text-left text-base text-neutral-300">
                Every match is ranked and judged instantly, so you always know
                where you stand against other developers.
              </p>
            </div>
          </WobbleCard>
          <WobbleCard containerClassName="bg-indigo-600 dark:bg-indigo-900 min-h-[16rem]">
            <h3 className="text-left text-xl font-semibold text-balance text-white md:text-2xl">
              Multiple languages
            </h3>
            <p className="mt-3 text-left text-base text-neutral-300">
              Solve problems in the programming language you already know, and
              rank your favorites in your profile.
            </p>
          </WobbleCard>
          <WobbleCard containerClassName="lg:col-span-3 bg-blue-600 dark:bg-blue-900 min-h-[16rem]">
            <div className="max-w-sm">
              <h3 className="text-left text-xl font-semibold text-balance text-white md:text-2xl">
                Competitive games
              </h3>
              <p className="mt-3 text-left text-base text-neutral-300">
                Battle head-to-head, join a free-for-all lobby, or race solo
                against the clock.
              </p>
            </div>
          </WobbleCard>
        </div>
      </div>
    </section>
  );
}
