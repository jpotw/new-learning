import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

export function RecentDocuments() {
  // TODO: Fetch recent documents from the database
  const recentDocuments = [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {recentDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 opacity-50 mb-2" />
            <p>No documents yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recentDocuments.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="flex-1 truncate">{doc.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 