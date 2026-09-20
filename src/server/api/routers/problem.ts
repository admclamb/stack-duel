import { TRPCError } from "@trpc/server";
import { and, count, eq, ilike } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  procedureRequiringPermission,
  publicProcedure,
} from "~/server/api/trpc";
import type { db as Db } from "~/server/db";
import { problemReactions, problems, problemSetups } from "~/server/db/schema";
import { Permissions } from "~/lib/permissions";

const paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const problemRouter = createTRPCRouter({
  list: publicProcedure.input(paginationInput).query(async ({ ctx, input }) => {
    const { page, size, search } = input;
    const where = and(
      eq(problems.status, "Published"),
      search ? ilike(problems.title, `%${search}%`) : undefined,
    );

    const [rows, totalResult] = await Promise.all([
      ctx.db.query.problems.findMany({
        where,
        limit: size,
        offset: (page - 1) * size,
        orderBy: (problem, { asc }) => asc(problem.id),
        with: {
          setups: { with: { languageVersion: { with: { language: true } } } },
        },
      }),
      ctx.db.select({ total: count() }).from(problems).where(where),
    ]);
    const total = totalResult[0]?.total ?? 0;

    return {
      results: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficultyTier: row.difficultyTier,
        tags: row.tags,
        languages: dedupeLanguages(row.setups),
      })),
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.problems.findFirst({
        where: and(
          eq(problems.slug, input.slug),
          eq(problems.status, "Published"),
        ),
        with: {
          publicTestCases: { orderBy: (tc, { asc }) => asc(tc.sortOrder) },
          setups: { with: { languageVersion: { with: { language: true } } } },
          author: { columns: { username: true, imageUrl: true } },
        },
      });

      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        difficultyTier: row.difficultyTier,
        question: row.question,
        tags: row.tags,
        availableLanguages: dedupeLanguages(row.setups),
        publicTestCases: row.publicTestCases.map((tc) => ({
          name: tc.name,
          description: tc.description,
          inputs: tc.inputs,
          expectedOutputs: tc.expectedOutputs,
        })),
        setups: row.setups.map((setup) => ({
          id: setup.id,
          languageVersionId: setup.languageVersionId,
          initialCode: setup.initialCode,
        })),
        author: row.author,
      };
    }),

  setup: publicProcedure
    .input(z.object({ slug: z.string(), languageVersionId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const problem = await ctx.db.query.problems.findFirst({
        where: eq(problems.slug, input.slug),
        columns: { id: true },
      });
      if (!problem) throw new TRPCError({ code: "NOT_FOUND" });

      const row = await ctx.db.query.problemSetups.findFirst({
        where: and(
          eq(problemSetups.problemId, problem.id),
          eq(problemSetups.languageVersionId, input.languageVersionId),
        ),
      });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: row.id,
        initialCode: row.initialCode,
        functionName: row.functionName,
        additionalFiles: row.additionalFiles,
      };
    }),

  reactionSummary: publicProcedure
    .input(z.object({ problemId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const currentUserId = await resolveCurrentUserId(
        ctx.db,
        ctx.auth.userId,
      );
      return getReactionSummary(ctx.db, input.problemId, currentUserId);
    }),

  setReaction: protectedProcedure
    .input(
      z.object({ problemId: z.number().int(), reactionTypeKey: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = await resolveCurrentUserId(ctx.db, ctx.auth.userId);
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.db
        .insert(problemReactions)
        .values({
          problemId: input.problemId,
          userId,
          reactionTypeKey: input.reactionTypeKey,
        })
        .onConflictDoUpdate({
          target: [problemReactions.problemId, problemReactions.userId],
          set: { reactionTypeKey: input.reactionTypeKey },
        });

      return getReactionSummary(ctx.db, input.problemId, userId);
    }),

  adminList: procedureRequiringPermission(Permissions.ADMIN_PROBLEMS_READ)
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, size, search } = input;
      const where = search ? ilike(problems.title, `%${search}%`) : undefined;

      const [rows, totalResult] = await Promise.all([
        ctx.db.query.problems.findMany({
          where,
          limit: size,
          offset: (page - 1) * size,
          orderBy: (problem, { desc }) => desc(problem.id),
          with: {
            author: { columns: { username: true } },
            setups: {
              with: { languageVersion: { with: { language: true } } },
            },
          },
        }),
        ctx.db.select({ total: count() }).from(problems).where(where),
      ]);
      const total = totalResult[0]?.total ?? 0;

      return {
        results: rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          difficultyValue: row.difficultyValue,
          difficultyTier: row.difficultyTier,
          status: row.status,
          timeLimitMs: row.timeLimitMs,
          memoryLimitMb: row.memoryLimitMb,
          tags: row.tags,
          languages: dedupeLanguages(row.setups).map((l) => l.name),
          setupCount: row.setups.length,
          createdAt: row.createdAt,
          createdByUsername: row.author?.username,
        })),
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    }),

  adminDetail: procedureRequiringPermission(Permissions.ADMIN_PROBLEMS_READ)
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.problems.findFirst({
        where: eq(problems.id, input.id),
        with: {
          author: { columns: { username: true } },
          setups: {
            with: { languageVersion: { with: { language: true } } },
          },
        },
      });

      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        question: row.question,
        difficultyValue: row.difficultyValue,
        difficultyTier: row.difficultyTier,
        timeLimitMs: row.timeLimitMs,
        memoryLimitMb: row.memoryLimitMb,
        status: row.status,
        createdAt: row.createdAt,
        createdByUsername: row.author?.username,
        tags: row.tags,
        setups: row.setups.map((setup) => ({
          id: setup.id,
          languageVersionId: setup.languageVersionId,
          languageName: setup.languageVersion.language.name,
          languageVersion: setup.languageVersion.version,
          functionName: setup.functionName,
          initialCode: setup.initialCode,
        })),
      };
    }),

  adminUpdate: procedureRequiringPermission(Permissions.ADMIN_PROBLEMS_UPDATE)
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1),
        question: z.string(),
        difficultyValue: z.number().int(),
        difficultyTier: z.string().min(1),
        timeLimitMs: z.number().int().positive(),
        memoryLimitMb: z.number().int().positive(),
        tags: z.array(z.string()),
        status: z.enum(["Draft", "Published", "Archived"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;
      await ctx.db.update(problems).set(rest).where(eq(problems.id, id));
    }),
});

