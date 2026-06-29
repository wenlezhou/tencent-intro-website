// 视频播放器逻辑
class VideoPlayer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.video = null;
    this.subtitles = [];
    this.currentSubtitle = null;
  }

  // 加载YouTube视频
  loadYouTubeVideo(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    iframe.className = 'video-player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    this.container.innerHTML = '';
    this.container.appendChild(iframe);
  }

  // 加载本地视频
  loadLocalVideo(videoUrl, subtitleUrls = []) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.className = 'video-player';
    video.controls = true;
    video.preload = 'metadata';
    
    // 添加字幕
    subtitleUrls.forEach(sub => {
      const track = document.createElement('track');
      track.src = sub.url;
      track.kind = 'subtitles';
      track.label = sub.label;
      track.srclang = sub.lang;
      if (sub.default) track.default = true;
      video.appendChild(track);
    });
    
    this.container.innerHTML = '';
    this.container.appendChild(video);
  }

  // 切换字幕
  toggleSubtitles(show) {
    if (this.video && this.video.textTracks) {
      for (let i = 0; i < this.video.textTracks.length; i++) {
        this.video.textTracks[i].mode = show ? 'showing' : 'hidden';
      }
    }
  }
}

// 初始化视频播放器
function initVideoPlayer(articleId) {
  const videoContainer = document.getElementById('articleVideo');
  if (!videoContainer) return;

  // 从articles.json获取视频ID
  fetch('/content/articles.json')
    .then(res => res.json())
    .then(articles => {
      const article = articles.find(a => a.id === articleId);
      if (article && article.videoId) {
        const player = new VideoPlayer('articleVideo');
        
        // 判断是YouTube还是本地视频
        if (article.videoId.startsWith('http')) {
          player.loadYouTubeVideo(article.videoId);
        } else {
          player.loadLocalVideo(
            `/content/videos/${article.videoId}.mp4`,
            [
              { url: `/content/subtitles/${article.videoId}_en.vtt`, label: 'English', lang: 'en' },
              { url: `/content/subtitles/${article.videoId}_zh.vtt`, label: '中文', lang: 'zh', default: true }
            ]
          );
        }
      }
    });
}

// 导出
window.VideoPlayer = VideoPlayer;
window.initVideoPlayer = initVideoPlayer;
