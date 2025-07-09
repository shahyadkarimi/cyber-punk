import { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Tag,
  ExternalLink,
  Shield,
  Zap,
  BarChart3,
  Mail,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  CheckCircle,
  AlertCircle,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { baseURL } from "@/services/API";
import { getDomainInfo } from "@/helper/helper";
import BookmarkShare from "./bookmark-share";
import { cookies } from "next/headers";
import BuyDomain from "./BuyDomain";
import QuickBuy from "./QuickBuy";
import Link from "next/link";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const token = (await cookies()).get("auth-token")?.value;

  const fetchData = async () => {
    const headers: HeadersInit = token ? { "x-auth-token": token } : {};

    try {
      const domainRes = await fetch(`${baseURL}/domains/${id}`, {
        method: "GET",
        cache: "no-store",
        headers,
      });

      return { domain: await domainRes.json() };
    } catch (error) {
      console.log(error);
      return { error: "Faild to get domain information" };
    }
  };

  const { domain, error } = await fetchData();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    console.log(domain);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-600/15";
    if (score >= 40) return "bg-yellow-600/15";
    return "bg-red-600/15";
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            // onClick={handleRefresh}
            className="px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] rounded-md text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#2a2a3a] bg-[#1a1a1a]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              asChild
              variant="ghost"
              className="text-white hover:bg-[#2a2a3a]"
            >
              <Link href={"/domains"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>

            <BookmarkShare domain={domain} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-purple-800/15 border border-purple-800 p-8 md:p-12 mb-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-purple-800">
                    {domain.domain}
                  </h1>
                  {domain?.featured && (
                    <Badge className="bg-yellow-600/15 text-yellow-600 border-yellow-600">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                  {domain?.seller?.verified && (
                    <Badge className="bg-green-600/15 text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-slate-300 mb-6 max-w-2xl">
                  {domain?.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {domain.tags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="lg:text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatPrice(domain.price)}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {domain.views || 0} views
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {domain.inquiries || 0} inquiries
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <BuyDomain domain={domain} />

                  {/* <Button
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600/10 bg-transparent"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Make Offer
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {domain.da_score.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-400">Domain Authority</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {domain?.pa_score?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-400">Page Authority</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {domain?.monthlyTraffic?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-slate-400">Monthly Traffic</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {domain?.age ? `${domain?.age}y` : "N/A"}
              </div>
              <div className="text-sm text-slate-400">Domain Age</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* SEO Metrics */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  SEO Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        Domain Authority
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          domain.da_score
                        )}`}
                      >
                        {domain.da_score}/100
                      </span>
                    </div>
                    <Progress value={domain.da_score} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        Page Authority
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          domain.pa_score
                        )}`}
                      >
                        {domain.pa_score}/100
                      </span>
                    </div>
                    <Progress value={domain.pa_score} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Trust Flow</span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          domain.trustFlow || 0
                        )}`}
                      >
                        {domain.trustFlow || 0}/100
                      </span>
                    </div>
                    <Progress value={domain.trustFlow || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        Citation Flow
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          domain.citationFlow || 0
                        )}`}
                      >
                        {domain.citationFlow || 0}/100
                      </span>
                    </div>
                    <Progress
                      value={domain.citationFlow || 0}
                      className="h-2"
                    />
                  </div>
                </div>

                <Separator className="bg-[#2a2a3a]" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Backlinks</span>
                    <span className="font-semibold text-white">
                      {domain?.backlinks?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Referring Domains</span>
                    <span className="font-semibold text-white">
                      {domain.referringDomains || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Analytics */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Traffic Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-600/15 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {domain?.monthlyTraffic?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-slate-400">
                      Monthly Visitors
                    </div>
                  </div>
                  <div className="p-4 bg-blue-600/15 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      +{domain.trafficGrowth || 0}%
                    </div>
                    <div className="text-sm text-slate-400">Growth Rate</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Top Countries
                  </h4>
                  <div className="space-y-2">
                    {Array.from({ length: 1 }).map(
                      (country: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-slate-300">United States</span>
                          <span className="text-sm text-slate-400">
                            #{index + 1}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">
                    Top Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map(
                      (item: any, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-slate-700 text-slate-300"
                        >
                          Keywords
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Extension</span>
                    <Badge className="bg-blue-600/15 text-blue-600">
                      {getDomainInfo(domain.domain).tld}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Length</span>
                    <span className="font-semibold text-white">
                      {getDomainInfo(domain.domain).domainName?.length} chars
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Age</span>
                    <span className="font-semibold text-white">
                      {domain.age ? `${domain.age} years` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SSL</span>
                    {!domain.ssl ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile</span>
                    {!domain.mobile ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Speed Score</span>
                    <span
                      className={`font-semibold ${getScoreColor(
                        domain.speed || 50
                      )}`}
                    >
                      {domain.speed || 50}/100
                    </span>
                  </div>
                </div>

                <Separator className="bg-[#2a2a3a]" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Registration Date</span>
                    <span className="text-white">
                      {formatDate(domain.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Expiration Date</span>
                    <span className="text-white">
                      {domain.created_at
                        ? formatDate(domain.created_at)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Registrar</span>
                    <span className="text-white">
                      {domain?.registrar || "GoDaddy"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Seller Info & Actions */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-purple-600" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600/15 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {domain?.seller?.username || "Unknown"}
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-400">
                        {domain?.seller?.rating || 4.8} (
                        {domain?.seller?.totalSales || 0} sales)
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#2a2a3a]" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Member Since</span>
                    <span className="text-white">
                      {domain?.seller?.created_at
                        ? formatDate(domain?.seller?.created_at)
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* <div className="flex flex-col gap-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-600/10 bg-transparent"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* Domain Category */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Tag className="h-5 w-5 text-orange-600" />
                  Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-orange-600/15 text-orange-600 border-orange-600">
                  {domain?.category}
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <QuickBuy domain={domain} />

                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-600/10 bg-transparent"
                >
                  <Link href={`https://${domain.domain}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Site
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card className="bg-[#1a1a1a] border-[#2a2a3a]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold text-white">
                      Secure Transaction
                    </div>
                    <div className="text-sm text-slate-400">
                      Protected by escrow service
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
