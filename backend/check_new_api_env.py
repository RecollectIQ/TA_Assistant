#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
测试 .env 中 OpenAI 兼容 API 配置是否有效的脚本
(针对 New API 的 /v1/chat/completions 图文混合输入 - 支持流式响应)
"""

import os
import json
import requests
import base64
import mimetypes # 用于从文件名推断 MIME 类型
from dotenv import load_dotenv

def get_image_data_url(image_path):
    """读取本地图片并转换为 data URL"""
    if not os.path.exists(image_path):
        print(f"❌ 错误: 本地图片文件未找到: {image_path}")
        return None
    
    # 从文件扩展名推断 MIME 类型
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith("image"):
        # 如果无法推断或不是图片类型，可以尝试默认或给出错误
        print(f"⚠️ 警告: 无法从文件名推断出有效的图片 MIME 类型: {image_path}")
        # 你可以根据需要设置一个默认值，例如 "image/jpeg"，但这可能不准确
        # 或者直接返回 None 或抛出错误
        # 为简单起见，如果无法推断，我们这里可以尝试一个通用类型，但这不推荐用于生产
        # mime_type = "image/jpeg" # 示例默认值，请谨慎使用
        print("     请确保文件是一个有效的图片 (如 .jpg, .png)。")
        return None 

    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return f"data:{mime_type};base64,{encoded_string}"
    except Exception as e:
        print(f"❌ 错误: 读取或编码本地图片时出错: {image_path}, {e}")
        return None

def main():
    print("开始检查 .env 文件中的 OpenAI 兼容 API 配置 (针对 /v1/chat/completions 图文混合，测试流式响应)...\n")
    print("重要提示: 请确保 .env 文件中的 OPENAI_COMPATIBLE_API_URL 指向 New API 的 /v1/chat/completions 端点")
    print("例如: OPENAI_COMPATIBLE_API_URL=\"http://127.0.0.1:3100/v1/chat/completions\"\n")
    
    # --- 用户需要配置本地图片路径 --- START ---
    # 请将下面的路径替换为你电脑上一个实际的图片文件路径
    # 例如: "/Users/yourusername/Pictures/test_image.jpg" 或 "C:\\Users\\yourusername\\Pictures\\test_image.png"
    local_image_path = "/Users/bobby/Desktop/Personal_Project/AI_Grader/backend/1.png" # <<< 在这里修改为你的本地图片路径
    # --- 用户需要配置本地图片路径 --- END ---
    print(f"将使用本地图片: {local_image_path}\n")

    load_dotenv()
    
    api_url = os.getenv("OPENAI_COMPATIBLE_API_URL")
    api_key = os.getenv("OPENAI_COMPATIBLE_API_KEY")
    
    if not api_url:
        print("❌ 错误: OPENAI_COMPATIBLE_API_URL 环境变量未设置或为空")
        print("请确保 .env 文件中包含: OPENAI_COMPATIBLE_API_URL=\"http://<your-new-api-server>/v1/chat/completions\"")
        return
    
    if not api_key:
        print("❌ 错误: OPENAI_COMPATIBLE_API_KEY 环境变量未设置或为空")
        return
    
    print(f"✅ 找到 OPENAI_COMPATIBLE_API_URL: {api_url}")
    print(f"✅ 找到 OPENAI_COMPATIBLE_API_KEY: {'*' * 8 + api_key[-4:] if len(api_key) > 4 else '有效但长度短于4字符'}")
    
    image_data_url_for_api = get_image_data_url(local_image_path)
    if not image_data_url_for_api:
        print("无法处理本地图片，测试中止。")
        return

    print("\n正在向 API (/v1/chat/completions) 发送图文混合流式测试请求 (使用本地图片 base64)...\n")
    
    try:
        if not api_url.endswith("/v1/chat/completions"):
            print(f"⚠️  警告: 当前 API URL ({api_url}) 可能未指向 /v1/chat/completions 端点。")
            print("     请确认 URL 是否正确，例如: http://<your-new-api-server>/v1/chat/completions")

        if not api_url.startswith("http://") and not api_url.startswith("https://"):
            print(f"⚠️  警告: API URL 缺少协议头 (http:// 或 https://), 自动添加 http://")
            api_url = "http://" + api_url
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream"  # 明确接受事件流
        }
        
        payload = {
            "model": "gpt-4.1", 
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "请描述这张图片的内容 (这是一个使用本地图片的流式测试请求)。并讲解相关知识点"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": image_data_url_for_api}
                        }
                    ]
                }
            ],
            "max_tokens": 200, # 调整 token 数量以适应流式讲解
            "stream": True      # 启用流式响应
        }
        
        print(f"请求 URL: {api_url}")
        print(f"请求 Headers: {json.dumps(headers, indent=2, ensure_ascii=False)}")
        print(f"请求 Payload (图片部分已省略): model={payload['model']}, stream={payload['stream']}, messages[0].role={payload['messages'][0]['role']}, text='{payload['messages'][0]['content'][0]['text']}', image_url_type={type(payload['messages'][0]['content'][1]['image_url']['url'])}")

        proxies = {"http": None, "https": None}
        print("已显式禁用代理设置，强制直接连接。")
        
        # 发送流式请求
        response = requests.post(api_url, headers=headers, json=payload, timeout=30, proxies=proxies, stream=True)
        
        print(f"\n响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API 流式请求成功! 开始接收数据流:")
            full_response_content = ""
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith("data: "):
                        data_json_str = decoded_line[len("data: "):]
                        if data_json_str.strip() == "[DONE]":
                            print("\n[DONE] - 数据流结束")
                            break
                        try:
                            chunk = json.loads(data_json_str)
                            # 打印每个数据块的 delta content (如果存在)
                            content_delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                            if content_delta:
                                print(content_delta, end="", flush=True)
                                full_response_content += content_delta
                        except json.JSONDecodeError:
                            print(f"\n⚠️ 无法解析JSON数据块: {data_json_str}")
                    elif decoded_line.strip(): # 打印非 data: 开头的非空行 (可能是错误或元数据)
                        print(f"\n[元数据/其他行]: {decoded_line}")
            
            print("\n\n--- 流式响应接收完毕 ---配置有效。")
            # print(f"\n完整响应内容:\n{full_response_content}") # 可选：打印完整拼接的内容

        else:
            print(f"❌ API 请求失败! 状态码: {response.status_code}")
            print("响应内容:")
            print(response.text[:1000] + "..." if len(response.text) > 1000 else response.text)
            
            if response.status_code == 401 or response.status_code == 403:
                print("\n可能的原因: API 密钥无效或权限不足")
            elif response.status_code == 404:
                print("\n可能的原因: API 端点 URL 不存在或路径错误。确保 URL 指向 /v1/chat/completions")
            elif response.status_code == 400:
                print("\n可能的原因: 请求体 (payload) 格式错误，或者图片数据无法处理 (例如过大、格式不支持)。请仔细检查模型名称、messages 结构、content 数组等是否符合 OpenAI Vision API 规范。")
            elif response.status_code == 500:
                print("\n可能的原因: API 服务器内部错误")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求错误: {str(e)}")
        if "SSLError" in str(e):
            print("\n可能的原因: SSL/TLS 连接问题。如果是本地测试，请确保使用 http:// 而不是 https://，或配置正确的证书")
        elif "ConnectionError" in str(e) or "ConnectTimeout" in str(e):
            print("\n可能的原因: 无法连接到 API 服务器。请检查服务器是否运行，以及 URL 和端口是否正确")
        elif "ProxyError" in str(e):
            print("\n 已尝试显式禁用代理，若仍出现此错误，请检查是否有其他网络层面强制代理。")
    except Exception as e:
        print(f"❌ 发生其他错误: {str(e)}")
    
if __name__ == "__main__":
    main() 