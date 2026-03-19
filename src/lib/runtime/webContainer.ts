import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer() {
  if (!webcontainerInstance) {
    // Call only once
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

export async function mountProject(files: Record<string, any>) {
  const wc = await getWebContainer();
  await wc.mount(files);
}

export async function startDevServer(onOutput: (data: string) => void) {
  const wc = await getWebContainer();
  
  // Install dependencies
  const installProcess = await wc.spawn('npm', ['install']);
  installProcess.output.pipeTo(new WritableStream({
    write(data) {
      onOutput(data);
    }
  }));
  
  const installExitCode = await installProcess.exit;
  if (installExitCode !== 0) {
    throw new Error('Installation failed');
  }

  // Start dev server
  const startProcess = await wc.spawn('npm', ['run', 'dev']);
  startProcess.output.pipeTo(new WritableStream({
    write(data) {
      onOutput(data);
    }
  }));

  return startProcess;
}
