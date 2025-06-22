import { createTRPCRouter, procedure } from "trpc";
import { z } from "zod";

import { syncSbirMetadataRecords, searchSbirMetadata, SearchSbirMetadataInput } from "@/lib/sbir";


/**
 * A tRPC mutation that fetches and stores one file from the SBIR API.
 *
 * Useful for development/testing purposes.
 *
 * @returns An object indicating the sync status.
 */
export const SbirRouter = createTRPCRouter({
    syncMetadata: procedure.mutation(async () => {
        try {
            const result = await syncSbirMetadataRecords();
            return { status: "done", ...result };
        } catch (err) {
            console.error("Error syncing metadata:", err);
            throw new Error("Failed to sync metadata");
        }
    }),

    searchSbirMetadata: procedure
        .input(SearchSbirMetadataInput)
        .query(async ({ input }) => {
            return await searchSbirMetadata(input.query, input.page, input.limit);
        })
});