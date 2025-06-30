"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Globe,
  Cog,
  AlertCircle,
  X,
  Server,
  Copy,
  Check,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { findDomainsByIp, findSubdomains, checkCMS } from "@/lib/domain-finder";
import CaptchaChallenge from "@/components/captcha-challenge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { postData } from "@/services/API";
import { redisClient } from "@/lib/redis/redis";

export default function DomainFinderTool() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("reverse");
  const [detectCMS, setDetectCMS] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(true);
  const [captchaData, setCaptchaData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // CMS detection state
  const [cmsDetectionInProgress, setCmsDetectionInProgress] = useState(false);
  const [cmsDetectionPaused, setCmsDetectionPaused] = useState(false);
  const [cmsDetectionProgress, setCmsDetectionProgress] = useState(0);
  const [cmsDetectionTotal, setCmsDetectionTotal] = useState(0);
  const [cmsDetectionCurrent, setCmsDetectionCurrent] = useState(0);
  const [cmsDetectionQueue, setCmsDetectionQueue] = useState<number[]>([]);

  const BATCH_SIZE = 3; // Process 3 domains at a time

  const handleCaptchaSuccess = () => {
    setCaptchaRequired(false);
    setCaptchaData(null);

    // Retry the last operation
    handleSubmit(new Event("submit") as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!domain) {
      setError("Please enter a domain name");
      return;
    }

    setLoading(true);
    // Reset CMS detection state
    setCmsDetectionInProgress(false);
    setCmsDetectionPaused(false);
    setCmsDetectionProgress(0);
    setCmsDetectionCurrent(0);
    setCmsDetectionTotal(0);
    setCmsDetectionQueue([]);

    if (activeTab === "reverse") {
      postData("/domain-finder/reverse-ip", {
        url: domain,
      })
        .then((res) => {
          setLoading(false);

          setResults(
            res.data.domains.map((subdomain: string) => ({
              domain: subdomain,
              type: "subdomain",
              cms: null,
              cmsConfidence: null,
              vulnerabilities: [],
              cmsDetected: false,
              cmsDetectionFailed: false,
            }))
          );

          // If CMS detection is enabled, prepare for detection after showing initial results
          if (detectCMS && res.data.domains.length) {
            const indices = Array.from(
              { length: res.data.domains.length },
              (_, i) => i
            );
            setCmsDetectionQueue(indices);
            setCmsDetectionTotal(res.data.domains.length);
            setCmsDetectionInProgress(true);
          }
        })
        .catch((errors) => {
          const err = errors?.response?.data;
          setLoading(false);

          // Handle CAPTCHA requirement
          if (err.captchaRequired && err.captcha) {
            setCaptchaRequired(true);
            setCaptchaData(err.captcha);
            setError(
              err.error ||
                "Rate limit exceeded. Please complete the CAPTCHA to continue."
            );
          } else {
            setError(
              err.error || "An error occurred while processing your request."
            );
          }
        });
    }

    if (activeTab === "subdomain") {
      postData("/domain-finder/sub-domains", {
        url: domain,
      })
        .then((res) => {
          setLoading(false);

          setResults(
            res.data.subdomains.map((subdomain: string) => ({
              domain: subdomain,
              type: "subdomain",
              cms: null,
              cmsConfidence: null,
              vulnerabilities: [],
              cmsDetected: false,
              cmsDetectionFailed: false,
            }))
          );

          // If CMS detection is enabled, prepare for detection after showing initial results
          if (detectCMS && res.data.subdomains.length) {
            // Create a queue of indices to process
            console.log(res.data.subdomains);
            const indices = Array.from(
              { length: res.data.subdomains.length },
              (_, i) => i
            );
            setCmsDetectionQueue(indices);
            setCmsDetectionTotal(res.data.subdomains.length);
            setCmsDetectionInProgress(true);
          }
        })
        .catch((errors) => {
          const err = errors?.response?.data;
          setLoading(false);

          // Handle CAPTCHA requirement
          if (err.captchaRequired && err.captcha) {
            setCaptchaRequired(true);
            setCaptchaData(err.captcha);
            setError(
              err.error ||
                "Rate limit exceeded. Please complete the CAPTCHA to continue."
            );
          } else {
            setError(
              err.error || "An error occurred while processing your request."
            );
          }
        });
    }
  };

  // Process CMS detection queue
  useEffect(() => {
    let isMounted = true;
    // const test = async () => {
    //   const pong = await redisClient.ping();
    //   console.log("Redis connected?", pong);
    // };
    // test();
    const processCmsDetectionQueue = async () => {
      if (
        !cmsDetectionInProgress ||
        cmsDetectionPaused ||
        !results ||
        cmsDetectionQueue.length === 0
      ) {
        return;
      }

      // Take a batch of domains to process
      const batchIndices = cmsDetectionQueue.slice(0, BATCH_SIZE);
      const remainingQueue = cmsDetectionQueue.slice(BATCH_SIZE);
      setCmsDetectionQueue(remainingQueue);

      try {
        // Process the batch in parallel
        await Promise.all(
          batchIndices.map(async (index) => {
            if (!isMounted) return;

            // Update the current domain being processed
            setCmsDetectionCurrent((prev) => prev + 1);

            // Get the domain
            const item = results[index];

            // Detect CMS
            postData("/domain-finder/cms-checker", { url: item.domain })
              .then((res) => {
                if (isMounted) {
                  // Update the results with CMS information
                  setResults((prevResults) => {
                    if (!prevResults) return null;

                    const newResults = [...prevResults];
                    newResults[index] = {
                      ...newResults[index],
                      cms: res.data.cms,
                      cmsConfidence: res.data.confidence,
                      vulnerabilities: res.data.vulnerabilities || [],
                      cmsDetected: true,
                      cmsDetectionFailed: res.data.cms === "Error Checking",
                    };

                    return newResults;
                  });
                }
              })
              .catch((err) => {
                console.error(
                  `Failed to detect CMS for domain at index ${index}:`,
                  err
                );

                if (isMounted) {
                  // Mark as failed but continue with others
                  setResults((prevResults) => {
                    if (!prevResults) return null;

                    const newResults = [...prevResults];
                    newResults[index] = {
                      ...newResults[index],
                      cms: "Error Checking",
                      cmsConfidence: 0,
                      cmsDetected: true,
                      cmsDetectionFailed: true,
                    };

                    return newResults;
                  });
                }
              });
            // const cmsInfo = await checkCMS(item.domain);
          })
        );

        // Update progress
        if (isMounted) {
          const progress =
            ((cmsDetectionTotal - remainingQueue.length) / cmsDetectionTotal) *
            100;
          setCmsDetectionProgress(progress);

          // If queue is empty, we're done
          if (remainingQueue.length === 0) {
            setCmsDetectionInProgress(false);
          }
        }
      } catch (err) {
        console.error("Error in CMS detection batch:", err);
      }
    };

    // Start processing if there are items in the queue
    if (
      cmsDetectionInProgress &&
      !cmsDetectionPaused &&
      cmsDetectionQueue.length > 0
    ) {
      const timer = setTimeout(processCmsDetectionQueue, 500); // Increased delay to 500ms
      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [
    cmsDetectionInProgress,
    cmsDetectionPaused,
    cmsDetectionQueue,
    results,
    cmsDetectionTotal,
  ]);

  const toggleCmsDetectionPause = () => {
    setCmsDetectionPaused((prev) => !prev);
  };

  const clearResults = () => {
    setResults(null);
    setCmsDetectionInProgress(false);
    setCmsDetectionPaused(false);
    setCmsDetectionProgress(0);
    setCmsDetectionCurrent(0);
    setCmsDetectionTotal(0);
    setCmsDetectionQueue([]);
  };

  // Reset results when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResults(null);
    setError(null);
    setCmsDetectionInProgress(false);
    setCmsDetectionPaused(false);
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (!results) return;

    let clipboardText = "";

    results.forEach((item) => {
      clipboardText += `${item.domain}\n`;

      if (item.cmsDetected && !item.cmsDetectionFailed && item.cms) {
        clipboardText += `CMS: ${item.cms} (${item.cmsConfidence}% confidence)\n`;

        if (item.vulnerabilities && item.vulnerabilities.length > 0) {
          clipboardText += "Vulnerabilities:\n";
          item.vulnerabilities.forEach((vuln: string) => {
            clipboardText += `- ${vuln}\n`;
          });
        }

        clipboardText += "\n";
      }
    });

    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="reverse"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4 bg-[#1a1a1a] border border-[#2a2a3a]">
          <TabsTrigger
            value="reverse"
            className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]"
          >
            <Server className="w-4 h-4 mr-2" />
            Reverse IP
          </TabsTrigger>
          <TabsTrigger
            value="subdomain"
            className="data-[state=active]:bg-[#2a2a3a] data-[state=active]:text-[#00ff9d]"
          >
            <Globe className="w-4 h-4 mr-2" />
            Subdomains
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reverse" className="mt-0">
          <div className="p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md mb-4">
            <p className="text-sm text-gray-400">
              Enter a domain or IP address to find all domains hosted on the
              same server.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="subdomain" className="mt-0">
          <div className="p-4 border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md mb-4">
            <p className="text-sm text-gray-400">
              Enter a domain to discover all its subdomains using various
              techniques including SSL certificate data.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {captchaRequired && captchaData ? (
        <CaptchaChallenge
          captchaId={captchaData?.captchaId}
          question={captchaData?.question}
          onSuccess={handleCaptchaSuccess}
          onCancel={() => setCaptchaRequired(false)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={
                  activeTab === "reverse"
                    ? "Enter domain or IP (e.g., example.com or 192.168.1.1)"
                    : "Enter domain (e.g., example.com)"
                }
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-[#1a1a1a] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 h-12 pl-12 font-mono"
              />
              <Globe className="absolute left-4 top-3.5 h-5 w-5 text-[#00ff9d]" />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] hover:from-[#00b8ff] hover:to-[#00ff9d] text-black font-mono transition-all duration-300"
            >
              {loading ? (
                <>
                  <Cog className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan {activeTab === "reverse" ? "IP" : "Subdomains"}
                </>
              )}
            </Button>
          </div>

          {!results && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="detectCMS"
                checked={detectCMS}
                onCheckedChange={(checked) => setDetectCMS(checked as boolean)}
                className="border-[#2a2a3a] data-[state=checked]:bg-[#00ff9d] data-[state=checked]:text-black"
              />
              <Label
                htmlFor="detectCMS"
                className="text-sm font-mono text-gray-300 cursor-pointer"
              >
                Detect CMS and vulnerabilities (will be processed gradually
                after initial results)
              </Label>
            </div>
          )}
        </form>
      )}

      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 border-red-900 text-red-400"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cmsDetectionInProgress && (
        <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-mono text-gray-300">
                CMS Detection in Progress
              </h3>
              <p className="text-xs text-gray-400">
                Detecting {cmsDetectionCurrent} of {cmsDetectionTotal} domains (
                {Math.round(cmsDetectionProgress)}%)
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCmsDetectionPause}
              className="border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a]"
            >
              {cmsDetectionPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          </div>
          <Progress
            value={cmsDetectionProgress}
            className="h-2 bg-[#2a2a3a]"
            // indicatorClassName="bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]"
          />
        </div>
      )}

      {results && results.length && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono text-[#00ff9d]">
              Results ({results.length}{" "}
              {results.length === 1 ? "item" : "items"})
            </h2>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a]"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy all results to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                className="border-[#2a2a3a] text-[#00ff9d] hover:bg-[#2a2a3a]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearResults}
                className="border-[#2a2a3a] text-gray-400 hover:bg-[#2a2a3a]"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {results.map((item, index) => (
              <div
                key={index}
                className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md overflow-hidden backdrop-blur-sm"
              >
                <div className="bg-[#2a2a3a]/50 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-mono text-lg text-[#00ff9d]">
                    {item.domain}
                  </h3>
                  <div className="flex items-center gap-2">
                    {detectCMS && (
                      <span
                        className={`text-xs font-mono px-2 py-1 rounded ${
                          !item.cmsDetected
                            ? "bg-gray-500/20 text-gray-400"
                            : item.cmsDetectionFailed
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {!item.cmsDetected
                          ? "Pending CMS Detection"
                          : item.cmsDetectionFailed
                          ? "CMS Detection Failed"
                          : "CMS Detected"}
                      </span>
                    )}
                    <span className="text-sm font-mono bg-[#00ff9d]/10 text-[#00ff9d] px-2 py-1 rounded">
                      {item.type === "reverse" ? "Shared IP" : "Subdomain"}
                    </span>
                  </div>
                </div>

                {item.cmsDetected && !item.cmsDetectionFailed && item.cms && (
                  <div className="p-4 space-y-3 border-t border-[#2a2a3a]">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-mono text-gray-400 mb-1">
                          CMS
                        </h4>
                        <p className="font-mono text-white">{item.cms}</p>
                      </div>

                      {item.cmsConfidence && (
                        <span
                          className={`text-sm font-mono px-2 py-1 rounded ${
                            item.cmsConfidence > 80
                              ? "bg-green-500/20 text-green-400"
                              : item.cmsConfidence > 50
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.cmsConfidence}% Confidence
                        </span>
                      )}
                    </div>

                    {item.vulnerabilities &&
                      item.vulnerabilities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-mono text-gray-400 mb-2">
                            Known Vulnerabilities
                          </h4>
                          <div className="space-y-2">
                            {item.vulnerabilities.map(
                              (vuln: string, i: number) => (
                                <div
                                  key={i}
                                  className="px-3 py-2 bg-red-900/20 border border-red-900/30 rounded text-red-400"
                                >
                                  <AlertCircle className="inline-block mr-2 h-4 w-4" />
                                  {vuln}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <Alert className="bg-yellow-900/20 border-yellow-900/30 text-yellow-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Results Found</AlertTitle>
          <AlertDescription>
            No {activeTab === "reverse" ? "domains" : "subdomains"} were found
            for the provided input.
          </AlertDescription>
        </Alert>
      )}

      {!results && !loading && !captchaRequired && (
        <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md p-8 text-center backdrop-blur-sm">
          <Globe className="h-12 w-12 text-[#00ff9d] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-mono mb-2 text-gray-300">
            Enter a domain to start scanning
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            {activeTab === "reverse"
              ? "Find all domains hosted on the same IP address."
              : "Discover all subdomains for a given domain."}
          </p>
        </div>
      )}

      <div className="border border-[#2a2a3a] bg-[#1a1a1a]/50 rounded-md p-4 text-sm text-gray-400 font-mono backdrop-blur-sm">
        <p className="mb-2">
          <span className="text-[#00ff9d]">Note:</span> This tool is for
          educational purposes and security research only.
        </p>
        <p>
          Always ensure you have permission to scan the target domain.
          Unauthorized scanning may violate laws and regulations.
        </p>
      </div>
    </div>
  );
}
