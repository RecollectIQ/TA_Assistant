import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import json
import re # Import re for regex
from services.llm_service import call_llm_api, LLMServiceError

load_dotenv()

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # 允许非ASCII字符在JSON中

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

        # Call the llm_service
        # Note: The model "gpt-4.1" is hardcoded here as per previous app.py logic.
        # Consider making the model name configurable if needed.
        ai_result = call_llm_api(
            api_url=OPENAI_COMPATIBLE_API_URL,
            api_key=OPENAI_COMPATIBLE_API_KEY,
            model="gpt-4.1", 
            prompt_text=prompt_text,
            image_data_url=final_image_data_url,
            max_tokens=8192 # Default from previous logic
        )

        # Process the successful response
        # ai_result is the parsed JSON from the LLM service
        ai_content_markdown = None # Initialize
        
        if ai_result and isinstance(ai_result.get('choices'), list) and len(ai_result['choices']) > 0:
            message = ai_result['choices'][0].get('message')
            if message and isinstance(message.get('content'), str):
                ai_content_markdown = message['content'] # This is NOW expected to be the Markdown string from LLM
                print("-------------------- AI Generated Markdown Content (Backend) --------------------");
                print(ai_content_markdown)
                print("-----------------------------------------------------------------------------");
        
        if ai_content_markdown:
            # Return the extracted Markdown content directly
            return jsonify(feedbackMarkdown=ai_content_markdown), 200
        else:
            # Handle case where markdown content couldn't be extracted as expected
            print("Error: Could not extract Markdown content from LLM response or response structure was unexpected.")
            # Log the actual ai_result for debugging if content is not found
            print(f"Full LLM service response for debugging: {ai_result}")
            return jsonify(error="Failed to get valid Markdown feedback from AI service. Check backend logs."), 500

    except LLMServiceError as e:
        print(f"LLMServiceError in /api/grade: {e.message}, Status: {e.status_code}, Details: {e.details}")
        # Return a more structured error to the client
        error_response = {"error": e.message}
        if e.details:
            # Attempt to parse details if it's a JSON string, otherwise include as is
            try:
                error_response["details"] = json.loads(e.details) if isinstance(e.details, str) else e.details
            except json.JSONDecodeError:
                error_response["details"] = e.details
        
        # Use the status code from the exception if available, otherwise default to 500
        # The llm_service already tries to provide relevant HTTP status codes
        return jsonify(error_response), e.status_code if e.status_code else 500
    
    except Exception as e: # Catch-all for other unexpected errors in this route
        print(f"An unexpected error occurred in /api/grade: {e}")
        import traceback
        traceback.print_exc() 
        return jsonify(error=f"An unexpected server error occurred: {str(e)}"), 500

