import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const languageRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const languages = await ctx.db.query.languages.findMany({
      with: { versions: true },
      orderBy: (language, { asc }) => asc(language.name),
    });

    return languages.map((language) => ({
      id: String(language.id),
      name: language.name,
      versions: language.versions.map((version) => ({
        id: String(version.id),
        version: version.version,
      })),
    }));
  }),
});
