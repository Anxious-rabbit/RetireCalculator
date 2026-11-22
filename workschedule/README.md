# 工作记录入口

修改前先读最新任务和所有未完成任务，再核对 Git 状态及实际文件。每次独立修改先建新日志，不覆盖别人的记录；跨 Agent 的共同约定见根目录 `AGENTS.md`。

## 查看顺序

```powershell
Get-ChildItem -LiteralPath workschedule -Filter '20*.md' | Sort-Object Name -Descending
Select-String -Path workschedule/20*.md -Pattern '状态：in_progress|状态：blocked'
git status --short --branch
git diff --stat
git diff --cached --stat
```

读取最新记录及所有活动记录的正文，不能只看文件名或状态行。比较任务责任范围、Git 基线和文件实际内容；没有日志也可能有其他工具的未登记修改。

## 新建记录

1. 使用 `TEMPLATE.md`；文件名为 `YYYY-MM-DD_HHmmss_agent_topic.md`，日期时间按 `America/Vancouver`。同秒重名加短随机后缀，绝不覆盖。
2. 文件顶部先简短说明生成时间、实际 AI/Agent/操作者、实际工具和记录范围，再写任务正文。
3. 开始状态为 `in_progress`，明确范围、负责人和基线。记录关键文件修改前的哈希；每次重要写入前复查是否有人改过。
4. 工作中持续补问题、解决步骤和真实测试结果。完成时更新自己记录为 `completed`，并写下一步；阻塞写 `blocked` 和具体条件。

这是任务级日志，不要求每条读文件命令另开一份。一次任务中新增实质范围时，先更新责任范围并检查冲突；新的独立更改另建日期日志。

## 状态与历史

- `in_progress`：仍在执行，或中断后尚未交接。
- `blocked`：被具体条件阻塞，保留责任与待解决条件。
- `completed`：本任务边界内工作完成，列明验证及剩余限制。

只维护自己的状态。历史回顾写在新记录中，标注原始日期和证据；Git、当前文件和实际测试优先于文字推测。本目录每份记录应能让不了解本聊天的维护者接手。
