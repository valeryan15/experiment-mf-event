import React from 'react';
import Navigation from '../widgets/Navigation/ui/Navigation';
import ContentArea from '../widgets/ContentArea/ui/ContentArea';

export const Router: React.FC = () => {
  return (
    <>
      <Navigation />
      <ContentArea />
    </>
  );
};