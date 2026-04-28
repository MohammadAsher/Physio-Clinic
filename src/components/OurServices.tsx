'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Award, Target, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { servicesData } from '@/lib/servicesData';

export default function OurServices() {
  return (
    <section className="w-full py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair-display)' }}>
            Our <span className="text-gradient">Specialized Services</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Comprehensive physiotherapy solutions designed for your recovery
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { title: 'Expert Therapists', description: 'Certified professionals with years of experience in specialized physiotherapy.', icon: <Award className="w-8 h-8 text-rose-400" /> },
            { title: 'Personalized Care', description: 'Tailored treatment plans designed specifically for your unique condition.', icon: <Target className="w-8 h-8 text-rose-400" /> },
            { title: 'Modern Facilities', description: 'State-of-the-art equipment and comfortable treatment rooms.', icon: <Building2 className="w-8 h-8 text-rose-400" /> },
            { title: 'Flexible Scheduling', description: 'Appointment times that fit your busy lifestyle.', icon: <Calendar className="w-8 h-8 text-rose-400" /> },
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 text-center group cursor-pointer"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-crimson-500/20 border border-rose-400/60 flex items-center justify-center">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-rose-300 transition-colors">{benefit.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Service Details Preview - First 2 Services as Example Cards */}
        <div className="space-y-20">
          {servicesData.slice(0, 2).map((service, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Image Side */}
                <div className="w-full lg:w-1/2">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/10 to-crimson-500/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group-hover:shadow-crimson-intense transition-all duration-500">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url('${service.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

                       {/* Icon Image Badge */}
                       {service.iconImage && (
                         <div className="absolute top-6 right-6 z-10">
                           <div className="w-40 h-40 rounded-2xl border-2 border-rose-400/60 overflow-hidden shadow-xl">
                             <img
                               src={service.iconImage}
                               alt={service.title}
                               className="w-full h-full object-cover rounded-xl"
                             />
                           </div>
                         </div>
                       )}

                      {/* Price Badge */}
                      <div className="absolute bottom-6 left-6 z-10">
                        <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600/95 to-crimson-700/95 backdrop-blur-md border border-white/20 shadow-lg">
                          <div className="text-white font-bold text-2xl">{service.price}</div>
                          <div className="text-white/80 text-sm">{service.duration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2">
                  <div className="mb-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold uppercase tracking-wider">
                      Service {service.id}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'var(--font-playfair-display)' }}>
                    {service.title}
                  </h3>

                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {service.benefits.slice(0, 4).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 p-2">
                        <CheckCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm leading-snug">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/treatments/${service.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.03, x: 8 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-bold rounded-2xl border border-white/10 shadow-lg shadow-rose-900/40 hover:shadow-crimson-intense transition-all group cursor-pointer w-fit"
                    >
                      <span>View Treatment Details</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20 pt-12 border-t border-white/10"
        >
          <p className="text-slate-300 mb-6">Ready to start your recovery journey?</p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-rose-600 to-crimson-700 text-white font-semibold rounded-xl hover:shadow-crimson-intense transition-all shadow-lg"
          >
            Book Your Consultation
          </a>
        </motion.div>
      </div>
    </section>
  );
}
