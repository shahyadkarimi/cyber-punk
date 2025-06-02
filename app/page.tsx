import TRXHero from "@/components/trx-hero"
import TRXServices from "@/components/trx-services"
import TRXTeam from "@/components/trx-team"

export default function HomePage() {
  return (
    <main className="flex-grow">
      <TRXHero />
      <TRXServices />
      <TRXTeam />
    </main>
  )
}
