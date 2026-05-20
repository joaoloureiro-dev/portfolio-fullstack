export default function About() {
    return (
        <section id="about" className="scroll-mt-24">
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                About Me <span className="h-px flex-1 bg-zinc-800"></span>
            </h2>
            <div className="space-y-6 text-zinc-400 font-medium leading-relaxed">
                <p>
                    I’m a <span className="text-white font-bold">Fullstack Developer</span> focused on building scalable and performant web applications.
                    I started my journey in 2026, driven by a strong interest in technology and problem-solving.
                </p>
                <p>
                    I enjoy turning ideas into real products, from frontend interfaces to backend systems. My focus is
                    <span className="text-(--color-primary) italic"> clean architecture</span>, performance and user-centered design.
                </p>
                <p>
                    Currently, I’m strengthening my skills in <span className="text-white">React, Tailwind, Typescrypt,Node.js and PostgreSQL</span>,
                    with the goal of building complete end-to-end digital solutions.
                </p>
            </div>
        </section>
    );
}