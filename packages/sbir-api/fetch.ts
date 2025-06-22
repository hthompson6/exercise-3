import axios, { AxiosError } from "axios";
import fs from "fs/promises";
import path from "path";

/**
 * Fetches a batch of files from the SBIR API using offset-based pagination.
 *
 * Example: https://api.www.sbir.gov/public/api/solicitations?rows=25&start=20
 * 
 * @param start - The offset to start retrieving records from.
 * @returns An object containing the files and a flag indicating if more pages exist.
 * 
 * The API returns a maximum of 50 records. If the returned number equals the max, more records likely exist.
 */
export async function fetchFilesPaginated(rows: number, start: number): Promise<{ file: any[]; hasNextPage: boolean }> {

    try {
        const res = await axios.get('https://api.www.sbir.gov/public/api/solicitations', {
            params: {
                rows: rows,
                start
            }
        });


        const file = Array.isArray(res.data) ? res.data : res.data?.results ?? [];

        if (!Array.isArray(file)) {
            throw new Error("API response format is invalid: expected an array");
        }

        const hasNextPage = file.length === rows;
        return { file, hasNextPage };

    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                throw new Error(`SBIR API responded with status ${err.response.status}`);
            } else if (err.request) {
                throw new Error("SBIR API did not respond")
            } else {
                throw new Error(`Axios request error: ${err.message}`)
            }
        }
        throw new Error(`Unexpected error: ${(err as Error).message}`);
    }
}


/**
 * Development use only.
 * 
 * Download a file from the given URL and stores it locally.
 *
 * @param url - The direct URL to download the file from.
 * @param name - The name to save the file as.
 */
export async function devDownloadAndStoreFileLocal({ url, name }: { url: string; name: string }) {
    let buffer: Buffer;

    // Download the file from the specified URL
    try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        buffer = Buffer.from(res.data);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const msg = status
                ? `HTTP ${status} error while downloading ${url}`
                : `Network error while downloading ${url}`;
            throw new Error(msg);
        }

        throw new Error(`Unexpected error downloading ${url}: ${(err as Error).message}`);
    }

    // Store the file locally
    const saveDir = path.join(__dirname, "../../../uploads");

    try {
        await fs.mkdir(saveDir, { recursive: true });
        const savePath = path.join(saveDir, name);
        await fs.writeFile(savePath, buffer);
    } catch (err) {
        throw new Error(`File system error saving ${name}: ${(err as Error).message}`)
    }
}