"use client";

import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";

import { useEffect, useState } from "react";
import { useAPI } from "@/trpc/hooks";
import PreviousMap_ from "postcss/lib/previous-map";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  const api = useAPI();

  // State variables for the sync button and op
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Handler for synchronizing the db
  // TODO: Make this continous instead
  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.sbirRecord.syncMetadata.mutate();
      setResult("✅ Sync complete");
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };


  // State variables for the search function

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (pageOverride?: number) => {
    if (!query) return;
    const currentPage = pageOverride ?? page;

    setSearching(true);
    try {
      const res = await api.sbirRecord.searchSbirMetadata.query({
        query,
        page: currentPage,
        limit: 20
      });

      setSearchResults((prev) =>
        currentPage === 1 ? res.result : [...prev, ...res.result]
      );
      setHasMore(currentPage < res.pageCount);


      setTimeout(() => {
        const needsMore = document.body.scrollHeight <= window.innerHeight;
        if (needsMore && currentPage < res.pageCount) {
          const nextPage = currentPage + 1;
          setPage(nextPage);
          handleSearch(nextPage);
        }
      });

    } catch (err: any) {
      setError(err.message ?? "Search Failed");
    } finally {
      setSearching(false);
    }
  }

  // Setup infinit scrolling
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 150;

      if (nearBottom && hasMore && !searching) {
        const nextPage = page + 1;
        setPage(nextPage);
        handleSearch(nextPage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, searching]);

  return (
    <main className="flex flex-col min-h-screen p-6">
      <h1 className="text-xl font-bold mb-4">SBIR Metadata Sync + Search</h1>

      {/* Sync Button */}
      <div className="mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSync}
          disabled={loading}
        >
          {loading ? "Syncing..." : "Sync Metadata"}
        </button>
        {result && <p className="text-green-600 mt-4">{result}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Search by title, agency, or program..."
        />
        <button
          onClick={() => {
            setPage(1);
            setSearchResults([]);
            setHasMore(true);
            handleSearch(1);
          }}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Agency</th>
                <th className="text-left p-2">Program</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((rec) => (
                <tr key={rec.id} className="border-t">
                  <td className="p-2">{rec.title}</td>
                  <td className="p-2">{rec.agency}</td>
                  <td className="p-2">{rec.program}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {searching && (
        <p className="mt-4 text-sm text-gray-600 text-center">Loading…</p>
      )}

      {!hasMore && searchResults.length > 0 && (
        <p className="mt-6 text-sm text-gray-400 text-center">
          ✅ End of results
        </p>
      )}
    </main>
  );
}