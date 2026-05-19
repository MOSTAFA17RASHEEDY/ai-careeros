import { motion } from 'framer-motion'
import { FileText, Brain, Target, Building2, GraduationCap, Zap } from 'lucide-react'
import { content } from '../data/content'
import { Reveal } from './Reveal'

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText size={24} />,
  Brain: <Brain size={24} />,
  Target: <Target size={24} />,
  Building2: <Building2 size={24} />,
  GraduationCap: <GraduationCap size={24} />,
  Zap: <Zap size={24} />,
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
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

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              {content.features.title}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{content.features.subtitle}</p>
          </div>
        </Reveal>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={containerVariants}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {content.features.items.map((item) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className="p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 mb-4">
                {iconMap[item.icon]}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
