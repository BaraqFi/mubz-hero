'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <span className="font-bold">Mubz2Hero</span>
          </Link>
          <Link href="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/gym"
            className="text-muted-foreground hover:text-foreground"
          >
            Gym
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
