import React from 'react';
import './config';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
// import { RollbarContext } from '@rollbar/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/utils';
import { AuthContextProvider, LayoutContextProvider } from '@/contexts';

import FeedPage from './pages/Feed';
import AppErrorBoundary from './appErrorBoundary';
import InnerLayout from './InnerLayout';
import ProfilePage from './pages/Profile';
import RankCard from './components/RanksCard';
import SideMenu from './SideMenu';

export type RoutePath = keyof typeof routes;

const routes = {
  '/feed': FeedPage,
  '/user/:id': ProfilePage,
};

const App: React.FC = () => (
  <AppErrorBoundary>
    <AuthContextProvider>
      <LayoutContextProvider>
        <ThemeProvider theme={theme}>
          <Layout>
            {/* <JobNotification /> */}
            <SideMenu />
            <InnerLayout>
              <RankCard />
              <Layout.Content>
                <Switch>
                  {Object.entries(routes).map(([path, Page]) => (
                    <Route exact path={path} key={path}>
                      {/* <RollbarContext context={path}> */}
                      <Page />
                      {/* </RollbarContext> */}
                    </Route>
                  ))}
                  <Redirect to="/feed" />
                </Switch>
              </Layout.Content>
            </InnerLayout>
          </Layout>
        </ThemeProvider>
      </LayoutContextProvider>
    </AuthContextProvider>
  </AppErrorBoundary>
);

export default App;
