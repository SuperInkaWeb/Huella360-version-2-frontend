export const Blog = () => {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center flex-1">
            {/* 1. Header del Blog */}
            <header className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#1ea59c]/10 text-[#1ea59c] text-sm font-bold uppercase tracking-wider mb-4">
                        Recursos y Noticias
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#2D3E82] tracking-tight">
                        Nuestro <span className="text-[#1ea59c]">Blog</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Explora artículos sobre salud animal, gestión de clínicas y las últimas novedades de Huella360.
                    </p>
                </div>
            </header>
        </div>
    );
};
