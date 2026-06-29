# Claude Code 101: 开发者入门

**课程概述**

Claude Code 101 专为开发者设计，教你如何在日常开发工作流中有效使用 Claude Code。

## 第一章：Claude Code 简介

**Claude Code** 是 Anthropic 的编程助手，可以：
- 理解和编辑代码库
- 执行命令行任务
- 调试和修复错误
- 生成测试和文档

### Agentic Loop（代理循环）
Claude Code 的核心工作模式：
1. 理解任务
2. 探索代码库
3. 提出计划
4. 执行修改
5. 验证结果
6. 迭代改进

## 第二章：上下文窗口管理

**上下文窗口**是Claude的"工作内存"，容量为200K tokens（约15万字）。

### 如何有效利用：
1. **精准提供相关文件**：不要一次性给所有代码
2. **使用 @ 引用**：`@filename` 引用特定文件
3. **摘要长内容**：先让Claude总结，再深入细节

## 第三章：工具使用

Claude Code 可以调用以下工具：
- **文件操作**：read, write, edit
- **Shell命令**：bash, npm, git
- **网络搜索**：查找文档
- **代码执行**：运行测试

### 权限管理
Claude Code 会请求权限执行命令，你可以：
- 允许一次
- 允许此类命令
- 拒绝

## 第四章：Explore → Plan → Code → Commit 工作流

**最佳实践工作流**：

### 1. Explore（探索）
```
探索这个代码库，理解项目结构
```

### 2. Plan（计划）
```
我想实现用户认证功能，请制定实施计划
```

### 3. Code（编码）
```
按计划实施，我会审查每一步
```

### 4. Commit（提交）
```
代码完成，请生成commit message并提交
```

## 第五章：CLAUDE.md

**CLAUDE.md** 是项目配置文件，类似 `.cursorrules` 或 `.github/copilot-instructions.md`。

### 内容建议：
```markdown
# 项目概述
这是一个React + TypeScript项目...

# 代码规范
- 使用2空格缩进
- 优先使用函数式组件
- 所有API调用使用axios

# 常用命令
- dev: npm run dev
- test: npm test
- build: npm run build
```

## 第六章：Subagents（子代理）

**Subagents** 让Claude Code可以委派特定任务给专门的代理。

### 使用场景：
- **代码审查子代理**：专注审查代码质量
- **测试子代理**：生成和运行测试
- **文档子代理**：生成API文档

## 第七章：Skills（技能）

**Skills** 是Claude Code的可复用指令集。

### 创建Skill：
在 `.claude/skills/` 目录下创建 `.md` 文件：
```markdown
# Code Review Skill

当你审查代码时：
1. 检查代码风格
2. 查找潜在bug
3. 评估性能
4. 提供改进建议
```

## 第八章：MCP Servers（模型上下文协议）

**MCP** 让Claude Code连接外部工具和数据源。

### 常用MCP服务器：
- **文件系统**：读写本地文件
- **数据库**：查询PostgreSQL、MongoDB
- **API**：调用外部API
- **Git**：版本控制操作

## 第九章：Hooks（钩子）

**Hooks** 让你在Claude Code执行特定操作前后运行自定义脚本。

### 示例：
```json
{
  "hooks": {
    "pre-commit": "npm test",
    "post-edit": "prettier --write"
  }
}
```

## 第九章：实际案例

### 案例1：修复Bug
```
用户报告登录页面报错。帮我定位并修复这个bug。
```

### 案例2：添加功能
```
添加用户注册功能，包含邮箱验证。
```

### 案例3：重构代码
```
这个文件太长了，帮我拆分成多个模块。
```

### 案例4：生成测试
```
为UserService.js生成单元测试，覆盖所有主要函数。
```

## 第十章：高级技巧

### 技巧1：增量开发
不要一次性给大任务，拆分为小步骤。

### 技巧2：代码审查
定期让Claude审查代码质量。

### 技巧3：文档同步
每次修改代码，让Claude更新文档。

### 技巧4：测试驱动
先写测试，再实现功能。

## 第十一章：团队协作

### 分享 CLAUDE.md
确保团队成员使用相同的项目配置。

### Code Review
用Claude辅助代码审查，提高效率。

### 知识传递
新成员可以通过Claude快速了解代码库。

## 第十二章：疑难解答

### 问题1：Claude不理解我的代码
- 提供更多信息（注释、文档）
- 使用示例

### 问题2：Claude的修改不正确
- 更明确的指令
- 分步验证

### 问题3：上下文超限
- 精简相关文件
- 使用总结

## 总结

Claude Code 是强大的开发助手，关键是：
- ✅ 清晰的任务描述
- ✅ 有效的上下文管理
- ✅ 迭代式开发
- ✅ 人工审查

**下一步**：Claude Platform 101（API开发）
