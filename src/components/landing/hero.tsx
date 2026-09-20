import Link from "next/link";
import { Button } from "~/components/ui/button";
import { BackgroundRippleEffect } from "~/components/ui/background-ripple-effect";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden">
      <BackgroundRippleEffect />
      <article className="relative z-10 flex flex-col items-center gap-5 px-4 py-34 text-center">
        <span className="bg-background/60 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm shadow-lg backdrop-blur-md">
          <span
            className="bg-primary size-1.5 rounded-full"
            aria-hidden="true"
          />{" "}
          Alpha Release
        </span>
        <h1 className="max-w-[25ch] text-3xl font-bold md:text-4xl lg:text-6xl">
          Stop Coding Alone
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl">
          Turn practicing data structures and algorithms into a battle. Go
          head-to-head with other developers, race to solve coding challenges,
          and climb the ranks to prove your skill.
        </p>
        <ul className="flex items-center gap-3">
          <li>
            <Button asChild size="lg" className="w-40">
              <Link href="/sign-up">Play Now</Link>
            </Button>
          </li>
        </ul>
      </article>
    </div>
  );
}
