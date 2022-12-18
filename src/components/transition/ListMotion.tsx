import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';

const ListMotion: FC<{ children: ReactNode }> = ({ children, ...others }) => {
  return (
    <motion.div
      className="h-full w-full flex"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      {...others}
    >
      {children}
    </motion.div>
  );
};

export default ListMotion;
