"use client";

import { useAPI } from "@/trpc/hooks";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";

export default function SolicitationDetailPage() {
  const { id } = useParams();
  const api = useAPI();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.sbirRecord.getById.query({ id: Number(id) })
      .then(setData)
      .catch((err) => setError(err.message ?? "Error loading data"));
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>Loading...</p>;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-10 scroll-smooth">
      <Link
        href="/"
        className="inline-block text-sm px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
      >
        ← Back to Search
      </Link>
      {/* Main Header */}
      <header>
        <h1 className="text-3xl font-bold mb-2">{data.solicitation_title}</h1>
        <p className="text-gray-600">Solicitation #{data.solicitation_number}</p>
      </header>

      {/* Metadata Section */}
      <section className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Solicitation ID:</strong> {data.solicitation_id}</div>
        <div><strong>Program:</strong> {data.program ?? "—"}</div>
        <div><strong>Phase:</strong> {data.phase ?? "—"}</div>
        <div><strong>Agency:</strong> {data.agency ?? "—"}</div>
        <div><strong>Branch:</strong> {data.branch ?? "—"}</div>
        <div><strong>Year:</strong> {data.solicitation_year ?? "—"}</div>
        <div><strong>Status:</strong> {data.current_status ?? "—"}</div>
        <div><strong>Application Due:</strong> {data.application_due_date ?? "—"}</div>
        <div><strong>Release Date:</strong> {formatDate(data.release_date)}</div>
        <div><strong>Open Date:</strong> {formatDate(data.open_date)}</div>
        <div><strong>Close Date:</strong> {formatDate(data.close_date)}</div>
        <div><strong>Is Open:</strong> {data.isOpen ? "✅" : "❌"}</div>
        <div className="col-span-2">
          <strong>Agency URL:</strong>{" "}
          {data.solicitation_agency_url ? (
            <a
              href={data.solicitation_agency_url}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.solicitation_agency_url}
            </a>
          ) : "—"}
        </div>
      </section>

      {/* Topics Section */}
      {data.solicitation_topics?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Topics</h2>
          <ul className="list-disc ml-5 mb-6">
            {data.solicitation_topics.map((topic: any) => (
              <li key={topic.id}>
                <a href={`#topic-${topic.id}`} className="text-blue-600 hover:underline">
                  {topic.topic_title || `Topic ${topic.id}`}
                </a>
              </li>
            ))}
          </ul>

          {data.solicitation_topics.map((topic: any) => (
            <div
              key={topic.id}
              id={`topic-${topic.id}`}
              className="mb-10 scroll-mt-16"
            >
              <h3 className="text-xl font-bold mb-1">{topic.topic_title ?? "Untitled Topic"}</h3>
              <div className="text-sm text-gray-600 mb-2">
                <span className="mr-4"><strong>Number:</strong> {topic.topic_number ?? "—"}</span>
                <span className="mr-4"><strong>Open:</strong> {formatDate(topic.topic_open_date)}</span>
                <span className="mr-4"><strong>Close:</strong> {formatDate(topic.topic_closed_date)}</span>
                <span><strong>Link:</strong>{" "}
                  {topic.sbir_topic_link ? (
                    <a
                      href={topic.sbir_topic_link}
                      className="text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : "—"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {topic.topic_description ?? "No description available."}
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}