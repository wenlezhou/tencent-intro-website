# Workspaces - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/manage-claude/workspaces

---

工作区用于在组织内组织 API 使用。使用工作区可以分离不同项目、环境或团队。

## 工作原理

每个组织都有一个**默认工作区**，无法重命名、归档或删除。创建额外工作区时，可以为每个工作区分配 API 密钥、成员和资源限制。

关键特征：
- 工作区标识符使用 `wrkspc_` 前缀
- 每个组织最多 100 个工作区
- API 密钥限定于单个工作区

## 工作区角色和权限

| 角色 | 权限 |
|------|------|
| Workspace User | 仅使用 Workbench |
| Workspace Limited Developer | 创建和管理 API 密钥，使用 API |
| Workspace Developer | 创建和管理 API 密钥，使用 API |
| Workspace Admin | 对工作区设置和成员的完全控制 |
| Workspace Billing | 查看工作区账单信息 |

## 管理工作区

### 使用控制台

在 [Claude 控制台](https://platform.claude.com/settings/workspaces) 中创建和管理工作区。

### 使用 Admin API

使用 [Admin API](https://platform.claude.com/docs/en/manage-claude/admin-api) 以编程方式管理工作区。

```bash
# 创建工作区
curl --request POST "https://api.anthropic.com/v1/organizations/workspaces" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{"name": "Production"}'
```

## API 密钥和资源范围

API 密钥限定于特定工作区。在工作区中创建的 API 密钥只能访问该工作区内的资源。

限定于工作区的资源包括：
- 通过文件 API 创建的文件
- 通过批处理 API 创建的消息批处理
- 通过技能 API 创建的技能

## 工作区限制

可以为每个工作区设置自定义支出和速率限制：
- **支出限制**：限制工作区的每月支出
- **速率限制**：限制每分钟请求数、输入 token 数或输出 token 数

## 使用量和成本跟踪

使用 [使用和成本 API](https://platform.claude.com/docs/en/manage-claude/usage-cost-api) 按工作区跟踪使用量和成本。

```bash
curl "https://api.anthropic.com/v1/organizations/usage_report/messages?\
starting_at=2025-01-01T00:00:00Z&\
workspace_ids[]=wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

## 常见使用场景

### 环境分离
为开发、预生产和生产创建单独的工作区。

### 团队或部门隔离
为不同团队分配工作区，用于成本分配和访问控制。

### 基于项目的组织
为特定项目或产品创建工作区，分别跟踪使用量和成本。
