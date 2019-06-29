function hasuraClaimsRule(user, context, callback) {
  const namespace = "https://hasura.io/jwt/claims";

  context.idToken[namespace] = {
    "x-hasura-default-role": "user",

    // do some custom logic to decide allowed roles
    'x-hasura-allowed-roles': user.email === 'admin@yourdomain.com' ? ['user', 'admin'] : ['user'],
    "x-hasura-user-id": user.user_id
  };

  callback(null, user, context);
}
