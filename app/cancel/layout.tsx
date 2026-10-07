import { Suspense } from "react";

// Enda syftet: en Suspense-ram runt sidan. Sidan läser webbadressen
// (useSearchParams), och utan ramen misslyckas "npm run build" (Vercel).
// Sidan själv ändras inte.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
