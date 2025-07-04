import { Shield, Terminal, Code, Lock, Server, Database, Globe, AlertTriangle } from "lucide-react"

export default function TrxServices() {
  const services = [
    {
      icon: <Shield className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Penetration Testing",
      description:
        "Comprehensive security assessments to identify vulnerabilities in your systems before malicious actors can exploit them.",
    },
    {
      icon: <Terminal className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Custom Security Tools",
      description:
        "Development of specialized cybersecurity tools tailored to your organization's unique security requirements.",
    },
    {
      icon: <Code className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Exploit Research",
      description:
        "Advanced research into new vulnerabilities and exploitation techniques to stay ahead of emerging threats.",
    },
    {
      icon: <Lock className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Security Consulting",
      description: "Expert guidance on cybersecurity strategy, compliance, and best practices for your organization.",
    },
    {
      icon: <Server className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Infrastructure Security",
      description: "Hardening of servers, networks, and infrastructure components against sophisticated attacks.",
    },
    {
      icon: <Database className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Database Security",
      description: "Protection of sensitive data with advanced database security measures and encryption techniques.",
    },
    {
      icon: <Globe className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />,
      title: "Web Application Security",
      description: "Identification and remediation of vulnerabilities in web applications and APIs.",
    },
    {
      icon: (
        <AlertTriangle className="h-10 w-10 text-[#00ff9d] group-hover:text-black transition-colors duration-300" />
      ),
      title: "Incident Response",
      description: "Rapid response to security incidents with forensic analysis and containment strategies.",
    },
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Our Cybersecurity Services
          </h2>
          <p className="text-gray-400 font-mono max-w-2xl mx-auto">
            XTeamSecurity offers a comprehensive range of cybersecurity services to protect your digital assets from
            evolving threats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#1a1a2e]/50 border border-[#2a2a3a] p-6 rounded-lg group hover:bg-gradient-to-r hover:from-[#00ff9d] hover:to-[#00b8ff] hover:text-black transition-all duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-black transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-400 font-mono text-sm group-hover:text-black/80 transition-colors duration-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
