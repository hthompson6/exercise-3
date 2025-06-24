// import { z } from "zod";

// import { prisma } from "@repo/database";
// import { fetchFilesPaginated } from "@repo/sbir-api";
// import { mapSbirToDb } from "@repo/sbir-api";

// const ROWS_PER_REQ = 1;


// /**
//  * Fetches and stores SBIR solicitation metadata.
//  * @param limit - Optional. Max number of records to fetch. Defaults to unlimited.
//  * @returns { created: number; updated: number }
//  */
// export async function syncSbirMetadataRecords(limit?: number): Promise<{ created: number; updated: number }> {
//     let offset = 0;
//     let hasNextPage = true;
//     let created = 0;
//     let updated = 0;
//     let totalSynced = 0;

//     while (hasNextPage && (limit === undefined || totalSynced < limit)) {
//         const { file, hasNextPage: next } = await fetchFilesPaginated(ROWS_PER_REQ, offset);

//         const results = await Promise.allSettled(
//             file.map(async (item) => {
//                 const data = mapSbirToDb(item);

//                 const result = await prisma.solicitation.upsert({
//                     where: { solicitationId: data.solicitationId },
//                     update: data,
//                     create: data
//                 });

//                 return result.createdAt.getTime() === result.updatedAt.getTime()
//                     ? 'created'
//                     : 'updated';
//             })
//         );

//         for (const res of results) {
//             if (res.status === 'fulfilled') {
//                 if (res.value === 'created') created++;
//                 else updated++;
//             } else {
//                 console.warn('Upsert error: ', res.reason);
//             }
//         }

//         offset += ROWS_PER_REQ;
//         hasNextPage = next;
//     }

//     return { created, updated };
// }

