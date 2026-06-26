// AI教程精华站 - 交互逻辑

// 文章数据
const articles = [
  {
    id: 'basics-01',
    title: 'AI入门：从零开始认识人工智能',
    slug: '01-ai-basics-introduction',
    category: 'basics',
    categoryLabel: 'AI基础',
    description: '零基础友好的AI入门指南，用通俗的语言解释AI的工作原理、能力边界和实际应用',
    difficulty: '入门',
    readingTime: 20,
    tags: ['AI入门', '人工智能', '大语言模型', '零基础'],
    file: 'content/basics/01-ai-basics-introduction.md'
  },
  {
    id: 'pe-01',
    title: '提示词工程完全指南',
    slug: '01-prompt-engineering-guide',
    category: 'prompt-engineering',
    categoryLabel: '提示词工程',
    description: '从零掌握提示词工程的核心技巧，涵盖基础结构、角色设定、示例使用、XML标签、长上下文等关键方法',
    difficulty: '入门-进阶',
    readingTime: 45,
    tags: ['提示词工程', 'Prompt Engineering', 'AI交互', '最佳实践'],
    file: 'content/prompt-engineering/01-prompt-engineering-guide.md'
  },
  {
    id: 'pe-02',
    title: '提示词工程交互式教程精要',
    slug: '02-prompt-engineering-interactive',
    category: 'prompt-engineering',
    categoryLabel: '提示词工程',
    description: '9章交互式教程的核心知识点提炼，从基础结构到复杂场景，每章配有实战练习',
    difficulty: '入门-进阶',
    readingTime: 50,
    tags: ['提示词工程', '交互式教程', '实战练习', '逐步进阶'],
    file: 'content/prompt-engineering/02-prompt-engineering-interactive.md'
  },
  {
    id: 'agent-01',
    title: 'AI智能体系统实战',
    slug: '01-agent-systems-guide',
    category: 'agent-systems',
    categoryLabel: '智能体系统',
    description: '深入理解AI智能体的设计模式，掌握长周期推理、子智能体编排、状态跟踪和安全控制',
    difficulty: '进阶',
    readingTime: 35,
    tags: ['智能体', 'Agent', '自动化', '工具调用', 'MCP'],
    file: 'content/agent-systems/01-agent-systems-guide.md'
  },
  {
    id: 'api-01',
    title: 'API开发实战指南',
    slug: '01-api-development-guide',
    category: 'api-development',
    categoryLabel: 'API开发',
    description: '从零开始掌握AI API开发，涵盖API基础、消息格式、流式响应、多模态提示和工具调用',
    difficulty: '入门-进阶',
    readingTime: 40,
    tags: ['API', '开发', 'Python', 'SDK', '多模态'],
    file: 'content/api-development/01-api-development-guide.md'
  },
  {
    id: 'literacy-01',
    title: 'AI素养：框架与基础',
    slug: '01-ai-fluency-fundamentals',
    category: 'ai-literacy',
    categoryLabel: 'AI素养',
    description: '建立与AI系统高效协作的核心素养，理解AI的能力与局限，学会负责任地使用AI',
    difficulty: '入门',
    readingTime: 25,
    tags: ['AI素养', 'AI Fluency', 'AI基础', '人机协作'],
    file: 'content/ai-literacy/01-ai-fluency-fundamentals.md'
  },
  {
    id: 'mcp-01',
    title: '模型上下文协议（MCP）实战',
    slug: '01-mcp-guide',
    category: 'mcp',
    categoryLabel: 'MCP协议',
    description: '从零构建MCP服务器和客户端，掌握工具、资源、提示三大核心原语，连接AI与外部服务',
    difficulty: '进阶-高级',
    readingTime: 35,
    tags: ['MCP', '模型上下文协议', '工具调用', 'Python', '服务器'],
    file: 'content/mcp/01-mcp-guide.md'
  }
];

