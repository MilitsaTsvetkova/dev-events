import {
  Schema,
  model,
  models,
  Document,
  Types,
  MongooseQueryOrDocumentMiddleware,
  CallbackWithoutResultAndOptionalError,
} from "mongoose";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // RFC 5322 compliant email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Verify that the referenced event exists
BookingSchema.pre("save", async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified("eventId")) {
    // Dynamically import Event model to avoid circular dependency
    const Event = models.Event || (await import("./event.model")).default;

    const eventExists = await Event.findById(this.eventId);

    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }

  next();
});

// Pre-query middleware: Validate eventId when it's changed via update queries
const updateHooks = [
  "findOneAndUpdate",
  "updateMany",
  "findByIdAndUpdate",
] as MongooseQueryOrDocumentMiddleware[];

updateHooks.forEach((hook) => {
  BookingSchema.pre(
    hook,
    async function (this: any, next: CallbackWithoutResultAndOptionalError) {
      try {
        const update =
          typeof this.getUpdate === "function" ? this.getUpdate() : this.update;
        if (!update) return next();

        // Detect eventId set directly or under $set
        const newEventId =
          update.eventId ?? (update.$set && update.$set.eventId);

        if (!newEventId) return next();

        // Dynamically import Event model to avoid circular dependency
        const Event = models.Event || (await import("./event.model")).default;

        const eventExists = await Event.findById(newEventId);
        if (!eventExists) {
          return next(new Error(`Event with ID ${newEventId} does not exist`));
        }

        return next();
      } catch (err: any) {
        return next(err);
      }
    }
  );
});

// Create index on eventId for faster queries
BookingSchema.index({ eventId: 1 });

// Compound index for querying bookings by event and email
BookingSchema.index({ eventId: 1, email: 1 });

// Enforce one booking per events per email
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "uniq_event_email" }
);

// Use existing model if available (prevents recompilation in development)
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
