import { parse } from "tldts";
// @ts-ignore
import { getName } from "country-list";

export const useClassifyDomain = (url: string) => {
  const { publicSuffix, subdomain } = parse(url);

  const tldParts = publicSuffix?.split(".") || [];
  const countryCode = tldParts[tldParts.length - 1]?.toUpperCase() || "";
  const countryName = getName(countryCode) || "Unknown";

  const candidates = [
    ...tldParts.slice(0, -1),
    ...(subdomain?.split(".") || []),
  ];

  let category = "Other";

  for (const part of candidates) {
    switch (part.toLowerCase()) {
      case "gov":
      case "go":
        category = "Government";
        break;
      case "edu":
      case "ac":
        category = "Education";
        break;
      case "org":
      case "ngo":
        category = "Organization";
        break;
      case "mil":
        category = "Military";
        break;
      case "com":
        category = "Commercial";
        break;
      case "net":
        category = "Network";
        break;
      case "int":
        category = "International";
        break;
      case "co":
        category = "Company";
        break;
      case "health":
        category = "Healthcare";
        break;
      case "bank":
      case "finance":
        category = "Finance";
        break;
      case "law":
      case "legal":
        category = "Legal";
        break;
      case "museum":
        category = "Cultural";
        break;
      case "news":
      case "press":
        category = "News";
        break;
      case "science":
        category = "Science";
        break;
      case "tech":
        category = "Technology";
        break;
      case "store":
      case "shop":
        category = "Retail";
        break;
      case "tv":
      case "media":
        category = "Media";
        break;
      case "blog":
        category = "Personal";
        break;
    }
    if (category !== "Other") break;
  }

  return { country: countryName, category };
};
