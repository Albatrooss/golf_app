interface Array<T> {
  filter(
    filter: BooleanConstructor,
  ): Exclude<T, null | undefined | 0 | '' | false>[];
}

type Int = number;
type Float = number;

declare module '@rollbar/react';

declare module '@/compiled-client-server' {
  export interface RenderAppResponse {
    /** the compiled version of the app to send to the client. */
    html: string;

    /** a string of styles which have been extracted from the react app. */
    styles: string;
  }

  /**
   * Render a react app on the server.
   *
   * @param url the request url
   * @param query the query string for the current request
   */
  export function renderApp(url: string): RenderAppResponse;
}

declare module 'axios/lib/adapters/http';
declare module 'axios/lib/adapters/xhr';
// declare module 'humanize-graphql-response';
