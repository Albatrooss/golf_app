import React from 'react';
import { Layout } from 'antd';
import { styled } from '@/utils';
import { LayoutContext } from '@/contexts';
import BG_IMG from './assets/ohohoh_bg02.png';

const InnerLayout: React.FC = ({ children }) => {
  const { siderWidth } = React.useContext(LayoutContext);
  return (
    <StyledInsideLayout $siderWidth={siderWidth}>{children}</StyledInsideLayout>
  );
};

const StyledInsideLayout = styled(Layout)<{ $siderWidth: number }>`
  margin-left: ${({ $siderWidth }) => $siderWidth}px;
  transition: all 0.2s;
  background-image: url(${BG_IMG});
  /* background-image: url(./assets/ohohoh_bg02.png); */
  background-repeat: repeat;
  width: 100%;
  min-height: 100vh;
`;

export default InnerLayout;
