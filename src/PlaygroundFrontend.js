import { LitElement, html } from 'lit-element';
import { github } from './github-icon.svg.js';
import '@vanillawc/wc-monaco-editor';
import {vanilla} from './demos/vanilla.js';
import {litelement} from './demos/litelement.js';
import {stencil} from './demos/stencil.js';
import {loading} from './icons/loading.js';
import debounce from 'lodash-es/debounce.js';


const demos = {
  vanilla,
  litelement,
  stencil,
}

export class PlaygroundFrontend extends LitElement {
  static properties = { loading: {type: Boolean}}
  createRenderRoot() {
    return this;
  }

  debouncedGetManifest = debounce(this.getManifest, 1000);
  async getManifest({newValue, library}) {
    this.loading = true;
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
    document.querySelector('#output').value = JSON.stringify(JSON.parse(response.customElementsManifest), null, 2)
  }

  firstUpdated() {
    this.monacoWc = this.querySelector('#code');
    this.editor = this.monacoWc.editor;

    this.editor.getModel().onDidChangeContent(() => {
      this.getNewCEM();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const library = urlParams.get('library');

    if(source) {
      const decoded = decodeURIComponent(atob(source));
      this.monacoWc.value = decoded;
      this.library = library;
    } else {
      this.monacoWc.value = demos.vanilla;
    }
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

  render() {
    return html`
      <header>
        <select @change=${this.handleChange} name="libraries">
          <option ?selected=${this.library === 'vanilla'} value="vanilla">vanilla</option>
          <option ?selected=${this.library === 'litelement'} value="litelement">litelement</option>
          <option ?selected=${this.library === 'stencil'} value="stencil">stencil</option>
        </select>
        ${this.loading ? loading : ''}
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