@app.route('/api/analyze_answer', methods=['POST'])
def analyze_standard_answer():
    if not OPENAI_COMPATIBLE_API_URL or not OPENAI_COMPATIBLE_API_KEY:
        return jsonify(error="API URL or Key is not configured in the backend."), 500

    try:
        data = request.json
        if not data:
            return jsonify(error="No data provided in the request body"), 400

        image_data_from_frontend = data.get('imageData') # Expecting base64 data URL

        if not image_data_from_frontend:
            return jsonify(error="Missing imageData in the request"), 400
        
        final_image_data_url = image_data_from_frontend

        print(f"Received image for standard answer analysis.")
        # print(f"Image data (first 100 chars): {final_image_data_url[:100]}...") # Keep this commented or short for cleaner logs

        analysis_prompt = """You are an AI assistant. Your task is to analyze the provided image, which represents a standard answer to a question. Extract all key components, concepts, steps, or pieces of information present in the answer. Present this information in a structured format (e.g., bullet points, numbered list, or a simple JSON structure) that would be easy for a teacher to use to create a detailed grading rubric. For example, if it's a math problem, identify the steps and the final answer. If it's a diagram, identify the key labels and relationships. If you provide a JSON structure for the rubric, ensure it is a valid JSON and enclosed in a markdown JSON code block like ```json ... ```."""

        ai_result_from_service = call_llm_api(
            api_url=OPENAI_COMPATIBLE_API_URL,
            api_key=OPENAI_COMPATIBLE_API_KEY,
            model="gpt-4.1", # Ensure this model is supported by your API endpoint
            prompt_text=analysis_prompt,
            image_data_url=final_image_data_url,
            max_tokens=8192 
        )

        print("Successfully received and parsed JSON response from LLM service for answer analysis.")
        
        ai_content = None
        suggested_rubric_json_str = None

        if ai_result_from_service and isinstance(ai_result_from_service.get('choices'), list) and len(ai_result_from_service['choices']) > 0:
            message = ai_result_from_service['choices'][0].get('message')
            if message and isinstance(message.get('content'), str):
                ai_content = message['content']
                print("-------------------- AI Generated Analysis (Backend) --------------------");
                print(ai_content) # Log the full AI content
                print("-------------------------------------------------------------------------");

                # Attempt to extract JSON from the AI content
                # This regex looks for a markdown JSON code block
                match = re.search(r"```json\s*([\s\S]*?)\s*```", ai_content, re.DOTALL)
                if match:
                    extracted_json_str = match.group(1).strip()
                    try:
                        # Validate and prettify the JSON
                        parsed_json = json.loads(extracted_json_str)
                        suggested_rubric_json_str = json.dumps(parsed_json, indent=2)
                        print("Successfully extracted and validated suggested Rubric JSON.")
                    except json.JSONDecodeError as je:
                        print(f"Failed to parse extracted JSON for rubric: {je}")
                        print(f"Extracted string was: {extracted_json_str}")
                        # Keep ai_content as is, suggested_rubric_json_str will remain None or be the raw (potentially invalid) string
                        # For robustness, you might want to pass the raw string if parsing fails and let frontend decide
                        suggested_rubric_json_str = extracted_json_str # Or set to None if only valid JSON is desired

        response_data = {
            "llmResponse": ai_result_from_service, # The full response from the LLM service
            "analyzedText": ai_content, # The textual content part of the LLM response
            "suggestedRubricJson": suggested_rubric_json_str # The extracted and prettified JSON rubric string, or None
        }
        
        return jsonify(response_data), 200

    except LLMServiceError as e:
        print(f"LLMServiceError in /api/analyze_answer: {e.message}, Status: {e.status_code}, Details: {e.details}")
        error_response = {"error": e.message}
        if e.details:
            try:
                error_response["details"] = json.loads(e.details) if isinstance(e.details, str) else e.details
            except json.JSONDecodeError:
                error_response["details"] = e.details
        return jsonify(error_response), e.status_code if e.status_code else 500
    
    except Exception as e:
        print(f"An unexpected error occurred in /api/analyze_answer: {e}")
        import traceback
        traceback.print_exc()
        return jsonify(error=f"An unexpected server error occurred: {str(e)}"), 500

@app.route('/api/test_connection', methods=['POST'])
def test_connection():
    """Test API connection with provided credentials."""
    try:
        data = request.json
        if not data:
            return jsonify(error="No data provided"), 400

        api_url = data.get('apiUrl')
        api_key = data.get('apiKey')
        model_name = data.get('modelName')

        if not api_url or not api_key or not model_name:
            return jsonify(error="Missing required parameters"), 400

        # Test with a simple prompt
        test_prompt = "Hello, this is a connection test."
        
        # Use the provided model instead of hardcoded one
        ai_result = call_llm_api(
            api_url=api_url,
            api_key=api_key,
            model=model_name,
            prompt_text=test_prompt,
            image_data_url=None,  # No image for connection test
            max_tokens=50
        )

        # Check if we got a valid response
        if ai_result and isinstance(ai_result.get('choices'), list) and len(ai_result['choices']) > 0:
            return jsonify({
                "success": True,
                "message": "API connection successful",
                "model": model_name
            }), 200
        else:
            return jsonify(error="Invalid response format from API"), 500

    except LLMServiceError as e:
        print(f"Connection test failed: {e.message}")
        return jsonify(error=e.message), e.status_code if e.status_code else 500
    except Exception as e:
        print(f"Connection test error: {e}")
        return jsonify(error=str(e)), 500

# Explicitly print registered routes for debugging
# This should be placed after all route definitions and before the app.run() call if __name__ == '__main__'
print("\n--- Debug: Checking registered routes before app.run() ---")
with app.app_context():
    print("Explicitly Registered Routes by app.url_map:")
    rules = sorted(app.url_map.iter_rules(), key=lambda r: str(r))
    for rule in rules:
        print(f"  Endpoint: {rule.endpoint}, Methods: {sorted(list(rule.methods))}, Path: {str(rule)}")
    print("--- End of Debug: Registered routes ---\n")

if __name__ == '__main__':
    # 确保 host='0.0.0.0'以便从外部（例如前端容器或局域网）访问，尽管对于 localhost 可能不是必需的
    # 但有时有助于解决一些本地网络解析问题。
    # The debug prints above will execute when this script is run directly OR when loaded by Flask CLI for FLASK_APP=backend.app
    app.run(debug=True, host='0.0.0.0', port=5000) 
    # Force Load