import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
# 使用更明确的 CORS 配置
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
# 或者允许所有源进行测试：
# CORS(app, resources={r"/api/*": {"origins": "*"}})

# 从环境变量读取 OpenAI 兼容 API 的信息 (推荐做法)
# 你需要在你的环境中设置这些变量，例如在 .env 文件中或直接在操作系统中设置
OPENAI_COMPATIBLE_API_URL = os.getenv("OPENAI_COMPATIBLE_API_URL")
OPENAI_COMPATIBLE_API_KEY = os.getenv("OPENAI_COMPATIBLE_API_KEY")

# === 占位/模拟 API 信息 (你需要替换成真实的值或从环境变量读取) ===
# OPENAI_COMPATIBLE_API_URL = "YOUR_OPENAI_COMPATIBLE_API_ENDPOINT_HERE" # 例如 "https://api.example.com/v1/chat/completions"
# OPENAI_COMPATIBLE_API_KEY = "YOUR_API_KEY_HERE" # 非常重要：不要将真实密钥硬编码在此处提交！
# =====================================================================

@app.route('/')
def hello_world():
    return 'Hello, World! This is the AI Grader backend with CORS enabled.'

@app.route('/api/greet', methods=['GET'])
def greet():
    name = "AI Grader User"
    return jsonify(message=f"Hello, {name}! This message is from your Flask backend.")

@app.route('/api/grade', methods=['POST'])
def grade_submission():
    OPENAI_COMPATIBLE_API_URL = os.getenv("OPENAI_COMPATIBLE_API_URL")
    OPENAI_COMPATIBLE_API_KEY = os.getenv("OPENAI_COMPATIBLE_API_KEY")

    if not OPENAI_COMPATIBLE_API_URL or not OPENAI_COMPATIBLE_API_KEY:
        return jsonify(error="API URL or Key is not configured in the backend."), 500

    try:
        data = request.json
        if not data:
            return jsonify(error="No data provided in the request body"), 400

        image_data_from_frontend = data.get('imageData') # Expecting base64 data URL
        prompt_text = data.get('prompt')

        if not image_data_from_frontend or not prompt_text:
            return jsonify(error="Missing imageData or prompt in the request"), 400
        
        # This is the variable that should be used in the payload
        final_image_data_url = image_data_from_frontend 

        print(f"Received prompt: {prompt_text}")
        print(f"Image data (first 100 chars): {final_image_data_url[:100]}...")

        headers = {
            "Authorization": f"Bearer {OPENAI_COMPATIBLE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4.1", 
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt_text
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                # Ensure this uses the correctly defined variable
                                "url": final_image_data_url 
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 8192
        }

        print(f"Sending non-stream request to: {OPENAI_COMPATIBLE_API_URL}")
        
        proxies = {"http": None, "https": None}
        
        external_api_response = requests.post(
            OPENAI_COMPATIBLE_API_URL,
            headers=headers,
            json=payload,
            proxies=proxies,
            timeout=30 
        )

        if external_api_response.status_code != 200:
            error_content = external_api_response.text
            try: 
                error_json = external_api_response.json()
                error_content = json.dumps(error_json)
            except json.JSONDecodeError:
                pass 
            print(f"Error from external API: {external_api_response.status_code} - {error_content}")
            return jsonify(error=f"External API Error ({external_api_response.status_code}): {error_content}"), external_api_response.status_code

        try:
            ai_result = external_api_response.json()
            print("Successfully received and parsed JSON response from external API.")
            
            if ai_result and isinstance(ai_result.get('choices'), list) and len(ai_result['choices']) > 0:
                message = ai_result['choices'][0].get('message')
                if message and isinstance(message.get('content'), str):
                    ai_content = message['content']
                    print("-------------------- AI Generated Content (Backend) --------------------");
                    print(ai_content)
                    print("----------------------------------------------------------------------");
            
            return jsonify(ai_result), 200
        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON from external API: {e}")
            print(f"Raw response text: {external_api_response.text[:500]}...")
            return jsonify(error="Failed to parse response from AI service.", details=external_api_response.text[:200]), 500

    except requests.exceptions.RequestException as e:
        print(f"Error calling OpenAI compatible API: {e}")
        return jsonify(error=f"Failed to call AI service: {str(e)}"), 503
    except Exception as e:
        print(f"An unexpected error occurred in /api/grade: {e}")
        import traceback
        traceback.print_exc() # This will print the full traceback to the Flask console
        return jsonify(error=f"An unexpected server error occurred: {str(e)}"), 500

if __name__ == '__main__':
    # 确保 host='0.0.0.0'以便从外部（例如前端容器或局域网）访问，尽管对于 localhost 可能不是必需的
    # 但有时有助于解决一些本地网络解析问题。
    app.run(debug=True, host='0.0.0.0', port=5000) 