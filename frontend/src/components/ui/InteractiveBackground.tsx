import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { tsParticles } from "@tsparticles/engine";

export const InteractiveBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) {
    return <div className="fixed inset-0 w-full h-full -z-10 bg-slate-900 pointer-events-none"></div>;
  }

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#164e63] to-[#d97757]/20 z-0 opacity-80 mix-blend-multiply"></div>
      
      <Particles
        id="tsparticles"
        options={{
          fullScreen: { enable: false, zIndex: -1 },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 150,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ["#f3e5ab", "#ffffff", "#ea580c"],
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.1,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: true,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                width: 800,
                height: 800,
              },
              value: 60,
            },
            opacity: {
              value: 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 4 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 w-full h-full z-10"
      />
    </div>
  );
};
