import { Schema, model, models, Document } from 'mongoose';

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
      required: [true, 'Title is required'],
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
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Generate slug from title and normalize date/time
EventSchema.pre('save', async function (next) {
  // Only regenerate slug if title has changed
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format. Please provide a valid date.');
    }
    this.date = parsedDate.toISOString().split('T')[0];
  }

  // Normalize time format to HH:MM (24-hour format)
  if (this.isModified('time')) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(this.time)) {
      throw new Error('Invalid time format. Use HH:MM (24-hour format).');
    }
  }

  next();
});

// Create unique index on slug
EventSchema.index({ slug: 1 }, { unique: true });

// Use existing model if available (prevents recompilation in development)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
