// Composition root. Stage 01 provides only the shell: fail loudly if the
// root element is missing. UI stages (04) compose the real interface here.

const appRoot = document.querySelector<HTMLElement>('#app');

if (!appRoot) {
  throw new Error('Application root element #app not found in index.html.');
}
