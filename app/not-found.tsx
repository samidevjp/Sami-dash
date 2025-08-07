'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-background">
      <div className="absolute right-0 top-0 -z-10 h-1/3 w-1/3 bg-gradient-to-bl from-primary/20 to-transparent opacity-50" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="mb-8">
          <Image
            src="/WhiteLogo.png"
            alt="WABI"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
        </div>

        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-[8rem] font-extrabold leading-none text-transparent"
        >
          404
        </motion.span>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-heading mb-2 text-2xl font-bold text-foreground"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 text-center text-muted-foreground"
        >
          The page you are looking for doesn&apos;t exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => router.back()}
            variant="default"
            size="lg"
            className="shadow-lg transition-all hover:shadow-primary/25"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            size="lg"
            className="shadow-sm transition-all hover:shadow-lg"
          >
            Dashboard
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 -z-10 h-1/3 w-1/3 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
    </div>
  );
}