// 分类数据
const categories = [
  { id: 'basics', icon: '🚀', title: 'AI基础', desc: '从零开始认识人工智能，建立AI基础认知', count: 1 },
  { id: 'prompt-engineering', icon: '✨', title: '提示词工程', desc: '系统掌握与AI高效沟通的核心技巧', count: 2 },
  { id: 'agent-systems', icon: '🤖', title: '智能体系统', desc: '深入理解AI智能体的设计与实现', count: 1 },
  { id: 'api-development', icon: '🔧', title: 'API开发', desc: '从API基础到工具调用的完整开发流程', count: 1 },
  { id: 'ai-literacy', icon: '💡', title: 'AI素养', desc: '建立与AI系统高效协作的核心素养', count: 1 },
  { id: 'mcp', icon: '🔌', title: 'MCP协议', desc: '模型上下文协议入门与进阶实战', count: 1 }
];

// 简单Markdown解析器
function parseMarkdown(md) {
  let html = md;

  // 移除YAML front matter
  html = html.replace(/^---[\s\S]*?---\n/, '');

  // 代码块（先处理，避免内部被其他规则影响）
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang}">${escaped}</code><button class="code-copy-btn" onclick="copyCode(this)">复制</button></pre>`;
  });

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 id="$1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 水平线
  html = html.replace(/^---$/gm, '<hr>');

  // 表格
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(c => c.trim());
    if (cells.every(c => /^[-:]+$/.test(c))) return '';
    const isHeader = false;
    const tag = isHeader ? 'th' : 'td';
    return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
  });

  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)/g, '$1');
  html = html.replace(/(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<tr>)/g, '<table>$1');
  html = html.replace(/(<\/tr>)<\/p>/g, '$1</table>');

  return html;
}

// 提取TOC
function extractTOC(html) {
  const headings = [];
  const regex = /<h([2-3]) id="([^"]*)">(.*?)<\/h[2-3]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, '')
    });
  }
  return headings;
}

// 复制代码
function copyCode(btn) {
  const code = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '已复制!';
    setTimeout(() => btn.textContent = '复制', 2000);
  });
}

// 搜索功能
function initSearch() {
  const searchInput = document.querySelector('.nav-search input');
  const overlay = document.querySelector('.search-overlay');
  const panelInput = document.querySelector('.search-panel-input');
  const results = document.querySelector('.search-results');

  if (!searchInput) return;

  searchInput.addEventListener('focus', () => {
    overlay.classList.add('active');
    panelInput.focus();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      overlay.classList.remove('active');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.add('active');
      panelInput.focus();
    }
  });

  panelInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      results.innerHTML = '<div class="search-result-item"><div class="search-result-desc">输入关键词搜索教程...</div></div>';
      return;
    }

    const filtered = articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query)) ||
      a.categoryLabel.includes(query)
    );

    if (filtered.length === 0) {
      results.innerHTML = '<div class="search-result-item"><div class="search-result-desc">没有找到匹配的教程</div></div>';
      return;
    }

    results.innerHTML = filtered.map(a => `
      <div class="search-result-item" onclick="navigateToArticle('${a.category}/${a.slug}')">
        <div class="search-result-title">${a.title}</div>
        <div class="search-result-desc">${a.description}</div>
        <div class="search-result-category">${a.categoryLabel} · ${a.difficulty} · ${a.readingTime}分钟</div>
      </div>
    `).join('');
  });
}

// 导航到文章
function navigateToArticle(path) {
  window.location.href = `article.html?c=${path}`;
}

// 返回顶部
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// TOC高亮
function initTOCHighlight() {
  const tocLinks = document.querySelectorAll('.toc-item a');
  if (!tocLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.toc-item a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  document.querySelectorAll('.article-body h2, .article-body h3').forEach(h => {
    if (h.id) observer.observe(h);
  });
}

// 动画入场
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.category-card, .path-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initBackToTop();
  initTOCHighlight();
  initAnimations();
});
