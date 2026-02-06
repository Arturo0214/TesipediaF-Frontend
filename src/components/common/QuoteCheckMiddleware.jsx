import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMyQuotes } from '../../features/quotes/quoteSlice';

const QuoteCheckMiddleware = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [hasPaidQuotes, setHasPaidQuotes] = useState(false);
    const { isAdmin } = useSelector(state => state.auth);
    const { quotes } = useSelector(state => state.quotes);

    useEffect(() => {
        const checkQuotes = async () => {
            try {
                const quotesResult = await dispatch(getMyQuotes()).unwrap();
                setHasPaidQuotes(quotesResult.some(quote => quote.status === 'paid'));
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching quotes:', error);
                setIsLoading(false);
            }
        };
        checkQuotes();
    }, [dispatch]);

    // Skip check for admin users
    if (isAdmin) {
        return <Outlet />;
    }

    // Show loading while checking quotes
    if (isLoading) {
        return <div className="text-center py-5">Verificando cotizaciones...</div>;
    }

    // If no paid quotes, redirect to quote page
    if (!hasPaidQuotes) {
        return <Navigate to="/cotizar" state={{ from: location.pathname }} replace />;
    }

    // If has paid quotes, allow access to dashboard
    return <Outlet />;
};

export default QuoteCheckMiddleware; 