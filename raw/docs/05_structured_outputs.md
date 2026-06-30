# Structured outputs - Claude Platform Docs

**URL**: https://platform.claude.com/docs/en/build-with-claude/structured-outputs

---

结构化输出（Structured outputs）可以约束 Claude 的响应遵循指定模式，确保输出有效、可解析，适用于下游处理。它提供两个互补功能：
- **JSON 输出**（`output_config.format`）：让 Claude 按指定 JSON 格式返回响应
- **严格工具使用**（`strict: true`）：保证工具名称和输入的 schema 验证通过

两个功能可以独立使用，也可以在同一请求中同时使用。

## 版本可用性

### 通用可用（GA）支持模型

| 平台 | 支持的模型 |
|------|------------|
| **Claude API** | Claude Opus 4.5、Claude Mythos 5、Claude Opus 4.8、Claude Mythos Preview、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6、Claude Sonnet 4.5、Claude Opus 4.5、Claude Haiku 4.5 |
| **Amazon Bedrock** | Claude Opus 4.6、Claude Sonnet 4.6、Claude Sonnet 4.5、Claude Opus 4.5、Claude Haiku 4.5；Claude Opus 4.7 和 Claude Mythos Preview 可通过 [Claude in Amazon Bedrock](https://platform.claude.com/docs/en/build-with-claude/claude-in-amazon-bedrock)（Messages-API Bedrock 端点）使用 |
| **[Claude Platform on AWS](https://platform.claude.com/docs/en/build-with-claude/claude-platform-on-aws)** | 支持 |
| **[Google Cloud](https://platform.claude.com/docs/en/build-with-claude/claude-on-vertex-ai)** | Claude Opus 4.5、Claude Mythos 5、Claude Opus 4.8、Claude Mythos Preview、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6、Claude Sonnet 4.5、Claude Opus 4.5、Claude Haiku 4.5 |
| **[Microsoft Foundry](https://platform.claude.com/docs/en/build-with-claude/claude-in-microsoft-foundry)** | Beta 阶段可用 |

### 迁移说明

如果使用 Beta 版本迁移，原 `output_format` 参数已迁移至 `output_config.format`，不再需要 Beta 请求头。旧的 Beta 头（`structured-outputs-2025-11-13`）和 `output_format` 参数在过渡期内仍可正常使用。

## 为什么使用结构化输出

不使用结构化输出时，Claude 可能生成格式错误的 JSON 响应或无效的工具输入，导致应用崩溃，即使精心提示也可能遇到以下问题：
- 无效 JSON 语法导致的解析错误
- 缺少必填字段
- 数据类型不一致
- 违反 schema 要求，需要错误处理和重试

结构化输出通过约束解码保证响应符合 schema 要求：
- **始终有效**：不会出现 `JSON.parse()` 错误
- **类型安全**：保证字段类型和必填字段符合要求
- **可靠**：不需要为 schema 违规进行重试

## JSON 输出

JSON 输出控制 Claude 的响应格式，确保返回符合你定义 schema 的有效 JSON。适用于以下场景：
- 控制 Claude 的响应格式
- 从图像或文本中提取数据
- 生成结构化报告
- 格式化 API 响应

### 快速开始示例

#### Python 代码示例

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm.",
        }
    ],
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "plan_interest": {"type": "string"},
                    "demo_requested": {"type": "boolean"},
                },
                "required": ["name", "email", "plan_interest", "demo_requested"],
                "additionalProperties": False,
            },
        }
    },
)
print(response.content[0].text)
```

#### 响应输出

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "plan_interest": "Enterprise",
  "demo_requested": true
}
```

> 响应格式：符合 schema 的有效 JSON 会返回在 `response.content[0].text` 字段中。

### 工作原理

