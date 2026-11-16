#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const val = n => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : null; };

if (flag('--help') || flag('-h')) {
  console.log('swiss-countdown — 黑白瑞士风格倒计时工具 / 交互桌面壁纸（单文件零依赖）');
  console.log('');
  console.log('用法: npx github:stowisdom/swiss-countdown [--dir 目录] [--open] [--force]');
  console.log('  --dir <目录>  把 todo.html 与 LivelyInfo.json 释放到该目录（默认当前目录）');
  console.log('  --open        释放后用默认浏览器打开 todo.html');
  console.log('  --force       目标已有不同内容的同名文件时允许覆盖');
  process.exit(0);
}

const dir = path.resolve(val('--dir') || process.cwd());
const files = ['todo.html', 'LivelyInfo.json'];
fs.mkdirSync(dir, { recursive: true });
let copied = 0, skipped = 0;
for (const f of files) {
  const buf = fs.readFileSync(path.join(__dirname, f));
  const dst = path.join(dir, f);
  if (fs.existsSync(dst)) {
    if (fs.readFileSync(dst).equals(buf)) { skipped++; continue; }
    if (!flag('--force')) {
      console.error('目标已存在不同内容的 ' + f + '：加 --force 覆盖，或用 --dir 指定别的目录。');
      process.exit(1);
    }
  }
  fs.writeFileSync(dst, buf);
  copied++;
}
console.log('已释放 ' + copied + ' 个文件到 ' + dir + (skipped ? '（' + skipped + ' 个已存在且相同，跳过）' : ''));
console.log('');
console.log('下一步：');
console.log('  网页 / 手机：双击 todo.html，或把该目录放到任意静态托管后用手机访问。');
console.log('  桌面壁纸：安装 Lively Wallpaper，把该目录拖入 Lively 即可（LivelyInfo.json 已含项目描述）。');
console.log('  数据只存在本机浏览器 localStorage，不联网、不上传。');

if (flag('--open')) {
  const target = path.join(dir, 'todo.html');
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const argv = process.platform === 'win32' ? ['/c', 'start', '', target] : [target];
  cp.spawn(cmd, argv, { detached: true, stdio: 'ignore' }).unref();
}