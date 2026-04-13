"use client";

import { useRef, useState } from "react";
import { createRole, updateRole } from "@/app/actions/roles";
import type { Role } from "@/lib/supabase/queries";

const PROJECT_TYPES = [
  { value: "short_film",   label: "Short Film" },
  { value: "feature",      label: "Feature Film" },
  { value: "youtube",      label: "YouTube Video" },
  { value: "music_video",  label: "Music Video" },
  { value: "commercial",   label: "Commercial" },
  { value: "brand",        label: "Brand / Sponsored" },
  { value: "tv",           label: "TV / Streaming" },
  { value: "web_series",   label: "Web Series" },
  { value: "podcast",      label: "Podcast" },
  { value: "photography",  label: "Photography" },
  { value: "gaming",       label: "Gaming / Streaming" },
  { value: "theatre",      label: "Theatre" },
  { value: "other",        label: "Other" },
];

const UNION_OPTIONS = [
  { value: "non_union", label: "Non-Union" },
  { value: "union",     label: "Union" },
  { value: "both",      label: "Both" },
];

const COMP_OPTIONS = [
  { value: "paid",         label: "Paid" },
  { value: "deferred",     label: "Deferred" },
  { value: "copy_credit",  label: "Copy / Credit" },
  { value: "unpaid",       label: "Unpaid" },
];

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Any"];

interface RoleFormProps {
  initialData?: Role;
  mode?: "create" | "edit";
}

export function RoleForm({ initialData, mode = "create" }: RoleFormProps) {
  const isEdit = mode === "edit";

  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    initialData?.gender ?? []
  );
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Deadline formatted as YYYY-MM-DD for the date input
  const defaultDeadline = initialData?.deadline
    ? initialData.deadline.slice(0, 10)
    : "";

  function toggleGender(g: string) {
    if (g === "Any") {
      setSelectedGenders(["Any"]);
      return;
    }
    setSelectedGenders((prev) => {
      const without = prev.filter((x) => x !== "Any");
      return without.includes(g) ? without.filter((x) => x !== g) : [...without, g];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setPending(true);
    const fd = new FormData(formRef.current);
    // Inject gender multi-select
    selectedGenders.forEach((g) => fd.append("gender", g));
    try {
      if (isEdit && initialData) {
        await updateRole(initialData.id, fd);
      } else {
        await createRole(fd);
      }
    } catch {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="role-form">
      {/* ── Core info ── */}
      <div className="form-section">
        <p className="eyebrow">The Role</p>
        <div className="form-grid-2">
          <label className="field">
            <span>Role Title *</span>
            <input
              name="title"
              required
              placeholder="Lead Female, 20s Drama"
              defaultValue={initialData?.title ?? ""}
            />
          </label>
          <label className="field">
            <span>Project Name</span>
            <input
              name="project_name"
              placeholder="Untitled Short Film"
              defaultValue={initialData?.project_name ?? ""}
            />
          </label>
        </div>
        <label className="field">
          <span>Project Type</span>
          <select name="project_type" defaultValue={initialData?.project_type ?? ""}>
            <option value="">Select type…</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Description / Breakdown</span>
          <textarea
            name="description"
            rows={5}
            placeholder="Describe the character, tone, what makes someone right for this role…"
            defaultValue={initialData?.description ?? ""}
          />
        </label>
      </div>

      {/* ── Requirements ── */}
      <div className="form-section">
        <p className="eyebrow">Requirements</p>

        <div className="field">
          <span className="field-label">Gender</span>
          <div className="pill-select">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                className={selectedGenders.includes(g) ? "pill-option active" : "pill-option"}
                onClick={() => toggleGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid-2">
          <label className="field">
            <span>Age Min</span>
            <input
              name="age_min"
              type="number"
              min={0}
              max={100}
              placeholder="18"
              defaultValue={initialData?.age_min ?? ""}
            />
          </label>
          <label className="field">
            <span>Age Max</span>
            <input
              name="age_max"
              type="number"
              min={0}
              max={100}
              placeholder="30"
              defaultValue={initialData?.age_max ?? ""}
            />
          </label>
        </div>

        <div className="form-grid-2">
          <label className="field">
            <span>Union Status</span>
            <select name="union_status" defaultValue={initialData?.union_status ?? ""}>
              <option value="">Any</option>
              {UNION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Location</span>
            <input
              name="location"
              placeholder="Los Angeles, CA or Remote"
              defaultValue={initialData?.location ?? ""}
            />
          </label>
        </div>
      </div>

      {/* ── Production details ── */}
      <div className="form-section">
        <p className="eyebrow">Production Details</p>
        <div className="form-grid-2">
          <label className="field">
            <span>Compensation</span>
            <select name="compensation" defaultValue={initialData?.compensation ?? ""}>
              <option value="">Select…</option>
              {COMP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Shoot Dates</span>
            <input
              name="shoot_dates"
              placeholder="Late June 2026"
              defaultValue={initialData?.shoot_dates ?? ""}
            />
          </label>
        </div>
        <label className="field">
          <span>Application Deadline</span>
          <input name="deadline" type="date" defaultValue={defaultDeadline} />
        </label>
      </div>

      <button
        type="submit"
        className="primary-button"
        disabled={pending}
        style={{ width: "100%", marginTop: 8 }}
      >
        {pending
          ? isEdit ? "Saving…" : "Publishing…"
          : isEdit ? "Save Changes →" : "Publish Role →"}
      </button>
    </form>
  );
}
