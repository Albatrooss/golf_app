type Int = number;
type Float = number;

interface Array<T> {
  filter(
    filter: BooleanConstructor,
  ): Exclude<T, null | undefined | '' | 0 | false>[];
}

// @ts-ignore external import
declare type SSR = import('../client/ssr').SSR;

type Spyify<T> = T &
  {
    [key in keyof T]: T[key] extends (...args: infer K) => infer R
      ? sinon.SinonStub<K, R> & sinon.SinonSpy<K, R>
      : T[key];
  };
