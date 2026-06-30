// UI Designer: 增强视频播放器组件
class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.video = null;
    this.subtitles = [];
    this.currentSubtitle = null;
    this.isYouTube = false;
    this.player = null;
  }

  // 加载YouTube视频 - 增强版
  loadYouTubeVideo(videoId, options = {}) {
    this.isYouTube = true;
    
    const iframe = document.createElement('iframe');
    const params = new URLSearchParams({
      autoplay: options.autoplay ? '1' : '0',
      rel: '0',
      modestbranding: '1',
      fs: '1',
      cc_load_policy: options.subtitles ? '1' : '0',
      ...options.params
    });
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    iframe.className = 'video-player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    
    this.container.innerHTML = '';
    this.container.appendChild(iframe);
    this.player = iframe;
  }

  // 加载本地视频 - 增强版
  loadLocalVideo(videoUrl, subtitleUrls = [], options = {}) {
    this.isYouTube = false;
    
    // 创建视频容器
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    
    // 创建video元素
    const video = document.createElement('video');
    video.src = videoUrl;
    video.className = 'video-player';
    video.controls = options.controls !== false;
    video.preload = options.preload || 'metadata';
    video.poster = options.poster || '';
    video.crossOrigin = 'anonymous';
    
    // 添加字幕
    subtitleUrls.forEach((sub, index) => {
      const track = document.createElement('track');
      track.src = sub.url;
      track.kind = sub.kind || 'subtitles';
      track.label = sub.label;
      track.srclang = sub.lang;
      if (sub.default || index === 0) {
        track.default = true;
      }
      video.appendChild(track);
    });
    
    // 创建自定义控制栏（可选）
    if (options.customControls) {
      const controls = this.createCustomControls(video, subtitleUrls);
      videoContainer.appendChild(video);
      videoContainer.appendChild(controls);
    } else {
      videoContainer.appendChild(video);
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(videoContainer);
    this.video = video;
  }

  // 创建自定义控制栏
  createCustomControls(video, subtitles) {
    const controls = document.createElement('div');
    controls.className = 'video-controls';
    
    // 播放/暂停按钮
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '▶️';
    playBtn.title = '播放/暂停';
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = '⏸️';
      } else {
        video.pause();
        playBtn.innerHTML = '▶️';
      }
    });
    
    // 字幕切换
    if (subtitles.length > 0) {
      const subtitleToggle = document.createElement('div');
      subtitleToggle.className = 'subtitle-toggle';
      
      const label = document.createElement('label');
      label.textContent = '字幕';
      label.htmlFor = 'subtitleToggle';
      
      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.id = 'subtitleToggle';
      toggle.checked = true;
      toggle.addEventListener('change', (e) => {
        this.toggleSubtitles(e.target.checked);
      });
      
      subtitleToggle.appendChild(label);
      subtitleToggle.appendChild(toggle);
      controls.appendChild(subtitleToggle);
    }
    
    controls.insertBefore(playBtn, controls.firstChild);
    return controls;
  }

  // 切换字幕
  toggleSubtitles(show) {
    if (this.video && this.video.textTracks) {
      for (let i = 0; i < this.video.textTracks.length; i++) {
        this.video.textTracks[i].mode = show ? 'showing' : 'hidden';
      }
    }
  }

  // 销毁播放器
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.video = null;
    this.player = null;
  }
}

// 初始化视频播放器 - 增强版
function initVideoPlayer(articleId, options = {}) {
  const videoContainer = document.getElementById('articleVideo');
  if (!videoContainer) return;

  // 显示加载状态
  videoContainer.innerHTML = '<div class="video-loading">加载视频中...</div>';

  // 从articles.json获取视频ID
  fetch('/content/articles.json')
    .then(res => res.json())
    .then(articles => {
      const article = articles.find(a => a.id === articleId);
      if (article && article.videoId) {
        const player = new VideoPlayer('articleVideo');
        
        // 判断是YouTube还是本地视频
        if (article.videoId.includes('youtube.com') || article.videoId.includes('youtu.be')) {
          // 提取YouTube视频ID
          const youtubeId = extractYouTubeId(article.videoId);
          if (youtubeId) {
            player.loadYouTubeVideo(youtubeId, {
              autoplay: false,
              subtitles: true
            });
          }
        } else if (article.videoId.startsWith('http')) {
          player.loadLocalVideo(article.videoId, [], options);
        } else {
          // 假设是本地视频文件
          player.loadLocalVideo(
            `/content/videos/${article.videoId}.mp4`,
            [
              { url: `/content/subtitles/${article.videoId}_en.vtt`, label: 'English', lang: 'en' },
              { url: `/content/subtitles/${article.videoId}_zh.vtt`, label: '中文', lang: 'zh', default: true }
            ],
            { customControls: true, ...options }
          );
        }
        
        // 存储player实例
        window.currentVideoPlayer = player;
      } else {
        videoContainer.innerHTML = '<div class="video-error">本文暂无视频资源</div>';
      }
    })
    .catch(err => {
      console.error('加载视频失败:', err);
      videoContainer.innerHTML = '<div class="video-error">视频加载失败</div>';
    });
}

// 提取YouTube视频ID的辅助函数
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// 导出
window.VideoPlayer = VideoPlayer;
window.initVideoPlayer = initVideoPlayer;
window.extractYouTubeId = extractYouTubeId;
