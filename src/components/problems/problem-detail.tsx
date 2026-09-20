"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Markdown } from "~/components/markdown/markdown";
import SolutionEditor from "~/components/workspace/solution-editor";
import { ProblemReactionButtons } from "~/components/problems/problem-reaction-buttons";
import { api } from "~/trpc/react";

type ProblemDetailProps = {
  slug: string;
};

export function ProblemDetail({ slug }: Readonly<ProblemDetailProps>) {
  const { data: problem, isLoading, error } = api.problem.bySlug.useQuery({
    slug,
  });

  const versionOptions = useMemo(
    () =>
      (problem?.availableLanguages ?? []).flatMap((language) =>
        language.versions.map((version) => ({
          id: version.id,
          label: `${language.name} (${version.version})`,
          languageName: language.name,
        })),
      ),
    [problem],
  );

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!selectedVersionId && versionOptions[0]) {
      setSelectedVersionId(versionOptions[0].id);
    }
  }, [versionOptions, selectedVersionId]);

  const { data: setup } = api.problem.setup.useQuery(
    { slug, languageVersionId: Number(selectedVersionId) },
    { enabled: !!selectedVersionId },
  );

  const [code, setCode] = useState("");

  useEffect(() => {
    setCode(setup?.initialCode ?? "");
  }, [setup]);

  if (error?.data?.code === "NOT_FOUND") notFound();

  if (isLoading || !problem) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const selectedLanguageName = versionOptions.find(
    (v) => v.id === selectedVersionId,
  )?.languageName;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <Badge variant="secondary">{problem.difficultyTier}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
            <ProblemReactionButtons problemId={problem.id} />
          </div>
        </div>

        <Markdown content={problem.question} />

        {problem.publicTestCases.length > 0 ? (
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold">Example test cases</h2>
            {problem.publicTestCases.map((testCase) => (
              <div
                key={testCase.name}
                className="bg-muted/40 rounded-md border p-3 text-sm"
              >
                <p className="mb-2 font-medium">{testCase.name}</p>
                <p>
                  <span className="text-muted-foreground">Input: </span>
                  {testCase.inputs.map((i) => i.value).join(", ")}
                </p>
                <p>
                  <span className="text-muted-foreground">Output: </span>
                  {testCase.expectedOutputs.map((o) => o.value).join(", ")}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <Select
          value={selectedVersionId ?? undefined}
          onValueChange={setSelectedVersionId}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {versionOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-[500px] overflow-hidden rounded-md border">
          <SolutionEditor
            languageName={selectedLanguageName}
            value={code}
            onChange={setCode}
          />
        </div>
      </div>
    </div>
  );
}
