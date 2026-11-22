# 养老金计算器：迁移、文件整理与协作交接

生成于 2026-11-22 12:22:06 America/Vancouver，由 Codex 生成。使用 PowerShell、Git、Node.js、Python、Playwright 和 Microsoft Edge；本文记录项目结构、运行流程、迁移核验、问题处理、测试结果及后续维护方式。

- 状态：completed
- 负责人：Codex / 当前迁移任务
- 开始时间：2026-11-22T12:22:06-08:00
- 完成时间：2026-11-22T12:34:22-08:00
- Git 基线：main / 39d6b53328ec206f03ed5ab1f3574d3b8758fead
- 原目录：C:\Users\qq104\Documents\Codex\calculator\RetireCalculator
- 新根目录：F:\project(main)\workProject\calculator(pension)
- 修改范围：新根的 AGENTS.md、README.md、PROJECT_MAP.json、docs/architecture.md、workschedule、reference/README.md、archive 说明与迁移证据、.gitignore、.gitattributes，以及 design.md 的维护入口提示；旧父目录与旧 RetireCalculator 的迁移入口。网站运行代码、测试脚本和养老金公式保持原样。
- 并发说明：开始时没有既有 workschedule 或活动记录；原仓库工作区干净。另一个 mileage 项目不在本次范围。

## 目标和边界

将养老金项目连同 Git 历史、现有 stash、原始需求和测试资料迁至新目录。后续所有操作从新根目录开始。旧目录最终只保留指向新位置的提示，不保留第二份可编辑代码。

## 流程和实现

1. 核对源和目标的真实绝对路径、Git 状态、符号链接和文件范围。
2. 复制源资料，逐文件核对 SHA-256；确认无丢失后才清除对应旧资料。
3. 保持 index.html、styles.css、js、scripts、tests、prototypes 的相对布局，将资料和历史产物分别放入 reference 与 archive。
4. 建立必读入口和每任务独立日志，记录负责范围、基线、问题和验证。
5. 在新路径运行 Node 与浏览器回归，保存实际测试结果。

当前文件流程是：`index.html` 加载本地模块 → `validation.js` 解析/校验输入 → `pension-calculator.js` 读取 `config.js` 计算固定服务后的领取方案 → `app.js` 生成卡片 → components、money-counter、calculate-action、info-dialog 分别处理周期、breakdown、金额呈现、计算反馈和声明焦点。`docs/architecture.md` 是完整职责表。开发预览只在响应中注入样例和监听器，正式页面没有测试状态。

## 问题与解决

- 2026-11-22 盘点：原 calculator 父目录混有独立 mileage 项目及其旧工作资料。明确限定养老金源目录、需求文件、.verification 和四张历史截图；不移动 mileage。
- 2026-11-22 盘点：旧 .verification/browser-check.cjs 写死 C: 路径，而且测试旧界面。保留为历史资料，不作为当前验证入口；当前使用 tests/browser 下的可配置脚本。
- 当前基线已经包含 Windows 预览 UTF-8 修复；不重复改动网页。
- 2026-11-22 测试：四个浏览器检查并行时，预览布局检查的首次卡片数量断言读到 0，而非样例的 2；其余静态、直接文件和弹窗检查通过。随后直接检查预览确认样例状态及两个结果存在，单独重跑完整布局检查通过。并行启动时序/资源竞争只是推断，根因未确认；初次失败保存为 `archive/verification/2026-11-22/browser-design-initial-failure.txt`，不据此改动网页或养老金公式。
- 2026-11-22 迁移：递归删除旧源目录被自动安全审查拒绝，命令未执行。改为在同盘将原件移到 `C:\Users\qq104\Documents\Codex\calculator\archive\2026-11-22-pension-originals`，保留恢复冷备份。新 F: 目录已具有逐文件核验后的全部资料；旧入口只放迁移提示。具体报告在 `archive/migration/2026-11-22/`。
- 2026-11-22 工具边界：Codex 的工作树附件接口只接受登记的 linked worktree，未能把主 checkout 当作该附件登记。文件迁移不依赖此接口；旧父目录和入口的 AGENTS.md 已指向新根，后续从新路径打开项目。未宣称 App 侧栏的旧项目地址已自动改写。
- 2026-11-22 最终检查：原始需求 Markdown 使用行末双空格作为硬换行，暂存后被默认空白检查报告。为保持历史资料原始字节，没有清理原件；仅在 `.gitattributes` 中对 `reference/original/*.md` 禁用文本换行转换与行末空白提示，其余文件维持正常检查。

## 历史回顾（本日整理，不是当日生成记录）

