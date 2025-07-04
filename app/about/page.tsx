"use client"

import { Cpu, Shield, Code, Target, Award, Users } from "lucide-react"
import TrxTeam from "@/components/trx-team"
import AnimatedSection from "@/components/animated-section"
import TypewriterText from "@/components/typewriter-text"
import MatrixRain from "@/components/matrix-rain"
import GlitchText from "@/components/glitch-text"
import { useEffect, useState } from "react"

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Prevent hydration errors
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <AnimatedSection animation="zoom-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] cyber-border">
                <GlitchText text="About XTeamSecurity Team" />
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.3}>
              <p className="text-xl text-gray-300 mb-8 font-mono">
                <TypewriterText
                  text="A group of cybersecurity experts dedicated to enhancing security in the digital space"
                  speed={30}
                />
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.6}>
              <div className="flex justify-center">
                <div className="h-1 w-20 bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] rounded-full animate-pulse-slow"></div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#00ff9d] rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#00b8ff] rounded-full mix-blend-multiply filter blur-[80px] opacity-10 animate-blob animation-delay-2000"></div>
          <MatrixRain opacity={0.05} className="z-0" />
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-right">
              <h2 className="text-3xl font-bold mb-6 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] neon-text">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-300 font-mono">
                <p className="hover-glow p-2">
                  XTeamSecurity team was founded in 2018 by a group of security researchers with the aim of enhancing
                  cybersecurity and raising awareness about web vulnerabilities.
                </p>
                <p className="hover-glow p-2">
                  We focus on researching and developing security tools, identifying vulnerabilities, and providing
                  security solutions to help organizations protect their digital assets.
                </p>
                <p className="hover-glow p-2">
                  Today, our team consists of prominent experts in various fields of cybersecurity who are committed to
                  ethical principles and contribute to advancing security in the digital space.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" delay={0.3} className="scan-effect">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 relative hover-lift">
                <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#00ff9d]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#00ff9d]"></div>
                <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Our Mission</h3>
                <p className="text-gray-300 font-mono mb-6">
                  Our mission is to enhance cybersecurity through research, education, and the development of effective
                  tools to protect digital systems.
                </p>
                <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Our Vision</h3>
                <p className="text-gray-300 font-mono">
                  Creating a safer digital world where organizations and individuals can confidently use technology.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <AnimatedSection animation="fade-up">
        <TrxTeam />
      </AnimatedSection>

      {/* Our Expertise Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-down" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] neon-text">
              Our Expertise
            </h2>
            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
              Our team consists of experienced specialists in various fields of cybersecurity.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection animation="fade-up" delay={0.1} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float">
                  <Shield className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Penetration Testing</h3>
                <p className="text-gray-400 font-mono">
                  Identifying and assessing security vulnerabilities in systems and applications using advanced
                  penetration testing methods.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.2} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float animation-delay-2000">
                  <Code className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Security Tool Development</h3>
                <p className="text-gray-400 font-mono">
                  Designing and developing advanced tools for identifying and fixing security vulnerabilities in various
                  systems.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.3} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float animation-delay-4000">
                  <Target className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Vulnerability Research</h3>
                <p className="text-gray-400 font-mono">
                  Researching and identifying new vulnerabilities in systems and software and providing security
                  solutions.
                </p>
              </div>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <AnimatedSection animation="fade-up" delay={0.4} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float">
                  <Cpu className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reverse Engineering</h3>
                <p className="text-gray-400 font-mono">
                  Analyzing and examining malware and malicious software to identify their methods of operation and
                  counter them.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.5} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float animation-delay-2000">
                  <Award className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cybersecurity Training</h3>
                <p className="text-gray-400 font-mono">
                  Providing specialized training courses in cybersecurity and ethical hacking to increase awareness and
                  security skills.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={0.6} className="hover-scale">
              <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover:border-[#00ff9d] transition-all duration-300 holographic">
                <div className="w-12 h-12 bg-[#2a2a3a] rounded-lg flex items-center justify-center mb-4 animate-float animation-delay-4000">
                  <Users className="h-6 w-6 text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-bold mb-3">Security Consulting</h3>
                <p className="text-gray-400 font-mono">
                  Providing specialized consulting to organizations to improve their security posture and implement
                  cyber defense strategies.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-[#0a0a0c] relative noise-bg">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-down" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] neon-text">
              Our Achievements
            </h2>
            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
              Some of the successes and achievements of the XTeamSecurity team in recent years
            </p>
          </AnimatedSection>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#00ff9d] to-[#00b8ff]"></div>

            {/* Timeline items */}
            <div className="space-y-16 relative">
              {/* Item 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <AnimatedSection animation="fade-right" className="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right">
                  <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover-lift cyber-border">
                    <h3 className="text-xl font-bold mb-2 text-[#00ff9d]">2023</h3>
                    <h4 className="text-lg font-bold mb-3">Critical Vulnerability Identification</h4>
                    <p className="text-gray-400 font-mono">
                      Identified and reported over 50 critical vulnerabilities in various systems and received
                      recognition from relevant organizations.
                    </p>
                  </div>
                </AnimatedSection>
                <div className="md:w-1/2 md:pl-12 relative">
                  <div className="absolute left-1/2 md:left-0 top-0 transform -translate-x-1/2 md:-translate-x-[17px] -translate-y-1/2 w-8 h-8 bg-[#1a1a2e] border-4 border-[#00ff9d] rounded-full animate-pulse-slow"></div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 relative order-2 md:order-1">
                  <div className="absolute left-1/2 md:right-0 top-0 transform -translate-x-1/2 md:translate-x-[17px] -translate-y-1/2 w-8 h-8 bg-[#1a1a2e] border-4 border-[#00b8ff] rounded-full animate-pulse-slow animation-delay-2000"></div>
                </div>
                <AnimatedSection
                  animation="fade-left"
                  delay={0.2}
                  className="md:w-1/2 md:pl-12 mb-6 md:mb-0 order-1 md:order-2"
                >
                  <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover-lift cyber-border">
                    <h3 className="text-xl font-bold mb-2 text-[#00b8ff]">2022</h3>
                    <h4 className="text-lg font-bold mb-3">Advanced Security Tool Development</h4>
                    <p className="text-gray-400 font-mono">
                      Designed and developed a suite of security tools for penetration testing and vulnerability
                      identification with over 10,000 active users.
                    </p>
                  </div>
                </AnimatedSection>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <AnimatedSection
                  animation="fade-right"
                  delay={0.3}
                  className="md:w-1/2 md:pr-12 mb-6 md:mb-0 md:text-right"
                >
                  <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover-lift cyber-border">
                    <h3 className="text-xl font-bold mb-2 text-[#00ff9d]">2021</h3>
                    <h4 className="text-lg font-bold mb-3">Training Courses</h4>
                    <p className="text-gray-400 font-mono">
                      Conducted over 20 specialized training courses in cybersecurity and trained more than 500 security
                      professionals.
                    </p>
                  </div>
                </AnimatedSection>
                <div className="md:w-1/2 md:pl-12 relative">
                  <div className="absolute left-1/2 md:left-0 top-0 transform -translate-x-1/2 md:-translate-x-[17px] -translate-y-1/2 w-8 h-8 bg-[#1a1a2e] border-4 border-[#00ff9d] rounded-full animate-pulse-slow"></div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 relative order-2 md:order-1">
                  <div className="absolute left-1/2 md:right-0 top-0 transform -translate-x-1/2 md:translate-x-[17px] -translate-y-1/2 w-8 h-8 bg-[#1a1a2e] border-4 border-[#00b8ff] rounded-full animate-pulse-slow animation-delay-2000"></div>
                </div>
                <AnimatedSection
                  animation="fade-left"
                  delay={0.4}
                  className="md:w-1/2 md:pl-12 mb-6 md:mb-0 order-1 md:order-2"
                >
                  <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-6 hover-lift cyber-border">
                    <h3 className="text-xl font-bold mb-2 text-[#00b8ff]">2020</h3>
                    <h4 className="text-lg font-bold mb-3">International Organization Collaboration</h4>
                    <p className="text-gray-400 font-mono">
                      Began collaborating with international organizations in the field of cybersecurity and
                      participating in joint research projects.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection
            animation="zoom-in"
            className="max-w-3xl mx-auto bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg p-8 scan-effect"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] neon-text">
                Contact Us
              </h2>
              <p className="text-gray-400 font-mono">
                For collaboration, consultation, or any questions, get in touch with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection animation="fade-right" delay={0.2}>
                <h3 className="text-xl font-bold mb-4 text-[#00ff9d]">Contact Information</h3>
                <div className="space-y-4 font-mono">
                  <p className="flex items-center hover-glow p-2 rounded-md transition-all duration-300">
                    <span className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center mr-3 animate-float">
                      <span className="text-[#00ff9d]">@</span>
                    </span>
                    info@XTeamSecurity.com
                  </p>
                  <p className="flex items-center hover-glow p-2 rounded-md transition-all duration-300">
                    <span className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center mr-3 animate-float animation-delay-2000">
                      <span className="text-[#00ff9d]">G</span>
                    </span>
                    github.com/XTeamSecurity
                  </p>
                  <p className="flex items-center hover-glow p-2 rounded-md transition-all duration-300">
                    <span className="w-8 h-8 bg-[#2a2a3a] rounded-full flex items-center justify-center mr-3 animate-float animation-delay-4000">
                      <span className="text-[#00ff9d]">T</span>
                    </span>
                    twitter.com/XTeamSecurity
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="fade-left" delay={0.3}>
                <h3 className="text-xl font-bold mb-4 text-[#00b8ff]">Work With Us</h3>
                <p className="text-gray-400 font-mono mb-4">
                  If you have expertise in cybersecurity and are interested in collaborating with our team, send us your
                  resume.
                </p>
                <a
                  href="mailto:careers@XTeamSecurity.com"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] text-black font-bold rounded-md hover:opacity-90 transition-opacity hover-scale"
                >
                  Send Resume
                </a>
              </AnimatedSection>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}
