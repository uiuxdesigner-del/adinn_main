"use client";

import { useState } from "react";
import { ProjectCard, type ProjectView } from "@/components/project-card";

export function WorkExplorer({
  projects,
  verticals,
}: {
  projects: (ProjectView & { verticalId: string })[];
  verticals: { id: string; name: string }[];
}) {
  const [filter, setFilter] = useState("all");
  const active = verticals.find((v) => v.id === filter);
  const results =
    filter === "all" ? projects : projects.filter((p) => p.verticalId === filter);
  const count = `${results.length} ${results.length === 1 ? "project" : "projects"}`;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div>
          <label htmlFor="work-filter" className="block font-medium">
            Filter by vertical
          </label>
          <select
            id="work-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="field mt-1 min-w-64"
          >
            <option value="all">All verticals</option>
            {verticals.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        {filter !== "all" && (
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="btn btn-secondary"
          >
            Clear Filter
          </button>
        )}
      </div>

      <p role="status" className="mt-4 text-ash">
        {active ? `Showing ${count} in ${active.name}` : `Showing ${count}`}
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {results.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl bg-line p-6 md:p-8">
          <p className="text-h3">No projects to show for this vertical yet.</p>
          <p className="mt-2 text-ash">
            No records have been added for {active?.name ?? "this filter"}.
            Clear the filter to see all projects.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="btn btn-primary mt-4"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
