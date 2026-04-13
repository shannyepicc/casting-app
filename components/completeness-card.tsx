import Link from "next/link";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import type { CompletenessResult } from "@/lib/utils/profile-completeness";

export function CompletenessCard({ result }: { result: CompletenessResult }) {
  const { score, items, message, tier } = result;
  const incomplete = items.filter((i) => !i.done);

  return (
    <section className="panel completeness-card">
      <div className="completeness-header">
        <div>
          <p className="eyebrow">Profile Strength</p>
          <h3 className={`completeness-score completeness-score--${tier}`}>
            {score}% complete
          </h3>
        </div>
        <span className={`completeness-badge completeness-badge--${tier}`}>
          {tier === "complete" ? "✓ Done" : `${incomplete.length} left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="completeness-bar-track">
        <div
          className={`completeness-bar-fill completeness-bar-fill--${tier}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="completeness-message">{message}</p>

      {/* Checklist */}
      {incomplete.length > 0 && (
        <div className="completeness-list">
          {items.map((item) => (
            <div key={item.label} className={`completeness-item${item.done ? " completeness-item--done" : ""}`}>
              {item.done ? (
                <CheckCircle size={15} className="completeness-check" />
              ) : (
                <Circle size={15} className="completeness-circle" />
              )}
              {item.done ? (
                <span>{item.label}</span>
              ) : (
                <Link href={item.href} className="completeness-link">
                  {item.label}
                  <ArrowRight size={12} />
                </Link>
              )}
              <span className="completeness-points">+{item.points}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
