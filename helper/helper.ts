import { parse } from "tldts";

type DomainInfo = {
  fullDomain: string | null;
  subdomain: string | null;
  rootDomain: string | null;
  domainName: string | null;
  tld: string | null;
  isIP: boolean | null;
};

export function getDomainInfo(domain: string): DomainInfo {
  const result = parse(domain);

  return {
    fullDomain: result.hostname,
    subdomain: result.subdomain || null,
    rootDomain: result.domain || null,
    domainName: result.domainWithoutSuffix || null,
    tld: result.publicSuffix ? `.${result.publicSuffix}` : null,
    isIP: result.isIp,
  };
}