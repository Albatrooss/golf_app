import React, { useMemo, useContext } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { PageHeader, Layout, Menu, Typography, Badge } from 'antd';
import { LayoutContext } from '@/contexts';
import { styled } from '@/utils';
import Trigger from './Trigger';
import Logo from '../components/Logo';

const SideMenu: React.FC = () => {
  const { siderCollapsed, setSiderCollapsed } = useContext(LayoutContext);

  const history = useHistory();
  const { pathname } = useLocation();

  const selectedKeys = useMemo(
    () =>
      [
        '/player/:id',
      ].filter(path => pathname.includes(path)),
    [pathname],
  );

  return (
    <StyledSiderContainer $collapsed={siderCollapsed}>
      <StyledSider
        theme="light"
        collapsible
        trigger={<Trigger siderCollapsed={siderCollapsed} />}
        collapsed={siderCollapsed}
        onCollapse={setSiderCollapsed}
      >
        <PageHeader
          title={
            <StyledHomeLink
              to="/feed"
              component={Typography.Link}
              $collapsed={siderCollapsed}
            >
              <Logo />
            </StyledHomeLink>
          }
        />
        <StyledMenu
          mode="inline"
          defaultOpenKeys={['leaderboard']}
          onClick={({ key }) => history.push(key.toString())}
          selectedKeys={selectedKeys}
        >
            <Menu.Item key="/leaderboard">LeaderBoard</Menu.Item>
            <Menu.Item key="/players">Players</Menu.Item>
            <Menu.Item key="/courses">Courses</Menu.Item>
            <Menu.Item key="/rounds">My Rounds</Menu.Item>
        </StyledMenu>
      </StyledSider>
    </StyledSiderContainer>
  );
};

const StyledSiderContainer = styled.div<{ $collapsed: boolean }>`
  overflow: hidden;
  height: 100vh;
  position: fixed;
  left: 0;

  ul {
    border-right: 1px solid #f0f0f0;
    ${({ $collapsed }) => !$collapsed && 'border: none'};
  }
`;

const StyledSider = styled(Layout.Sider)`
  min-height: 100vh;
  position: fixed;
  ${({ collapsed }) => collapsed && 'ul { border-right: 1px solid #f0f0f0 }'};
  > * {
    border-right: 1px solid #f0f0f0;
  }
  .ant-layout-sider-trigger {
    height: 100px;
  }
`;

const StyledHomeLink = styled(Link)<{ $collapsed: boolean }>`
  div {
    display: block;
    width: ${({ $collapsed }) => ($collapsed ? '0px' : '112px')};
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.2s;

    &:not(:hover) {
      color: #000000d9;
    }
  }
`;

const StyledMenu = styled(Menu)`
  border: none;
`;

export default SideMenu;
