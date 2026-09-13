import { absoluteUrl, localePath, site } from "@/lib/site";
import { getContent } from "@/lib/content";

export const dynamic = "force-static";

export function GET() {
  const tr = getContent("tr");
  const en = getContent("en");

  const body = `# ${site.person.name}

> ${en.meta.description}

## Pages
- [Türkçe](${absoluteUrl(localePath("tr"))}): ${tr.meta.description}
- [English](${absoluteUrl(localePath("en"))}): ${en.meta.description}

## Who
${site.person.name} is a full stack developer based in ${site.person.location.city}, Turkey, and a final year Software Engineering student at ${site.education.institution}.

Since January 2022 he has been building the backend of an e-commerce business with Node.js, Express, TypeScript, Prisma ORM and PostgreSQL, including JWT authentication and role based access control. Since July 2026 he has worked as a full stack developer intern at ideaZone Digital, where he built a three language corporate site of more than 200 pages with Next.js App Router and owned its search visibility, structured data and Core Web Vitals.

## What he works with
${en.skills.groups.map((g) => `- ${g.name}: ${g.items.join(", ")}`).join("\n")}
- Currently learning: ${en.skills.learning.join(", ")}

## Contact
- Email: ${site.person.email}
- GitHub: ${site.social.github}
- LinkedIn: ${site.social.linkedin}
- CV (Turkish): ${absoluteUrl(site.cv.tr)}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
