import { Schema, model, models, Document } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: ["online", "offline", "hybrid"],
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helper functions for normalization/validation
function normalizeSlug(title: unknown): string {
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("Title must be a non-empty string to generate slug.");
  }
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Trim leading/trailing hyphens
    .trim();
}

function normalizeDate(date: unknown): string {
  // Accept Date or string that can be parsed by Date
  const parsedDate = new Date(date as any);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format. Please provide a valid date.");
  }
  return parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

function validateAndNormalizeTime(time: unknown): string {
  if (typeof time !== "string") {
    throw new Error("Invalid time format. Use HH:MM (24-hour format).");
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    throw new Error("Invalid time format. Use HH:MM (24-hour format).");
  }
  // Ensure zero-padded HH:MM
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

// Pre-save hook: Generate slug from title and normalize date/time
EventSchema.pre("save", async function (next) {
  try {
    // Only regenerate slug if title has changed
    if (this.isModified("title")) {
      this.slug = normalizeSlug(this.title);
    }

    // Normalize date to ISO format (YYYY-MM-DD)
    if (this.isModified("date")) {
      this.date = normalizeDate(this.date);
    }

    // Normalize/validate time format to HH:MM (24-hour format)
    if (this.isModified("time")) {
      this.time = validateAndNormalizeTime(this.time);
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});

// Shared helper to apply normalizations to an update payload
function applyNormalizationsToUpdate(update: any) {
  if (!update) return update;

  // Source of fields can be update.$set or the update itself (replacement)
  const source = update.$set ? update.$set : update;
  // Work on a shallow copy to avoid mutating unexpected places
  const newSet: Record<string, any> = { ...source };

  // Only run normalization when the field is actually present in the update payload
  const hasTitle = Object.prototype.hasOwnProperty.call(source, "title");
  const hasDate = Object.prototype.hasOwnProperty.call(source, "date");
  const hasTime = Object.prototype.hasOwnProperty.call(source, "time");

  if (hasTitle) {
    newSet.slug = normalizeSlug(newSet.title);
  }
  if (hasDate) {
    newSet.date = normalizeDate(newSet.date);
  }
  if (hasTime) {
    newSet.time = validateAndNormalizeTime(newSet.time);
  }

  // Ensure we set the normalized values in $set so operators continue to work
  update.$set = { ...(update.$set || {}), ...newSet };

  return update;
}

// Query middleware to handle findOneAndUpdate and updateOne
EventSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  try {
    const update = this.getUpdate();
    if (!update) return next();
    const newUpdate = applyNormalizationsToUpdate(update);
    this.setUpdate(newUpdate);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Create unique index on slug
EventSchema.index({ slug: 1 }, { unique: true });

// Create compound index for common queries
EventSchema.index({ date: 1, mode: 1 });

// Use existing model if available (prevents recompilation in development)
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
