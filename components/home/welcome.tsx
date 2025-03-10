import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Welcome() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Welcome to New Learning</CardTitle>
        <CardDescription>Your personal learning and document analysis assistant</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Upload PDF documents, ask questions, take notes, and generate summaries to enhance your learning experience.
          Get started by uploading a document or accessing your recent materials below.
        </p>
      </CardContent>
    </Card>
  );
} 