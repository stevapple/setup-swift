export class Installation {
  constructor(
    readonly location: string,
    readonly toolchain: string,
    readonly sdkroot: string,
    readonly runtime: string,
    readonly devdir?: string
  ) {}
}
