"use client";

import { useState } from "react";
import Link from "next/link";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { LanguageIcon } from "~/components/language/language-icon";
import { api } from "~/trpc/react";

export function ProblemsList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading } = api.problem.list.useQuery({
    page: 1,
    size: 50,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <Input
        placeholder="Search problems..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="divide-border divide-y rounded-md border">
          {data?.results.length ? (
            data.results.map((problem) => (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="hover:bg-muted/50 flex items-center justify-between gap-4 px-4 py-3 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{problem.title}</span>
                  {problem.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {problem.languages.map((language) => (
                      <LanguageIcon
                        key={language.id}
                        slug={language.name.toLowerCase()}
                        name={language.name}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">{problem.difficultyTier}</Badge>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground px-4 py-8 text-center text-sm">
              No problems found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
