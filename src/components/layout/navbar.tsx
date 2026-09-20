"use client";

import Link from "next/link";
import { Show, SignOutButton, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import Logo from "~/components/logo";
import { ModeToggle } from "~/components/mode-toggle";

const defaultRoutes = [
  { name: "Home", href: "/" },
  { name: "Problems", href: "/" },
  { name: "Games", href: "/" },
  { name: "Blog", href: "/" },
];

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="bg-background/60 mx-auto grid max-w-6xl grid-cols-2 gap-3 rounded-full border px-6 py-3 shadow-lg backdrop-blur-md md:grid-cols-3">
        <Logo />
        <ul className="text-muted-foreground hidden items-center gap-3 justify-self-center md:flex">
          {defaultRoutes.map((route) => (
            <li key={route.name} className="hidden md:block">
              <Link href={route.href}>{route.name}</Link>
            </li>
          ))}
        </ul>
        <ul className="row-reverse md:row flex items-center gap-2 justify-self-end md:gap-3">
          <Show when="signed-out">
            <li className="hidden md:block">
              <Button asChild variant="ghost" data-testid="sign-in-button">
                <Link href="/sign-in">Login</Link>
              </Button>
            </li>
            <li className="hidden md:block">
              <Button
                asChild
                variant="default"
                className="rounded-full"
                data-testid="sign-up-button"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </li>
          </Show>
          <Show when="signed-in">
            <li className="hidden md:flex md:items-center">
              <UserButton
                appearance={{
                  elements: { userButtonBox: "flex items-center" },
                }}
              />
            </li>
          </Show>
          <li>
            <ModeToggle />
          </li>
          <li className="block md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" aria-label="Open navigation menu">
                  <MenuIcon aria-hidden="true" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="px-2">
                  <ul className="flex flex-col gap-2">
                    {defaultRoutes.map((route) => (
                      <li key={route.name}>
                        <Button
                          variant="ghost"
                          asChild
                          className="w-full justify-start py-5 text-start"
                        >
                          <Link href={route.href}>{route.name}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                <SheetFooter>
                  <Show when="signed-in">
                    <SignOutButton>
                      <Button variant="default">Log Out</Button>
                    </SignOutButton>
                  </Show>
                  <Show when="signed-out">
                    <Card className="rounded">
                      <CardHeader>
                        <CardTitle>Join the StackDuel community</CardTitle>
                        <CardDescription>
                          Sign up to track progress, solve problems, and
                          compete.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3">
                        <Button asChild variant="outline" className="grow">
                          <Link href="/sign-in" data-testid="sign-in-button">
                            Login
                          </Link>
                        </Button>
                        <Button asChild variant="default">
                          <Link href="/sign-up" data-testid="sign-up-button">
                            Get Started
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </Show>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </div>
    </nav>
  );
}
