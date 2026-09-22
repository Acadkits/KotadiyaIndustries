import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { COMPANY } from "@/lib/company";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mono-label text-primary">404</div>
        <h1 className="mt-4 font-display text-4xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="mt-6 inline-flex rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
          Return home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. You can retry or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_TITLE = `${COMPANY.name} — Precision CNC Components & Custom Manufacturing`;
const SITE_DESC = "Kotadiya Industries manufactures precision-engineered CNC components — rebar couplers, shafts, flanges, bushes and custom parts — with a focus on quality, accuracy, and reliable B2B partnership.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: COMPANY.name },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: COMPANY.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b1024" },
      { title: "Kotadiya Industry" },
      { property: "og:title", content: "Kotadiya Industry" },
      { name: "twitter:title", content: "Kotadiya Industry" },
      { name: "description", content: "Precision Forge is a B2B industrial website for Kotadiya Industries, showcasing precision engineering and manufacturing capabilities." },
      { property: "og:description", content: "Precision Forge is a B2B industrial website for Kotadiya Industries, showcasing precision engineering and manufacturing capabilities." },
      { name: "twitter:description", content: "Precision Forge is a B2B industrial website for Kotadiya Industries, showcasing precision engineering and manufacturing capabilities." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e83b3c4b-f5b2-43c4-ab70-69d63ff273ae/id-preview-2ec33477--34cc1253-6797-4f55-96ea-8c02cc913deb.lovable.app-1785153953876.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e83b3c4b-f5b2-43c4-ab70-69d63ff273ae/id-preview-2ec33477--34cc1253-6797-4f55-96ea-8c02cc913deb.lovable.app-1785153953876.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: COMPANY.name,
          url: `https://${COMPANY.website}`,
          telephone: COMPANY.phone,
          email: COMPANY.email,
          description: SITE_DESC,
        }),
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isApp = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/reset-password");
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        {!isApp && <Navbar />}
        <main className={isApp ? "flex-1" : "flex-1 pt-16 sm:pt-20"}>
          <Outlet />
        </main>
        {!isApp && <Footer />}
        {!isApp && <FloatingActions />}
        <Toaster position="bottom-center" theme="dark" richColors />
      </div>
    </QueryClientProvider>
  );
}
