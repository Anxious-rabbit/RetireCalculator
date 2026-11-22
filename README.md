# Federal Public Service Pension Estimator

当前项目根目录：`F:\project(main)\workProject\calculator(pension)`。

维护前先读 [AGENTS.md](AGENTS.md) 和 [workschedule](workschedule/README.md)，再检查最新与未完成任务。程序入口是根目录 `index.html`。此项目是浏览器本地运行的静态养老金估算器；无账号、后台、构建步骤，也不上传或保存输入与结果。

## 快速理解目录

| 阅读顺序/位置 | 作用 |
| --- | --- |
| `AGENTS.md` | 所有人、AI、Agent 的操作与协作规则 |
| `workschedule/` | 日期任务日志、活动范围、问题与交接；每次独立修改先建新文件 |
| `PROJECT_MAP.json` | 供程序快速识别入口、目录和测试的机器索引 |
| `docs/architecture.md` | 输入到结果的流程、模块职责及维护闭环 |
| `index.html`, `styles.css`, `js/` | 当前唯一正式应用 |
| `scripts/` | 本地预览工具 |
| `tests/` | 计算/历史渲染回归及当前页面浏览器检查 |
| `reference/original/` | 原始需求与 ZIP，不能覆盖当前代码 |
| `prototypes/pension/` | 旧入口跳转和设计历史，不是第二份应用 |
| `archive/` | 只保留本地的历史截图、检查产物和迁移核验，不加入 Git |

文件系统显示顺序因工具而异；以此表和 `PROJECT_MAP.json` 为统一阅读入口，不为排序而重命名运行资源。

## 运行网页

不需要依赖安装，直接打开 `index.html` 即可计算。官方参考链接需要网络。

开发预览：

```powershell
Set-Location -LiteralPath 'F:\project(main)\workProject\calculator(pension)'
python scripts/preview.py
```

默认地址是 `http://127.0.0.1:63047/prototypes/pension/`；也可用 `--port 18744`。预览注入合成样例与变更提示，正式静态页面从空表单开始。细节见 [当前架构](docs/architecture.md) 和 [预览历史](prototypes/pension/README.md)。

## 本地检查

```powershell
node --test tests/*.test.js
```

31 项 Node 测试覆盖养老金规则、边界、输入校验和历史渲染。当前页面还要运行浏览器检查，不能只依赖旧渲染模块测试。

使用已有 Playwright 环境，将 `NODE_PATH` 指向其 `node_modules`，必要时设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE`；本项目不绑定某个 Agent 的安装路径。预览服务器启动后：

```powershell
$env:PREVIEW_URL = 'http://127.0.0.1:63047/prototypes/pension/'
node tests/browser/pension-design.cjs
node tests/browser/pension-dialog.cjs
```

测试正式静态入口时，用独立静态服务器，而不是注入样例的开发预览：

```powershell
python -m http.server 63048 --bind 127.0.0.1
```

另一个终端运行：

```powershell
$env:RELEASE_URL = 'http://127.0.0.1:63048/'
node tests/browser/pension-release.cjs
```

`RELEASE_URL` 也支持根目录 `index.html` 的 `file:///` URL 和正式网址。`EVIDENCE_DIR` 可设为本地 `archive/verification/<任务日期>/`；用例覆盖空表单、计算、月/年切换、breakdown、间隔小数、待刷新状态、弹窗与焦点、窄屏、重置、资源请求和输入不持久化。结果与未验证设备须写入任务日志。

## 计算与发布边界

当前年薪作为 highest-five 平均薪金近似；整年输入近似年龄和服务年数，非养老金间隔先扣除，再对金额服务应用 35 年上限。固定服务后的不同领取年龄是备选方案，不是连续自动升级的待遇。养老金公式与常量分别位于 `js/pension-calculator.js`、`js/config.js`。

AMPE 使用已披露的 2026 CPP YMPE $74,600 近似值。它不是个人的正式 AMPE；不计未来薪金、YMPE、indexing、CPP/QPP/OAS 或税。变更规则时同步官方依据、说明、审阅日期和测试；迁移本身不更新养老金规则。

源码仓库：[Anxious-rabbit/RetireCalculator](https://github.com/Anxious-rabbit/RetireCalculator)。公开网站：[GitHub Pages](https://anxious-rabbit.github.io/RetireCalculator/)。发布仍使用 `main` 根目录及 `.nojekyll`，无构建步骤。只有用户要求才推送或发布；本地路径迁移不要求改公开网址。

`js/ui.js` 和 `js/preferences.js` 为历史兼容模块，当前页面不加载。不要据此推断现行页面已经实现其中的显示设置。旧 stash 保留在 Git 中，使用前必须核对与当前代码的差异。

## 最近维护

- 2026-11-22：迁移到当前 F: 根目录，整理参考资料与历史证据，建立协作规则、架构入口和日期日志。详细过程及验证见 `workschedule/2026-11-22_122206_codex_migration-handoff.md`。
- 2026-10-07：澄清字段名称，并保持长标签与输入框对齐。
- 2026-09-30：整合正式静态界面、声明弹窗、小数间隔输入和本地预览；修复 Windows UTF-8 读取。

更早实现与决策见 Git 历史及原始资料。今后的每次修改均以新的 `workschedule` 任务记录为准。
