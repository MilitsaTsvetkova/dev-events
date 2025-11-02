export type EventItem = {
  id: string;
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    id: "1",
    title: "Hackathon 2024",
    image: "/images/event1.png",
    slug: "hackathon-2024",
    location: "San Francisco, CA",
    date: "2024-09-15",
    time: "10:00 AM",
  },
  {
    id: "2",
    title: "Tech Meetup NYC",
    image: "/images/event2.png",
    slug: "tech-meetup-nyc",
    location: "New York, NY",
    date: "2024-10-05",
    time: "2:00 PM",
  },
  {
    id: "3",
    title: "Dev Conference",
    image: "/images/event3.png",
    slug: "dev-conference",
    location: "Austin, TX",
    date: "2024-11-10",
    time: "9:00 AM",
  },
  {
    id: "4",
    title: "Open Source Summit",
    image: "/images/event4.png",
    slug: "open-source-summit",
    location: "Seattle, WA",
    date: "2024-12-01",
    time: "11:00 AM",
  },
  {
    id: "5",
    title: "AI & ML Workshop",
    image: "/images/event5.png",
    slug: "ai-ml-workshop",
    location: "Boston, MA",
    date: "2025-01-20",
    time: "1:00 PM",
  },
];
