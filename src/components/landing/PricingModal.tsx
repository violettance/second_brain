import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaywallModal } from '../analytics/PaywallModal';
import { logger } from '../../lib/logger';

export const PricingModal: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const handleUpgrade = () => {
    // In a real implementation, this would trigger Paddle checkout
    logger.info('Paddle checkout would open here for Pro subscription');
    alert('Paddle checkout would open here for Pro subscription');
  };

  return (
    <PaywallModal onClose={handleClose} onUpgrade={handleUpgrade} />
  );
};

export default PricingModal;
