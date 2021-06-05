export const catalyst = `
import { controller, attr } from '@github/catalyst'

@controller
class HelloWorldElement extends HTMLElement {
  @attr foo = 'hello'

  bar;
}
`;