# Blender 操作总结（更新）

## 本次导出包含
- Earth（程序化地球材质）
- WhiteCat（贴图材质，含眼睛/耳朵）
- BlackCat（同款白猫复制 + 通过节点让毛色变黑但保留五官）

## 关键经验
- **黑猫贴图复用前提是 UV 一致**：若 UV 不一致，贴图无法对齐五官；最稳方案是复用同一模型/UV。
- **导出成果必须进子文件夹**：统一放入 `results/blender-operations/`，并提供 README/SUMMARY。
