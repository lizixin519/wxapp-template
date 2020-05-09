const inquirer = require('inquirer');
let versionConf = require('./version.config');
let fs = require('fs');
let path = require('path');
let jsonFormat = require('json-format');
let spawn = require('cross-spawn');
let projectPath = path.join(__dirname + '/dist')
/**
 * @param {version}
 * @Description: 获取versions升级后的版本值
 * @Author: Lzx
 * @Date: 2020-05-09 15:57:44
 * @LastEditors: lzx
 * @LastEditTime: Do not Edit
 */
function getVersionChoices(version) {
  // 描述数组
  const vArrsDesc = ['raise major: ', 'raise minor: ', 'raise patch: '];
  // 版本号(数组形态)
  let vArrs = version.split('.');
  // 版本号选项
  let choices = vArrsDesc.map((item, index, array) => {
      // 当配置文件内的版本号，位数不够时补0
      array.length > vArrs.length ? vArrs.push(0) : '';
      // 版本号拼接
      return vArrsDesc[index] + versionNext(vArrs, index)
  }).reverse();
  // 添加选项
  choices.unshift('no change');
  return choices;
}

function versionNext(array, idx) {
  let arr = [].concat(array); ++arr[idx];
  arr = arr.map((v, i) => i > idx ? 0 : v);
  return arr.join('.');
}

function getPublishQuestion({ version, versionDesc }) {
  return [{
      type: 'confirm',
      name: 'isRelease',
      message: '是否要发布正式版？',
      default: true
    },
    {
      type: 'list',
      name: 'version',
      message: `设置上传的版本号 (当前版本号: ${version}):`,
      default: 1,
      choices: getVersionChoices(version),
      filter(opts) {
        if (opts === 'no change') {
          return version;
        }
        return opts.split(': ')[1];
      },
      when(answer) {
        return !!answer.isRelease
      }
    },
    {
      type: 'input',
      name: 'versionDesc',
      message: `写一个简单的介绍来描述这个版本的改动过:`,
      default: versionDesc
    }
  ]
}
/**
 * @param {}
 * @Description: 询问发布相关问题
 * @Author: Lzx
 * @Date: 2020-05-09 16:04:02
 * @LastEditors: lzx
 * @LastEditTime: Do not Edit
 */
async function publishWxapp() {
  let answer = await inquirer.prompt(getPublishQuestion(versionConf));
  versionConf.version = answer.version || '0.0.0';
  versionConf.versionDesc = answer.versionDesc;
  // 将文字写入文件
  !!answer.isRelease && await writeVersionConfigFile(answer)
  // 将src内容发布到微信上
  await publishWxCli(answer)
}
/**
 * @param {answer}
 * @Description: 修改配置文件
 * @Author: Lzx
 * @Date: 2020-05-09 16:08:25
 * @LastEditors: lzx
 * @LastEditTime: Do not Edit
 */
function writeVersionConfigFile(answer) {
  return new Promise((resolve, reject) => {
    let versionConfigPath = path.join(__dirname + '/version.config.json');
    fs.writeFile(versionConfigPath, jsonFormat(versionConf), err => {
      if(err) {
        console.log(err)
        process.exit(1)
        reject(err)
      }
      resolve()
    })
  })
}

/**
 * @param {answer}
 * @Description: 通过开发者工具cli发布微信小程序体验版
 * @Author: Lzx
 * @Date: 2020-05-09 16:08:56
 * @LastEditors: lzx
 * @LastEditTime: Do not Edit
 */
async function publishWxCli(answer) {
  let cli = '/Applications/wechatwebdevtools.app/Contents/Resources/app.nw/bin/cli';
  let res = null;
  try {
    res = spawn.sync(cli, ['-u',  `${versionConf.version}@${projectPath}`,'--upload-desc', `${versionConf.versionDesc}`], { stdio: 'inherit' })
  } catch(e) {
    console.log(e.message)
  }
  if (res.status !== 0) process.exit(1);
  console.log(`上传体验版成功, 登录微信公众平台 https://mp.weixin.qq.com 获取体验版二维码`)
}


publishWxapp()