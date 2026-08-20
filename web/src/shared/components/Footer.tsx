import { BriefcaseBusiness, Mail } from "lucide-react"

const EMAIL = "euclidlquemada@gmail.com"
const LINKEDIN_URL = "https://linkedin.com/in/euclidlquemada"

const Footer = () => {
  return (
    <footer className="flex flex-col items-center bg-white text-sm">
      <div className="flex max-w-5xl flex-col gap-8 p-8 sm:flex-row sm:gap-12">
        <div className="sm:flex-1">
          <p className="font-semibold text-gray-800">Visita</p>
          <p className="mt-1 max-w-xl leading-relaxed text-gray-500">
            Submit and track visitor registrations, review requests, and monitor visits
            from check-in to check-out.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Created by Euclid Quemada</p>
          <nav aria-label="Euclid Quemada contact links" className="mt-2 flex flex-wrap items-center gap-5 text-gray-600">
            <a
              className="flex items-center gap-2 hover:text-blue-600"
              href={`mailto:${EMAIL}`}
            >
              <Mail aria-hidden="true" size={18} />
              Email
            </a>
            <a
              className="flex items-center gap-2 hover:text-blue-600"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              <BriefcaseBusiness aria-hidden="true" size={18} />
              LinkedIn
            </a>
          </nav>
        </div>
      </div>
      <div className="w-full bg-blue-500 p-4 text-center text-white">
        <p>© {new Date().getFullYear()} Euclid Quemada. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
