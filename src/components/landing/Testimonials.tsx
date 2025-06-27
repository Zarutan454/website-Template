
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Markus Schneider',
    role: 'Crypto Investor',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2787&auto=format&fit=crop',
    text: 'Ich bin begeistert von der Kombination aus Social Media und Blockchain. Endlich kann ich für meine Beiträge und Interaktionen belohnt werden. Das Mining-System ist intuitiv und macht wirklich Spaß!',
    stars: 5
  },
  {
    name: 'Lisa Meyer',
    role: 'Content Creator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2961&auto=format&fit=crop',
    text: 'Als Content Creator habe ich schon viele Plattformen ausprobiert, aber BSN ist wirklich einzigartig. Die Möglichkeit, meine eigenen Tokens zu erstellen und durch Aktivitäten zu verdienen, ist revolutionär.',
    stars: 5
  },
  {
    name: 'Jan Weber',
    role: 'Blockchain Developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2940&auto=format&fit=crop',
    text: 'Die technische Umsetzung des Proof-of-Activity Minings ist brillant. Es ist energieeffizient und belohnt echte Interaktionen statt sinnloser Rechenoperationen.',
    stars: 4
  },
  {
    name: 'Anne Schmidt',
    role: 'Digital Marketer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    text: 'BSN hat es mir ermöglicht, eine aktive Community aufzubauen und gleichzeitig Krypto-Assets zu verdienen. Die Kombination aus traditionellem Social Media und Blockchain-Technologie ist genau das, was wir gebraucht haben.',
    stars: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 relative" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-pink-600 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Das sagen unsere Nutzer
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Erfahre, was unsere Community über BSN denkt und wie es ihr geholfen hat, in der Welt der Kryptowährungen und sozialen Medien erfolgreich zu sein.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-dark-300/70 backdrop-blur-sm rounded-xl p-6 border border-white/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5, 
                boxShadow: '0 10px 25px rgba(227, 28, 121, 0.15)',
                borderColor: 'rgba(227, 28, 121, 0.3)' 
              }}
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-pink-500" 
                />
                <div>
                  <h3 className="text-white font-medium">{testimonial.name}</h3>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`${i < testimonial.stars ? 'text-pink-500' : 'text-gray-600'}`}
                    fill={i < testimonial.stars ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              
              <p className="text-gray-300 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
