export default function TrxTeam() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Meet Our Team
          </h2>
          <p className="text-gray-400 font-mono max-w-2xl mx-auto">
            Led by elite security researchers with years of experience in the cybersecurity industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg overflow-hidden group hover:border-[#00ff9d] transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-[#2a2a3a] to-[#1a1a2e] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] flex items-center justify-center text-4xl font-bold text-black">
                MA
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">M@rAz Ali</h3>
              <p className="text-[#00ff9d] font-mono text-sm mb-3">Team Leader & Security Researcher</p>
              <p className="text-gray-400 font-mono text-sm">
                Elite security researcher with expertise in exploit development and penetration testing.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg overflow-hidden group hover:border-[#00ff9d] transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-[#2a2a3a] to-[#1a1a2e] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#00b8ff] to-[#00ff9d] flex items-center justify-center text-4xl font-bold text-black">
                JD
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">John Doe</h3>
              <p className="text-[#00ff9d] font-mono text-sm mb-3">Web Security Specialist</p>
              <p className="text-gray-400 font-mono text-sm">
                Expert in web application security and vulnerability assessment.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1a2e]/50 border border-[#2a2a3a] rounded-lg overflow-hidden group hover:border-[#00ff9d] transition-all duration-300">
            <div className="h-64 bg-gradient-to-br from-[#2a2a3a] to-[#1a1a2e] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] flex items-center justify-center text-4xl font-bold text-black">
                AS
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Alice Smith</h3>
              <p className="text-[#00ff9d] font-mono text-sm mb-3">Reverse Engineering Expert</p>
              <p className="text-gray-400 font-mono text-sm">
                Specialized in malware analysis and reverse engineering of security threats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
