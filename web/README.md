# BrightStar AWS 课程网站（带登录码门）

学员在企业微信发「**登录码**」获取专属码 → 在本站输入登录 → 看课程。
登录校验走 brightstar 后端 `/web/login`（已部署，CORS 开放）。

## 本地预览
直接用浏览器打开 `index.html` 即可（纯静态 + fetch 调后端）。

## 部署到 Vercel（免费）
1. 打开 https://vercel.com → 用 GitHub 登录 → **Add New Project** → 选 `scgpp12/aws-demo01` 仓库。
2. **Root Directory** 选 `web`（重要：只发布这个目录）。
3. Framework 选 **Other**（纯静态，无需构建）。Deploy。
4. 得到一个 `*.vercel.app` 地址，打开即用。

> ⚠️ Vercel Hobby（免费）仅限非商业用途。公司培训站若担心条款，改用 **Cloudflare Pages**：
> Pages → Connect to Git → 选仓库 → 构建命令留空、输出目录填 `web` → 部署。两者代码完全一样。

## 之后可做
- 把真实 AWS 课程内容（原 `lesson1.html` 等）作为子页面放进 `web/`，并在每页开头加一句
  `if(!sessionStorage.getItem('bs_session')) location.href='/';` 做页面级拦截。
- 如需"按是否报名/老师身份"展示不同内容，可在 `/web/login` 返回里扩展字段。

## 安全说明
- 登录码由后端校验（不在前端硬编码名单），比纯前端口令安全。
- 登录态存 `sessionStorage`（关浏览器即失效）。如需更强，可在后端签发带过期的 token。
