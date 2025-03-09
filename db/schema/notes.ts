import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { documents, documentPages } from "./documents";

// Notes table to store user notes on documents
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  pageId: uuid("page_id").references(() => documentPages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
});

// Highlights table to store text highlights in documents
export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  pageId: uuid("page_id").references(() => documentPages.id, { onDelete: "cascade" }),
  textContent: text("text_content").notNull(),
  startOffset: text("start_offset").notNull(),
  endOffset: text("end_offset").notNull(),
  color: text("color").default("yellow"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
  noteId: uuid("note_id").references(() => notes.id, { onDelete: "set null" }),
}); 