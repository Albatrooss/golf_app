import styled, { StyledOptions } from '@emotion/styled';

const options: StyledOptions<any> = {
  shouldForwardProp: prop => !(prop as string).startsWith('$'),
} as const;

const wrappedStyled = new Proxy(styled, {
  get(target, property) {
    if (typeof property === 'string') {
      return styled(property as keyof JSX.IntrinsicElements, options);
    }
    return target[(property as unknown) as keyof typeof target];
  },
  apply(target, thisArg, args) {
    return target.call(thisArg, ...(args as [any]), options);
  },
});

export default wrappedStyled;
