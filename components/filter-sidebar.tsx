const filterGroups = [
  {
    title: "Talent Type",
    items: ["Actor", "Host / Presenter", "Dancer", "Musician", "Voice Artist", "Model", "Content Creator"]
  },
  {
    title: "Age Range",
    items: ["18-24", "24-30", "27-34", "30-42"]
  },
  {
    title: "Gender",
    items: ["Any", "Woman", "Man", "Non-binary"]
  },
  {
    title: "Location",
    items: ["Los Angeles", "New York", "San Francisco", "Remote"]
  },
  {
    title: "Tags",
    items: ["Comedy", "Drama", "Improv", "Action", "Voice"]
  }
];

export function FilterSidebar() {
  return (
    <section className="filter-panel">
      <div className="filter-panel-header">
        <p className="eyebrow">Filter Stack</p>
        <h3>Find talent fast</h3>
        <span>Keep it manual for now. This is the surface where your future matching logic gets smarter.</span>
      </div>

      <div className="filter-highlight">
        <strong>Curated for any production</strong>
        <p>Filter by talent type, traits, and availability. Every control should sharpen who you find.</p>
      </div>

      {filterGroups.map((group) => (
        <div className="filter-group" key={group.title}>
          <h4>{group.title}</h4>
          <div className="filter-pills">
            {group.items.map((item) => (
              <button key={item} className="filter-pill">
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
