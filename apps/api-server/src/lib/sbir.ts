import { z } from "zod";

import { prisma } from "@repo/database";
import { Solicitation } from "@repo/database";

/**
 * Searches SBIR metadata records in the database using a text query.
 *
 * This function performs a case-insensitive search across the `title`, `agency`,
 * and `program` fields of the `Solicitation` model. Results are paginated.
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
export async function searchSbirMetadata(query: string, page = 1, limit = 20
): Promise<SearchSbirMetadataResponse> {
    const skip = (page - 1) * limit;

    const [result, total] = await Promise.all([
        prisma.solicitation.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { agency: { contains: query, mode: "insensitive" } },
                    { program: { contains: query, mode: "insensitive" } }
                ]
            },
            orderBy: [
                { updatedAt: "desc" },
                { id: "asc" } // Stabalize the pagination results
            ],
            skip,
            take: limit
        }),


        // Get the total count so we know if we can grab more
        prisma.solicitation.count({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { agency: { contains: query, mode: "insensitive" } },
                    { program: { contains: query, mode: "insensitive" } }
                ]
            }
        })
    ]);

    // console.log("Record count: %d", total);
    // console.log("result length:", result.length);

    return {
        result,
        total,
        page,
        pageCount: Math.ceil(total / limit)
    };
}

export const SearchSbirMetadataInput = z.object({
    query: z.string().min(1),
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