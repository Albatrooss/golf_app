import { Theme } from '@emotion/react';
import { css } from '@emotion/css';

declare module '@emotion/react' {
  export interface Theme {
    borderRadius: string;
    color: {
      primary: string;
      green: string;

      black: string;
      white: string;
    };
  }
}

const theme: Theme = {
  borderRadius: '4px',
  color: {
    primary: '#7EAB1E',
    green: '#A9DC3C',

    black: '#333333',
    white: '#F2F2F2',
  },
};

export default theme;
