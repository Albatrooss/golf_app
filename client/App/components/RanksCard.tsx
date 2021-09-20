import React from 'react';
import { styled, css } from '@/utils/';
import { UserOutlined } from '@ant-design/icons';

interface comProps {}

const RankCard = ({}: comProps) => {
  return (
    <Wrapper>
      <Left>
        <StyledUserOutlined />
      </Left>
      <Right>
        <Top>
          <Player>
            <PlayerText>ALBATROOSS</PlayerText>
          </Player>
          <HandicapWrapper>
            <Handicap>-23</Handicap>
          </HandicapWrapper>
        </Top>
        <Bottom>
          <Text>1st</Text>
          <Text>101</Text>
        </Bottom>
      </Right>
    </Wrapper>
  );
};
export default RankCard;

const Wrapper = styled.div`
  position: fixed;
  display: flex;
  background-color: red;
  width: 352px;
  height: 98px;
  top: 32px;
  right: 32px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  ${({ theme }) => css`
    background: linear-gradient(
      180deg,
      #9bcf2d 0%,
      ${theme.color.primary} 50.52%,
      ${theme.color.primary} 100%
    );
  `}
`;
const Left = styled.div`
  width: 98px;
  height: 100%;
  background-color: ${({theme}) => theme.color.white};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledUserOutlined = styled(UserOutlined)`
  font-size: 60px;
  border: 4px solid black;
   border-radius: 50%;
   padding: 8px;
`;

const Right = styled.div`
  height: 100%;
  flex: 1;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  height: 50%;
  border-bottom: 1px solid ${({ theme }) => theme.color.green};
  padding-left: 6px;
`;

const Player = styled.div`
  flex: 1;
`;

const PlayerText = styled.span`
  color: white;
  font-weight: 500;
  font-size: 24px;
`;

const HandicapWrapper = styled.div`
  background-color: ${({ theme }) => theme.color.green};
  width: 79px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Handicap = styled.span`
  color: white;
  font-size: 26px;
  font-weight: 500;
`;

const Bottom = styled.div`
  padding: 0 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Text = styled.span`
  color: ${({theme}) => theme.color.white};
  font-size:36px;
`;
