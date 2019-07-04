function userSyncRule(user, context, callback) {
  const userId = user.user_id;
  const nickname = user.nickname;

  const mutation = `mutation($userId: String!, $nickname: String) {
    insert_users(objects: [{
        auth0_id: $userId,
        name: $nickname
      }],
      on_conflict: {
        constraint: users_pkey,
        update_columns: [last_seen, name]
      }) {
        affected_rows
      }
    }`;

  request.post(
    {
      headers: {
        "content-type": "application/json",
        "x-hasura-admin-secret": configuration.ACCESS_KEY
      },
      url: "https://<yourdomain>.herokuapp.com/v1/graphql",
      body: JSON.stringify({ query: mutation, variables: { userId, nickname } })
    },
    function(error, response, body) {
      console.log(body);
      callback(error, user, context);
    }
  );
}
