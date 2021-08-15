import { connect } from './utils/connect'
import { getLocalDirList, linuxjoin } from './utils/common'
// import { resolve, join } from 'path'
import { statSync } from 'fs'
import { promisify } from 'util'

const uploadDir: (
  localUrl: string,
  remoteUrl: string,
  targetFolder: string
) => void = function (localUrl, remoteUrl, targetFolder) {
  console.time('总共耗时： ')
  localUrl = linuxjoin(localUrl)
  const fileObj = getLocalDirList(localUrl)
  connect().then(async (conn) => {
    const sftp = await promisify(conn.sftp).call(conn)
    const stat = promisify(sftp.stat).bind(sftp)
    const mkdir = promisify(sftp.mkdir).bind(sftp)
    const fastPut = promisify(sftp.fastPut).bind(sftp)
    const rename = promisify(sftp.rename).bind(sftp)

    const targetFolderPath = linuxjoin(remoteUrl, targetFolder)
    try {
      const targetFolderStats = await stat(targetFolderPath)
      const time = new Date(targetFolderStats.mtime * 1000)
        .toJSON()
        .slice(0, 10)
      console.log('文件夹出现重复，正在转移……')
      await rename(targetFolderPath, targetFolderPath + ' ' + time)
    } catch (error) {
      console.log('文件夹未创建,正在创建……')
    }

    await mkdir(targetFolderPath)
    for (const item of fileObj.directoryArr) {
      const remoteDir = linuxjoin(item).replace(localUrl, '')
      await mkdir(linuxjoin(targetFolderPath, remoteDir))
    }
    let folderSize = 0
    for (const item of fileObj.fileArr) {
      const remoteDir = linuxjoin(item).replace(localUrl, '')
      folderSize += statSync(item).size
      await fastPut(item, linuxjoin(targetFolderPath, remoteDir))
      console.log(
        `正在上传中……${
          ~~(((folderSize * 100) / fileObj.folderSize) * 100) / 100
        }%`
      )
    }
    console.log('文件上传成功！！！')
    console.timeEnd('总共耗时： ')
    conn.end()
  })
}
export default uploadDir
