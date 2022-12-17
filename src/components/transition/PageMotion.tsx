import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

const PageMotion: FC<{ children: ReactNode }> = ({ children, ...others }) => {
  return (
    <motion.div
      className="mdc-paper"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...others}
    >
      {children}
    </motion.div>
  );
};

export default PageMotion;
