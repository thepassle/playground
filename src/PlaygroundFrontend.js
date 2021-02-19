import { LitElement, html } from 'lit-element';
import '@vanillawc/wc-monaco-editor';
import {vanilla} from './demos/vanilla.js';
import {litelement} from './demos/litelement.js';
import {stencil} from './demos/stencil.js';
import { github } from './icons/github-icon.svg.js';
import {loading} from './icons/loading.js';
import debounce from 'lodash-es/debounce.js';
import { dialog } from '@generic-components/components';
import { render } from 'lit-html';
import { createGithubIssue } from './utils/createGithubIssue.js';

const demos = {
  vanilla,
  litelement,
  stencil,
}

export class PlaygroundFrontend extends LitElement {
  static properties = { 
    loading: {type: Boolean},
    error: {type: Boolean},
    library: {type: String},
  }
  createRenderRoot() {
    return this;
  }

  debouncedGetManifest = debounce(this.getManifest, 1000);
  async getManifest({newValue, library}) {
    this.loading = true;
    try {
      const res = await fetch('https://playground-api.cleverapps.io/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: './my-element.js',
          sourceCode: newValue,
          library
        })
      });
      const response = await res.json();
      this.loading = false;
      this.error = false;
      document.querySelector('#output').value = JSON.stringify(JSON.parse(response.customElementsManifest), null, 2)
    } catch(e) {
      this.error = true;
      this.loading = false;
      console.log(e)
    }
  }

  firstUpdated() {
    this.monacoWc = this.querySelector('#code');
    this.editor = this.monacoWc.editor;

    this.editor.getModel().onDidChangeContent(() => {
      this.getNewCEM();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    this.library = urlParams.get('library');
    if(this.library === 'null') this.library = 'vanilla';

    if(source) {
      const decoded = decodeURIComponent(atob(source));
      this.monacoWc.value = decoded;
      this.library = library;
    } else {
      this.monacoWc.value = demos.vanilla;
    }

    this.debouncedGetManifest({library: this.library, newValue: this.editor.getValue()});
  }

  handleChange() {
    this.library = this.querySelector('select').value;

    this.monacoWc.value = demos[this.library];
    if(this.library === 'stencil') {
      window.monaco.editor.setModelLanguage(window.monaco.editor.getModels()[0], 'typescript')
    } else {
      window.monaco.editor.setModelLanguage(window.monaco.editor.getModels()[0], 'javascript')
    }
    this.getNewCEM()
  }

  async getNewCEM() {
    const val = this.editor.getValue();

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("source", btoa(val));

    urlParams.set("library", this.library);
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
    window.history.pushState({path: newurl}, '', newurl);

    this.debouncedGetManifest({library: this.library, newValue: val});
  }

  handleError(e){
    dialog.open({
      invokerNode: e.target,
      content: (dialogNode) => {
        const issueUrl = createGithubIssue({
          user: 'open-wc',
          repo: 'custom-elements-manifest',
          body: `# Playground issue

Reproduction URL: 
${window.location.href}

## Additional information:
Please enter additional information here.

          `,
          title: 'Found playground issue'
        });

        render(html`
            <h1>Uh oh</h1>
            <h2>Looks like you've found a bug!</h2>
            <p>
              You can help this project out by reporting the bug on our GitHub repository, all you have to do is click <a href="${issueUrl}" target="_blank">this link</a>.
            </p>

            <button @click=${() => dialog.close()}>Close</button>
        `, dialogNode);
      }
    });
  }

  render() {
    return html`
      <header>
        <select @change=${this.handleChange} name="libraries">
          <option ?selected=${this.library === 'vanilla'} value="vanilla">vanilla</option>
          <option ?selected=${this.library === 'litelement'} value="litelement">litelement</option>
          <option ?selected=${this.library === 'stencil'} value="stencil">stencil</option>
        </select>
        ${this.loading ? loading : ''}
        ${this.error ? html`<button class="error" @click=${this.handleError}>❌</button>` : ''}
        <a aria-label="github" target="_blank" href="https://www.github.com/open-wc/custom-elements-manifest">
          ${github}
        </a>
      </header>
      </header>
      <main>
        <wc-monaco-editor id="code" language="javascript"></wc-monaco-editor>
        <wc-monaco-editor id="output" language="json"></wc-monaco-editor>
      </main>
    `;
  }
}
