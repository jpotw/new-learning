import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">New Learning</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Documents</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-medium">Your Documents</h3>
                      <p className="text-sm text-muted-foreground">
                        Access your uploaded documents and notes
                      </p>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/documents"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">All Documents</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View and manage all your uploaded documents
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Summaries</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-medium">Your Summaries</h3>
                      <p className="text-sm text-muted-foreground">
                        Access your generated summaries and notes
                      </p>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/summaries"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">All Summaries</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View and manage all your generated summaries
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-2">
            {/* Theme toggle will be added in Step 24 */}
            <Button variant="outline" size="sm">
              Upload
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 