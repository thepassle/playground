export const stencil = `
import { Component } from '@stencil/core';

@Component({
  tag: 'my-element',
})
export class MyElement {
  @Prop() color: string;
}
`;