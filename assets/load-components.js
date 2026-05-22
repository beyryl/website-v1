async function include(id, path) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(path, { cache: "no-store" });
    el.innerHTML = await res.text();
  } catch (err) {
    console.error(`Failed to load ${path}:`, err);
  }
}

function includeFirst(ids, path) {
  const id = ids.find((candidate) => document.getElementById(candidate));
  if (id) include(id, path);
}

window.addEventListener("DOMContentLoaded", () => {
  include("nav", "components/Navigation.html");
  include("hero", "components/Hero.html");
  includeFirst(["identity", "product"], "components/ProductSection.html");
  includeFirst(["delivery", "features"], "components/FeaturesGrid.html");
  includeFirst(["partnership", "cta"], "components/CallToAction.html");
});
