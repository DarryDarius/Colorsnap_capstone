import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

const SectionReveal: React.FC<Props> = ({ children, delay = 0, className }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.36, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
