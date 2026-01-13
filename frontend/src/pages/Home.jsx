import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Navbar } from '../components/Navbar'
import { Shield, ArrowRight, Activity, Users, FileSearch, CheckCircle2, Search, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
        >
          <Shield className="h-4 w-4" />
          Trusted by Election Commission of India
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold text-[#0f172a] mb-6 tracking-tight"
        >
          Electoral Roll Forensic<br />
          Audit System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-500 mb-10 max-w-3xl mx-auto"
        >
          Making silent voter list manipulation impossible to hide through advanced time-series analysis and pattern detection
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/dashboard">
            <Button size="lg" className="bg-indigo-700 hover:bg-indigo-800 text-base h-12 px-8">
              Launch Audit Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Feature Cards Grid */}
      <div className="container mx-auto px-4 pb-16 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-4 gap-6"
        >
          {[
            {
              title: "Anomaly Detection",
              icon: Search,
              color: "bg-blue-100 text-blue-600",
              desc: "AI-powered detection of suspicious voter roll changes across 543 constituencies"
            },
            {
              title: "Time Travel Analysis",
              icon: TrendingUp,
              color: "bg-green-100 text-green-600",
              desc: "Visualize voter roll changes over time with interactive timeline slider"
            },
            {
              title: "Real-time Monitoring",
              icon: Users,
              color: "bg-yellow-100 text-yellow-600",
              desc: "Track 450M+ registered voters across all Indian states and union territories"
            },
            {
              title: "Audit Reports",
              icon: Shield,
              color: "bg-red-100 text-red-600",
              desc: "Generate comprehensive audit reports with charts, maps, and actionable insights"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center">
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { label: 'Constituencies Monitored', value: '543', color: 'text-indigo-600' },
            { label: 'Registered Voters Tracked', value: '450M+', color: 'text-green-600' },
            { label: 'Active Anomalies Detected', value: '23', color: 'text-red-500' }
          ].map((stat, i) => (
            <motion.div key={i} variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-gray-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="bg-[#f8fafc] py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: FileSearch, title: 'Data Collection', desc: 'Continuously collect and analyze voter roll data from all Indian constituencies.' },
              { icon: Activity, title: 'Pattern Analysis', desc: 'AI algorithms detect unusual patterns in voter additions, deletions, and modifications.' },
              { icon: Shield, title: 'Alert & Audit', desc: 'Generate alerts for suspicious activity and provide detailed audit reports.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Features</h2>
            <div className="space-y-6">
              {[
                'Interactive India map with color-coded anomaly scores',
                'Time-travel slider to visualize changes over time',
                'Advanced filtering by state, anomaly threshold',
                'Detailed constituency analysis with voter trends'
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Security & Compliance</h2>
            <div className="space-y-6">
              {[
                'End-to-end encrypted data transmission',
                'Role-based access control for auditors',
                'Audit trail for all system activities',
                'Compliant with data protection regulations'
              ].map((text, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-12 text-center">
        <img src="/assets/matsetu-logo.png" alt="Matsetu Logo" className="h-20 w-auto mx-auto mb-4" />
        <p className="font-semibold text-lg mb-2">Matsetu</p>
        <p className="text-gray-400 text-sm mb-8">Electoral Roll Forensic Audit System</p>
        <p className="text-gray-600 text-xs">© 2026 Matsetu. A project for ensuring electoral transparency and integrity.</p>
      </footer>
    </div>
  )
}

export default Home
