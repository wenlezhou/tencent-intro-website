# Model Context Protocol: Advanced Topics

**URL**: https://anthropic.skilljar.com/model-context-protocol-advanced-topics

---

## About this course

This course examines advanced features and implementation patterns for Model Context Protocol (MCP) development, focusing on server-client communication, transport mechanisms, and production deployment considerations. You'll explore sophisticated MCP capabilities including sampling for AI model integration, notification systems, file system access control, and the technical details of different transport protocols.

---

## What You'll Learn

1. **Sampling implementation** - Understand how MCP servers can request language model calls through connected clients, including the architecture that shifts AI costs and complexity from server to client

2. **Progress and logging notifications** - Learn to implement real-time feedback systems using context objects, logging callbacks, and progress reporting for long-running operations

3. **Roots-based file access** - Explore permission systems that grant MCP servers access to specific directories while providing security boundaries and enabling user-friendly file discovery

4. **JSON message architecture** - Examine the complete MCP message specification, distinguishing between request-result pairs and notification messages, and understanding bidirectional communication patterns

5. **Stdio transport mechanisms** - Understand how MCP clients and servers communicate through standard input/output streams, including the required initialization handshake sequence

6. **StreamableHTTP transport implementation** - Learn how Server-sent Events (SSE) enable server-to-client communication over HTTP, including session management and dual-connection architectures

7. **HTTP transport limitations** - Discover how configuration flags affect functionality, particularly regarding server-initiated requests and streaming capabilities

8. **Production scaling considerations** - Understand when to use stateless HTTP for horizontal scaling with load balancers and the trade-offs between stateful and stateless server configurations

9. **Transport selection criteria** - Learn to choose appropriate transport methods based on deployment requirements, functionality needs, and scaling constraints

---

## Prerequisites

- Experience with Python development and async programming patterns
- Familiarity with JSON message formats and HTTP protocols
- Basic knowledge of Server-sent Events (SSE)

---

## Who This Course Is For

- Developers working with Model Context Protocol implementations
- Engineers building MCP servers and clients
- Technical leads evaluating MCP transport options for production deployments

---

## Curriculum

### 1. Introduction
- Let's get started!

### 2. Core MCP Features
- **Sampling** - Understanding sampling architecture
- **Sampling walkthrough** - Hands-on implementation
- **Log and progress notifications** - Real-time feedback systems
- **Notifications walkthrough** - Implementation practice
- **Roots** - File system access control
- **Roots walkthrough** - Permission systems implementation
- **Survey**

### 3. Transports and Communication
- **JSON message types** - Complete message specification
- **The STDIO transport** - Standard input/output communication
- **The StreamableHTTP transport** - HTTP-based communication
- **StreamableHTTP in depth** - Session management and SSE
- **State and the StreamableHTTP transport** - Stateful vs stateless considerations

### 4. Assessment and Next Steps
- **Assessment on MCP concepts**
- **Wrapping up**

---

## Key Advanced Concepts

### Sampling
MCP servers can request language model calls through connected clients:
- Shifts AI costs and complexity from server to client
- Enables servers to leverage AI without running their own models
- Requires careful implementation of the sampling request flow

### Notifications
Real-time feedback systems:
- **Progress notifications** - Report long-running operation status
- **Logging notifications** - Provide debug information
- Implemented via context objects and callbacks

### Roots (File System Access)
Permission systems for file access:
- Grant MCP servers access to specific directories
- Provide security boundaries
- Enable user-friendly file discovery

### Transport Mechanisms

#### STDIO Transport
- Communication through standard input/output streams
- Required initialization handshake sequence
- Simple, suitable for local development

#### StreamableHTTP Transport
- Server-sent Events (SSE) for server-to-client communication
- Session management
- Dual-connection architectures
- More complex but suitable for production

#### State Considerations
- **Stateful servers** - Maintain session state, easier development
- **Stateless servers** - Horizontal scaling with load balancers
- Choose based on deployment requirements

---

## Production Considerations

### Scaling
- Use stateless HTTP for horizontal scaling
- Load balancer compatibility
- Trade-offs between stateful and stateless configurations

### Transport Selection Criteria
Choose based on:
1. **Deployment requirements** - Local vs cloud, containerized vs bare metal
2. **Functionality needs** - Bidirectional communication, streaming
3. **Scaling constraints** - Horizontal scaling, load balancing

---

**Scraped on**: 2026-06-30
**Source**: https://anthropic.skilljar.com/model-context-protocol-advanced-topics
