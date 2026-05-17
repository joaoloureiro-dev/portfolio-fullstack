import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '3rem', color: '#ff4d4f' }}>Access Denied 🛑</h1>
            <p style={{ fontSize: '1.2rem' }}>
                Oops! It looks like you don't have administrator permissions to view this page.
            </p>
            <p style={{ color: '#666' }}>
                You will be redirected to the homepage in 5 seconds...
            </p>
            <button
                onClick={() => navigate('/')}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    backgroundColor: '#e66a00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                }}
            >
                Go Back Now
            </button>
        </div>
    );
};

export default Unauthorized;