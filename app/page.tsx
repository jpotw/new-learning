import { Welcome } from "@/components/home/welcome";
import { RecentDocuments } from "@/components/home/recent-documents";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Welcome />
          <div className="flex justify-center md:justify-start">
            <Button asChild size="lg">
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          </div>
        </div>
        <div>
          <RecentDocuments />
        </div>
      </div>
    </div>
  );
}
