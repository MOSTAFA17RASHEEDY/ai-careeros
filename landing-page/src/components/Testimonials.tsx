import { motion } from 'framer-motion'
import { content } from '../data/content'
import { Reveal } from './Reveal'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const ease = [0.25, 0.1, 0.25, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {content.testimonials.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{content.testimonials.subtitle}</p>
          </div>
        </Reveal>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {content.testimonials.items.map((item) => (
            <motion.div
              key={item.name}
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-100 p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {item.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.title}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
