import { z } from "zod";

import { prisma } from "@/server/db";
import { fetchFilesPaginated } from "./fetch";
import { mapSbirToDb } from "./transform";

const ROWS_PER_REQ = 1;


/**
 * Fetches and stores SBIR solicitation metadata.
 * @param limit - Optional. Max number of records to fetch. Defaults to unlimited.
 * @returns { created: number; updated: number }
 */
export async function syncSbirMetadataRecords(limit?: number): Promise<{created: number; updated: number}> {
    let offset = 0;
    let hasNextPage = true;
    let created = 0;
    let updated = 0;
    let totalSynced = 0;

    while (hasNextPage && (limit === undefined || totalSynced < limit)) {
        const { file, hasNextPage: next} = await fetchFilesPaginated(ROWS_PER_REQ, offset);
        
        const results = await Promise.allSettled(
            file.map(async (item) => {
                const data = mapSbirToDb(item);

                const result = await prisma.solicitation.upsert({
                    where: {solicitationId: data.solicitationId},
                    update: data,
                    create: data
                });

                return result.createdAt.getTime() === result.updatedAt.getTime()
                    ? 'created'
                    : 'updated';
            })
        );

        for (const res of results) {
            if (res.status === 'fulfilled') {
                if (res.value === 'created') created++;
                else updated++;
            } else {
                console.warn('Upsert error: ', res.reason);
            }
        }

        offset += ROWS_PER_REQ;
        hasNextPage = next;
    }

    return { created, updated};
}


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
export async function searchSbirMetadata(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [result, total] = await Promise.all([
        prisma.solicitation.findMany({
            where: {
                OR: [
                    {title: {contains: query, mode: "insensitive"}},
                    { agency: {contains: query, mode: "insensitive"}},
                    {program: {contains: query, mode: "insensitive"}}
                ]
            },
            orderBy: [
                {updatedAt: "desc"},
                {id: "asc"} // Stabalize the pagination results
            ],
            skip,
            take: limit
        }),


        // Get the total count so we know if we can grab more
        prisma.solicitation.count({
            where: {
                OR: [
                    {title: {contains: query, mode: "insensitive"}},
                    { agency: {contains: query, mode: "insensitive"}},
                    {program: {contains: query, mode: "insensitive"}}
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
export type SearchSbirMetadataResponse = Awaited<
  ReturnType<typeof searchSbirMetadata>
>;