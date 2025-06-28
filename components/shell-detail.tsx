"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Copy,
  Check,
  FileCode,
  Calendar,
  User,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WebShell } from "@/lib/database-services/shells-service";
import { getData } from "@/services/API";

interface ShellDetailProps {
  shell: WebShell;
}

export default function ShellDetail({ shell }: ShellDetailProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shell.file_path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = async () => {
    setDownloading(true);

    window.open(
      `/api/webshells/download/${shell.id}`,
      "_blank",
      "noopener,noreferrer"
    );

    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isGitHubLink = (url: string) => {
    return (
      url.includes("github.com") || url.includes("raw.githubusercontent.com")
    );
  };

  const getGitHubRepoInfo = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2],
          repoUrl: `https://github.com/${match[1]}/${match[2]}`,
        };
      }
    } catch (error) {
      console.error("Error parsing GitHub URL:", error);
    }
    return null;
  };

  const repoInfo = isGitHubLink(shell.file_path)
    ? getGitHubRepoInfo(shell.file_path)
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/shells"
          className="inline-flex items-center text-gray-400 hover:text-[#00ff9d] transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Shells
        </Link>
      </div>

      {/* Header */}
      <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="p-3 bg-[#2a2a3a] rounded-md mr-4">
              <FileCode className={`h-8 w-8 ${getTypeColor(shell.language)}`} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {shell.name}
              </h1>
              <div className="text-gray-400 flex items-center mt-1">
                <Badge
                  variant="outline"
                  className="mr-2 bg-[#2a2a3a] border-none"
                >
                  {shell.language.toUpperCase()}
                </Badge>
                <span className="text-sm">{shell.category}</span>
              </div>
              {repoInfo && (
                <p className="text-gray-500 text-sm mt-1 flex items-center">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <a
                    href={repoInfo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00ff9d] transition-colors"
                  >
                    {repoInfo.owner}/{repoInfo.repo}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy Link"}
            </Button>

            <Button
              onClick={downloadFile}
              disabled={downloading}
              className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>

            {isGitHubLink(shell.file_path) && (
              <Button
                asChild
                variant="outline"
                className="border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
              >
                <a
                  href={shell.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Source
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg overflow-hidden">
            <Tabs defaultValue="details">
              <TabsList className="bg-[#2a2a3a] w-full border-b border-[#3a3a4a]">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-[#1a1a1a]"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="usage"
                  className="data-[state=active]:bg-[#1a1a1a]"
                >
                  Usage
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-[#1a1a1a]"
                >
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-6">
                <h2 className="text-xl font-bold text-[#00ff9d] mb-4">
                  Description
                </h2>
                <p className="text-gray-300 whitespace-pre-line">
                  {shell.description ||
                    "No description provided for this shell."}
                </p>

                {shell.tags && shell.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {shell.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#2a2a3a] border-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isGitHubLink(shell.file_path) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                      Source
                    </h3>
                    <div className="bg-[#2a2a3a] p-4 rounded-md">
                      <p className="text-gray-300 text-sm mb-2">
                        GitHub Repository:
                      </p>
                      <a
                        href={shell.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00ff9d] hover:text-[#00cc7d] transition-colors break-all"
                      >
                        {shell.file_path}
                      </a>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="usage" className="p-6">
                <h2 className="text-xl font-bold text-[#00ff9d] mb-4">
                  Usage Instructions
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    This web shell can be used for remote system administration
                    and penetration testing. Follow these steps to use it:
                  </p>

                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>
                      Download the shell file using the download button above
                    </li>
                    <li>
                      Upload it to the target server via FTP, file manager, or
                      other means
                    </li>
                    <li>
                      Access the shell through a web browser by navigating to
                      its URL
                    </li>
                    <li>Use the provided interface to execute commands</li>
                  </ol>

                  <div className="bg-[#2a2a3a] p-4 rounded-md mt-4">
                    <p className="text-amber-400 text-sm">
                      ⚠️ Warning: Only use this tool on systems you have
                      permission to access. Unauthorized use is illegal.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="p-6">
                <h2 className="text-xl font-bold text-[#00ff9d] mb-4">
                  Security Considerations
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Web shells are powerful tools that can be used for both
                    legitimate system administration and malicious purposes. Be
                    aware of the following security considerations:
                  </p>

                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>
                      Always protect access to your web shell with strong
                      authentication
                    </li>
                    <li>
                      Use encryption when possible to protect transmitted data
                    </li>
                    <li>Remove the shell when it's no longer needed</li>
                    <li>Monitor access logs for unauthorized usage</li>
                    <li>Consider using IP restrictions to limit access</li>
                  </ul>

                  <div className="bg-[#2a2a3a] p-4 rounded-md mt-4">
                    <p className="text-gray-300 text-sm">
                      This tool is provided for educational purposes and
                      legitimate security testing only. The authors are not
                      responsible for any misuse or damage caused by this tool.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Information</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-400 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </h3>
                <p className="text-white">{formatDate(shell.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-400 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </h3>
                <p className="text-white">{formatDate(shell.updated_at)}</p>
              </div>

              {shell.uploader && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Author
                  </h3>
                  <p className="text-white">
                    {shell?.uploader?.username || shell?.uploader?.email}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm text-gray-400 mb-1">Downloads</h3>
                <p className="text-white">{shell.download_count}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-400 mb-1">Language</h3>
                <p className="text-white">{shell.language}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                onClick={downloadFile}
                disabled={downloading}
                className="w-full bg-[#00ff9d] hover:bg-[#00cc7d] text-black"
              >
                {downloading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </>
                )}
              </Button>

              {isGitHubLink(shell.file_path) && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
                >
                  <a
                    href={shell.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
              )}

              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full border-[#2a2a3a] hover:bg-[#2a2a3a] hover:text-[#00ff9d]"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a3a] rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Disclaimer</h2>
            <p className="text-gray-400 text-sm">
              This web shell is provided for educational and professional
              security testing purposes only. Using this tool against systems
              without explicit permission is illegal and unethical. Always
              practice responsible security testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "php":
      return "text-purple-400";
    case "aspx":
    case "asp":
      return "text-blue-400";
    case "jsp":
      return "text-red-400";
    case "python":
      return "text-green-400";
    case "perl":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
}
