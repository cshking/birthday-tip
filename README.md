# 生日提醒微信推送（birthday-tip 增强版）

> ⚠️ **隐私警告（务必先读）**
> 本项目含你家人生日等隐私数据。部署前请二选一，否则任何人都可在 GitHub 上看到：
> - **方案 B（推荐）**：把仓库设为 **Private**，数据留在仓库内，仅设 1 个 Secret；
> - **方案 A**：保持 Public，但**不要提交真实 `birthdays.json` / `birthdays_backup.json` / `import.html` 中的真实数据**，改用 `BIRTHDAYS_JSON` 密钥（见下）。
>
> 无论哪种方案，Pages 都**只发布前端文件**（已通过 `deploy-pages.yml` 限定），生日数据不会被发布到公开网页。

---

## 目标

家人（程序里"我的好友"分组、且开启提醒的人）的生日，**提前 1 天自动推送到你的个人微信**——
手机微信、电脑微信（PC 端）都会收到 Server酱（方糖）的**微信服务通知**，不需要打开网页、不需要电脑开机。

- 推送渠道：Server酱 `sctapi.ftqq.com`（与你小程序里已集成的推送一致）
- 触发时间：每天 **北京时间 09:00**（GitHub Actions 自动运行）
- 农历换算：使用 `lunar_python` 专业库，**已修正原小程序写死映射表在 2月/12月各差 1 天的 bug**

---

## 项目结构

```
birthday-tip/
├── index.html                  # 前端小程序（原功能不变）
├── script.js / style.css       # 前端逻辑与样式
├── simple.html / import.html   # 辅助页面
├── birthdays.json              # 生日数据源（真实家人数据，见隐私警告）
├── scripts/
│   └── reminder.py             # 推送脚本（GitHub Actions / 本机通用）
├── .github/workflows/
│   ├── birthday-reminder.yml   # 每天定时检查并推送
│   └── deploy-pages.yml        # 仅把前端发布到 GitHub Pages
├── BIRTHDAYS_JSON_内容.txt     # 生日数据文本（方案 A 复制到密钥用）
└── README.md
```

---

## 方案 B（推荐，最省 Secret）

适合把仓库设为私有的情况，**只需 1 个密钥**。

1. 把本目录全部文件推送到 GitHub 仓库 `cshking/birthday-tip`（main 分支）。
2. 仓库 **Settings → General → Change visibility → Make private**（设为私有，保护家人生日）。
3. 配置 1 个密钥：**Settings → Secrets → Actions → New repository secret**
   - Name：`SERVERCHAN_TOKEN`
   - Value：你的 Server酱 SCTOKEN（即小程序"微信推送设置"里填的 `scToken`）
4. 把 Pages 发布方式改为 Actions：
   **Settings → Pages → Source 选择 "GitHub Actions"**。
   （此后前端由 `deploy-pages.yml` 自动发布，仅含前端文件，不含生日数据）
5. 启用并测试：进入 **Actions → 生日提醒推送 → Run workflow** 手动跑一次，看日志是否命中并推送。

---

## 方案 A（保持 Public 仓库）

适合不想改私有、且接受多设一个密钥的情况。

1. 推送代码到 GitHub（**先删除或替换** `birthdays.json`、`birthdays_backup.json`、`import.html` 中的真实数据，避免公开泄露）。
2. 配置 2 个密钥（Settings → Secrets → Actions）：
   - `BIRTHDAYS_JSON`：复制本仓库 `BIRTHDAYS_JSON_内容.txt` 的**全部内容**粘贴进去
   - `SERVERCHAN_TOKEN`：你的 Server酱 SCTOKEN
3. 启用并测试：Actions → 生日提醒推送 → Run workflow 手动跑一次。

> 方案 A 下 `birthday-reminder.yml` 会优先读取 `BIRTHDAYS_JSON` 密钥，不依赖仓库文件。

---

## 本地测试（不改 GitHub，先自测）

需要 Python 3.11+，并安装农历库：

```bash
pip install lunar_python
```

1. 编辑 `birthdays.json` 填入家人生日（已是真实数据）。
2. 把你的 Server酱 SCTOKEN 设为环境变量，并开启 dry_run（只打印、不真发）：

```bash
export SERVERCHAN_TOKEN=你的SCTOKEN
export DRY_RUN=1
python scripts/reminder.py
```

3. 确认输出里该提醒的人被 `[命中]`、分组被正确过滤，再把 `DRY_RUN` 去掉正式运行一次。

---

## 常见问题

- **如何改"提前天数"？**
  默认提前 1 天。可在 `birthday-reminder.yml` 把 `PUSH_DAYS: "1"` 改成 `"1,3,7"`（提前 1/3/7 天都推）。
- **如何加/改家人？**
  直接编辑 `birthdays.json`（方案 B），或更新 `BIRTHDAYS_JSON` 密钥（方案 A）。字段 `group` 决定分组、`reminder:true/false` 决定是否提醒、`isLunar:true` 表示农历。
- **分组只想提醒"我的好友"？**
  已默认 `PUSH_GROUPS: 我的好友`。要包含其他分组改成 `我的好友,同事` 即可。
- **微信公众号/PC 端都能收到吗？**
  能。Server酱推送到微信"服务通知"，手机和电脑微信同步显示，无需打开网页。
- **GitHub 定时任务会停吗？**
  Public 仓库若 **60 天无任何提交**，Actions 定时会被自动暂停，到 Actions 页点一下 Enable 恢复（你平时更新网站即保持活跃）。
- **农历为什么更准了？**
  原小程序把 2026/2027 农历写死在代码里，且 2月、12月各错 1 天；本脚本改用 `lunar_python` 实时换算，覆盖任意年份。
