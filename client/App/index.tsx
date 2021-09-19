import React from 'react';
import './config';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import { RollbarContext } from '@rollbar/react';

import { AuthContextProvider, LayoutContextProvider } from '@/contexts';

import FeedPage from './pages/Feed';
import AppErrorBoundary from './appErrorBoundary';
import InnerLayout from './InnerLayout';

export type RoutePath = keyof typeof routes;

const routes = {
  '/feed': FeedPage,
};

const App: React.FC = () => (
  <AppErrorBoundary>
    <AuthContextProvider>
      <LayoutContextProvider>
        <Layout>
          {/* <JobNotification /> */}
          {/* <SideMenu /> */}
          <InnerLayout>
            {/* <AppHeader /> */}
            <Layout.Content>
              <Switch>
                {Object.entries(routes).map(([path, Page]) => (
                  <Route exact path={path} key={path}>
                    <RollbarContext context={path}>
                      <Page />
                    </RollbarContext>
                  </Route>
                ))}
                <Redirect to="/feed" />
              </Switch>
            </Layout.Content>
          </InnerLayout>
        </Layout>
      </LayoutContextProvider>
    </AuthContextProvider>
  </AppErrorBoundary>
);

export default App;
