import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

const PageMotion: FC<{ children: ReactNode }> = ({ children, ...others }) => {
  return (
    <motion.div
      className="mdc-paper"
      initial={{ y: '10px', opacity: 0.5 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.2 } }}
      // transition={{ ease: 'linear' }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      {...others}
    >
      {children}
    </motion.div>
  );
};

export default PageMotion;
