# Blender 项目导出文件（更新）

## 项目文件
- `earth_and_cats.blend`：完整 Blender 项目（包含 Earth / WhiteCat / BlackCat，及灯光相机）

## 模型文件（glTF 2.0，分离格式）
- `earth.gltf` + `earth.bin`
- `whitecat.gltf` + `whitecat.bin`
- `blackcat.gltf` + `blackcat.bin`

## 材质与资源
- `cat_texture_diffuse.png`：白猫贴图（同时用于白猫与黑猫材质逻辑）
- `materials_info.json`：材质节点结构导出（便于排查/复现）

## 场景备注
- `BlackCat_Orig`：保留了原 AI 生成黑猫（UV 不同，已隐藏），当前导出的 `BlackCat` 为“同款白猫复制 + 毛色变黑但保留五官”的版本。

## 注意
- glTF 分离格式需要同时保留 `.gltf` 与 `.bin`。
