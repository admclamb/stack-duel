import { createClerkClient } from "@clerk/backend";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { env } from "~/env";
import { closeDb, db } from "~/server/db";
import {
  groups,
  languages,
  languageVersions,
  problemPublicTestCases,
  problems,
  problemSetups,
  reactionTypes,
  userGroups,
} from "~/server/db/schema";
import { upsertUserFromClerk } from "~/server/auth/upsert-user";
import { Permissions } from "~/lib/permissions";

const ADMIN_BOOTSTRAP_EMAIL = "algowarsdev@gmail.com";

function allColumnsExcept<T extends PgTable>(
  table: T,
  exclude: (keyof T["_"]["columns"])[],
) {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    Object.entries(columns)
      .filter(([key]) => !exclude.includes(key as keyof T["_"]["columns"]))
      .map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)]),
  ) as Record<Exclude<keyof T["_"]["columns"], (typeof exclude)[number]>, SQL>;
}

async function seedAdminGroup() {
  const [adminsGroup] = await db
    .insert(groups)
    .values({
      name: "Admins",
      permissions: Object.values(Permissions),
    })
    .onConflictDoUpdate({
      target: groups.name,
      set: { permissions: Object.values(Permissions) },
    })
    .returning();

  if (!adminsGroup) throw new Error("Failed to upsert Admins group");

  const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
  const { data: clerkUsers } = await clerkClient.users.getUserList({
    emailAddress: [ADMIN_BOOTSTRAP_EMAIL],
  });
  const clerkUser = clerkUsers[0];

  if (!clerkUser) {
    console.warn(
      `Skipping admin bootstrap: no Clerk user found for ${ADMIN_BOOTSTRAP_EMAIL}. Sign in with that account first, then re-run the seed.`,
    );
    return;
  }

  const appUser = await upsertUserFromClerk({
    id: clerkUser.id,
    username: clerkUser.username,
    imageUrl: clerkUser.imageUrl,
  });

  await db
    .insert(userGroups)
    .values({ userId: appUser.id, groupId: adminsGroup.id })
    .onConflictDoNothing();

  console.log(`Granted Admins group to ${ADMIN_BOOTSTRAP_EMAIL}`);
}

async function seedReactionTypes() {
  await db
    .insert(reactionTypes)
    .values([
      { key: "like", name: "Like", emoji: null },
      { key: "dislike", name: "Dislike", emoji: null },
    ])
    .onConflictDoNothing();
}

const LANGUAGE_SEEDS = [
  { name: "JavaScript", version: "Node.js 20" },
  { name: "Python", version: "3.11" },
  { name: "SQLite", version: "3.42" },
] as const;

async function seedLanguages() {
  const versionIds: Partial<Record<(typeof LANGUAGE_SEEDS)[number]["name"], number>> = {};

  for (const { name, version } of LANGUAGE_SEEDS) {
    const [language] = await db
      .insert(languages)
      .values({ name })
      .onConflictDoUpdate({ target: languages.name, set: { name } })
      .returning();
    if (!language) throw new Error(`Failed to upsert language ${name}`);

    const [languageVersion] = await db
      .insert(languageVersions)
      .values({ languageId: language.id, version })
      .onConflictDoUpdate({
        target: [languageVersions.languageId, languageVersions.version],
        set: { version },
      })
      .returning();
    if (!languageVersion) {
      throw new Error(`Failed to upsert language version ${name} ${version}`);
    }

    versionIds[name] = languageVersion.id;
  }

  return versionIds;
}

async function seedDemoProblem(
  versionIds: Partial<Record<(typeof LANGUAGE_SEEDS)[number]["name"], number>>,
) {
  const [problem] = await db
    .insert(problems)
    .values({
      title: "Hello or Goodbye",
      slug: "hello-or-goodbye",
      question:
        'Given a name, return "Hello, {name}!" if the name is at least 3 characters long, otherwise return "Goodbye, {name}!".',
      difficultyValue: 1,
      difficultyTier: "Beginner",
      status: "Published",
    })
    .onConflictDoUpdate({
      target: problems.slug,
      set: allColumnsExcept(problems, ["id", "slug"]),
    })
    .returning();

  if (!problem) throw new Error("Failed to upsert demo problem");

  await db
    .insert(problemPublicTestCases)
    .values([
      {
        problemId: problem.id,
        name: "Short name",
        inputs: [{ value: "Al", valueType: "string" }],
        expectedOutputs: [{ value: "Goodbye, Al!", valueType: "string" }],
        sortOrder: 0,
      },
      {
        problemId: problem.id,
        name: "Long enough name",
        inputs: [{ value: "Alice", valueType: "string" }],
        expectedOutputs: [{ value: "Hello, Alice!", valueType: "string" }],
        sortOrder: 1,
      },
    ])
    .onConflictDoUpdate({
      target: [problemPublicTestCases.problemId, problemPublicTestCases.name],
      set: allColumnsExcept(problemPublicTestCases, ["id", "problemId", "name"]),
    });

  const setupSeeds = [
    {
      languageVersionId: versionIds.JavaScript,
      functionName: "helloOrGoodbye",
      initialCode: "function helloOrGoodbye(name) {\n  \n}\n",
    },
    {
      languageVersionId: versionIds.Python,
      functionName: "hello_or_goodbye",
      initialCode: "def hello_or_goodbye(name):\n    pass\n",
    },
  ];

  for (const setup of setupSeeds) {
    if (!setup.languageVersionId) continue;

    await db
      .insert(problemSetups)
      .values({ problemId: problem.id, ...setup, languageVersionId: setup.languageVersionId })
      .onConflictDoUpdate({
        target: [problemSetups.problemId, problemSetups.languageVersionId],
        set: {
          functionName: setup.functionName,
          initialCode: setup.initialCode,
        },
      });
  }
}

async function main() {
  await seedReactionTypes();
  const versionIds = await seedLanguages();
  await seedDemoProblem(versionIds);
  await seedAdminGroup();

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
    process.exit(process.exitCode ?? 0);
  });
