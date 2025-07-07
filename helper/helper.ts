import { parse } from "tldts";
import base64url from "base64url";

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

export function encoderData(data: string): string {
  const raw = data;
  return base64url.encode(raw);
}

export function decoderData(data: string): string[] {
  const decoded = base64url.decode(data);
  const decodedData: string[] = decoded.split("-");
  return decodedData;
}
