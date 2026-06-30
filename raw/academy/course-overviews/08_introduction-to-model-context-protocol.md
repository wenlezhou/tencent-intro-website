# Introduction to Model Context Protocol

**URL**: https://anthropic.skilljar.com/introduction-to-model-context-protocol

---

## About this course

This course covers MCP (Model Context Protocol), a protocol for connecting Claude to external services and data sources without manually writing tool schemas. You'll learn to build both MCP servers that expose tools, resources, and prompts, and MCP clients that consume them. The course includes a hands-on project where you implement a document management system using MCP.

---

## Learning Objectives

By the end of this course, you'll be able to:

1. **Understand MCP architecture** and the client-server communication model
2. **Build MCP servers** that expose tools using the Python SDK
3. **Implement MCP clients** to connect your applications to MCP servers
4. **Create resources** for exposing data and prompts for pre-defined workflows
5. **Test and debug MCP servers** using the MCP Inspector
6. **Choose between tools, resources, and prompts** based on control patterns
7. **Handle resource cleanup and async communication** in MCP implementations

---

## Prerequisites

- Basic Python programming experience
- Understanding of async/await patterns
- Familiarity with API concepts

---

## Who This Course Is For

Engineers who want to integrate Claude with external tools and services without writing tons of boilerplate integration code.

---

## Course Sections

### 1. MCP Fundamentals & Server Development
**8 lessons**

Start with understanding MCP's architecture and why it exists. Build your first MCP server with tools using the Python SDK, then test it with the built-in inspector.

**Topics Covered**:
- MCP architecture diagram showing client-server communication
- Python code showing MCP server tool definitions
- MCP Inspector interface testing tools

### 2. MCP Client Implementation & Advanced Features
**8 lessons**

Build the client side to communicate with MCP servers. Implement resources for direct data access and prompts for pre-built instructions. See how everything connects in a complete application flow.

**Topics Covered**:
- Client implementation code with session management
- Resource and prompt implementation examples
- Complete application flow diagram with MCP integration

---

## Key Concepts

### What is MCP?
MCP is a protocol for connecting Claude to external services and data sources without manually writing tool schemas.

### MCP Architecture
- **MCP Servers**: Expose tools, resources, and prompts
- **MCP Clients**: Consume MCP server capabilities
- **Communication Model**: Client-server architecture

### Core Components
1. **Tools** - Functions that Claude can call
2. **Resources** - Data sources that Claude can access
3. **Prompts** - Pre-defined workflow instructions

### Development Tools
- **MCP Inspector** - Test and debug MCP servers
- **Python SDK** - Build MCP servers and clients

---

## Hands-on Project

Implement a **document management system** using MCP:
- Build an MCP server with tools for document operations
- Create resources for document access
- Implement a client to interact with your server
- Test everything using the MCP Inspector

---

## Control Patterns

Learn when to use:
- **Tools** - When Claude needs to take action
- **Resources** - When Claude needs to read data
- **Prompts** - When you want to guide Claude's behavior

---

**Scraped on**: 2026-06-30
**Source**: https://anthropic.skilljar.com/introduction-to-model-context-protocol
