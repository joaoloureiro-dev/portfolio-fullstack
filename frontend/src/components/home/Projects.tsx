import { motion } from "framer-motion";

const PROJECTS = [
    {
        title: "Project One",
        description: "Resumo do projeto ou funcionalidade principal.",
        tech: ["HTML", "CSS", "JS"],
        link: "#"
    },
    {
        title: "Project Two",
        description: "COMING SOON",
        tech: ["React", "Tailwind"],
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
                    <motion.article
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5, borderColor: "var(--color-primary)" }}
                        className="group p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-sm transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-white font-bold group-hover:text-(--color-primary) transition-colors italic uppercase tracking-tighter">
                                {project.title}
                            </h3>
                            <motion.a
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                href={project.link}
                                target="_blank"
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                            </motion.a>
                        </div>
                        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{project.description}</p>
                        <div className="flex gap-3 mt-4">
                            {project.tech.map(t => (
                                <span key={t} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}