import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShellsService } from "@/lib/database-services/shells-service"
import ShellDetail from "@/components/shell-detail"

interface ShellPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ShellPageProps): Promise<Metadata> {
  const shell = await ShellsService.getShellById(params.id)

  if (!shell || !shell.is_active) {
    return {
      title: "Shell Not Found | Cyberpunk Web Shell Hub",
      description: "The requested web shell could not be found.",
    }
  }

  return {
    title: `${shell.name} | Cyberpunk Web Shell Hub`,
    description: shell.description.substring(0, 160),
    keywords: [
      "web shell",
      shell.language,
      shell.category,
      ...(shell.tags || []),
      "cybersecurity",
      "penetration testing",
    ].join(", "),
  }
}

export default async function ShellPage({ params }: ShellPageProps) {
  const shell = await ShellsService.getShellById(params.id)

  if (!shell || !shell.is_active) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ShellDetail shell={shell} />
    </main>
  )
}
