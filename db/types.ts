import { InferSelectModel } from 'drizzle-orm';
import * as schema from './schema';

// This type represents the database schema
export type Database = {
  public: {
    Tables: {
      documents: {
        Row: InferSelectModel<typeof schema.documents>;
        Insert: typeof schema.documents.$inferInsert;
        Update: Partial<typeof schema.documents.$inferInsert>;
      };
      notes: {
        Row: InferSelectModel<typeof schema.notes>;
        Insert: typeof schema.notes.$inferInsert;
        Update: Partial<typeof schema.notes.$inferInsert>;
      };
      qa_sessions: {
        Row: InferSelectModel<typeof schema.qaSessions>;
        Insert: typeof schema.qaSessions.$inferInsert;
        Update: Partial<typeof schema.qaSessions.$inferInsert>;
      };
      qa_messages: {
        Row: InferSelectModel<typeof schema.qaMessages>;
        Insert: typeof schema.qaMessages.$inferInsert;
        Update: Partial<typeof schema.qaMessages.$inferInsert>;
      };
      qa_branches: {
        Row: InferSelectModel<typeof schema.qaBranches>;
        Insert: typeof schema.qaBranches.$inferInsert;
        Update: Partial<typeof schema.qaBranches.$inferInsert>;
      };
      summaries: {
        Row: InferSelectModel<typeof schema.summaries>;
        Insert: typeof schema.summaries.$inferInsert;
        Update: Partial<typeof schema.summaries.$inferInsert>;
      };
    };
    Views: {};
    Functions: {};
  };
}; 