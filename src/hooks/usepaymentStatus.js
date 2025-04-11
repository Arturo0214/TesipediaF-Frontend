import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkGuestPaymentStatus } from '../features/payments/guestPaymentSlice';

export const usePaymentStatus = (trackingToken) => {
    const dispatch = useDispatch();
    const paymentStatus = useSelector((state) => state.payments?.paymentStatus);
    const loading = useSelector((state) => state.payments?.loading);
    const error = useSelector((state) => state.payments?.error);
    const paymentDetails = useSelector((state) => state.payments?.paymentDetails);

    useEffect(() => {
        if (trackingToken && paymentStatus !== 'completed') {
            dispatch(checkGuestPaymentStatus(trackingToken));
        }
    }, [dispatch, trackingToken, paymentStatus]);

    return { paymentStatus, loading, error, paymentDetails };
};

