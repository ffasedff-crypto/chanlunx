# ChanlunX 缠论主图 · 纯静态托管包（GitHub Pages）

本目录是**无需后端**的纯静态版本：浏览器直接连腾讯/雪球/东方财富行情接口（CORS 开放），
手机、电脑打开即用，可托管到 GitHub Pages / 任意静态空间，链接永久不过期。

## 目录结构
```
index.html      ← 主页面（已设为「静态模式」：跳过本地服务器探测，首屏直接浏览器直连）
chanlun.js      ← 缠论计算（笔/段/中枢）+ 吸拉派落/财富阶梯/缺口
sw.js           ← Service Worker（壳缓存：离线可开；跨域行情永远走网络、不缓存，保证 K 线实时）
manifest.json   ← PWA 清单（"添加到主屏幕"）
icon.svg        ← 图标
.nojekyll       ← 禁用 GitHub Pages 的 Jekyll 处理
```

## 推送到 GitHub（在你自己电脑/手机热点网络下执行，公司网络直连 github.com 会被拦）
假设你已登录 GitHub，仓库名 `ChanlunX`：

```bash
cd ChanlunX/ghpages
git init
git add -A
git commit -m "ChanlunX 缠论主图 纯静态包"
git branch -M main
git remote add origin https://github.com/<你的用户名>/ChanlunX.git
git push -u origin main
```

## 开启 GitHub Pages
1. 打开仓库 **Settings → Pages**
2. Source 选 **Deploy from a branch**
3. Branch 选 **main**，目录选 **/ (root)**（本目录直接放仓库根）或 **/ghpages**（若整仓库只放此子目录）
4. Save，等待 1~2 分钟
5. 访问 `https://<你的用户名>.github.io/ChanlunX/`

> 若整仓库只放 ghpages 内容，把上面文件直接放仓库根最省事，URL 就是 `https://<用户名>.github.io/ChanlunX/`。

## 手机使用
- 浏览器打开上面的 URL → 输入代码（如 `sh603799` / `sz000001` / `IF2509`）→ 选周期（日/周/月/60 分钟等）→ 加载。
- 想当 App 用：iPhone 用 Safari「分享 → 添加到主屏幕」；安卓用 Chrome 菜单「安装应用 / 添加到主屏幕」。
- 60 分钟线主力数据源是雪球（免登录、CORS 放行），失败自动回退东方财富、再回退新浪代理。
- 若某网络拦截了数据域名（公司网常见），换手机流量或家里 WiFi 即可。

## 关于 WorkBuddy 临时链接 vs 本静态包
- WorkBuddy 发布的链接由平台管控，可能过期/迁移域名（已遇到过一次）。
- 本静态包链接由 GitHub 永久托管，不受平台影响。日常看盘用这个最稳。
