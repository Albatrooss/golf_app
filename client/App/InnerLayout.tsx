import React from 'react';
import { Layout } from 'antd';
import { styled } from '@/utils';
import { LayoutContext } from '@/contexts';

const InnerLayout: React.FC = ({ children }) => {
  const { siderWidth } = React.useContext(LayoutContext);

  return (
    <StyledInsideLayout $siderWidth={siderWidth}>{children}</StyledInsideLayout>
  );
};

const StyledInsideLayout = styled(Layout)<{ $siderWidth: number }>`
  margin-left: ${({ $siderWidth }) => $siderWidth}px;
  transition: all 0.2s;
`;

export default InnerLayout;