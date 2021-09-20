import React from 'react';
import { styled } from '@/utils';
import { MenuFoldOutlined } from '@ant-design/icons';

type TriggerProps = { siderCollapsed: boolean };

const Trigger: React.FC<TriggerProps> = ({ siderCollapsed }) => (
  <StyledTrigger>
    <StyledIconWrapper>
      <MenuFoldOutlined />
    </StyledIconWrapper>
  </StyledTrigger>
);

const StyledTrigger = styled.div`
  display: grid;
  align-items: flex-end;
  height: 100%;
`;

const StyledIconWrapper = styled.div`
  padding: 3px 0;
  width: 79px;
  span {
    font-size: 16px;
  }
`;

export default Trigger;
