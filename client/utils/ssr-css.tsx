import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';

export const key = 'automaton';
const cache = createCache({ key });
const { extractCritical } = createEmotionServer(cache);

const ServerCacheProvider: React.FC = ({ children }) => (
  <CacheProvider value={cache}>{children}</CacheProvider>
);
export { ServerCacheProvider as CacheProvider };

export function extractEmotion(renderedString: string) {
  const { html, css, ids } = extractCritical(renderedString);
  const style = `<style data-emotion="${key} ${ids.join(' ')}">${css}</style>`;
  return { style, html };
}
