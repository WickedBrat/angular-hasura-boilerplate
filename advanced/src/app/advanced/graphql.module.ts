import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '@env/environment.prod';
import { ApolloLink } from 'apollo-link';

@NgModule({
  exports: [HttpClientModule, ApolloModule, HttpLinkModule]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {

    // Create a link to the graphQL endpoint
    const http = httpLink.create({ uri: environment.graphqlEndpoint });

    // Establish middleware to add the authentication token from local storage
    const middleware = new ApolloLink((operation, forward) => {
      const token = localStorage.getItem('id_token');
      if (token) {
        // NOTE: For Auth0, the token claims are read to get the X-Hasura-User-Id and role information.
        // This info is injected using a `hasura-jwt-claim` rule established in Auth0, as described at
        // https://auth0.com/blog/building-a-collaborative-todo-app-with-realtime-graphql-using-hasura/#Authentication-Using-Auth0
        operation.setContext({
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        });
      }
      return forward(operation);
    });

    // Create an Apollo client with HTTP Link and cache as InMemoryCache.
    apollo.create({
      link: middleware.concat(http),
      cache: new InMemoryCache()
    });
  }
}
