import Link from "next/link";
import Logo from "~/components/logo";

const platformLinks = [
  { name: "Problems", href: "/problems" },
  { name: "Games", href: "/" },
  { name: "Dashboard", href: "/" },
];

const accountLinks = [{ name: "Profile Settings", href: "/settings" }];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)] bg-[size:6rem_6rem]"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3">
          <Logo />
          <p className="text-muted-foreground max-w-xs text-sm">
            StackDuel is an online competitive coding platform. Practice through
            competition.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Platform</h3>
          <ul className="flex flex-col gap-2">
            {platformLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/sign-up"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Sign Up
              </Link>
            </li>
            {accountLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} StackDuel. Practice through
            competition.
          </p>
        </div>
      </div>
    </footer>
  );
}
