import { connect } from './utils/connect'
import { linuxjoin } from './utils/common'
import { promisify } from 'util'
interface Idir {
  directoryArr: string[]
  fileArr: string[]
  folderSize: number
}
const removeDir: (remoteUrl: string) => void = function (remoteUrl) {
  console.time('删除文件夹总共耗时：')
  connect().then(async (conn) => {
    const sftp = await promisify(conn.sftp).call(conn)
    const stat = promisify(sftp.stat).bind(sftp)
    const rmdir = promisify(sftp.rmdir).bind(sftp)
    const unlink = promisify(sftp.unlink).bind(sftp)
    const readdir = promisify(sftp.readdir).bind(sftp)

    const getRemoteDirListAsync: (url: string) => Promise<Idir> =
      async function getRemoteDirList(url) {
        let directoryArr: string[] = []
        let fileArr: string[] = []
        let folderSize = 0

        const rootDirList = await readdir(url)
        for (const { filename, attrs } of rootDirList) {
          const stats = await stat(linuxjoin(url, filename))
          const fileNamePath = linuxjoin(url, filename)
          if (stats.isDirectory()) {
            directoryArr.push(fileNamePath)
            const dirInfo = await getRemoteDirListAsync(fileNamePath)
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
    const folderObj = await getRemoteDirListAsync(remoteUrl)
    for (const filePath of folderObj.fileArr) {
      await unlink(filePath)
    }
    folderObj.directoryArr.reverse()
    for (const filePath of folderObj.directoryArr) {
      await rmdir(filePath)
    }
    await rmdir(remoteUrl)
    console.timeEnd('删除文件夹总共耗时：')
    conn.end()
  })
}
export default removeDir
