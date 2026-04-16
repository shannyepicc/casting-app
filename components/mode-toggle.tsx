"use client";

import { useEffect, useState } from "react";
import type { ActiveMode } from "@/lib/types";

const STORAGE_KEY = "slate_active_mode";

export function useModeToggle(): [ActiveMode, (m: ActiveMode) => void] {
  const [mode, setModeState] = useState<ActiveMode>("actor");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ActiveMode | null;
    if (stored === "actor" || stored === "creator") setModeState(stored);
  }, []);

  function setMode(m: ActiveMode) {
    localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  }

  return [mode, setMode];
}

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: ActiveMode;
  onChange: (m: ActiveMode) => void;
}) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-toggle-btn${mode === "actor" ? " active" : ""}`}
        onClick={() => onChange("actor")}
        type="button"
      >
        🎭 Actor
      </button>
      <button
        className={`mode-toggle-btn${mode === "creator" ? " active" : ""}`}
        onClick={() => onChange("creator")}
        type="button"
      >
        🎬 Creator
      </button>
    </div>
  );
}
