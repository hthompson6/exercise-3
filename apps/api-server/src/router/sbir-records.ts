import { createTRPCRouter, procedure } from "trpc";
import { z } from "zod";

import { searchSbirMetadata, SearchSbirMetadataInput, getSolicitationById, GetSolicitationByIdInput } from "@/lib/sbir";


/**
 * A tRPC mutation that fetches and stores one file from the SBIR API.
 *
 * Useful for development/testing purposes.
 *
 * @returns An object indicating the sync status.
 */
export const SbirRouter = createTRPCRouter({
    searchSbirMetadata: procedure
        .input(SearchSbirMetadataInput)
        .query(async ({ input }) => {
            return await searchSbirMetadata(input.query, input.page, input.limit);
        }),

    getById: procedure
        .input(GetSolicitationByIdInput)
        .query(async ({ input }) => {
            return await getSolicitationById(input.id);
        }),
});