import { copyFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';
const androidDir = path.join(clientDir, 'android');
const localAppData = process.env.LOCALAPPDATA || '';
const defaultSdkPath = path.join(localAppData, 'Android', 'Sdk');
const sdkPath = process.env.ANDROID_HOME
  || process.env.ANDROID_SDK_ROOT
  || (localAppData && defaultSdkPath);
const java21Home = path.join(
  process.env.ProgramFiles || 'C:\\Program Files',
  'Microsoft',
  'jdk-21.0.12.101-hotspot',
);
const isJava21 = (home) => {
  if (!home) return false;
  const executable = path.join(home, 'bin', isWindows ? 'java.exe' : 'java');
  if (!existsSync(executable)) return false;
  const result = spawnSync(executable, ['-version'], { encoding: 'utf8' });
  const version = `${result.stdout || ''}${result.stderr || ''}`.match(/version "(?:1\.)?(\d+)/);
  return Number(version?.[1]) >= 21;
};
const javaHome = [java21Home, process.env.JAVA_HOME].find(isJava21);
const java = javaHome
  ? path.join(javaHome, 'bin', isWindows ? 'java.exe' : 'java')
  : 'java';
const gradleWrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');

const isPrivateIpv4 = (address) => {
  const octets = address.split('.').map(Number);
  return octets.length === 4 && (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
};

const findLanAddress = () => {
  for (const addresses of Object.values(networkInterfaces())) {
    const address = addresses?.find(
      (item) => item.family === 'IPv4' && !item.internal && isPrivateIpv4(item.address),
    );
    if (address) return address.address;
  }
  return null;
};

const run = (command, args, env) => {
  const result = spawnSync(command, args, {
    cwd: clientDir,
    env,
    stdio: 'inherit',
    shell: isWindows && command.endsWith('.cmd'),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
};

if (!sdkPath) {
  throw new Error('Set ANDROID_HOME or ANDROID_SDK_ROOT to your Android SDK directory.');
}
if (!javaHome) {
  throw new Error('JDK 21 or newer is required. Set JAVA_HOME to an installed JDK 21 directory.');
}

const apiBaseUrl = process.env.VITE_API_BASE_URL || `http://${findLanAddress() || '127.0.0.1'}:5000/api`;
if (apiBaseUrl.includes('127.0.0.1') || apiBaseUrl.includes('localhost')) {
  throw new Error('The phone cannot reach a loopback API URL. Set VITE_API_BASE_URL to this computer’s LAN IP.');
}

const env = {
  ...process.env,
  ANDROID_HOME: sdkPath,
  ANDROID_SDK_ROOT: sdkPath,
  JAVA_HOME: javaHome || process.env.JAVA_HOME || '',
  VITE_API_BASE_URL: apiBaseUrl,
  VITE_LOCAL_NETWORK_URL: `http://${new URL(apiBaseUrl).hostname}:5173`,
};

run(npm, ['run', 'build'], env);

const apkInDist = path.join(clientDir, 'dist', 'downloads', 'unibot.apk');
await rm(apkInDist, { force: true });
run(npm, ['exec', 'cap', '--', 'sync', 'android'], env);
run(java, [
  '-classpath',
  gradleWrapperJar,
  'org.gradle.wrapper.GradleWrapperMain',
  '-p',
  androidDir,
  'assembleDebug',
], env);

const generatedApk = path.join(
  clientDir,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'debug',
  'app-debug.apk',
);
const publicDownload = path.join(clientDir, 'public', 'downloads', 'unibot.apk');
await mkdir(path.dirname(publicDownload), { recursive: true });
await copyFile(generatedApk, publicDownload);
await mkdir(path.dirname(apkInDist), { recursive: true });
await copyFile(generatedApk, apkInDist);

console.log(`APK built: ${publicDownload}`);
console.log(`API endpoint embedded for this phone build: ${apiBaseUrl}`);
