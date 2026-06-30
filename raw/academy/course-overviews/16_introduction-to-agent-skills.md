# Introduction to Agent Skills

**URL**: https://anthropic.skilljar.com/introduction-to-agent-skills

---

## About this course

Learn how to build, configure, and share Skills in Claude Code — reusable markdown instructions that Claude automatically applies to the right tasks at the right time. This course takes you from creating your first Skill to distributing them across teams and troubleshooting common issues.

In this course, you'll learn how to stop repeating yourself and start teaching Claude once. You'll discover what Skills are and how they differ from other Claude Code customization options like CLAUDE.md, hooks, and subagents. You'll create your first Skill from scratch — writing the SKILL.md frontmatter, crafting effective descriptions that reliably trigger matching, and organizing your skill directory with progressive disclosure to keep context windows efficient. You'll also explore advanced configuration options like restricting tool access with allowed-tools and using scripts that execute without consuming context.

Beyond building individual Skills, you'll learn how to share them with your team by committing them to a repository, distribute them more broadly through plugins, and deploy them organization-wide using enterprise managed settings. You'll see how to wire Skills into custom subagents for isolated, expert task delegation, and you'll walk through a complete troubleshooting guide for diagnosing issues — from skills that won't trigger to priority conflicts and runtime errors. By the end, you'll have the knowledge to build a full Skills-based workflow that keeps Claude consistent, context-efficient, and aligned with your team's standards.

---

## What You'll Learn

### 1. What are Skills?
- Understanding Skills as reusable markdown instructions
- How Skills differ from CLAUDE.md, hooks, and subagents
- When to use Skills vs. other customization options

### 2. Creating Your First Skill
- Writing the SKILL.md frontmatter
- Crafting effective descriptions that reliably trigger matching
- Organizing your skill directory with progressive disclosure
- Keeping context windows efficient

### 3. Configuration and Multi-file Skills
- Advanced configuration options
- Restricting tool access with allowed-tools
- Using scripts that execute without consuming context
- Progressive disclosure patterns

### 4. Skills vs. Other Claude Code Features
- Comparison with CLAUDE.md (project-level instructions)
- Comparison with hooks (event-driven automation)
- Comparison with subagents (isolated task execution)
- Choosing the right customization approach

### 5. Sharing Skills
- Committing Skills to a repository for team sharing
- Distributing Skills through plugins
- Deploying Skills organization-wide using enterprise managed settings
- Version control and collaboration workflows

### 6. Troubleshooting Skills
- Diagnosing skills that won't trigger
- Resolving priority conflicts between Skills
- Fixing runtime errors
- Debugging and testing Skills

---

## Key Concepts

### What are Skills?

**Skills** are reusable markdown instructions that Claude automatically applies to the right tasks at the right time.

- **Automatic triggering** - Claude matches Skills to tasks based on descriptions
- **Reusable** - Write once, use across multiple conversations
- **Context-efficient** - Only loaded when relevant, keeping context windows clean
- **Markdown-based** - Easy to read, write, and maintain

### Skills vs. Other Claude Code Features

| Feature | Purpose | When to Use |
|---------|---------|-------------|
| **CLAUDE.md** | Project-level instructions | Always-loaded project context |
| **Hooks** | Event-driven automation | Automate workflows on specific events |
| **Subagents** | Isolated task execution | Delegate tasks to focused assistants |
| **Skills** | Reusable task instructions | Teach Claude to handle specific task types |

### Skill Structure

A Skill consists of:
1. **SKILL.md** - The main instruction file with frontmatter
2. **Frontmatter** - YAML metadata including description for trigger matching
3. **Optional files** - Scripts, templates, or additional context files
4. **Progressive disclosure** - Organized to load only what's needed

### Advanced Configuration

- **allowed-tools** - Restrict which tools the Skill can use
- **Scripts** - Execute code without consuming context window
- **Priority** - Control trigger ordering when multiple Skills match
- **Progressive disclosure** - Organize files to load context efficiently

---

## Practical Applications

### For Individual Developers
- Create Skills for common coding patterns
- Automate repetitive code review tasks
- Standardize testing approaches across projects

### For Teams
- Share coding standards via Skills
- Distribute best practices through plugins
- Ensure consistent approaches across the team

### For Organizations
- Deploy enterprise-wide Skills via managed settings
- Enforce coding standards and security practices
- Scale expertise across the entire engineering organization

---

## Workflow Integration

### Creating a Skill Workflow
1. **Identify repetitive tasks** - What do you find yourself explaining to Claude repeatedly?
2. **Write the SKILL.md** - Create clear, actionable instructions
3. **Craft the description** - Make it reliably trigger for relevant tasks
4. **Test and iterate** - Refine based on how well Claude applies it
5. **Share** - Commit to repo, distribute via plugin, or deploy org-wide

### Integrating with Subagents
- Wire Skills into custom subagents for isolated execution
- Build expert subagents that leverage specialized Skills
- Create task-specific workflows that combine Skills and subagents

---

## Troubleshooting Guide

### Common Issues

1. **Skill won't trigger**
   - Check description matching
   - Verify file location and naming
   - Review priority settings

2. **Priority conflicts**
   - Multiple Skills matching the same task
   - Adjust priority values in frontmatter
   - Make descriptions more specific

3. **Runtime errors**
   - Check script permissions and paths
   - Verify tool access restrictions
   - Review error logs

4. **Context inefficiency**
   - Use progressive disclosure to load only needed content
   - Split large Skills into smaller, focused ones
   - Remove unnecessary context from SKILL.md

---

## Best Practices

1. **Write clear, specific descriptions** - The better the description, the more reliably Claude triggers the Skill
2. **Use progressive disclosure** - Organize content to load only what's needed for each task
3. **Test thoroughly** - Verify the Skill works as expected before sharing
4. **Version control** - Track changes and collaborate via Git
5. **Document** - Include examples and edge cases in your Skill
6. **Start simple** - Begin with one focused Skill, then expand

---

**Scraped on**: 2026-06-30
**Source**: https://anthropic.skilljar.com/introduction-to-agent-skills
