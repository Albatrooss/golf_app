import React from 'react'
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

const FeedPage = ({  }) => {

  const TEST = gql`
    query User($id: String!) {
      user(id: $id) {
        id
        username
      }
    }
  `;

  const {data} = useQuery(TEST, {
    variables: {
      id: '1'
    }
  });
  console.log('data', data)
  return (
    <div>
      <p>FEEEED!!?</p>
    </div>
  )

}
export default FeedPage;
