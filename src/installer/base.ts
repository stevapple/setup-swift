import * as os from 'os'
import * as path from 'path'
import * as core from '@actions/core'
import {getExecOutput} from '@actions/exec'
import * as cache from '@actions/cache'
import * as toolCache from '@actions/tool-cache'
import {coerce as parseSemVer} from 'semver'
import {SWIFT_BRANCH_REGEX} from '../version'
import {ToolchainSnapshot} from '../snapshot'

export type SnapshotForInstaller<Installer> =
  Installer extends ToolchainInstaller<infer Snapshot extends ToolchainSnapshot>
    ? Snapshot
    : never

export abstract class ToolchainInstaller<Snapshot extends ToolchainSnapshot> {
  constructor(readonly data: Snapshot) {}

  protected get version() {
    const match = SWIFT_BRANCH_REGEX.exec(this.data.branch)
    return match && match.length > 1 ? parseSemVer(match[1]) : undefined
  }

  protected get baseUrl() {
    return `https://download.swift.org/${this.data.branch}/${this.data.platform}/${this.data.dir}`
  }

  protected swiftVersionCommand() {
    return {
      bin: 'swift',
      args: ['--version']
    }
  }

  async install(arch?: string) {
    const key = `${this.data.dir}-${this.data.platform}`
    const version = this.version?.raw
    let tool: string | undefined
    if (version) {
      tool = toolCache.find(key, version, arch).trim()
      core.debug(`Found tool at "${tool}" in tool cache`)
    }
    if (!tool?.length) {
      const tmpDir = process.env.RUNNER_TEMP || os.tmpdir()
      const restore = path.join(tmpDir, 'setup-swift', key)
      if (await cache.restoreCache([restore], key)) {
        core.debug(`Restored snapshot at "${restore}" from key "${key}"`)
        tool = restore
      } else {
        const resource = await this.download()
        const installation = await this.unpack(resource)
        core.debug(`Downloaded and installed snapshot at "${installation}"`)
        tool = installation
      }
    }
    if (version) {
      tool = await toolCache.cacheDir(tool, key, version, arch)
      core.debug(`Added to tool cache at "${tool}"`)
    }
    if (core.getBooleanInput('cache-snapshot')) {
      await cache.saveCache([tool], key)
      core.debug(`Saved to cache with key "${key}"`)
    }
    await this.add(tool)
  }

  protected async download() {
    const url = `${this.baseUrl}/${this.data.download}`
    core.debug(`Downloading snapshot from "${url}"`)
    return await toolCache.downloadTool(url)
  }

  protected abstract unpack(resource: string): Promise<string>
  protected abstract add(installation: string): Promise<void>

  async installedSwiftVersion(command?: {bin: string; args: string[]}) {
    const {bin, args} = command ?? this.swiftVersionCommand()

    core.debug(`Getting swift version with command "${bin} ${args}"`)
    const {stdout} = await getExecOutput(bin, args)
    const match = /Swift\s+version\s+(?<version>\S+)/.exec(stdout)
    if (!match?.groups || !match.groups.version) {
      throw new Error('Error getting swift version')
    }
    return match.groups.version
  }
}
