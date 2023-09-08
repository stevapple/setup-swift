import * as core from '@actions/core'
import {SemVer, coerce as parseSemVer} from 'semver'
import {ToolchainVersion} from './base'
import {LatestToolchainVersion} from './latest'
import {SemanticToolchainVersion} from './semver'
import {ToolchainSnapshotName, DEVELOPMENT_SNAPSHOT} from './name'

declare module './base' {
  // eslint-disable-next-line no-shadow
  export namespace ToolchainVersion {
    function create(requested: string, dev: boolean): ToolchainVersion
  }
}

ToolchainVersion.create = (requested: string, dev = false) => {
  if (requested === 'latest' || requested === 'current') {
    core.debug(`Using latest ${dev ? 'development ' : ''}toolchain requirement`)
    return new LatestToolchainVersion(dev)
  }

  if (
    requested.includes(DEVELOPMENT_SNAPSHOT) ||
    requested.startsWith('swift-')
  ) {
    const version = new ToolchainSnapshotName(requested)
    core.debug(`Using as toolchain name "${version}"`)
    return version
  }

  let semver: SemVer
  try {
    semver = new SemVer(requested)
  } catch (error) {
    const ver = parseSemVer(requested)
    if (!ver) {
      throw error
    }
    semver = ver
  }
  core.debug(
    `Using latest ${requested}${dev ? '-dev' : ''} toolchain requirement`
  )
  return new SemanticToolchainVersion(requested, semver, dev)
}

export * from './base'
export * from './latest'
export * from './semver'
export * from './name'
