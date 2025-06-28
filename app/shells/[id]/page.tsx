import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShellDetail from "@/components/shell-detail";
import { baseURL } from "@/services/API";

interface ShellPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ShellPageProps): Promise<Metadata> {
  const fetchData = async () => {
    try {
      const webshellRes = await fetch(`${baseURL}/webshells/${params.id}`, {
        method: "GET",
        cache: "no-store",
      });

      return { webshell: await webshellRes.json() };
    } catch (error) {
      return { error: "Faild to get webshell information" };
    }
  };

  const { webshell, error } = await fetchData();

  if (!webshell || !webshell.is_active) {
    return {
      title: "Shell Not Found | Cyberpunk Web Shell Hub",
      description: "The requested web shell could not be found.",
    };
  }

  return {
    title: `${webshell.name} | Cyberpunk Web Shell Hub`,
    description: webshell.description.substring(0, 160),
    keywords: [
      "web shell",
      webshell.language,
      webshell.category,
      ...(webshell.tags || []),
      "cybersecurity",
      "penetration testing",
    ].join(", "),
  };
}

export default async function ShellPage({ params }: ShellPageProps) {
  const fetchData = async () => {
    try {
      const webshellRes = await fetch(`${baseURL}/webshells/${params.id}`, {
        method: "GET",
        cache: "no-store",
      });

      return { webshell: await webshellRes.json() };
    } catch (error) {
      return { error: "Faild to get webshell information" };
    }
  };

  const { webshell, error } = await fetchData();

  if (!webshell || !webshell.is_active) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ShellDetail shell={webshell} />
    </main>
  );
}
