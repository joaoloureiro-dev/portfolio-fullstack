import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROJECTS = [
    {
        title: "Secure Admin & Analytics Dashboard",
        description: "A private management panel integrated with Fastify and PostgreSQL. Tracks real-time traffic statistics, audits security logs, and manages contact leads.",
        images: ["/admin_dashboard.jpg", "/ga_dashboard.jpg"],
        tech: ["Node.js", "FASTIFY", "JWT"],
        link: "#"
    },
    {
        title: "Dev Portfolio & Landing Page",
        images: ["/og-image.jpg"],
        description: "A high-performance, SEO-optimized trilingual portfolio built with React 19 and Tailwind v4. Features rock-solid layouts protected against automatic translation breaks.",
        tech: ["React", "TypeScript", "Tailwind v4", "VITE"],
        link: "#"
    }
];

export default function Projects() {
    return (
        <section id="projects" className="scroll-mt-24">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                Selected Projects <span className="h-px flex-1 bg-zinc-800"></span>
            </h2>
            <div className="grid gap-4">
                {PROJECTS.map((project, i) => (
                    <ProjectCard key={i} project={project} index={i} />
                ))}
            </div>
        </section>
    );
}

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const hasMultipleImages = project.images.length > 1;

    const nextImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, borderColor: "var(--color-primary)" }}
            onClick={() => window.open(project.link, "_blank")}
            className="group p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm transition-colors cursor-pointer select-none"
        >
            <div className="flex justify-between items-start">
                <h3 className="text-white font-bold group-hover:text-(--color-primary) transition-colors italic uppercase tracking-tighter">
                    {project.title}
                </h3>
                <motion.a
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                </motion.a>
            </div>

            <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{project.description}</p>

            {project.images && project.images.length > 0 && (
                <div className="relative mt-4 overflow-hidden rounded-xl border border-zinc-800/50 aspect-video bg-zinc-950 flex items-center justify-center touch-pan-y">

                    {/* 🚀 Imagem com suporte para Swipe Animado no Telemóvel */}
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImgIndex}
                            src={project.images[currentImgIndex]}
                            alt={`${project.title} - ${currentImgIndex + 1}`}
                            initial={{ opacity: 0.6 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0.6 }}
                            transition={{ duration: 0.2 }}
                            // Lógica de arrastar com o dedo
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (!hasMultipleImages) return;
                                if (info.offset.x < -50) nextImage();
                                if (info.offset.x > 50) prevImage();
                            }}
                            className="w-full h-full object-cover opacity-90 md:opacity-80 md:group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                        />
                    </AnimatePresence>

                    {hasMultipleImages && (
                        <>
                            {/* Setas de navegação: Sempre visíveis no mobile, ocultas por padrão no desktop */}
                            <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 cursor-pointer z-20"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 cursor-pointer z-20"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Indicadores de posição (pontinhos) */}
                            <div className="absolute bottom-3 flex gap-1 z-10">
                                {project.images.map((_, dotIdx) => (
                                    <div
                                        key={dotIdx}
                                        className={`h-1 rounded-full transition-all duration-300 ${currentImgIndex === dotIdx ? "bg-white w-4" : "bg-white/30 w-1"
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="flex gap-3 mt-4">
                {project.tech.map((t) => (
                    <span key={t} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest md:group-hover:text-zinc-400 transition-colors">
                        {t}
                    </span>
                ))}
            </div>
        </motion.article>
    );
}