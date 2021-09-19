import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import React from 'react'

const FeedPage = ({  }) => {

  const TEST = gql`
    query User($id: String!) {
      user(id: $id) {
        id
        username
      }
    }
  `;

  const {data} = useQuery(TEST);
  console.log(data)
  return (
    <div>
      FEEEED
    </div>
  )

}
export default FeedPage;
