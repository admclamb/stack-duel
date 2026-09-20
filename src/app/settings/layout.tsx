// Authentication is already enforced by middleware.ts for /settings/*. This shell exists so
// later phases have a place to hang settings-specific chrome (tab nav, etc.) without another
// round of auth wiring.
export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
