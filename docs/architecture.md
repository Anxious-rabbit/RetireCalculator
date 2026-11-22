# 当前实现与维护流程

先读 `AGENTS.md` 和 `workschedule`。本文描述当前程序；历史想法以 Git 和 `prototypes/pension/README.md` 为参考，不要将旧稿当成当前入口。

## 网页如何工作

1. `index.html` 加载 CSS 和本地 JS。正式入口显示空表单，所有输入只在浏览器内存中处理。
2. `js/validation.js` 解析出生年、联邦服务开始年、计划退休年、薪金、非养老金服务间隔，返回合法值或字段错误。
3. `js/pension-calculator.js` 使用 `js/config.js` 的常量判断 Group 1/2、服务年限、领取资格与减额，生成终身养老金和 bridge。金额服务最多计 35 年，离职后的领取方案固定服务年数。
4. `js/app.js` 调用计算器，将减额和未减额方案渲染到页面；重新输入会标记结果待刷新，重新计算后保留金额周期和 breakdown 展开状态。
5. `js/components.js` 提供月/年金额切换与共享 breakdown。`js/money-counter.js` 仅呈现金额动画，不能改变业务值。
6. `js/calculate-action.js` 负责计算按钮的视觉反馈和窄屏结果定位。`js/ambient-scene.js` 负责背景，支持减弱动画和静态回退。
7. `js/info-dialog.js` 管理原生声明弹窗、关闭与焦点恢复。`index.html` 保留官方链接、假设及隐私说明。

提前领取的减额只作用于终身部分；bridge 未减额，并按模型于 65 岁结束。提前开始领与等到未减额年龄再领是不同选择。公式依据和简化限制以代码、现行官方信息及测试共同确认。

## 文件职责

| 位置 | 用途 |
| --- | --- |
| `index.html`, `styles.css`, `js/` | 唯一正式应用 |
| `js/ui.js`, `js/preferences.js` | 历史兼容模块；当前入口不加载，不代表当前设置功能 |
| `tests/pension-calculator.test.js` | 计算、边界、输入校验回归 |
| `tests/presentation.test.js` | 历史渲染模块的解释与金额回归，不能替代当前 UI 浏览器测试 |
| `tests/browser/pension-design.cjs` | 当前预览布局、交互、输入与恢复 |
| `tests/browser/pension-dialog.cjs` | 声明弹窗、滚动与焦点 |
| `tests/browser/pension-release.cjs` | 当前静态入口、资源、计算、隐私与空表单 |
| `scripts/preview.py`, `scripts/preview-reload.js` | 无缓存开发预览与源码变更提示，不进入正式页面 |
| `prototypes/pension/` | 兼容跳转和设计历史，不维护另一份实现 |
| `reference/original/` | 2026-09 原始需求和网站 ZIP，只作历史依据 |
| `workschedule/` | 按时间排序的任务、问题、验证与接手记录 |
| `archive/` | 本地旧截图、旧检查脚本、迁移哈希和新测试证据，不加入 Git |

## 本地与正式入口

静态使用直接打开根目录 `index.html`，不需要安装依赖或联网计算。开发预览运行 `python scripts/preview.py`，默认地址 `http://127.0.0.1:63047/prototypes/pension/`。换端口时传 `--port`。

预览在响应中注入合成样例和 `setState` 测试工具；正式 HTML 没有这些注入。预览监听到源码变化后，未编辑页面可以重载，已编辑页面提示用户主动重载，避免清掉正在输入的内容。

当前 GitHub Pages 使用仓库根目录发布 `main`，无构建步骤。迁移本地文件夹不改变远程仓库或公开网址；仅本地维护不需要部署。

## 修改与交接闭环

读活动日志和 Git → 创建本任务日志并界定范围 → 检查目标文件当前内容与哈希 → 小步修改 → 按改动范围验证 → 再查并发差异 → 更新记录、完成度与下一步 → 按用户授权提交/发布。

代码注释只补充不明显的原因或边界。文档负责说明总体流程，不将每行实现再解释一遍。遇到未经记录的差异，先保留、识别来源，再接着推进。
