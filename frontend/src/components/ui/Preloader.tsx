import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  images: string[];
  onComplete: () => void;
}

const MIN_DISPLAY_MS = 5000; // minimum time the preloader stays visible

export const Preloader = ({ images, onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [activeMessage, setActiveMessage] = useState("Mediterranean Horizons");

  useEffect(() => {
    if (progress < 20) setActiveMessage("Mediterranean Horizons");
    else if (progress < 40) setActiveMessage("Sidi Bou Said");
    else if (progress < 60) setActiveMessage("Cap Serrat");
    else if (progress < 80) setActiveMessage("Kuriat Islands");
    else if (progress < 95) setActiveMessage("Sahara Adventures");
    else setActiveMessage("Your Journey Begins");
  }, [progress]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const startTime = Date.now();
    let imagesReady = images.length === 0; // true immediately if no images
    let timerDone = false;
    let fakeFrame: ReturnType<typeof setTimeout>;

    // --- fake slow progress: 0 → 90% over ~4 seconds ---
    const FAKE_DURATION = 4000; // ms to reach 90%
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const fakeProgress = Math.min(90, Math.round((elapsed / FAKE_DURATION) * 90));
      setProgress(fakeProgress);
      if (fakeProgress < 90) {
        fakeFrame = setTimeout(tick, 80);
      }
    };
    fakeFrame = setTimeout(tick, 80);

    // --- real image preloading ---
    const finishWhenReady = () => {
      if (!imagesReady || !timerDone) return;
      // sprint to 100% then call onComplete
      setProgress(100);
      setTimeout(() => {
        document.body.style.overflow = "";
        onComplete();
      }, 600);
    };

    // minimum display timer
    const minTimer = setTimeout(() => {
      timerDone = true;
      finishWhenReady();
    }, MIN_DISPLAY_MS);

    if (images.length === 0) {
      imagesReady = true;
      // finishWhenReady will be triggered by minTimer
    } else {
      const imagePromises = images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      );
      Promise.all(imagePromises).then(() => {
        imagesReady = true;
        finishWhenReady();
      });
    }

    return () => {
      clearTimeout(fakeFrame);
      clearTimeout(minTimer);
      document.body.style.overflow = "";
    };
  }, [images, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.03,
        filter: "blur(20px)",
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.03] blur-3xl"
        />

        <motion.div
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-8 text-center">
        {/* Logo */}
        <motion.img
          src="/images/traveland.png"
          alt="Traveland"
          initial={{
            opacity: 0,
            scale: 0.8,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-40 md:h-52 lg:h-64 mx-auto mb-16 object-contain drop-shadow-2xl"
        />

        {/* Dynamic destination text */}
        <div className="h-16 mt-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeMessage}
              initial={{
                opacity: 0,
                y: 20,
                filter: "blur(10px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -20,
                filter: "blur(10px)",
              }}
              transition={{
                duration: 0.6,
              }}
              className="text-white/70 uppercase tracking-[0.45em] text-xs md:text-sm"
            >
              {activeMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress section */}
        <div className="max-w-lg mx-auto mt-8">
          <div className="h-[1px] bg-white/10 overflow-hidden">
            <motion.div
              animate={{
                width: `${progress}%`,
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                width: {
                  duration: 0.4,
                  ease: "easeOut",
                },
                opacity: {
                  repeat: Infinity,
                  duration: 2,
                },
              }}
              className="h-full bg-white"
            />
          </div>

          <div className="flex justify-between mt-5">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              Loading
            </span>

            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              {progress}%
            </span>
          </div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 1.2,
            duration: 1,
          }}
          className="mt-24"
        >
          <p className="text-white/20 text-xs tracking-[0.35em] uppercase">
            Curated Experiences Across Tunisia
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};