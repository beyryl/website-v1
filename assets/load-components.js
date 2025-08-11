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

window.addEventListener("DOMContentLoaded", () => {
  include("nav", "components/Navigation.html");
  include("hero", "components/Hero.html");
  include("features", "components/FeaturesGrid.html");
  include("product", "components/ProductSection.html");
  include("cta", "components/CallToAction.html");
});
