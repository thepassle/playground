import { LitElement, html } from 'lit-element';
import { github } from './github-icon.svg.js';
import '@vanillawc/wc-monaco-editor';
import {vanilla} from './demos/vanilla.js';
import {litelement} from './demos/litelement.js';
import {stencil} from './demos/stencil.js';

const demos = {
  vanilla,
  litelement,
  stencil,
}

function debounce(func, delay = 0) {
  let timeoutId;

  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  }
};

async function getManifest({library, newValue}) {
  
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
  document.querySelector('#output').value = JSON.stringify(JSON.parse(response.customElementsManifest), null, 2)
}

const debouncedGetManifest = debounce(getManifest, 1000);

export class PlaygroundFrontend extends LitElement {
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.monacoWc = this.querySelector('#code');
    this.editor = this.monacoWc.editor;

    this.editor.getModel().onDidChangeContent(() => {
      this.getNewCEM();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get('source');

    if(param) {
      const decoded = decodeURIComponent(atob(param));
      this.monacoWc.value = decoded;
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

  getNewCEM() {
    const val = this.editor.getValue();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("source", btoa(val));
    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
    window.history.pushState({path: newurl}, '', newurl);
    debouncedGetManifest({library: this.library, newValue: val});
  }

  render() {
    return html`
      <header>
        <select @change=${this.handleChange} name="libraries">
          <option value="vanilla">vanilla</option>
          <option value="litelement">litelement</option>
          <option value="stencil">stencil</option>
        </select>
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
