import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { documents } from "./documents";

// QA sessions table to store conversation sessions
export const qaSessions = pgTable("qa_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
});

// QA messages table to store individual messages in a session
export const qaMessages = pgTable("qa_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => qaSessions.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// QA branches table to store branching conversations
export const qaBranches = pgTable("qa_branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => qaSessions.id, { onDelete: "cascade" }).notNull(),
  parentMessageId: uuid("parent_message_id").references(() => qaMessages.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
});

// Summaries table to store generated summaries
export const summaries = pgTable("summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => qaSessions.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
}); 