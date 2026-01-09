export async function fetchTripPlan(destination, days) {
  const response = await fetch("/api/generate_plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, days: parseInt(days) }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Błąd serwera");
  }
  return await response.json();
}
