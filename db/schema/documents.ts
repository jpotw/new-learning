import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Documents table to store uploaded PDF documents
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(),
  fileType: text("file_type").notNull(),
  storagePath: text("storage_path").notNull(),
  textContent: text("text_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
});

// Document pages table to store individual page information
export const documentPages = pgTable("document_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  pageNumber: serial("page_number").notNull(),
  textContent: text("text_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}); 