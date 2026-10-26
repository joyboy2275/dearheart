import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { dedicationCategoryValues, reportReasonValues } from "../shared/dedications";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createDedication, createDedicationReport, getDedicationBySlug, listPublicDedications } from "./db";

const optionalText = (max: number) => z.string().trim().max(max).optional().transform(value => value || null);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dedications: router({
    list: publicProcedure.input(z.object({
      category: z.enum(dedicationCategoryValues).optional(),
      limit: z.number().int().min(1).max(50).default(24),
    })).query(({ input }) => listPublicDedications(input.category, input.limit)),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(12).max(32) })).query(async ({ input }) => {
      const dedication = await getDedicationBySlug(input.slug);
      if (!dedication) throw new TRPCError({ code: "NOT_FOUND", message: "This letter could not be found." });
      return dedication;
    }),
    create: publicProcedure.input(z.object({
      title: optionalText(120),
      message: z.string().trim().min(1, "Write a few words before saving.").max(2400),
      category: z.enum(dedicationCategoryValues),
      authorName: optionalText(80),
      recipientName: optionalText(80),
      anonymous: z.boolean().default(true),
      visibility: z.enum(["public", "private"]),
    })).mutation(async ({ input }) => {
      try {
        const created = await createDedication({
          slug: nanoid(21),
          title: input.title,
          message: input.message,
          category: input.category,
          authorName: input.anonymous ? null : input.authorName,
          recipientName: input.recipientName,
          anonymous: input.anonymous,
          visibility: input.visibility,
        });
        if (!created) throw new Error("Saved letter could not be read back.");
        return { slug: created.slug, visibility: created.visibility };
      } catch (error) {
        console.error("[Dedication] Save failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your words couldn't be saved just now. Please try again." });
      }
    }),
    report: publicProcedure.input(z.object({
      slug: z.string().min(12).max(32),
      reason: z.enum(reportReasonValues),
      details: optionalText(500),
    })).mutation(async ({ input }) => {
      try {
        const dedication = await getDedicationBySlug(input.slug);
        if (!dedication || dedication.visibility !== "public") {
          throw new TRPCError({ code: "NOT_FOUND", message: "This public letter could not be found." });
        }
        await createDedicationReport({ dedicationId: dedication.id, reason: input.reason, details: input.details });
        return { submitted: true as const };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Dedication] Report failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your report couldn't be saved. Please try again." });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
