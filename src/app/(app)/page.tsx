import { API_URL } from "@/types/eonet";
import MapContent from "./map-content";

const fetchEvents = async () => {
  const response = await fetch(`${API_URL}/events?status=open&days=90`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch events API.");
  }

  return response.json();
};

const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories API.");
  }

  return response.json();
};

const fetchSources = async () => {
  const response = await fetch(`${API_URL}/sources`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch sources API.");
  }

  return response.json();
};

const fetchMagnitudes = async () => {
  const response = await fetch(`${API_URL}/magnitudes`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch magnitudes API.");
  }

  return response.json();
};

const Page = async () => {
  const [eventsQuery, categoriesQuery, sourcesQuery, magnitudesQuery] =
    await Promise.all([
      fetchEvents(),
      fetchCategories(),
      fetchSources(),
      fetchMagnitudes(),
    ]);

  const events = eventsQuery?.events || [];
  const categories = categoriesQuery?.categories || [];
  const sources = sourcesQuery?.sources || [];
  const magnitudes = magnitudesQuery?.magnitudes || [];

  return (
    <MapContent
      events={events}
      categories={categories}
      sources={sources}
      magnitudes={magnitudes}
    />
  );
};

export default Page;