async function resolveCurrentUserId(
  db: typeof Db,
  clerkUserId: string | null,
) {
  if (!clerkUserId) return null;
  const row = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.clerkId, clerkUserId),
    columns: { id: true },
  });
  return row?.id ?? null;
}

async function getReactionSummary(
  db: typeof Db,
  problemId: number,
  currentUserId: number | null,
) {
  const [rows, reactionTypeRows] = await Promise.all([
    db
      .select({
        key: problemReactions.reactionTypeKey,
        userId: problemReactions.userId,
      })
      .from(problemReactions)
      .where(eq(problemReactions.problemId, problemId)),
    db.query.reactionTypes.findMany(),
  ]);

  return {
    counts: reactionTypeRows.map((type) => ({
      key: type.key,
      name: type.name,
      emoji: type.emoji,
      count: rows.filter((r) => r.key === type.key).length,
    })),
    currentUserReactionKey:
      rows.find((r) => r.userId === currentUserId)?.key ?? null,
  };
}

type SetupWithLanguage = {
  languageVersion: {
    id: number;
    version: string;
    language: { id: number; name: string };
  };
};

function dedupeLanguages(setups: SetupWithLanguage[]) {
  const byLanguageId = new Map<
    number,
    { id: string; name: string; versions: { id: string; version: string }[] }
  >();

  for (const setup of setups) {
    const { language, id: versionId, version } = setup.languageVersion;
    const entry = byLanguageId.get(language.id) ?? {
      id: String(language.id),
      name: language.name,
      versions: [],
    };
    entry.versions.push({ id: String(versionId), version });
    byLanguageId.set(language.id, entry);
  }

  return [...byLanguageId.values()];
}
