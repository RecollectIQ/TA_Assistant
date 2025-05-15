import requests
import json
import os

# It's good practice for services to be able to access necessary configurations,
# but for now, we'll assume API URL and KEY are passed in or read by the service itself if needed.

class LLMServiceError(Exception):
    """Custom exception for LLM service errors."""
    def __init__(self, message, status_code=None, details=None):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.details = details

def call_llm_api(
    api_url: str,
    api_key: str,
    model: str,
    prompt_text: str,
    image_data_url: str | None = None,  # Optional for pure text, required for vision
    max_tokens: int = 8192,
    timeout: int = 30
) -> dict:
    """
    Calls a generic OpenAI-compatible LLM API, supporting vision if image_data_url is provided.

    Args:
        api_url: The full URL of the LLM API endpoint.
        api_key: The API key for authentication.
        model: The model name to use (e.g., "gpt-4.1", "gpt-4-vision-preview").
        prompt_text: The main text prompt.
        image_data_url: Optional. Base64 data URL for the image if using a vision model.
        max_tokens: The maximum number of tokens to generate.
        timeout: Request timeout in seconds.

    Returns:
        The JSON response from the LLM API as a dictionary.

    Raises:
        LLMServiceError: If the API call fails or returns an error.
    """
    if not api_url or not api_key:
        # This check can also be done before calling, but good to have defense in depth
        raise LLMServiceError("API URL or Key is not configured.", status_code=500)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    messages_content = [{"type": "text", "text": prompt_text}]
    if image_data_url:
        messages_content.append({
            "type": "image_url",
            "image_url": {"url": image_data_url}
        })

    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": messages_content
            }
        ],
        "max_tokens": max_tokens
    }

    print(f"LLM Service: Sending request to: {api_url} with model: {model}")
    # To avoid printing very long base64 strings in logs for images:
    # print(f"LLM Service: Prompt: {prompt_text}")
    # if image_data_url:
    #     print(f"LLM Service: Image data (first 100 chars): {image_data_url[:100]}...")


    # Standard practice to avoid issues with system-wide proxy settings if not needed
    proxies = {"http": None, "https": None}

    try:
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            proxies=proxies,
            timeout=timeout
        )

        if response.status_code != 200:
            error_content = response.text
            try:
                error_json = response.json()
                error_content = json.dumps(error_json) # Or format it nicely
            except json.JSONDecodeError:
                # If response is not JSON, use raw text
                pass
            print(f"LLM Service Error: API returned {response.status_code} - {error_content}")
            raise LLMServiceError(
                message=f"External LLM API Error ({response.status_code})",
                status_code=response.status_code,
                details=error_content 
            )

        try:
            result_json = response.json()
            print("LLM Service: Successfully received and parsed JSON response from external API.")
            return result_json
        except json.JSONDecodeError as e:
            print(f"LLM Service Error: Failed to decode JSON from external API: {e}")
            print(f"LLM Service: Raw response text (first 500 chars): {response.text[:500]}...")
            raise LLMServiceError(
                message="Failed to parse JSON response from LLM service.",
                status_code=500, # Internal server error type
                details=response.text[:500] # Provide snippet of raw response
            )

    except requests.exceptions.RequestException as e:
        print(f"LLM Service Error: Request to LLM API failed: {e}")
        raise LLMServiceError(f"Failed to connect to LLM service: {str(e)}", status_code=503) # Service Unavailable
    except Exception as e: # Catch any other unexpected errors
        print(f"LLM Service Error: An unexpected error occurred: {e}")
        raise LLMServiceError(f"An unexpected error occurred in LLM service: {str(e)}", status_code=500)

# Example usage (for testing this module directly, if needed):
# if __name__ == \'__main__\':
#     load_dotenv(dotenv_path=\'../.env\') # Assuming .env is in the parent (backend) directory
#     test_api_url = os.getenv("OPENAI_COMPATIBLE_API_URL")
#     test_api_key = os.getenv("OPENAI_COMPATIBLE_API_KEY")
#     test_prompt = "Describe this image."
#     # You\'d need a test base64 image data URL here
#     # test_image_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." 
# 
#     if not test_api_url or not test_api_key:
#         print("Please set OPENAI_COMPATIBLE_API_URL and OPENAI_COMPATIBLE_API_KEY in backend/.env for testing.")
#     else:
#         try:
#             # Example for a text-only model
#             # response_data = call_llm_api(test_api_url, test_api_key, "gpt-3.5-turbo", "Hello, who are you?")
#             # print("API Response (text-only):", json.dumps(response_data, indent=2))
#
#             # Example for a vision model (requires a valid test_image_url)
#             # if test_image_url:
#             #     response_data_vision = call_llm_api(test_api_url, test_api_key, "gpt-4-vision-preview", test_prompt, image_data_url=test_image_url)
#             #     print("API Response (vision):", json.dumps(response_data_vision, indent=2))
#             # else:
#             #     print("Skipping vision test as test_image_url is not set.")
#             print("LLM Service module loaded. Uncomment and configure example usage if needed.")
#         except LLMServiceError as e:
#             print(f"Error during test call: {e.message}, Status: {e.status_code}, Details: {e.details}") 