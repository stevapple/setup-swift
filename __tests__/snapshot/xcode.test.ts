import os from 'os'
import {posix} from 'path'
import {glob} from 'glob'
// @ts-ignore
import {__setos as setos} from 'getos'
import {ToolchainVersion} from '../../src/version'
import {Platform, XcodePlatform} from '../../src/platform'
import {XcodeToolchainSnapshot} from '../../src/snapshot'

jest.mock('getos')

describe('fetch macos tool data based on options', () => {
  const ver4 = ToolchainVersion.create('4', false)
  const ver5_0 = ToolchainVersion.create('5.0', false)
  const ver5_5_0 = ToolchainVersion.create('5.5.0', false)
  const ver5_5 = ToolchainVersion.create('5.5', false)
  const dev5_5 = ToolchainVersion.create('5.5', true)
  const latest = ToolchainVersion.create('latest', false)
  const latestDev = ToolchainVersion.create('latest', true)

  it('fetches macOS latest swift 4 tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(ver4)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe('swift-4.2.4-RELEASE-osx.pkg')
    expect(xTool.dir).toBe('swift-4.2.4-RELEASE')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-4.2.4-release')
    expect(xTool.xcode).toBe('10.1')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift 5.0 tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(ver5_0)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe('swift-5.0.3-RELEASE-osx.pkg')
    expect(xTool.dir).toBe('swift-5.0.3-RELEASE')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-5.0.3-release')
    expect(xTool.xcode).toBe('10.2.1')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift 5.5.0 tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(ver5_5_0)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe('swift-5.5-RELEASE-osx.pkg')
    expect(xTool.dir).toBe('swift-5.5-RELEASE')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-5.5-release')
    expect(xTool.xcode).toBe('13')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift 5.5 tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(ver5_5)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe('swift-5.5.3-RELEASE-osx.pkg')
    expect(xTool.dir).toBe('swift-5.5.3-RELEASE')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-5.5.3-release')
    expect(xTool.xcode).toBe('13.2')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift 5.5 tool including dev snapshot', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(dev5_5)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe('swift-5.5.3-RELEASE-osx.pkg')
    expect(xTool.dir).toBe('swift-5.5.3-RELEASE')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-5.5.3-release')
    expect(xTool.xcode).toBe('13.2')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(latest)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBeTruthy()
    expect(xTool.dir).toBeTruthy()
    expect(xTool.platform).toBeTruthy()
    expect(xTool.branch).toBeTruthy()
    expect(xTool.xcode).toBeTruthy()
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift tool including dev snapshot', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tool = await Platform.toolchain(latestDev)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBeTruthy()
    expect(xTool.dir).toBeTruthy()
    expect(xTool.platform).toBeTruthy()
    expect(xTool.branch).toBeTruthy()
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift beta version tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const branches = await glob(`swiftorg/_data/builds/swift-*`)

    function getVersions(folders: string[], suffix: string) {
      return folders.flatMap(folder => {
        const match = folder.match(`swift-([^-]*)-${suffix}`)
        if (match?.length) {
          return match[1]
        }
        return []
      })
    }

    const stableVersions = getVersions(branches, 'release')
    const betaVersions = getVersions(branches, 'branch').filter(
      v => !stableVersions.includes(v)
    )
    if (betaVersions?.length) {
      const betaVersion = betaVersions[betaVersions.length - 1].replaceAll(
        '_',
        '.'
      )
      const tool = await Platform.toolchain(
        ToolchainVersion.create(betaVersion, false)
      )
      expect(tool).toBeTruthy()
      const xTool = tool as XcodeToolchainSnapshot
      expect(xTool.preventCaching).toBe(false)
    }
  })

  it('fetches macOs named swift tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const name = 'swift-DEVELOPMENT-SNAPSHOT-2023-09-02-a'
    const version = ToolchainVersion.create(name, false)
    const tool = await Platform.toolchain(version)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe(
      'swift-DEVELOPMENT-SNAPSHOT-2023-09-02-a-osx.pkg'
    )
    expect(xTool.dir).toBe('swift-DEVELOPMENT-SNAPSHOT-2023-09-02-a')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('development')
    expect(xTool.preventCaching).toBe(false)
  })

  it('fetches macOS named versioned swift tool', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const name = 'swift-5.9-DEVELOPMENT-SNAPSHOT-2023-09-01-a'
    const version = ToolchainVersion.create(name, false)
    const tool = await Platform.toolchain(version)
    expect(tool).toBeTruthy()
    const xTool = tool as XcodeToolchainSnapshot
    expect(xTool.download).toBe(
      'swift-5.9-DEVELOPMENT-SNAPSHOT-2023-09-01-a-osx.pkg'
    )
    expect(xTool.dir).toBe('swift-5.9-DEVELOPMENT-SNAPSHOT-2023-09-01-a')
    expect(xTool.platform).toBe('xcode')
    expect(xTool.branch).toBe('swift-5.9-branch')
    expect(xTool.preventCaching).toBe(false)
  })

  it('detects earliest toolchains', async () => {
    const platform = new XcodePlatform('x64')
    const version = ToolchainVersion.create('latest', false)
    const tools = await platform.tools(version)

    const earliestTool = tools[tools.length - 1]
    expect(earliestTool.xcode).toBe('7.3')
    expect(earliestTool.dir).toBe('swift-2.2-RELEASE')
    expect(earliestTool.platform).toBe('xcode')
    expect(earliestTool.branch).toBe('swift-2.2-release')
    expect(earliestTool.download).toBe('swift-2.2-RELEASE-osx.pkg')
    expect(earliestTool.preventCaching).toBe(false)
  })

  it('fetches macOS latest swift 5.5 tools', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tools = await Platform.toolchains(ver5_5)
    expect(tools.length).toBe(4)
  })

  it('fetches macOS latest swift 5.5 tools including dev snapshot', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const tools = await Platform.toolchains(dev5_5)
    expect(tools.length).toBe(103)
  })

  it('fetches macOS custom swift tools', async () => {
    setos({os: 'darwin', dist: 'macOS', release: '21'})
    jest.spyOn(os, 'arch').mockReturnValue('x64')
    const swiftwasm = 'https://github.com/swiftwasm/swift/releases/download'
    const name = 'swift-wasm-5.10-SNAPSHOT-2024-03-30-a'
    const resource = `${name}-macos_arm64.pkg`
    const toolchainUrl = `${swiftwasm}/${name}/${resource}`
    const cVer = ToolchainVersion.create(toolchainUrl, false)
    const tools = await Platform.toolchains(cVer)
    expect(tools.length).toBe(1)
    const tool = tools[0]
    expect(tool.baseUrl?.href).toBe(posix.dirname(toolchainUrl))
    expect(tool.preventCaching).toBe(true)
    expect(tool.name).toBe('Swift Custom Snapshot')
    expect(tool.platform).toBe('xcode')
    expect(tool.download).toBe(resource)
    expect(tool.dir).toBe(name)
    expect(tool.branch).toBe('swiftwasm')
  })
})
