import React, {
  useCallback,
  // useEffect
} from 'react';
import { useQuery, gql } from '@apollo/client';
// import { useRollbar } from '@rollbar/react';

export type AuthContextType = {
  auth: {
    id: string;
    username: string;
  };
  logout(): void;
};

const AuthContext = React.createContext<
  AuthContextType | Record<string, never>
>({});

// Avoid ts-graphql-plugin typecheck
// GetUser does not exist in schema, which causes an error in ts-graphql-plugin.
// We alias `gql` function here so ts-graphql-plugin won’t attempt to type check the query.
const gql2 = gql;

export const AuthContextProvider: React.FC = ({ children }) => {
  // const rollbar = useRollbar();
  const { data } = useQuery<{ user: AuthContextType['auth'] }>(
    gql2`
      query GetUser {
        user
      }
    `,
    {
      fetchPolicy: 'cache-only',
    },
  );

  const logout = useCallback(() => {
    window.location.assign('/logout');
  }, []);

  // useEffect(() => {
  //   rollbar.configure({
  //     payload: {
  //       context: 'ssr',
  //       person: {
  //         id: data!.user?.id,
  //         username: data!.user?.username,
  //       },
  //     },
  //   });
  // });

  return (
    <AuthContext.Provider
      value={{
        auth: data!.user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
