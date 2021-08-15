import { readdirSync, statSync } from 'fs'
import { join } from 'path'

interface Idir {
  directoryArr: string[]
  fileArr: string[]
  folderSize: number
}
/**
 * @description 获取本地所有文件与目录 2021-06-30
 * @param { string } url
 * @return { Object }
 */
export const getLocalDirList: (url: string) => Idir = function (url) {
  let directoryArr: string[] = []
  let fileArr: string[] = []
  let folderSize = 0
  const list = readdirSync(url)
  list.forEach((fileName) => {
    const stats = statSync(join(url, fileName))
    if (stats.isDirectory()) {
      directoryArr.push(join(url, fileName))
      const dirInfo = getLocalDirList(join(url, fileName))
      directoryArr.push(...dirInfo.directoryArr)
      fileArr.push(...dirInfo.fileArr)
      folderSize += dirInfo.folderSize
    } else if (stats.isFile()) {
      fileArr.push(join(url, fileName))
      folderSize += stats.size
    }
  })

  return {
    directoryArr,
    fileArr,
    folderSize
  }
}

export const linuxjoin = (...url: string[]): string => {
  return join(...url).replace(/\\/g, '/')
}
