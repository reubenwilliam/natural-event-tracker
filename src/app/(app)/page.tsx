import MapContent from "./map-content";

const fetchEvents = async () => {
  const response = await fetch(
    "https://eonet.gsfc.nasa.gov/api/v2.1/events?status=open&days=30",
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch events API.");
  }

  return response.json();
};

const fetchCategories = async () => {
  const response = await fetch(
    "https://eonet.gsfc.nasa.gov/api/v2.1/categories",
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_NASA_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 },
    },
  );

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

  console.log("Events Result:", events);

  return <MapContent initialEvents={events} initialCategories={categories} />;
};

export default Page;