| 原始时间 | 进展/问题 | 方式与结果 | 证据 |
| --- | --- | --- | --- |
| 2026-09 初始实现 | Group 1/2、Annual Allowance、终身与 bridge、附近年份对比和输入校验 | 纯静态模块，计算与 DOM 分离；规则常量集中配置，Node 回归覆盖边界 | 原始需求、Git 历史和 `tests/pension-calculator.test.js` |
| 2026-09-24 的领取解释 | 早领减额与等到未减额年龄容易被当成同一选择 | 拆分终身与未减额 bridge，明确早领的终身减额不会在 65 岁自动取消 | `2e11c2e` 及现行方案卡片/声明说明；14 年、$70,000、Group 2 的示例见既有回归 |
| 2026-09-30 | 简洁界面、间隔输入和声明位置需要整合 | 共用周期与 breakdown；小数输入替代滚轮；原生 modal 保持页面几何与焦点；原型升级为根静态应用 | `6b9891a`、`c436d71`、`6526c1f`、`06ec6b7`、`prototypes/pension/README.md` |
| 2026-09-30 | Windows 开发预览产生 UTF-8 乱码 | `read_text(encoding="utf-8")`，浏览器重测通过 | `22502c5` |
| 2026-10-07 | Joined / Leave / Time away 含义太简略 | 更换完整标签，同步校验、无障碍名称及标签对齐 | `39d6b53` |
| 2026-11-22 | 多 Agent 接手及新路径组织 | 平铺迁移 Git 根，分离历史资料，新增协作协议、机器索引、模板与本日志 | 本记录与迁移 SHA-256 清单 |

## 验证结果

测试环境：Windows、Node.js v24.22.3、Python 3.12.10、Playwright 现有运行时、Microsoft Edge 158.0.4370.33 headless。命令从新 F: 根目录执行，Playwright 模块和 Edge 可执行文件通过环境变量提供，没有给应用添加依赖。

| 检查 | 实际命令/方法 | 结果 |
| --- | --- | --- |
| 初次迁移 | 逐文件 SHA-256 比对 | 192/192 一致：仓库及 Git 内部 163、历史检查 23、原始参考 2、父目录截图 4 |
| 冷备份与原件 | 归档前重验源哈希；归档后核对冷备份全部原件 | 192/192 一致；无删除，旧资料未丢失 |
| Git | `git fsck --full`、`git worktree list --porcelain`、`git stash list` | 完整性通过，工作根为新 F: 路径；历史 stash 保留，补充导出 patch 供追溯 |
| 程序未变 | `git diff --name-only -- index.html styles.css js scripts tests prototypes .nojekyll` | 无差异，迁移未改变网页程序或测试脚本 |
| Node 回归 | `node --test tests/*.test.js` | 31 项通过 |
| 开发预览 | `python scripts/preview.py --port 18744` | 新路径启动成功；UTF-8 标签正常，预览使用合成样例 |
| 布局与输入 | `node tests/browser/pension-design.cjs` | 单独重跑及原件归档后顺序运行均通过；12 组屏宽/字号、面板对齐、周期、breakdown、键盘、小数间隔校验、重置、CSS zoom 200%，无 JS 错误 |
| 声明弹窗 | `node tests/browser/pension-dialog.cjs` | 10 组屏宽/字号、几何稳定、内部滚动、关闭/焦点返回、减弱动画通过 |
| HTTP 静态入口 | `RELEASE_URL=http://127.0.0.1:18745/calculator(pension)/` 下运行 `pension-release.cjs` | 通过：空表单、计算、资源、五种屏宽、无资格状态、重置、无数据存储与第三方请求 |
| 直接打开文件 | `RELEASE_URL=file:///F:/project(main)/workProject/calculator(pension)/index.html` 下运行同一 release 检查 | 通过，带空格/括号风险的真实新路径可运行，不依赖旧源码位置 |
| 入口与文档 | 解析 `PROJECT_MAP.json` 并检查阅读入口/应用入口存在；`git diff --check` | 通过 |

实际输出和截图保存在 `archive/verification/2026-11-22/`，汇总为 `migration-summary.json`。首次并行失败另存，未被成功日志覆盖。预览布局的初始化断言在并行运行时有一次波动，原因仍未确认；若再次出现，下一位维护者先捕获失败网络请求、浏览器错误和加载状态，不直接修改公式或移除断言。

未验证：实体 iOS/Android、Safari/Firefox、读屏语音、原生浏览器菜单缩放、硬件动画性能、最新养老金法规。未重新发布或改动公开网站。现有测试通过只代表其明确覆盖的行为。

## 当前进度与下一步

本次边界内完成：源码与 Git 迁移、参考和历史产物归类、唯一维护路径、协作入口、架构地图、日志模板、历史问题追溯及新路径测试。旧入口只保留迁移提示，原件保留冷备份，mileage 项目未改动。本次整理保存为本地 Git 提交；提交标识以 Git 历史为准，不推送或发布。

下一次维护：

1. 从 `F:\project(main)\workProject\calculator(pension)` 打开，先读 `AGENTS.md`、此目录日志及实际 Git 状态。
2. 新建带当日日期的任务日志，登记自己的修改范围后再动手；旧 stash 不自动恢复。
3. 如只维护应用，忽略 archive；需恢复历史资料时按本次哈希清单核验，不覆盖现行实现。
4. 若要让其他机器获得协作规范，由用户授权后推送本地整理提交；archive 本身被忽略，需备份时另外复制，不能以 GitHub 存在为由删除本地证据。
5. App 仍可能显示原聊天的旧父目录；直接从新 F: 文件夹打开项目。旧 AGENTS 指引也会要求转入新位置，未伪称已自动改写侧栏配置。
