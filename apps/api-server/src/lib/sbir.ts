import { z } from "zod";

import { prisma, Prisma } from "@repo/database";
import type { Solicitation, Topic } from "@repo/database";

/**
 * Searches SBIR metadata records in the database using a text query.
 *
 * If no query is provided, returns the most recent records ordered by `open_date`.
 *
 * @param query - The search keyword to match against SBIR records.
 * @param page - The current page number (1-indexed). Defaults to 1.
 * @param limit - The number of results per page. Defaults to 20.
 * @returns An object containing:
 *   - `result`: the matching records,
 *   - `total`: total number of matching records,
 *   - `page`: current page number,
 *   - `pageCount`: total number of pages.
 */
export async function searchSbirMetadata(
  query: string = "",
  page = 1,
  limit = 20
): Promise<SearchSbirMetadataResponse> {
  const skip = (page - 1) * limit;

  const where = query.trim()
    ? {
        OR: [
          {
            solicitation_title: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            agency: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            program: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            solicitation_topics: {
              some: {
                topic_description: {
                  contains: query,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        ],
      }
    : {};

  const [result, total] = await Promise.all([
    prisma.solicitation.findMany({
      where,
      include: {
        solicitation_topics: true,
      },
      orderBy: [{ open_date: "desc" }, { id: "asc" }],
      skip,
      take: limit,
    }),
    prisma.solicitation.count({ where }),
  ]);

  return {
    result,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
}

export const SearchSbirMetadataInput = z.object({
  query: z.string().optional().default(""),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export type SearchSbirMetadataInput = z.infer<typeof SearchSbirMetadataInput>;
export type SearchSbirMetadataResponse = {
  result: Solicitation[];
  total: number;
  page: number;
  pageCount: number;
};

export async function getSolicitationById(id: number) {
  return await prisma.solicitation.findUnique({
    where: { id },
    include: {
      solicitation_topics: true,
    },
  });
}

export const GetSolicitationByIdInput = z.object({
  id: z.number().int().positive(),
});

export type GetSolicitationByIdResponse = (Solicitation & {
  solicitation_topics: Topic[];
}) | null;