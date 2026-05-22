import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redireciona automaticamente após 5 segundos
        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-(--color-bg) flex flex-col items-center justify-center p-4 text-center font-sans select-none">

            {/* Ícone Animado de Alerta */}
            <div className="text-6xl mb-4 animate-bounce">
                🛑
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-red-500 tracking-tighter italic uppercase mb-4">
                Access Denied
            </h1>

            <p className="text-(--color-text-secondary) max-w-md text-sm md:text-base font-medium mb-2 leading-relaxed">
                Oops! It looks like you don't have administrator permissions to view this page.
            </p>

            <p className="text-zinc-600 text-xs md:text-sm italic mb-6">
                You will be redirected to the homepage in 5 seconds...
            </p>

            <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-black px-6 py-3 rounded-xl shadow-xl shadow-(--color-primary)/20 transition-all transform active:scale-95 uppercase text-xs tracking-widest cursor-pointer"
            >
                Go Back Now
            </button>
        </div>
    );
};

export default Unauthorized;