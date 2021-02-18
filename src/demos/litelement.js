export const litelement = `
import { LitElement } from 'lit-element';

export class MyElement extends LitElement {
  static get properties() {
    return {
      foo: { type: String }
    }
  }

  constructor() {
    super();
    this.foo = 'hello';
  }

  myMethod(){}
}
`;