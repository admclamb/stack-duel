import React from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { cn } from "~/lib/utils";

type SiteLayoutProps = {
  mainClassName?: string;
} & React.ComponentProps<"div">;

export default function SiteLayout({
  className,
  children,
  mainClassName,
  ...props
}: SiteLayoutProps) {
  return (
    <div className={cn("flex min-h-svh flex-col", className)} {...props}>
      <header>
        <Navbar />
      </header>
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      <Footer />
    </div>
  );
}
