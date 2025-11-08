"use client";
import React from "react";
import { createBooking } from "../lib/actions/booking.action";
import posthog from "posthog-js";

const BookEvent = ({ slug, eventId }: { slug: string; eventId: string }) => {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success, error } = await createBooking({
      eventId,
      slug,
      email,
    });

    if (success) {
      setSubmitted(true);
      posthog.capture("event_booked", { slug, email, eventId });
    } else {
      console.error("Error creating booking:", error);
      posthog.captureException(error);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="button-submit">
            Book Now
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
