import { ArrowRight } from 'lucide-react'
import { content } from '../data/content'
import { Reveal } from './Reveal'

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {content.cta.headline}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{content.cta.subheadline}</p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {content.cta.button}
            <ArrowRight size={18} />
          </a>
        </div>
      </Reveal>
    </section>
  )
}
