export default function Stack() {
    const badges = [
        { name: "React", logo: "react" },
        { name: "TypeScript", logo: "typescript" },
        { name: "Tailwind CSS", logo: "tailwind-css" },
        { name: "Node.js", logo: "node.js" },
        { name: "PostgreSQL", logo: "postgresql" },
        { name: "JavaScript", logo: "javascript" },
    ];

    return (
        <section id="stack" className="scroll-mt-24">
            <h2 className="notranslate text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4" translate="no">
                Tech Stack <span className="notranslate h-px flex-1 bg-zinc-800"></span>
            </h2>
            <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                    <img
                        key={badge.name}
                        src={`https://img.shields.io/badge/${badge.name}-0f0f0f?style=for-the-badge&logo=${badge.logo}&logoColor=ff7b00`}
                        alt={badge.name}
                        className="h-8 transition-transform hover:-translate-y-1 cursor-crosshair"
                    />
                ))}
            </div>
        </section>
    );
}