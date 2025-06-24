"use client";

import { useEffect, useState } from "react";
import { useAPI } from "@/trpc/hooks";
import { useRouter } from "next/navigation";

export default function Home() {
  const api = useAPI();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (pageOverride?: number) => {
    const currentPage = pageOverride ?? page;
    setSearching(true);
    try {
      const res = await api.sbirRecord.searchSbirMetadata.query({
        query,
        page: currentPage,
        limit: 20,
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
  };

  useEffect(() => {
    handleSearch(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 150;

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
      <h1 className="text-2xl font-bold mb-4">SBIR Solicitation Search</h1>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, agency, program, or topic description..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setSearchResults([]);
              setHasMore(true);
              handleSearch(1);
            }
          }}
          className="border border-gray-300 p-2 rounded flex-1"
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

      {/* Results */}
      <div className="grid gap-4">
        {searchResults.map((rec) => (
          <div
            key={rec.id}
            onClick={() => router.push(`/solicitation/${rec.id}`)}
            className="border rounded-xl p-4 bg-white cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-[1.015] hover:shadow-lg hover:bg-gray-100 hover:border-gray-500"
          >
            <h2 className="text-lg font-semibold mb-1 line-clamp-2" title={rec.solicitation_title}>
              {rec.solicitation_title}
            </h2>
            <div className="text-sm text-gray-500 mb-2">
              <span className="mr-4">{rec.agency}</span>
              <span>{rec.program}</span>
            </div>
            {rec.solicitation_topics?.[0]?.topic_description && (
              <p className="text-gray-700 text-sm line-clamp-3" title={rec.solicitation_topics[0].topic_description}>
                {rec.solicitation_topics[0].topic_description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Loading & Footer */}
      {searching && (
        <p className="mt-6 text-center text-gray-600 text-sm">Loading…</p>
      )}

      {!hasMore && searchResults.length > 0 && (
        <p className="mt-6 text-center text-gray-400 text-sm">✅ End of results</p>
      )}

      {error && (
        <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
      )}
    </main>
  );
}