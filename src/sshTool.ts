import { Client, ConnectConfig, SFTPWrapper } from 'ssh2'
import { promisify } from 'util'

interface toolKitOption {
  sftp: SFTPWrapper
}

export class SSHTOOL {
  private serversInfo: ConnectConfig
  public service!: Client
  constructor(serversInfo: ConnectConfig) {
    this.serversInfo = serversInfo
  }
  public async connect() {
    const conn = new Client()
    return new Promise((resole, reject) => {
      conn
        .on('ready', () => {
          console.info('连接成功')
          this.service = conn
          resole(conn)
        })
        .on('end', () => {
          console.log('---end')
        })
        .on('close', () => {
          console.log('---close')
        })
        .connect(this.serversInfo)
    })
  }

  public async toolKit<T extends keyof toolKitOption>(
    attr: T
  ): Promise<toolKitOption[T]> {
    return await promisify(this.service[attr]).call(this.service)
  }
}
