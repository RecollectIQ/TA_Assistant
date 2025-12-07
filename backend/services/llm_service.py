import requests
import json
import os
import logging
import sys
from typing import Optional

# Configure logging to use stderr (more reliable than stdout for background processes)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

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
    image_data_url: Optional[str] = None,  # Optional for pure text, required for vision
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
        "Content-Type": "application/json",
        "Accept-Charset": "utf-8"
    }

    # Build message content - use simple string for text-only, array for multimodal
    if image_data_url:
        messages_content = [
            {"type": "text", "text": prompt_text},
            {"type": "image_url", "image_url": {"url": image_data_url}}
        ]
    else:
        # For text-only, use simple string format (more compatible)
        messages_content = prompt_text

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

    logger.info(f"LLM Service: Sending request to: {api_url} with model: {model}")

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
            logger.error(f"LLM Service Error: API returned {response.status_code} - {error_content}")
            raise LLMServiceError(
                message=f"External LLM API Error ({response.status_code})",
                status_code=response.status_code,
                details=error_content 
            )

        try:
            result_json = response.json()
            logger.info("LLM Service: Successfully received and parsed JSON response from external API.")
            return result_json
        except json.JSONDecodeError as e:
            logger.error(f"LLM Service Error: Failed to decode JSON from external API: {e}")
            # 尝试使用UTF-8编码处理响应
            try:
                raw_text = response.content.decode('utf-8')[:500]
            except:
                raw_text = response.text[:500]
            logger.error(f"LLM Service: Raw response text (first 500 chars): {raw_text}...")
            raise LLMServiceError(
                message="Failed to parse JSON response from LLM service.",
                status_code=500, # Internal server error type
                details=raw_text # Provide snippet of raw response
            )

    except requests.exceptions.RequestException as e:
        logger.error(f"LLM Service Error: Request to LLM API failed: {e}")
        raise LLMServiceError(f"Failed to connect to LLM service: {str(e)}", status_code=503) # Service Unavailable
    except LLMServiceError:
        raise  # Re-raise LLMServiceError as-is
    except Exception as e: # Catch any other unexpected errors
        logger.error(f"LLM Service Error: An unexpected error occurred: {e}")
        raise LLMServiceError(f"An unexpected error occurred in LLM service: {str(e)}", status_code=500)