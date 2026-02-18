/**
 * B站页面跳转验证辅助函数
 * 用于验证点击链接后页面是否正确跳转，避免重复打开页面
 */

/**
 * 验证页面跳转的标准流程
 * @param {string} targetUrl - 目标 URL（可以是完整 URL 或 URL 的一部分，如 "BV1WBG9zgECp"）
 * @param {number} waitTime - 等待时间（毫秒），默认 2000
 * @returns {Promise<Object>} 验证结果
 */
async function verifyPageNavigation(targetUrl, waitTime = 2000) {
  // 步骤 1: 等待页面跳转
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  // 步骤 2: 检查当前页面 URL
  const currentUrl = window.location.href;
  const urlMatches = currentUrl.includes(targetUrl) || currentUrl === targetUrl;
  
  // 步骤 3: 检查页面标题（辅助验证）
  const pageTitle = document.title;
  const titleMatches = pageTitle && !pageTitle.includes('哔哩哔哩 (゜-゜)つロ 干杯~-bilibili');
  
  return {
    success: urlMatches,
    currentUrl: currentUrl,
    targetUrl: targetUrl,
    urlMatches: urlMatches,
    pageTitle: pageTitle,
    needsNewPage: !urlMatches
  };
}

/**
 * 检查是否有新标签页打开（通过检查 opener）
 * @returns {boolean} 是否在新标签页打开
 */
function isNewTabOpened() {
  return window.opener !== null;
}

/**
 * 获取所有打开的页面信息（在当前窗口上下文中）
 * @returns {Object} 页面信息
 */
function getPageInfo() {
  return {
    url: window.location.href,
    title: document.title,
    isNewTab: window.opener !== null,
    referrer: document.referrer,
    readyState: document.readyState
  };
}

/**
 * 等待页面完全加载
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<boolean>} 是否加载完成
 */
function waitForPageLoad(timeout = 5000) {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(true);
      return;
    }
    
    const checkInterval = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(false);
    }, timeout);
  });
}

/**
 * 检查页面是否包含特定元素（用于验证页面是否正确加载）
 * @param {string} selector - CSS 选择器或文本内容
 * @param {boolean} isText - 是否按文本内容查找
 * @returns {boolean} 是否找到元素
 */
function checkPageContains(selector, isText = false) {
  if (isText) {
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements.some(el => {
      const text = (el.textContent || '').trim();
      return text.includes(selector);
    });
  } else {
    return document.querySelector(selector) !== null;
  }
}

/**
 * 验证视频页面是否正确加载
 * @param {string} videoId - 视频 ID（如 "BV1WBG9zgECp"）
 * @returns {Object} 验证结果
 */
function verifyVideoPageLoaded(videoId) {
  const urlMatches = window.location.href.includes(videoId);
  const hasVideoPlayer = document.querySelector('.bilibili-player') !== null ||
                        document.querySelector('video') !== null;
  const hasVideoTitle = Array.from(document.querySelectorAll('h1')).some(h1 => 
    h1.textContent && h1.textContent.trim().length > 0
  );
  
  return {
    success: urlMatches && hasVideoPlayer && hasVideoTitle,
    urlMatches: urlMatches,
    hasVideoPlayer: hasVideoPlayer,
    hasVideoTitle: hasVideoTitle,
    currentUrl: window.location.href
  };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyPageNavigation,
    isNewTabOpened,
    getPageInfo,
    waitForPageLoad,
    checkPageContains,
    verifyVideoPageLoaded
  };
}
