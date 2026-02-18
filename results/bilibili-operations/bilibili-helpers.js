/**
 * B站操作辅助函数集合
 * 这些函数可以通过 evaluate_script 在浏览器中执行，帮助定位元素和验证操作
 */

/**
 * 查找包含特定文本的元素
 * @param {string} text - 要搜索的文本
 * @param {string} tagName - 元素标签名（可选）
 * @returns {Array} 匹配的元素数组
 */
function findElementsByText(text, tagName = '*') {
  const allElements = Array.from(document.querySelectorAll(tagName));
  return allElements.filter(el => {
    const elementText = el.textContent || el.getAttribute('aria-label') || '';
    return elementText.includes(text);
  }).map(el => ({
    tagName: el.tagName,
    text: (el.textContent || '').substring(0, 50),
    ariaLabel: el.getAttribute('aria-label') || '',
    className: el.className || '',
    id: el.id || '',
    href: el.href || ''
  }));
}

/**
 * 查找点赞按钮
 * @returns {Object|null} 点赞按钮信息
 */
function findLikeButton() {
  const buttons = Array.from(document.querySelectorAll('*'));
  const likeButton = buttons.find(btn => {
    const text = (btn.textContent || '').trim();
    const ariaLabel = btn.getAttribute('aria-label') || '';
    const desc = btn.getAttribute('description') || '';
    return text.includes('点赞') || ariaLabel.includes('点赞') || desc.includes('点赞') || 
           text.includes('1.') || ariaLabel.includes('like');
  });
  
  if (likeButton) {
    const likeText = likeButton.querySelector('.video-like-info');
    return {
      element: likeButton,
      text: (likeButton.textContent || '').substring(0, 30),
      ariaLabel: likeButton.getAttribute('aria-label') || '',
      likeCount: likeText ? likeText.textContent : null
    };
  }
  return null;
}

/**
 * 查找收藏按钮
 * @returns {Object|null} 收藏按钮信息
 */
function findFavoriteButton() {
  const buttons = Array.from(document.querySelectorAll('*'));
  const favButton = buttons.find(btn => {
    const text = (btn.textContent || '').trim();
    const ariaLabel = btn.getAttribute('aria-label') || '';
    const desc = btn.getAttribute('description') || '';
    return text.includes('收藏') || ariaLabel.includes('收藏') || desc.includes('收藏') || 
           text.includes('2.') || ariaLabel.includes('fav');
  });
  
  if (favButton) {
    const favText = favButton.querySelector('.video-fav-info');
    return {
      element: favButton,
      text: (favButton.textContent || '').substring(0, 30),
      ariaLabel: favButton.getAttribute('aria-label') || '',
      favCount: favText ? favText.textContent : null
    };
  }
  return null;
}

/**
 * 查找收藏夹对话框中的文件夹
 * @param {string} folderName - 文件夹名称（如"学习"）
 * @returns {Object|null} 文件夹信息
 */
function findFavoriteFolder(folderName) {
  const dialog = document.querySelector('[role="dialog"]') || 
                 document.querySelector('.fav-list') ||
                 Array.from(document.querySelectorAll('*')).find(el => 
                   el.textContent && el.textContent.includes('添加到收藏夹')
                 );
  
  if (!dialog) return null;
  
  const allItems = Array.from(dialog.querySelectorAll('*'));
  const folderItem = allItems.find(item => {
    const text = (item.textContent || '').trim();
    return text === folderName || text.includes(folderName);
  });
  
  if (folderItem) {
    return {
      element: folderItem,
      text: (folderItem.textContent || '').substring(0, 50),
      tagName: folderItem.tagName,
      className: folderItem.className || ''
    };
  }
  return null;
}

/**
 * 检查页面是否已跳转到目标 URL
 * @param {string} targetUrl - 目标 URL（可以是完整 URL 或 URL 的一部分）
 * @returns {boolean} 是否已跳转
 */
function checkPageNavigation(targetUrl) {
  const currentUrl = window.location.href;
  return currentUrl.includes(targetUrl) || currentUrl === targetUrl;
}

/**
 * 获取当前页面所有可点击的按钮和链接
 * @returns {Array} 可点击元素列表
 */
function getAllClickableElements() {
  const clickable = [];
  
  // 按钮
  const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
  buttons.forEach(btn => {
    const text = (btn.textContent || '').trim();
    if (text) {
      clickable.push({
        type: 'button',
        text: text.substring(0, 50),
        ariaLabel: btn.getAttribute('aria-label') || '',
        disabled: btn.disabled || btn.hasAttribute('disabled')
      });
    }
  });
  
  // 链接
  const links = Array.from(document.querySelectorAll('a[href]'));
  links.forEach(link => {
    const text = (link.textContent || '').trim();
    if (text) {
      clickable.push({
        type: 'link',
        text: text.substring(0, 50),
        href: link.href,
        ariaLabel: link.getAttribute('aria-label') || ''
      });
    }
  });
  
  return clickable;
}

/**
 * 等待元素出现
 * @param {string} selector - CSS 选择器
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Element|null>} 找到的元素或 null
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * 检查点赞是否成功（通过数字变化）
 * @param {string} previousCount - 之前的点赞数（如"1.4万"）
 * @returns {Object} 检查结果
 */
function verifyLikeSuccess(previousCount) {
  const likeButton = findLikeButton();
  if (!likeButton) {
    return { success: false, reason: '找不到点赞按钮' };
  }
  
  const currentCount = likeButton.likeCount || '';
  // 简单的数字比较（实际应该更智能）
  if (currentCount !== previousCount) {
    return { success: true, previousCount, currentCount };
  }
  
  return { success: false, reason: '点赞数未变化', currentCount };
}

/**
 * 检查收藏对话框是否已关闭
 * @returns {boolean} 对话框是否已关闭
 */
function isFavoriteDialogClosed() {
  const dialog = document.querySelector('[role="dialog"]');
  const favDialog = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('添加到收藏夹')
  );
  return !dialog && !favDialog;
}

// 导出函数（如果作为模块使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findElementsByText,
    findLikeButton,
    findFavoriteButton,
    findFavoriteFolder,
    checkPageNavigation,
    getAllClickableElements,
    waitForElement,
    verifyLikeSuccess,
    isFavoriteDialogClosed
  };
}
