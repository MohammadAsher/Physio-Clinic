'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { servicesData } from '@/lib/servicesData';

export default function TreatmentDetailPage() {
  const params = useParams();
  const serviceId = parseInt(params.id as string);
  const service = servicesData.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Treatment Not Found</h1>
          <p className="text-slate-400 mb-8">The treatment you're looking for doesn't exist.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-semibold rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${service.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-950" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-6">
          <Link 
            href="/"
            className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-black/70 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl red-gradient flex items-center justify-center border border-white/10">
                <span className="text-white font-bold text-xl">
                  {service.icon === 'baby' ? '👶' : 
                   service.icon === 'activity' ? '🏋️' : 
                   service.icon === 'bone' ? '🦴' : '🧠'}
                </span>
              </div>
              <span className="text-rose-400 font-medium tracking-wider uppercase text-sm">
                Our Services
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-playfair-display)' }}>
              {service.title}
            </h1>

            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
              {service.description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <div className="glass-card p-8 md:p-12">
                <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair-display)' }}>
                  About This Treatment
                </h2>

                <p className="text-lg text-slate-300 leading-relaxed mb-8">
                  {service.longDescription}
                </p>

                <h3 className="text-2xl font-bold text-white mb-6">What You'll Experience</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <CheckCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Treatment Process Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-12 glass-card p-8 md:p-12"
              >
                <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair-display)' }}>
                  Treatment Journey
                </h2>

                <div className="space-y-6">
                  {[
                    { step: 'Initial Assessment', desc: 'Comprehensive evaluation of your condition and medical history' },
                    { step: 'Personalized Plan', desc: 'Custom treatment plan tailored to your specific needs and goals' },
                    { step: 'Active Treatment', desc: 'Regular therapy sessions with progress tracking' },
                    { step: 'Progress Review', desc: 'Regular assessments to adjust treatment and ensure improvement' },
                    { step: 'Maintenance', desc: 'Home exercise program and strategies for long-term wellness' },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-rose-600 to-crimson-700 flex items-center justify-center text-white font-bold border border-white/10">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{item.step}</h4>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Sidebar - Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-8 space-y-6">
                {/* Pricing Card */}
                <div className="glass-card p-6 border-rose-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-rose-400" />
                    <h3 className="text-xl font-bold text-white">Pricing</h3>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{service.price}</div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration} per session
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Availability</p>
                        <p className="text-white text-sm">Mon - Sat, 8AM - 8PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Session Type</p>
                        <p className="text-white text-sm">One-on-One Personalized</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-900/30 border border-white/10 flex items-center justify-center gap-2"
                  >
                    Book This Treatment
                  </motion.button>
                </Link>

                {/* Insurance Info */}
                <div className="glass-card p-6 bg-white/5">
                  <p className="text-slate-400 text-sm text-center">
                    Most major insurance plans accepted. Contact us for details.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair-display)' }}>
              Explore Other <span className="text-gradient">Services</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Discover our full range of specialized treatments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesData
              .filter(s => s.id !== serviceId)
              .map((relatedService, index) => (
                <motion.div
                  key={relatedService.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/treatments/${relatedService.id}`}>
                    <div className="glass-card overflow-hidden group cursor-pointer h-full flex flex-col">
                      <div className="relative h-40 overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url('${relatedService.image}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-rose-400 transition-colors">
                          {relatedService.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                          {relatedService.description}
                        </p>
                        <div className="text-rose-400 font-medium text-sm">
                          {relatedService.price}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
