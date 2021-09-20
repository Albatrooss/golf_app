import React from 'react';
import { styled } from '@/utils/';

const Logo = () => {
  return (
    <Wrapper>
      <Golf>G</Golf>
      <OHOHOH>OHOHOH</OHOHOH>
      <Golf>LF</Golf>
    </Wrapper>
  );
};
export default Logo;

const Wrapper = styled.div`
  display: flex;
  width: 300px;
`;

const Golf = styled.span``;

const OHOHOH = styled.span``;
