#!/usr/bin/env python3
"""
快照文件解析工具
用于解析 take_snapshot 生成的快照文件，快速查找元素
"""

import re
import sys
from typing import List, Dict, Optional

def parse_snapshot_file(file_path: str) -> List[Dict]:
    """
    解析快照文件，返回元素列表
    
    Args:
        file_path: 快照文件路径
        
    Returns:
        元素列表，每个元素包含 uid, type, text, description 等信息
    """
    elements = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # 解析行格式: uid=1_0 RootWebArea "title" url="..."
                match = re.match(r'uid=([^\s]+)\s+(\w+)\s+"([^"]*)"', line)
                if match:
                    uid = match.group(1)
                    element_type = match.group(2)
                    text = match.group(3)
                    
                    # 提取 description
                    desc_match = re.search(r'description="([^"]*)"', line)
                    description = desc_match.group(1) if desc_match else ''
                    
                    # 提取 url
                    url_match = re.search(r'url="([^"]*)"', line)
                    url = url_match.group(1) if url_match else ''
                    
                    elements.append({
                        'uid': uid,
                        'type': element_type,
                        'text': text,
                        'description': description,
                        'url': url,
                        'line': line
                    })
    except FileNotFoundError:
        print(f"文件未找到: {file_path}")
        return []
    except Exception as e:
        print(f"解析文件时出错: {e}")
        return []
    
    return elements

def find_elements_by_text(elements: List[Dict], text: str, case_sensitive: bool = False) -> List[Dict]:
    """
    通过文本内容查找元素
    
    Args:
        elements: 元素列表
        text: 要搜索的文本
        case_sensitive: 是否区分大小写
        
    Returns:
        匹配的元素列表
    """
    if not case_sensitive:
        text = text.lower()
    
    results = []
    for elem in elements:
        elem_text = elem['text'].lower() if not case_sensitive else elem['text']
        elem_desc = elem['description'].lower() if not case_sensitive else elem['description']
        
        if text in elem_text or text in elem_desc:
            results.append(elem)
    
    return results

def find_like_button(elements: List[Dict]) -> Optional[Dict]:
    """查找点赞按钮"""
    keywords = ['点赞', 'like', '1.']
    for keyword in keywords:
        results = find_elements_by_text(elements, keyword)
        for elem in results:
            if '点赞' in elem['description'] or 'like' in elem['description'].lower():
                return elem
    return None

def find_favorite_button(elements: List[Dict]) -> Optional[Dict]:
    """查找收藏按钮"""
    keywords = ['收藏', 'fav', '2.']
    for keyword in keywords:
        results = find_elements_by_text(elements, keyword)
        for elem in results:
            if '收藏' in elem['description'] or 'fav' in elem['description'].lower():
                return elem
    return None

def find_favorite_folder(elements: List[Dict], folder_name: str) -> Optional[Dict]:
    """查找收藏夹中的文件夹"""
    results = find_elements_by_text(elements, folder_name)
    for elem in results:
        # 查找 listitem 或包含文件夹名的元素
        if elem['type'] == 'listitem' or '学习' in elem['text']:
            return elem
    return None

def main():
    """命令行工具入口"""
    if len(sys.argv) < 2:
        print("用法: python snapshot-parser.py <快照文件路径> [搜索文本]")
        print("示例: python snapshot-parser.py snapshot.txt '点赞'")
        sys.exit(1)
    
    file_path = sys.argv[1]
    elements = parse_snapshot_file(file_path)
    
    if len(sys.argv) == 2:
        # 只解析文件，显示统计信息
        print(f"共解析 {len(elements)} 个元素")
        print("\n常见元素:")
        like_btn = find_like_button(elements)
        if like_btn:
            print(f"  点赞按钮: uid={like_btn['uid']}, text={like_btn['text'][:30]}")
        
        fav_btn = find_favorite_button(elements)
        if fav_btn:
            print(f"  收藏按钮: uid={fav_btn['uid']}, text={fav_btn['text'][:30]}")
    else:
        # 搜索文本
        search_text = sys.argv[2]
        results = find_elements_by_text(elements, search_text)
        print(f"找到 {len(results)} 个匹配元素:")
        for elem in results[:10]:  # 只显示前10个
            print(f"  uid={elem['uid']}, type={elem['type']}, text={elem['text'][:50]}")

if __name__ == '__main__':
    main()
