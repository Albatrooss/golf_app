import React from 'react';
import { injectGlobal } from '@emotion/css';

/*
  In the server, useLayoutEffect throws errors/warnings so we shouldn't use
  it but some libaries use it internally (rc-select), so this makes sure it
  gets replaced by useEffect in the server.
*/
if (typeof window === 'undefined') {
  React.useLayoutEffect = React.useEffect;
}

// eslint-disable-next-line no-unused-expressions
injectGlobal`
  .ant-table table {
    font-size: inherit;
  }
  html .ant-page-header-footer .ant-tabs .ant-tabs-tab {
    font-size: 15px;
  }
`;
