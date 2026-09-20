"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { api } from "~/trpc/react";

const LIKE_KEY = "like";
const DISLIKE_KEY = "dislike";

type ProblemReactionButtonsProps = {
  problemId: number;
  className?: string;
};

export function ProblemReactionButtons({
  problemId,
  className,
}: Readonly<ProblemReactionButtonsProps>) {
  const { isSignedIn } = useAuth();
  const hasMounted = useHasMounted();
  const utils = api.useUtils();
  const { data } = api.problem.reactionSummary.useQuery({ problemId });
  const mutation = api.problem.setReaction.useMutation({
    onSuccess: (summary) => {
      utils.problem.reactionSummary.setData({ problemId }, summary);
    },
    onError: () =>
      toast.error("Couldn't update your reaction. Please try again."),
  });

  const counts = data?.counts ?? [];
  const currentUserReactionKey = data?.currentUserReactionKey ?? null;
  const likeCount = counts.find((c) => c.key === LIKE_KEY)?.count ?? 0;
  const dislikeCount = counts.find((c) => c.key === DISLIKE_KEY)?.count ?? 0;

  const react = (reactionTypeKey: string) => {
    mutation.mutate({ problemId, reactionTypeKey });
  };

  const isDisabled = !hasMounted || !isSignedIn || mutation.isPending;
  const signInTitle = hasMounted && isSignedIn ? undefined : "Sign in to react";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={currentUserReactionKey === LIKE_KEY}
        aria-label="Like"
        disabled={isDisabled}
        title={signInTitle}
        onClick={() => react(LIKE_KEY)}
      >
        <ThumbsUp
          className={cn(
            currentUserReactionKey === LIKE_KEY && "fill-primary text-primary",
          )}
        />
        <span className="tabular-nums">{likeCount}</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={currentUserReactionKey === DISLIKE_KEY}
        aria-label="Dislike"
        disabled={isDisabled}
        title={signInTitle}
        onClick={() => react(DISLIKE_KEY)}
      >
        <ThumbsDown
          className={cn(
            currentUserReactionKey === DISLIKE_KEY &&
              "fill-destructive text-destructive",
          )}
        />
        <span className="tabular-nums">{dislikeCount}</span>
      </Button>
    </div>
  );
}
