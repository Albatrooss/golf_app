import { Layout } from 'antd';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { styled } from '@/utils';

const refresh = () => window.location.reload();

const CompleteFailureScreen: React.FC<{
  message: string;
}> = ({ message }) => {
  const history = useHistory();
  useEffect(() => {
    history.listen(() => {
      window.location.reload();
    });
  }, []);

  return (
    <Layout>
      <StyledContent>
        <div>
          <Header>{'>.<'}</Header>
          <p>
            There was an error handling your request. Please{' '}
            <a href="#" onClick={refresh}>
              reload the page.
            </a>
          </p>
          <p>
            Error message: <strong>{message}</strong>.
          </p>
        </div>
      </StyledContent>
    </Layout>
  );
};

const Header = styled.h1`
  font-size: 3em;
`;

const StyledContent = styled(Layout.Content)`
  padding: 40px;
  min-height: 100vh;
`;

export default CompleteFailureScreen;
