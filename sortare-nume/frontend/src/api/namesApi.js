// ─────────────────────────────────────────────────────────────
// Stratul API — singurul loc din React care comunică cu backend-ul
// ─────────────────────────────────────────────────────────────

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/names`;

// ─────────────────────────────────────────────────────────────
// POST /api/names/sort
// Trimite array-ul de nume, primește înapoi:
//   { sorted: [...], fileUrl: "/output/...", fileName, count }
// ─────────────────────────────────────────────────────────────
export async function sortNames(names) {
  const response = await fetch(`${BASE_URL}/sort`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      err.errors?.join(", ") || err.error || "Nu s-a putut sorta lista."
    );
  }
  return response.json();
}