1. **定义 JSON schema**：创建描述你期望的响应结构的 JSON schema，使用标准 JSON Schema 格式，但存在部分限制（见 [JSON Schema 限制](#json-schema-limitations) 部分）。
2. **添加 `output_config.format` 参数**：在 API 请求中包含 `output_config.format` 参数，设置 `type: "json_schema"` 并填入你的 schema 定义。
3. **解析响应**：Claude 的响应是符合 schema 的有效 JSON，直接通过 `response.content[0].text` 获取即可。

## SDK 中使用 JSON 输出

各 SDK 提供了辅助工具，方便使用 JSON 输出，包括 schema 转换、自动验证、与常用 schema 库的集成。

> 注意：Python SDK 的 `client.messages.parse()` 仍支持 `output_format` 作为便捷参数，内部会自动转换为 `output_config.format`；其他 SDK 需要直接使用 `output_config`。

### 使用原生 schema 定义

不需要手写原始 JSON schema，可以使用各语言熟悉的 schema 定义工具：

| 语言 | 支持的 schema 工具 |
|------|---------------------|
| **Python** | Pydantic 模型 + `client.messages.parse()` |
| **TypeScript** | Zod schemas + `zodOutputFormat()`，或类型化 JSON Schema 字面量 + `jsonSchemaOutputFormat()` |
| **Java** | 普通 Java 类，通过 `outputConfig(Class<T>)` 自动推导 schema |
| **Ruby** | `Anthropic::BaseModel` 类 + `output_config: {format: Model}` |
| **PHP** | 实现 `StructuredOutputModel` 的类 + `outputConfig: ['format' => MyClass::class]` |
| **C#** | 普通 C# 类 + 泛型 `Create<T>()` 重载，自动推导 schema |
| **Go** | Go 结构体在 Beta API 中会自动反射为 JSON schema，或通过 `output_config` 传入原始 JSON schema |

#### Python Pydantic 示例

```python
from pydantic import BaseModel
from anthropic import Anthropic

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str
    demo_requested: bool

client = Anthropic()

response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract the key information from this email: John Smith (john@example.com) is interested in our Enterprise plan and wants to schedule a demo for next Tuesday at 2pm.",
        }
    ],
    output_format=ContactInfo,
)

print(response.parsed_output)
```

### SDK 特定方法

#### Python SDK 方法

1. **`client.messages.parse()`（推荐）**

自动转换 Pydantic 模型、验证响应，返回 `parsed_output` 属性，可直接访问解析后的结构化数据：

```python
from pydantic import BaseModel

class ContactInfo(BaseModel):
    name: str
    email: str
    plan_interest: str

response = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extract contact info: John Smith, john@example.com, interested in the Pro plan",
        }
    ],
    output_format=ContactInfo,
)

# 直接访问解析后的输出
contact = response.parsed_output
print(contact.name, contact.email)
```

2. **`transform_schema()` 辅助函数**

如果需要手动转换 schema 后再发送，或者需要修改 Pydantic 生成的 schema，可以使用该函数。与 `client.messages.parse()` 自动转换不同，该函数返回转换后的 schema，方便进一步自定义：

```python
from anthropic import transform_schema
from pydantic import TypeAdapter

# 先将 Pydantic 模型转换为 JSON schema，再转换
schema = TypeAdapter(ContactInfo).json_schema()
schema = transform_schema(schema)
# 可按需修改 schema
schema["properties"]["custom_field"] = {"type": "string"}

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[{"role": "user", "content": "..."}],
    output_config={
        "format": {"type": "json_schema", "schema": schema},
    },
)
```

### SDK 转换原理

Python、TypeScript、Ruby、PHP SDK 会自动转换包含不支持特性的 schema；C# 和 Go SDK 在 schema 从原生类型推导时（`Create<T>()` 方法、Go Beta API 的结构体反射或 `BetaJSONSchemaOutputFormat()`）也会执行相同转换。转换步骤如下：

1. 移除不支持的约束（例如 `minimum`、`maximum`、`minLength`、`maxLength`）
2. 如果约束无法直接通过结构化输出支持，将约束信息更新到字段描述中（例如 "Must be at least 100"）
3. 给所有对象添加 `additionalProperties: false`
4. 过滤字符串格式，仅保留支持的格式
5. 用你的原始 schema（包含所有约束）验证响应

> 示例：Pydantic 字段设置 `minimum: 100`，转换后发送到 Claude 的 schema 中是普通整数，但 SDK 会将描述更新为 "Must be at least 100"，并在响应返回后用原始约束验证结果。

## 严格工具使用（Strict tool use）

用于强制执行 JSON Schema 合规性，对工具输入进行语法约束采样，详见 [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use) 文档。

## 同时使用两个功能

JSON 输出和严格工具使用解决不同的问题，可以协同工作：

- **JSON 输出**：控制 Claude 的响应格式（Claude 最终返回的内容）
- **严格工具使用**：验证工具参数（Claude 调用你的函数时传入的参数）

两者结合时，Claude 可以调用参数保证有效的工具，同时返回结构化的 JSON 响应，非常适合需要可靠工具调用和结构化最终输出的智能体工作流。

### 同时使用示例（Python）

```python
response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Help me plan a trip to Paris departing May 15, 2026",
        }
    ],
    # JSON 输出：结构化响应格式
    output_config={
        "format": {
            "type": "json_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "next_steps": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["summary", "next_steps"],
                "additionalProperties": False,
            },
        }
    },
    # 严格工具使用：保证工具参数有效
    tools=[
        {
            "name": "search_flights",
            "strict": True,
            "input_schema": {
                "type": "object",
                "properties": {
                    "destination": {"type": "string"},
                    "date": {"type": "string", "format": "date"},
                },
                "required": ["destination", "date"],
                "additionalProperties": False,
            },
        }
    ],
)

print(response)
```

## 重要注意事项

### 语法编译与缓存

结构化输出使用约束采样，会编译生成语法制品，有以下性能特性：

- **首次请求延迟**：第一次使用特定 schema 时，语法编译会产生额外延迟
- **自动缓存**：编译后的语法会缓存 24 小时（从最后一次使用开始计算），后续请求速度会快很多
- **缓存失效**：修改以下内容会导致缓存失效：
  - JSON schema 结构
  - 请求中的工具集合（同时使用结构化输出和工具使用时）
  - 仅修改 `name` 或 `description` 字段不会让缓存失效

### Prompt 修改与 token 成本

使用结构化输出时，Claude 会自动收到一段额外的系统提示，说明预期的输出格式，因此：

- 输入 token 数量会略有增加
- 注入的提示会像其他系统提示一样消耗 token
- 修改 `output_config.format` 参数会使该对话线程的任何 [prompt 缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) 失效

### JSON Schema 限制

结构化输出支持标准 JSON Schema，但存在部分限制，JSON 输出和严格工具使用都遵循这些限制。

- **支持的特性**：见官方文档对应章节
- **不支持的特性**：见官方文档对应章节
- **正则（pattern）支持**：Python、TypeScript、Ruby、PHP SDK 可以自动转换包含不支持特性的 schema，移除不支持的部分并将约束添加到字段描述中；C# 和 Go SDK 在 schema 从原生类型推导时也会执行相同操作，详见 [SDK 特定方法](#sdk-specific-methods) 部分。

### 属性排序

使用结构化输出时，对象中的属性会保持你在 schema 中定义的顺序，但有一个重要规则：**必填属性会排在前面，可选属性排在后面**。

#### 示例

给定以下 schema：

```json
{
  "type": "object",
  "properties": {
    "notes": {"type": "string"},
    "name": {"type": "string"},
    "email": {"type": "string"},
    "age": {"type": "integer"}
  },
  "required": ["name", "email"],
  "additionalProperties": false
}
```

输出属性排序为：

1. `name`（必填，按 schema 中顺序）
2. `email`（必填，按 schema 中顺序）
3. `notes`（可选，按 schema 中顺序）
4. `age`（可选，按 schema 中顺序）

最终输出：

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "notes": "Interested in enterprise plan",
  "age": 35
}
```

> 如果你的应用对输出属性顺序有要求，可以将所有属性标记为必填，或者在解析逻辑中考虑这种重排序。

### 无效输出场景

虽然结构化输出在大多数情况下保证 schema 合规，但以下场景中输出可能不符合你的 schema：

1. **拒绝请求（`stop_reason: "refusal"`）**

   Claude 即使在使用结构化输出时也会保持安全和有用性特性。如果 Claude 出于安全原因拒绝请求：
   - 响应会返回 `stop_reason: "refusal"`
   - 你会收到 200 状态码
   - 你仍需要为生成的 token 付费
   - 输出可能不符合你的 schema，因为拒绝消息的优先级高于 schema 约束

2. **达到 token 限制（`stop_reason: "max_tokens"`）**

   如果响应因为达到 `max_tokens` 限制被截断：
   - 响应会返回 `stop_reason: "max_tokens"`
   - 输出可能不完整，不符合你的 schema
   - 可以调大 `max_tokens` 值重试，获取完整的结构化输出

### Schema 复杂度限制

结构化输出通过将你的 JSON schema 编译为约束 Claude 输出的语法来工作。更复杂的 schema 会生成更大的语法，编译时间更长。为了避免编译时间过长，API 强制执行以下复杂度限制。

#### 明确限制

以下限制适用于所有包含 `output_config.format` 或 `strict: true` 的请求：

| 限制项 | 值 | 说明 |
|--------|----|------|
| **每个请求的严格工具数量** | 20 | 最多支持 20 个 `strict: true` 的工具，非严格工具不计入该限制 |
| **可选参数总数** | 24 | 所有严格工具 schema 和 JSON 输出 schema 的可选参数总数，每个未列在 `required` 中的参数都计入该限制 |
| **联合类型参数总数** | 16 | 所有严格 schema 中使用 `anyOf` 或类型数组（例如 `"type": ["string", "null"]`）的参数总数，这类参数会产生指数级编译成本 |

> 注意：这些限制是单个请求中所有严格 schema 的合计值。例如，如果你有 4 个严格工具，每个有 6 个可选参数，即使单个工具看起来不复杂，也会达到 24 个可选参数的限制。

#### 额外内部限制

除了上述明确限制，编译后的语法大小还有额外内部限制。因为 schema 复杂度不是单维度的：可选参数、联合类型、嵌套对象、工具数量等特性会互相作用，导致编译后的语法大小 disproportionate 增长。

如果超过这些限制，你会收到 400 错误，提示 "Schema is too complex for compilation"，意味着你的 schema 组合复杂度超过了高效编译的上限，即使每个明确限制都满足要求。作为最后兜底，API 还会强制执行 **180 秒的编译超时**，如果 schema 通过了所有明确检查但生成的编译语法非常大，可能会触发该超时。

#### 降低 schema 复杂度的技巧

如果触发了复杂度限制，可以按以下顺序尝试优化：

1. **仅将关键工具标记为严格**：如果有大量工具，仅对 schema 违规会导致实际问题的工具启用严格模式，简单工具可以依赖 Claude 的自然遵循能力。
2. **减少可选参数**：尽可能将参数标记为 `required`。每个可选参数大约会让语法的状态空间翻倍。如果参数通常有合理的默认值，可以标记为必填，让 Claude 显式提供该默认值。
3. **简化嵌套结构**：带有可选字段的深层嵌套对象会复合提升复杂度，尽可能扁平化结构。
4. **拆分为多个请求**：如果有大量严格工具，可以考虑拆分到多个请求或子智能体中。

如果合法 schema 仍然持续出现问题，可以 [联系支持](https://support.claude.com/en/articles/9015913-how-to-get-support) 并提供你的 schema 定义。

## 数据保留

使用结构化输出时，提示和响应会按照 ZDR（零数据保留）要求处理。但 JSON schema 本身会为了优化目的临时缓存最多 24 小时（从最后一次使用开始计算），不会保留任何提示或响应数据超过 API 响应返回的时间。

结构化输出符合 HIPAA 要求，但 **JSON schema 定义中不得包含 PHI（受保护健康信息）**。API 会将 JSON schema 编译为语法，这些语法会单独缓存，不与消息内容享受同等 PHI 保护。不要在 schema 属性名、`enum` 值、`const` 值或 `pattern` 正则表达式中包含 PHI。PHI 只能出现在消息内容（提示和响应）中，这些内容会按照 HIPAA 保障措施受到保护。

关于所有功能的 ZDR 和 HIPAA 合规性，详见 [API 和数据保留](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) 文档。

## 功能兼容性

### 兼容功能

- **[批量处理](https://platform.claude.com/docs/en/build-with-claude/batch-processing)**：大规模处理结构化输出，享受 50% 折扣
- **[Token 计数](https://platform.claude.com/docs/en/build-with-claude/token-counting)**：计数 token 时不会触发编译
- **[流式传输](https://platform.claude.com/docs/en/build-with-claude/streaming)**：可以像普通响应一样流式返回结构化输出
- **组合使用**：可以在同一请求中同时使用 JSON 输出（`output_config.format`）和严格工具使用（`strict: true`）

### 不兼容功能

- **[引用](https://platform.claude.com/docs/en/build-with-claude/citations)**：引用需要在文本中交错插入引用块，与严格的 JSON schema 约束冲突，同时启用 `output_config.format` 和引用会返回 400 错误
- **消息预填充**：与 JSON 输出不兼容

### 语法作用范围

语法仅适用于 Claude 的直接输出，不适用于工具使用调用、工具结果或思考标签（使用 [扩展思考](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) 时）。语法状态会在不同部分之间重置，允许 Claude 自由思考，同时在最终响应中生成结构化输出。

## 后续步骤

- **[引用](https://platform.claude.com/docs/en/build-with-claude/citations)**：让 Claude 在回答提供的文档相关问题时引用来源
- **[严格工具使用](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use)**：通过语法约束采样强制执行 Claude 工具输入的 JSON Schema 合规性
- **[Claude 工具使用](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)**：将 Claude 连接到外部工具和 API，了解工具执行位置和智能体循环工作原理
- **[定价](https://platform.claude.com/docs/en/about-claude/pricing)**：了解 Anthropic 模型和功能的定价结构

---

**抓取时间**: 2026-06-30 01:15:00
**抓取工具**: WebFetch
