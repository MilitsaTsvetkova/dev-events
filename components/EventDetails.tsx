import { notFound } from "next/navigation";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetails = async ({ slug }: { slug: string }) => {
  let event;
  try {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!request.ok) {
      if (request.status === 404) {
        return notFound();
      }
      throw new Error(`Failed to fetch event: ${request.statusText}`);
    }

    const response = await request.json();
    event = response.event;

    if (!event) {
      return notFound();
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    return notFound();
  }

  const {
    title,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags,
    organizer,
  } = event;

  if (!description) return notFound();

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p className="mt-2">{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={image}
            alt={title}
            width={800}
            height={800}
            className="banner"
          />
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="Calendar"
              label={date}
            />
            <EventDetailItem icon="/icons/clock.svg" alt="Time" label={time} />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="Location"
              label={location}
            />
            <EventDetailItem icon="/icons/mode.svg" alt="Mode" label={mode} />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="Audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={JSON.parse(agenda[0])} />

          <section className="flex-col-gap-2">
            <h2>About the organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={JSON.parse(tags[0])} />
        </div>
        <aside className="booking">
          <p className="text-lg font-semibold">Book Event</p>
        </aside>
      </div>
    </section>
  );
};

export default EventDetails;
