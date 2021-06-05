import { LitElement, html } from 'lit-element';
import '@vanillawc/wc-monaco-editor';
import {PLUGIN} from './demos/plugin.js';
import {vanilla} from './demos/vanilla.js';
import {catalyst} from './demos/catalyst.js';
import {fastelement} from './demos/fastelement.js';
import {litelement} from './demos/litelement.js';
import {stencil} from './demos/stencil.js';
import { github } from './icons/github-icon.svg.js';
import {loading} from './icons/loading.js';
import debounce from 'lodash-es/debounce.js';
import { dialog } from '@generic-components/components';
import { render } from 'lit-html';
import { createGithubIssue } from './utils/createGithubIssue.js';


const issueUrl = () => createGithubIssue({
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

const demos = {
  vanilla,
  litelement,
  stencil,
  fastelement,
  catalyst
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
      const modules = [ts.createSourceFile(
        'src/my-element.js',
        newValue,
        ts.ScriptTarget.ES2015,
        true,
      )];

      const pluginFn = this.getPluginFn()

      let plugins = [pluginFn(), /* library plugins */];

      switch(this.library) {
        case 'litelement':
          plugins = [...litPlugin(), ...plugins];
          break;
        case 'fastelement':
          plugins = [...fastPlugin(), ...plugins];
          break;
        case 'stencil':
          plugins = [stencilPlugin(), ...plugins];
          break;
        case 'catalyst':
          plugins = [...catalystPlugin(), ...plugins];
          break;
      }

      // add lib specific plugins here
      const manifest = create({modules, plugins});
      this.loading = false;
      this.error = false;
      document.querySelector('#output').value = JSON.stringify(manifest, null, 2)
    } catch(e) {

      document.querySelector('#output').value = `
Uh oh!

Looks like you've found a bug!

You can help this project out by reporting the bug on our GitHub repository. 
All you have to do is follow this link: 

${issueUrl()}
      `;
      this.error = true;
      this.loading = false;
      console.log(e)
    }
  }

  getPluginFn() {
    const value = this.pluginEditor.getValue();
    const pluginFn = new Function(`return ${value.trim()}`)();
    return pluginFn;
  }

  firstUpdated() {
    this.plugin = this.querySelector('#plugin');
    this.plugin.value = PLUGIN;
    this.pluginEditor = this.plugin.editor;

    this.monacoWc = this.querySelector('#code');
    this.editor = this.monacoWc.editor;

    this.editor.getModel().onDidChangeContent(() => {
      this.getNewCEM();
    });

    this.pluginEditor.getModel().onDidChangeContent(() => {
      this.debouncedGetManifest({library: this.library, newValue: this.editor.getValue()});
    });


    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    this.library = urlParams.get('library');

    if(this.library === 'null') this.library = 'vanilla';
    window.monaco.editor.setModelLanguage(window.monaco.editor.getModels()[0], 'typescript')
    window.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
    });

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
        render(html`
            <h1>Uh oh</h1>
            <h2>Looks like you've found a bug!</h2>
            <p>
              You can help this project out by reporting the bug on our GitHub repository, all you have to do is click <a id="issue" href="${issueUrl()}" target="_blank">this link</a>.
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
          <option ?selected=${this.library === 'fastelement'} value="fastelement">fastelement</option>
          <option ?selected=${this.library === 'catalyst'} value="catalyst">catalyst</option>
        </select>
        ${this.loading ? loading : ''}
        ${this.error ? html`<button class="error" @click=${this.handleError}>❌</button>` : ''}
        <a aria-label="github" target="_blank" href="https://www.github.com/open-wc/custom-elements-manifest">
          ${github}
        </a>
      </header>
      </header>
      <main>
        <div id="left">
          <wc-monaco-editor id="code" language="javascript"></wc-monaco-editor>
          <wc-monaco-editor id="plugin" language="javascript"></wc-monaco-editor>
        </div>
        <wc-monaco-editor id="output" language="json"></wc-monaco-editor>
      </main>
    `;
  }
}
