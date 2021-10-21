import React from 'react';
import { Layout } from 'antd';
import { styled } from '@/utils';
import { LayoutContext } from '@/contexts';

const InnerLayout: React.FC = ({ children }) => {
  const { siderWidth } = React.useContext(LayoutContext);
  return (
    <main className={'ohohoh-bg'} style={{ marginLeft: siderWidth }}>
      {children}
    </main>
  );
};

const StyledInsideLayout = styled(Layout)<{ $siderWidth: number }>`
  margin-left: ${({ $siderWidth }) => $siderWidth}px;
  transition: all 0.2s;
  background-repeat: repeat;
  width: 100%;
  min-height: 100vh;
`;

export default InnerLayout;
