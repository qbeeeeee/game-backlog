import { MediaType, TrackStatus } from "@prisma/client";
import { z } from "zod";

const dateString = z.string().datetime({ offset: true }).optional();

export const createTrackedItemSchema = z.object({
  mediaType: z.nativeEnum(MediaType),
  status: z.nativeEnum(TrackStatus).default("BACKLOG"),
  title: z.string().min(1).max(200),
  externalId: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
  notes: z.string().max(5000).optional(),
  rating: z.number().int().min(1).max(10).optional(),
  progressCurrent: z.number().int().min(0).optional(),
  progressTotal: z.number().int().min(0).optional(),
  startedAt: dateString,
  completedAt: dateString,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateTrackedItemSchema = createTrackedItemSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required to update a tracked item.",
  });

export const trackerQuerySchema = z.object({
  mediaType: z.nativeEnum(MediaType).optional(),
  status: z.nativeEnum(TrackStatus).optional(),
  externalId: z.string().max(120).optional(),
  source: z.string().max(60).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
