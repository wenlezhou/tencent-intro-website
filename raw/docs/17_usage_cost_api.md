# Usage and Cost API - Claude Platform Docs

**URL**: https://docs.anthropic.com/en/docs/manage-claude/usage-cost-api

---

使用和成本 Admin API 提供程序化访问组织 API 使用和成本数据。

## 快速开始

获取组织最近 7 天的每日使用情况：

```bash
curl "https://api.anthropic.com/v1/organizations/usage_report/messages?\
starting_at=2025-01-08T00:00:00Z&\
ending_at=2025-01-15T00:00:00Z&\
bucket_width=1d" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

## Usage API

使用 `/v1/organizations/usage_report/messages` 端点跨组织跟踪 token 消耗。

### 关键概念

- **时间桶**：固定间隔聚合使用数据（1m、1h 或 1d）
- **Token 跟踪**：测量未缓存输入、缓存输入、缓存创建和输出 token
- **过滤和分组**：按 API 密钥、工作区、模型、服务层级等过滤和分组

### 示例

#### 按模型每日使用情况

```bash
curl "https://api.anthropic.com/v1/organizations/usage_report/messages?\
starting_at=2025-01-01T00:00:00Z&\
ending_at=2025-01-08T00:00:00Z&\
group_by[]=model&\
bucket_width=1d" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

#### 按 API 密钥和工作区过滤使用情况

```bash
curl "https://api.anthropic.com/v1/organizations/usage_report/messages?\
starting_at=2025-01-01T00:00:00Z&\
ending_at=2025-01-08T00:00:00Z&\
api_key_ids[]=apikey_01Rj2N8SVvo6BePZj99NhmiT&\
workspace_ids[]=wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ&\
bucket_width=1d" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

## Cost API

使用 `/v1/organizations/cost_report` 端点检索服务级成本分解（美元）。

### 关键概念

- **货币**：所有成本以美元计
- **成本类型**：跟踪 token 使用、网络搜索和代码执行成本
- **分组**：按工作区或描述分组成本

### 示例

```bash
curl "https://api.anthropic.com/v1/organizations/cost_report?\
starting_at=2025-01-01T00:00:00Z&\
ending_at=2025-01-31T00:00:00Z&\
group_by[]=workspace_id&\
group_by[]=description" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

## 分页

两个端点都支持大数据集的分页：

```bash
# 首次请求
curl "...&limit=7" --header "x-api-key: $ANTHROPIC_ADMIN_KEY"

# 响应包含："has_more": true, "next_page": "page_xyz..."

# 使用分页的后续请求
curl "...&limit=7&page=page_xyz..." --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

## 常见使用场景

- **每日使用报告**：跟踪 token 消耗趋势
- **成本归属**：按工作区分配费用
- **缓存效率**：测量和优化提示缓存
- **预算监控**：设置支出阈值警报
- **CSV 导出**：为财务团队生成报告
