import { execSync } from "child_process";
import { createInterface } from "readline";

/**
 * Plugin metadata for auto-installation
 */
export interface PluginInfo {
  /** npm package name */
  package: string;
  /** Human-readable name for display */
  displayName: string;
  /** The generator name it provides */
  generatorName: string;
}

/**
 * Registry of known plugins and their packages
 */
export const PLUGIN_REGISTRY: Record<string, PluginInfo> = {
  qr: {
    package: "@teamflojo/floimg-qr",
    displayName: "QR Code Generator",
    generatorName: "qr",
  },
  quickchart: {
    package: "@teamflojo/floimg-quickchart",
    displayName: "QuickChart Generator",
    generatorName: "quickchart",
  },
  mermaid: {
    package: "@teamflojo/floimg-mermaid",
    displayName: "Mermaid Diagram Generator",
    generatorName: "mermaid",
  },
  d3: {
    package: "@teamflojo/floimg-d3",
    displayName: "D3 Visualization Generator",
    generatorName: "d3",
  },
  screenshot: {
    package: "@teamflojo/floimg-screenshot",
    displayName: "Screenshot Generator",
    generatorName: "screenshot",
  },
};

/**
 * Prompt user for confirmation (works in TTY)
 */
async function promptConfirm(message: string): Promise<boolean> {
  // Check if we're in an interactive terminal
  if (!process.stdin.isTTY) {
    return false;
  }

  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

/**
 * Detect the package manager being used
 */
function detectPackageManager(): "npm" | "pnpm" | "yarn" | "bun" {
  // Check for common environment variables
  if (process.env.npm_config_user_agent?.includes("pnpm")) {
    return "pnpm";
  }
  if (process.env.npm_config_user_agent?.includes("yarn")) {
    return "yarn";
  }
  if (process.env.npm_config_user_agent?.includes("bun")) {
    return "bun";
  }
  return "npm";
}

/**
 * Install a package using the detected package manager
 */
function installPackage(packageName: string): void {
  const pm = detectPackageManager();

  const commands: Record<string, string> = {
    npm: `npm install ${packageName}`,
    pnpm: `pnpm add ${packageName}`,
    yarn: `yarn add ${packageName}`,
    bun: `bun add ${packageName}`,
  };

  console.log(`\n📦 Installing ${packageName}...`);
  execSync(commands[pm], { stdio: "inherit" });
  console.log(`✅ Installed ${packageName}\n`);
}

/**
 * Try to load a plugin, with auto-install if not found
 *
 * @param pluginKey - Key from PLUGIN_REGISTRY (e.g., "qr", "quickchart")
 * @param autoInstall - Whether to prompt for auto-install (default: true)
 * @returns The loaded plugin module, or null if not available
 */
export async function loadPlugin<T = unknown>(
  pluginKey: string,
  autoInstall = true
): Promise<T | null> {
  const info = PLUGIN_REGISTRY[pluginKey];

  if (!info) {
    console.error(`Unknown plugin: ${pluginKey}`);
    return null;
  }

  // Try to import the plugin
  try {
    const module = await import(info.package);
    return module as T;
  } catch {
    // Plugin not installed
  }

  // Plugin not found - offer to install
  console.log(`\n🔍 The '${pluginKey}' command requires ${info.package}`);
  console.log(`   ${info.displayName}\n`);

  if (!autoInstall) {
    console.log(`Install it with: npm install ${info.package}`);
    return null;
  }

  // Check if we can prompt
  if (!process.stdin.isTTY) {
    console.log(`Install it with: npm install ${info.package}`);
    console.log(`(Auto-install disabled in non-interactive mode)`);
    return null;
  }

  const shouldInstall = await promptConfirm("Install it now?");

  if (!shouldInstall) {
    console.log(`\nYou can install it later with: npm install ${info.package}`);
    return null;
  }

  // Install the package
  try {
    installPackage(info.package);

    // Try to import again
    const module = await import(info.package);
    return module as T;
  } catch (error) {
    console.error(
      `\n❌ Failed to install ${info.package}:`,
      error instanceof Error ? error.message : error
    );
    console.log(`Try installing manually: npm install ${info.package}`);
    return null;
  }
}

/**
 * Check if running via npx
 */
export function isRunningViaNpx(): boolean {
  // npx sets this environment variable
  return Boolean(process.env.npm_execpath?.includes("npx"));
}

/**
 * Show a helpful tip for npx users after first successful run
 */
export function showNpxTip(): void {
  if (isRunningViaNpx()) {
    console.log("\n💡 Tip: For faster runs, install globally: npm i -g @teamflojo/floimg");
  }
}
