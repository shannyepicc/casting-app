const filterGroups = [
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
    items: ["Los Angeles", "Berkeley", "Oakland", "Remote"]
  },
  {
    title: "Tags",
    items: ["Comedy", "Drama", "College Student", "Authority", "Action"]
  }
];

export function FilterSidebar() {
  return (
    <section className="filter-panel">
      <div className="filter-panel-header">
        <p className="eyebrow">Filter Stack</p>
        <h3>Find actors fast</h3>
        <span>Keep it manual for now. This is the surface where your future matching logic gets smarter.</span>
      </div>

      <div className="filter-highlight">
        <strong>Curated for indie casting</strong>
        <p>Use lightweight traits, not bloated recruiting filters. Every control should sharpen watchability.</p>
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
