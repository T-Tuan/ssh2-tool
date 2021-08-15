// import { Client, ConnectConfig, SFTPWrapper } from 'ssh2'
// import servers from './config/index.local'
// import uploadDir from './uploadDir'
// import removeDir from './removeDir'
// import path from 'path'
// interface ISSHTOOL {
//   connect(): Promise<Client>
// }
// import { statSync } from 'fs'
// import { getLocalDirList, linuxjoin } from './utils/common'
// import { promisify } from 'util'
// import { Stats, FileEntry } from 'ssh2-streams'
// interface Idir {
//   directoryArr: string[]
//   fileArr: string[]
//   folderSize: number
// }

// interface toolKitOption {
//   sftp: SFTPWrapper
//   // exec: string
//   // shell: SFTPWrapper
//   // forwardIn: SFTPWrapper
//   // unforwardIn: SFTPWrapper
//   // forwardOut: SFTPWrapper
//   // subsys: SFTPWrapper
//   // openssh_forwardOutStreamLocal: SFTPWrapper
// }

// type toolKitOption = 'sftp'

// export class SSHTOOL {
//   private serversInfo: ConnectConfig
//   public service!: Client
//   constructor(serversInfo: ConnectConfig) {
//     this.serversInfo = serversInfo
//   }
//   public async connect() {
//     const conn = new Client()
//     return new Promise((resole, reject) => {
//       conn
//         .on('ready', () => {
//           console.info('连接成功')
//           this.service = conn
//           resole(conn)
//         })
//         .on('end', () => {
//           console.log('---end')
//         })
//         .on('close', () => {
//           console.log('---close')
//         })
//         .connect(this.serversInfo)
//     })
//   }

//   public async toolKit<T extends keyof toolKitOption>(
//     attr: T
//   ): Promise<toolKitOption[T]> {
//     return await promisify(this.service[attr]).call(this.service)
//   }
// }

/* class SFTP extends SSHTOOL {
  sftp!: SFTPWrapper
  private stat!: (arg1: string) => Promise<Stats>
  private readdir!: (arg1: string | Buffer) => Promise<FileEntry[]>
  private mkdir!: (arg1: string) => Promise<void>
  private rmdir!: (arg1: string) => Promise<void>
  private unlink!: (arg1: string) => Promise<void>
  private fastPut!: (arg1: string, arg2: string) => Promise<void>
  private rename!: (arg1: string, arg2: string) => Promise<void>
  constructor(serversInfo: ConnectConfig) {
    super(serversInfo)
  }
  async init() {
    await this.connect()
    this.sftp = await this.toolKit('sftp')

    const sftp = this.sftp
    this.stat = promisify(sftp.stat).bind(sftp)
    this.readdir = promisify(sftp.readdir).bind(sftp)
    this.mkdir = promisify(sftp.mkdir).bind(sftp)
    this.rmdir = promisify(sftp.rmdir).bind(sftp)
    this.unlink = promisify(sftp.unlink).bind(sftp)
    this.fastPut = promisify(sftp.fastPut).bind(sftp)
    this.rename = promisify(sftp.rename).bind(sftp)
  }

  async uploadDir(localUrl: string, remoteUrl: string, targetFolder: string) {
    console.time('总共耗时： ')
    localUrl = linuxjoin(localUrl)
    const fileObj = getLocalDirList(localUrl)
    const targetFolderPath = linuxjoin(remoteUrl, targetFolder)
    try {
      const targetFolderStats = await this.stat(targetFolderPath)
      const time = new Date(targetFolderStats.mtime * 1000)
        .toJSON()
        .slice(0, 10)
      console.log('文件夹出现重复，正在转移……')
      await this.rename(targetFolderPath, targetFolderPath + ' ' + time)
    } catch (error) {
      console.log('文件夹未创建,正在创建……')
    }

    await this.mkdir(targetFolderPath)
    for (const item of fileObj.directoryArr) {
      const remoteDir = linuxjoin(item).replace(localUrl, '')
      await this.mkdir(linuxjoin(targetFolderPath, remoteDir))
    }
    let folderSize = 0
    for (const item of fileObj.fileArr) {
      const remoteDir = linuxjoin(item).replace(localUrl, '')
      folderSize += statSync(item).size
      await this.fastPut(item, linuxjoin(targetFolderPath, remoteDir))
      console.log(
        `正在上传中……${
          ~~(((folderSize * 100) / fileObj.folderSize) * 100) / 100
        }%`
      )
    }
    console.log('文件上传成功')
    console.timeEnd('总共耗时： ')
  }

  async removeDir(remoteUrl: string) {
    console.time('删除文件夹总共耗时：')
    const folderObj = await this.getRemoteDirListAsync(remoteUrl)
    for (const filePath of folderObj.fileArr) {
      await this.unlink(filePath)
    }
    folderObj.directoryArr.reverse()
    for (const filePath of folderObj.directoryArr) {
      await this.rmdir(filePath)
    }
    await this.rmdir(remoteUrl)
    console.timeEnd('删除文件夹总共耗时：')
  }

  async getRemoteDirListAsync(url: string): Promise<Idir> {
    let directoryArr: string[] = []
    let fileArr: string[] = []
    let folderSize = 0

    const rootDirList = await this.readdir(url)
    for (const { filename, attrs } of rootDirList) {
      const stats = await this.stat(linuxjoin(url, filename))
      const fileNamePath = linuxjoin(url, filename)
      if (stats.isDirectory()) {
        directoryArr.push(fileNamePath)
        const dirInfo = await this.getRemoteDirListAsync(fileNamePath)
        directoryArr.push(...dirInfo.directoryArr)
        fileArr.push(...dirInfo.fileArr)
        folderSize += dirInfo.folderSize
      } else if (stats.isFile()) {
        fileArr.push(fileNamePath)
        folderSize += attrs.size
      }
    }

    return {
      directoryArr,
      fileArr,
      folderSize
    }
  }
} */

/* ;(async () => {
  const tool = new SSHTOOL(servers)
  await tool.connect()
  await tool.toolKit('sftp')
})() */
export * from './sftp'
