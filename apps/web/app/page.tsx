"use client";

import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";

import { useState } from "react";
import { useAPI } from "@/trpc/hooks";

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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">SBIR Metadata Sync</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? "Syncing..." : "Sync Metadata"}
      </button>
      {result && <p className="text-green-600 mt-4">{result}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </main>
  );
}