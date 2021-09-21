import React from 'react'
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

const FeedPage = ({  }) => {

  const TEST = gql`
    query User($id: Int!) {
      user(id: $id) {
        id
        username
        role
        scores {
          date
          front
          back
        }
      }
    }
  `;

  const {data} = useQuery(TEST, {
    variables: {
      id: 8
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
