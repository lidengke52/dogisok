import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "API Documentation — Dog is OK",
  description: "REST API for accessing Dog is OK articles and content.",
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
      <code>{code}</code>
    </pre>
  )
}

function Endpoint({
  method,
  path,
  description,
  params,
  example,
  response,
}: {
  method: "GET" | "POST"
  path: string
  description: string
  params?: { name: string; type: string; required: boolean; desc: string }[]
  example: string
  response: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
          {method}
        </span>
        <code className="font-mono text-sm font-semibold text-foreground">{path}</code>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>

      {params && params.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Required</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs">{p.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-2">
                      {p.required ? (
                        <Badge variant="default" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example Request</p>
        <CodeBlock code={example} />
      </div>
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example Response</p>
        <CodeBlock code={response} />
      </div>
    </div>
  )
}

export default function ApiDocsPage() {
  const baseUrl = "https://dogisok.com"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20 lg:px-8">

          {/* Header */}
          <div className="mb-12">
            <Badge className="mb-4">REST API v1</Badge>
            <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Access Dog is OK articles and content programmatically. All endpoints require a valid API key.
            </p>
          </div>

          {/* Authentication */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Authentication</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                All API requests must include your API key in the <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Authorization</code> header using the Bearer scheme.
              </p>
              <CodeBlock code={`Authorization: Bearer dik_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Keep your API key secret. Contact us at dogisok.com to request an API key.
                </p>
              </div>
            </div>
          </section>

          {/* Base URL */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Base URL</h2>
            <CodeBlock code={`${baseUrl}/api/v1`} />
          </section>

          {/* Errors */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Error Codes</h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["401", "Missing Authorization header"],
                    ["403", "Invalid or revoked API key"],
                    ["404", "Resource not found"],
                    ["500", "Internal server error"],
                  ].map(([code, meaning]) => (
                    <tr key={code} className="border-t border-border">
                      <td className="px-4 py-3 font-mono font-semibold">{code}</td>
                      <td className="px-4 py-3 text-muted-foreground">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-4">
            <h2 className="mb-6 text-2xl font-semibold">Endpoints</h2>

            <Endpoint
              method="GET"
              path="/api/v1/articles"
              description="Returns a paginated list of published articles. Optionally filter by category."
              params={[
                { name: "page",     type: "integer", required: false, desc: "Page number, default 1" },
                { name: "limit",    type: "integer", required: false, desc: "Items per page, max 50, default 20" },
                { name: "category", type: "string",  required: false, desc: "Filter by category slug: food, behavior, knowledge, breed, health" },
              ]}
              example={`curl -X GET "${baseUrl}/api/v1/articles?page=1&limit=10" \\
  -H "Authorization: Bearer dik_your_api_key"`}
              response={`{
  "data": [
    {
      "slug": "can-dogs-eat-blueberries",
      "title": "Can Dogs Eat Blueberries?",
      "category": "food",
      "tags": ["fruit", "safe"],
      "author": "Dr. Sarah Chen",
      "read_time": 4,
      "image": "https://dogisok.com/...",
      "excerpt": "Blueberries are safe for dogs...",
      "published_at": "2025-01-15T10:00:00Z",
      "url": "https://dogisok.com/articles/can-dogs-eat-blueberries"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/articles/:slug"
              description="Returns full details and content of a single article by its slug."
              params={[
                { name: "slug", type: "string", required: true, desc: "The article slug (from the URL path)" },
              ]}
              example={`curl -X GET "${baseUrl}/api/v1/articles/can-dogs-eat-blueberries" \\
  -H "Authorization: Bearer dik_your_api_key"`}
              response={`{
  "data": {
    "slug": "can-dogs-eat-blueberries",
    "title": "Can Dogs Eat Blueberries?",
    "excerpt": "Blueberries are safe for dogs...",
    "content": "# Can Dogs Eat Blueberries?\\n\\nYes, dogs can...",
    "category": "food",
    "tags": ["fruit", "safe"],
    "author": "Dr. Sarah Chen",
    "read_time": 4,
    "image": "https://dogisok.com/...",
    "published_at": "2025-01-15T10:00:00Z",
    "url": "https://dogisok.com/articles/can-dogs-eat-blueberries"
  }
}`}
            />

            <Endpoint
              method="GET"
              path="/api/v1/categories"
              description="Returns a list of all available article categories."
              example={`curl -X GET "${baseUrl}/api/v1/categories" \\
  -H "Authorization: Bearer dik_your_api_key"`}
              response={`{
  "data": [
    { "slug": "food",      "label": "Can Eat",     "description": "What dogs can and cannot eat" },
    { "slug": "behavior",  "label": "Can Do",      "description": "Dog behavior & training" },
    { "slug": "knowledge", "label": "Knowledge",   "description": "General dog care knowledge" },
    { "slug": "breed",     "label": "Breed Guide", "description": "Dog breed guides & comparisons" },
    { "slug": "health",    "label": "Health",      "description": "Dog health & veterinary advice" }
  ]
}`}
            />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
