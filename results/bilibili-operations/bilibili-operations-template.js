/**
 * B站操作模板脚本
 * 这些函数可以直接通过 evaluate_script 调用，执行常见的 B站操作
 */

/**
 * 完整的页面跳转验证流程
 * 使用方式：evaluate_script({function: verifyPageNavigationComplete, args: ["BV1WBG9zgECp"]})
 */
function verifyPageNavigationComplete(targetUrl) {
  const result = {
    step: 1,
    message: '开始验证页面跳转',
    currentUrl: window.location.href,
    targetUrl: targetUrl,
    needsWait: true,
    needsNewPage: false
  };
  
  // 检查当前 URL
  if (window.location.href.includes(targetUrl)) {
    result.step = 2;
    result.message = '页面已跳转到目标 URL';
    result.needsWait = false;
    result.needsNewPage = false;
    return result;
  }
  
  // 检查页面是否还在加载
  if (document.readyState !== 'complete') {
    result.step = 3;
    result.message = '页面仍在加载中，需要等待';
    result.needsWait = true;
    return result;
  }
  
  // 页面已加载但 URL 不匹配
  result.step = 4;
  result.message = '页面已加载但 URL 不匹配，可能需要使用 new_page';
  result.needsWait = false;
  result.needsNewPage = true;
  return result;
}

/**
 * 查找并点击点赞按钮
 * 使用方式：evaluate_script({function: clickLikeButton})
 */
function clickLikeButton() {
  const buttons = Array.from(document.querySelectorAll('*'));
  const likeButton = buttons.find(btn => {
    const desc = btn.getAttribute('description') || '';
    const ariaLabel = btn.getAttribute('aria-label') || '';
    return desc.includes('点赞') || ariaLabel.includes('点赞');
  });
  
  if (likeButton) {
    likeButton.click();
    return {
      success: true,
      message: '已点击点赞按钮'
    };
  }
  
  return {
    success: false,
    message: '未找到点赞按钮'
  };
}

/**
 * 查找并点击收藏按钮
 * 使用方式：evaluate_script({function: clickFavoriteButton})
 */
function clickFavoriteButton() {
  const buttons = Array.from(document.querySelectorAll('*'));
  const favButton = buttons.find(btn => {
    const desc = btn.getAttribute('description') || '';
    const ariaLabel = btn.getAttribute('aria-label') || '';
    return desc.includes('收藏') || ariaLabel.includes('收藏');
  });
  
  if (favButton) {
    favButton.click();
    return {
      success: true,
      message: '已点击收藏按钮'
    };
  }
  
  return {
    success: false,
    message: '未找到收藏按钮'
  };
}

/**
 * 在收藏对话框中查找并选择文件夹
 * 使用方式：evaluate_script({function: selectFavoriteFolder, args: ["学习"]})
 */
function selectFavoriteFolder(folderName) {
  // 查找收藏对话框
  const dialog = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('添加到收藏夹')
  );
  
  if (!dialog) {
    return {
      success: false,
      message: '未找到收藏对话框'
    };
  }
  
  // 查找文件夹
  const allItems = Array.from(dialog.querySelectorAll('*'));
  const folderItem = allItems.find(item => {
    const text = (item.textContent || '').trim();
    return text === folderName;
  });
  
  if (folderItem) {
    // 尝试点击
    folderItem.click();
    
    // 检查确定按钮是否可用
    const confirmButton = Array.from(dialog.querySelectorAll('button')).find(btn => 
      btn.textContent && btn.textContent.includes('确定')
    );
    
    return {
      success: true,
      message: `已选择文件夹: ${folderName}`,
      confirmButtonEnabled: confirmButton && !confirmButton.disabled
    };
  }
  
  return {
    success: false,
    message: `未找到文件夹: ${folderName}`
  };
}

/**
 * 点击收藏对话框的确定按钮
 * 使用方式：evaluate_script({function: clickFavoriteConfirm})
 */
function clickFavoriteConfirm() {
  const dialog = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('添加到收藏夹')
  );
  
  if (!dialog) {
    return {
      success: false,
      message: '未找到收藏对话框'
    };
  }
  
  const confirmButton = Array.from(dialog.querySelectorAll('button')).find(btn => 
    btn.textContent && btn.textContent.includes('确定') && !btn.disabled
  );
  
  if (confirmButton) {
    confirmButton.click();
    return {
      success: true,
      message: '已点击确定按钮'
    };
  }
  
  return {
    success: false,
    message: '未找到可用的确定按钮'
  };
}

/**
 * 完整的点赞操作流程
 * 使用方式：evaluate_script({function: performLikeOperation})
 */
function performLikeOperation() {
  const result = {
    step: 1,
    message: '开始点赞操作',
    success: false
  };
  
  // 查找点赞按钮
  const buttons = Array.from(document.querySelectorAll('*'));
  const likeButton = buttons.find(btn => {
    const desc = btn.getAttribute('description') || '';
    return desc.includes('点赞');
  });
  
  if (!likeButton) {
    result.message = '未找到点赞按钮';
    return result;
  }
  
  // 获取当前点赞数
  const likeText = likeButton.querySelector('.video-like-info');
  const previousCount = likeText ? likeText.textContent : null;
  
  // 点击点赞按钮
  likeButton.click();
  
  result.step = 2;
  result.message = '已点击点赞按钮';
  result.previousCount = previousCount;
  result.success = true;
  
  return result;
}

/**
 * 完整的收藏操作流程
 * 使用方式：evaluate_script({function: performFavoriteOperation, args: ["学习"]})
 */
function performFavoriteOperation(folderName) {
  const result = {
    step: 1,
    message: '开始收藏操作',
    success: false,
    folderName: folderName
  };
  
  // 步骤 1: 点击收藏按钮
  const buttons = Array.from(document.querySelectorAll('*'));
  const favButton = buttons.find(btn => {
    const desc = btn.getAttribute('description') || '';
    return desc.includes('收藏');
  });
  
  if (!favButton) {
    result.message = '未找到收藏按钮';
    return result;
  }
  
  favButton.click();
  result.step = 2;
  result.message = '已点击收藏按钮，等待对话框打开';
  
  // 注意：对话框是异步打开的，需要等待
  // 这里只返回当前状态，实际使用时需要等待后再调用选择文件夹的函数
  
  return result;
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    verifyPageNavigationComplete,
    clickLikeButton,
    clickFavoriteButton,
    selectFavoriteFolder,
    clickFavoriteConfirm,
    performLikeOperation,
    performFavoriteOperation
  };
}
