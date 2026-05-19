import { content } from '../data/content'
import { Reveal } from './Reveal'

export function Footer() {
  return (
    <Reveal>
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-sm font-semibold text-gray-900">{content.brand.name}</span>
            <p className="mt-1 text-xs text-gray-500">{content.footer.description}</p>
          </div>
          <div className="flex items-center gap-6">
            {content.footer.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400">{content.footer.copyright}</p>
        </div>
      </footer>
    </Reveal>
  )
}
