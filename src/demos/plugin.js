export const PLUGIN = `
function myPlugin() {
  // Write a custom plugin
  return {
    // Make sure to always give your plugins a name, this helps when debugging
    name: 'my-plugin',
    // Runs before analysis starts
    initialize({ts, customElementsManifest, context}) {},
    // Runs for all modules in a project, before continuing to the analyzePhase
    collectPhase({ts, node, context}){},
    // Runs for each module
    analyzePhase({ts, node, moduleDoc, context}){},
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({moduleDoc, context}){},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({customElementsManifest, context}){},
  }
}
`