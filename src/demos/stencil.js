export const stencil = `
import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'my-element',
})
export class MyElement {
  @Prop() color: string;
}
`;