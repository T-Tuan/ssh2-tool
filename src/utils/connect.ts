import { Client, SFTPWrapper } from 'ssh2'
import servers from '../config'

// type Iconnect = () => Promise<Client>

/** 连接ssh */
export const connect = function (): Promise<Client> {
  const conn = new Client()
  return new Promise((resole, reject) => {
    conn
      .on('ready', () => {
        console.info('连接成功')
        resole(conn)
        // fn(conn)
      })
      .on('end', () => {
        console.log('---end')
      })
      .on('close', () => {
        console.log('---close')
      })
      .connect(servers)
  })
}
