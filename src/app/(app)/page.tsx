import { API_URL } from "@/types/eonet";
import MapContent from "./map-content";

const fetchEvents = async () => {
  const response = await fetch(`${API_URL}/events?status=open&days=60`, {
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
    throw new Error("Failed to fetch events API.");
  }

  return response.json();
};

const Page = async () => {
  const [eventsQuery, categoriesQuery] = await Promise.all([
    fetchEvents(),
    fetchCategories(),
  ]);

  const events = eventsQuery?.events || [];
  const categories = categoriesQuery?.categories || [];

  return <MapContent initialEvents={events} initialCategories={categories} />;
};

export default Page;
