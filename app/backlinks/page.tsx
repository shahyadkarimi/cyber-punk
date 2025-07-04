import Link from "next/link"
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Globe,
  Lock,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium Backlinks Service | XTeamSecurity",
  description:
    "Acquire high-quality backlinks from authoritative sources like government, university, and high-ranking websites. Boost your clients' SEO rankings with our premium backlink service.",
  keywords:
    "backlinks, SEO, high authority backlinks, government backlinks, university backlinks, betting websites SEO, premium backlinks",
}

export default function BacklinksPage() {
  return (
    <main className="flex flex-col items-center min-h-screen relative z-10">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="matrix-bg absolute inset-0 opacity-10"></div>
          <div className="scan-effect absolute inset-0"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center mb-12 animate-fade-down">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 glitch-heading neon-text"
              data-text="ELITE BACKLINKS"
            >
              ELITE BACKLINKS
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-gray-300 mb-8 animate-fade-up">
              Supercharge your clients' SEO with high-authority backlinks from government, university, and premium
              domains
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="https://t.me/mrzblackhat"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold py-3 px-8 rounded-md transition-all duration-300 flex items-center gap-2 hover-lift"
              >
                Contact on Telegram <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="bg-transparent border-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d10] font-bold py-3 px-8 rounded-md transition-all duration-300 hover-glow">
                View Packages
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Globe,
                title: "Gov & Edu Domains",
                description: "Exclusive backlinks from .gov, .edu and other high-authority domains",
              },
              {
                icon: Shield,
                title: "100% Safe & Manual",
                description: "All backlinks are manually created following white-hat SEO practices",
              },
              {
                icon: TrendingUp,
                title: "Guaranteed Results",
                description: "See measurable ranking improvements within 30-60 days",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a4e] hover-lift cyber-border animate-fade-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <feature.icon className="w-12 h-12 text-[#00ff9d] mb-4 animate-float" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="w-full py-16 bg-[#0a0a14] relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-text animate-fade-up">
              WHY TOP SEO AGENCIES CHOOSE OUR BACKLINKS
            </h2>
            <p className="text-xl text-gray-300 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Our premium backlink service is specifically designed for SEO companies looking to deliver exceptional
              results to their clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative animate-fade-right">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] rounded-lg blur opacity-25"></div>
              <div className="relative bg-[#1a1a2e] p-8 rounded-lg border border-[#2a2a4e] h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-[#00ff9d]" /> For SEO Agencies
                </h3>
                <ul className="space-y-4">
                  {[
                    "White-label reports for your clients",
                    "Bulk order discounts for agency needs",
                    "Dedicated account manager",
                    "Custom solutions for specific client niches",
                    "Regular performance updates",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative animate-fade-left">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00b8ff] to-[#00ff9d] rounded-lg blur opacity-25"></div>
              <div className="relative bg-[#1a1a2e] p-8 rounded-lg border border-[#2a2a4e] h-full">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="text-[#00ff9d]" /> Our Backlink Sources
                </h3>
                <ul className="space-y-4">
                  {[
                    "Government websites (.gov domains)",
                    "Educational institutions (.edu domains)",
                    "News and media outlets (DA 50+)",
                    "Industry-specific authority sites",
                    "Established business directories",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="w-full py-16 relative overflow-hidden">
        <div className="noise-bg absolute inset-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-text animate-fade-up">
              SPECIALIZED FOR CHALLENGING NICHES
            </h2>
            <p className="text-xl text-gray-300 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              We excel in providing high-quality backlinks for websites in competitive and restricted niches
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Betting & Casino",
                description:
                  "Our specialized backlink packages help betting and casino websites improve rankings despite strict advertising limitations",
                icon: BarChart3,
              },
              {
                title: "Crypto & Finance",
                description:
                  "Custom backlink strategies for cryptocurrency and financial service websites facing regulatory challenges",
                icon: TrendingUp,
              },
              {
                title: "Adult & Restricted",
                description:
                  "Effective backlink solutions for websites in adult and other restricted categories that struggle with traditional marketing",
                icon: Lock,
              },
            ].map((niche, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a4e] hover-scale animate-fade-up holographic"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <niche.icon className="w-12 h-12 text-[#00ff9d] mb-4" />
                <h3 className="text-xl font-bold mb-2">{niche.title}</h3>
                <p className="text-gray-400">{niche.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="inline-block p-4 bg-[#1a1a2e] rounded-lg border border-[#2a2a4e] max-w-2xl mx-auto">
              <p className="text-lg mb-2">
                <span className="font-bold text-[#00ff9d]">Note:</span> Our service is particularly effective for
                websites that face challenges with traditional link building
              </p>
              <p className="text-gray-400">
                We've helped hundreds of betting, casino, and other restricted niche websites achieve top rankings in
                Google
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 bg-[#0a0a14] relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-text animate-fade-up">
              TRUSTED BY SEO PROFESSIONALS
            </h2>
            <p className="text-xl text-gray-300 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              See what other SEO agencies say about our premium backlink service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "The backlinks from .edu domains helped our client's betting site jump from page 3 to the top 5 results in just 45 days.",
                author: "Michael R., SEO Agency Owner",
                company: "RankPro SEO",
              },
              {
                quote:
                  "We've tried many backlink services, but none delivered the quality and results that we've seen with XTeamSecurity's backlinks.",
                author: "Sarah T., Digital Marketing Director",
                company: "Apex Digital",
              },
              {
                quote:
                  "Our casino client was struggling with rankings for months. After using these backlinks, we saw a 67% increase in organic traffic.",
                author: "David K., SEO Consultant",
                company: "GamblingSEO",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a4e] hover-lift animate-fade-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="inline-block w-5 h-5 text-[#00ff9d] fill-[#00ff9d]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/CTA */}
      <section className="w-full py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="matrix-bg absolute inset-0 opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-[#1a1a2e] p-8 md:p-12 rounded-lg border border-[#2a2a4e] cyber-border animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 neon-text">READY TO BOOST YOUR CLIENTS' RANKINGS?</h2>
              <p className="text-xl text-gray-300">
                Contact us now to discuss your backlink needs and get a customized package
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-[#0d0d15] p-6 rounded-lg mb-8 w-full max-w-md">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#00ff9d] rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-xl">@</span>
                  </div>
                  <div className="text-2xl font-mono font-bold">mrzblackhat</div>
                </div>
                <p className="text-center text-gray-300 mb-4">Contact us on Telegram for inquiries and purchases</p>
                <Link
                  href="https://t.me/mrzblackhat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00ff9d] hover:bg-[#00cc7d] text-black font-bold py-3 px-8 rounded-md transition-all duration-300 flex items-center justify-center gap-2 w-full hover-lift"
                >
                  Message on Telegram <ExternalLink className="w-5 h-5" />
                </Link>
              </div>

              <div className="text-center text-gray-400 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                <p className="mb-2">
                  <span className="font-bold text-white">Fast Response:</span> We typically reply within 1-2 hours
                </p>
                <p>
                  <span className="font-bold text-white">Special Offer:</span> Mention "TRX-ELITE" for 15% off your
                  first order
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 bg-[#0a0a14]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 neon-text animate-fade-up">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="max-w-3xl mx-auto grid gap-6">
            {[
              {
                question: "How long does it take to see results from your backlinks?",
                answer:
                  "Most clients start seeing measurable improvements in rankings within 30-60 days. However, this can vary depending on your website's current authority, competition, and other SEO factors.",
              },
              {
                question: "Are these backlinks safe from Google penalties?",
                answer:
                  "Yes. Our backlinks are created manually following white-hat SEO practices. We focus on relevance and quality rather than quantity, ensuring your clients' websites remain safe from Google penalties.",
              },
              {
                question: "Do you offer white-label reports for agencies?",
                answer:
                  "We provide comprehensive white-label reports that you can share directly with your clients under your agency's branding.",
              },
              {
                question: "Can you help with very competitive niches like betting and casino?",
                answer:
                  "Yes, we specialize in providing high-quality backlinks for challenging niches like betting, casino, crypto, and adult websites that typically struggle with traditional link building.",
              },
              {
                question: "What information do you need to get started?",
                answer:
                  "To get started, we'll need your target URLs, preferred anchor texts, and any specific requirements you might have. Contact us on Telegram (@mrzblackhat) and we'll guide you through the process.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-[#1a1a2e] p-6 rounded-lg border border-[#2a2a4e] animate-fade-up"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <h3 className="text-xl font-bold mb-2 text-[#00ff9d]">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
