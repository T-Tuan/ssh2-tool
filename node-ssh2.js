/**
 * 使用ssh2实现的
 */

const path = require("path");
const fs = require("fs");
const Client = require("ssh2").Client;

path.linuxjoin = (...url) => {
  return path.join(...url).replace(/\\/g, "/");
};

/** ssh2 函数转promise */
function sshPromise(fn, self) {
  return function cb() {
    // let _resolve, _rejection;
    return new Promise((resolve, rejection) => {
      // _rejection = rejection;
      let arr = [...arguments];
      arr.push(function (err, data) {
        if (err) {
          rejection(err);
        } else {
          resolve(data);
        }
      });
      try {
        fn.apply(self, arr);
      } catch (error) {
        rejection(error);
      }
    });
  };
}

/** 连接ssh */
function connect(servers, fn) {
  const conn = new Client();
  conn
    .on("ready", () => {
      fn(conn);
    })
    .on("end", () => {
      console.log("---end");
    })
    .on("close", () => {
      console.log("---close");
    })
    .connect(servers);
}

/** 获取所有文件与目录 */
function getFileDir(url) {
  let directoryArr = [];
  let fileArr = [];
  let allSize = 0;
  const list = fs.readdirSync(url);
  list.forEach((fileName) => {
    const stats = fs.statSync(path.join(url, fileName));
    if (stats.isDirectory()) {
      directoryArr.push(path.join(url, fileName));
      const dirInfo = getFileDir(path.join(url, fileName));
      directoryArr.push(...dirInfo.directoryArr);
      fileArr.push(...dirInfo.fileArr);
      allSize += dirInfo.allSize;
    } else if (stats.isFile()) {
      fileArr.push(path.join(url, fileName));
      allSize += stats.size;
    }
  });

  return {
    directoryArr,
    fileArr,
    allSize,
  };
}

/** 获取文件树结构 */
function getTree(url) {
  let tree = [];
  let allSize = 0;
  const list = fs.readdirSync(url);
  list.forEach((fileName) => {
    const stats = fs.statSync(path.join(url, fileName));
    if (stats.isDirectory()) {
      tree.push({
        name: fileName,
        children: getTree(path.join(url, fileName)).tree,
      });
    } else if (stats.isFile()) {
      tree.push({
        name: fileName,
        size: stats.size,
      });
      allSize += stats.size;
    }
  });

  return {
    tree,
    allSize,
  };
}

const servers = { // 吴镇宏
  host: '121.5.42.203',
  port: '22',
  username: 'root',
  password: 'Qq.144515'
}

const localurl = `C:/caojiabin/Project/ehr-tenant-websites/dist`; // 当前地址的
const serverUrl = "/data2/solution/web"; // 远程目录
const proName = "ehrtenant"; // 远程包名

connect(servers, (conn) => {
  console.log('连接成功', conn);
  conn.end()
})

function uploadDir(localurl, remoteurl, mren) {
  console.time("总共耗时： ");
  localurl = path.linuxjoin(localurl);
  const fileObj = getFileDir(localurl);
  const time = ` ${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
  connect(servers, (conn) => {
    conn.sftp(async (err, sftp) => {
      if (err) throw err;
      const mkdir = sshPromise(sftp.mkdir, sftp);
      const fastPut = sshPromise(sftp.fastPut, sftp);
      const rename = sshPromise(sftp.rename, sftp);
      try {
        console.log("目录出现重复，正在转移目录");
        await rename(
          path.linuxjoin(remoteurl, mren),
          path.linuxjoin(remoteurl, mren) + time
        );
      } catch (error) {
        console.log("目录未创建,正在创建目录");
      }
      await mkdir(path.linuxjoin(remoteurl, mren));
      for (const item of fileObj.directoryArr) {
        const remoteDir = path.linuxjoin(item).replace(localurl, "");
        await mkdir(path.linuxjoin(remoteurl, mren, remoteDir));
      }
      let nowSize = 0;
      for (const item of fileObj.fileArr) {
        const remoteDir = path.linuxjoin(item).replace(localurl, "");
        nowSize += fs.statSync(item).size;
        await fastPut(item, path.linuxjoin(remoteurl, mren, remoteDir));
        console.log(
          `正在上传中……${~~(((nowSize * 100) / fileObj.allSize) * 100) / 100}%`
        );
      }
      console.log("文件上传成功！！！");
      console.timeEnd("总共耗时： ");
      conn.end();
    });
  });
}

// uploadDir(localurl, serverUrl, proName)