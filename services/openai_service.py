"""
OpenAI Service Module

This module handles all interactions with the OpenAI API.
"""

import os
import json
import hashlib
from openai import OpenAI
from functools import lru_cache

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Simple in-memory cache for API responses
response_cache = {}

def get_cache_key(messages, model, response_format, max_tokens, temperature):
    """
    Generate a cache key based on the request parameters.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        model (str): The OpenAI model to use
        response_format (dict, optional): Format specification for the response
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        
    Returns:
        str: A hash string to use as cache key
    """
    # Convert messages to a string representation
    messages_str = json.dumps(messages, sort_keys=True)
    
    # Convert response_format to a string representation if it exists
    response_format_str = json.dumps(response_format, sort_keys=True) if response_format else "None"
    
    # Combine all parameters into a single string
    params_str = f"{messages_str}|{model}|{response_format_str}|{max_tokens}|{temperature}"
    
    # Generate a hash of the parameters string
    return hashlib.md5(params_str.encode()).hexdigest()

def call_openai_api(messages, model="gpt-4.5-preview", response_format=None, max_tokens=1000, temperature=0.3, use_cache=True):
    """
    Generic function to call the OpenAI API with error handling.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        model (str): The OpenAI model to use
        response_format (dict, optional): Format specification for the response
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        use_cache (bool): Whether to use the cache for this request
    Returns:
        str: The content of the response
        
    Raises:
        Exception: If there's an error calling the API
    """
    try:
        # Check cache if enabled
        if use_cache:
            cache_key = get_cache_key(messages, model, response_format, max_tokens, temperature)
            if cache_key in response_cache:
                print(f"Cache hit for request with key: {cache_key[:8]}...")
                return response_cache[cache_key]
        
        # Prepare the API call parameters
        params = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        # Add response_format if provided
        if response_format:
            params["response_format"] = response_format
        
        # Call the API
        response = client.chat.completions.create(**params)
        
        # Get the content
        content = response.choices[0].message.content.strip()
        
        # Cache the response if caching is enabled
        if use_cache:
            cache_key = get_cache_key(messages, model, response_format, max_tokens, temperature)
            response_cache[cache_key] = content
            print(f"Cached response with key: {cache_key[:8]}...")
        
        return content
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        raise

def get_json_response(messages, max_tokens=1000, temperature=0.3, use_cache=True):
    """
    Call the OpenAI API and get a JSON response.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        use_cache (bool): Whether to use the cache for this request
    Returns:
        dict: The parsed JSON response
        
    Raises:
        json.JSONDecodeError: If the response cannot be parsed as JSON
        Exception: If there's an error calling the API
    """
    try:
        content = call_openai_api(
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=max_tokens,
            temperature=temperature,
            use_cache=use_cache
        )
        
        # Log the full response for debugging
        print(f"Full JSON response from OpenAI: {content}")
        
        # Try to parse the JSON response
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {str(e)}")
            print(f"Raw content: {content}")
            
            # Attempt to sanitize and fix common JSON formatting issues
            sanitized_content = sanitize_json(content)
            print(f"Sanitized content: {sanitized_content[:100]}...")
            
            # Try parsing the sanitized content
            try:
                return json.loads(sanitized_content)
            except json.JSONDecodeError:
                # If still failing, try a more aggressive approach
                print("Attempting more aggressive JSON repair...")
                try:
                    # Try to extract valid JSON using regex
                    import re
                    json_pattern = re.compile(r'(\{.*\})', re.DOTALL)
                    match = json_pattern.search(content)
                    if match:
                        extracted_json = match.group(1)
                        try:
                            return json.loads(extracted_json)
                        except json.JSONDecodeError:
                            # If still failing, try to sanitize the extracted JSON
                            sanitized_extracted = sanitize_json(extracted_json)
                            return json.loads(sanitized_extracted)
                    else:
                        # If no valid JSON object is found, try to construct a minimal valid JSON
                        # Extract all key-value pairs that look valid
                        print("No valid JSON object found, attempting to construct minimal valid JSON...")
                        return construct_minimal_json(content)
                except Exception as repair_error:
                    print(f"Error in aggressive JSON repair: {str(repair_error)}")
                    # Return a minimal valid JSON as a last resort
                    return {"error": "Failed to parse JSON response", "partial_content": content[:500]}
    except Exception as e:
        print(f"Error getting JSON response: {str(e)}")
        raise

def sanitize_json(content):
    """
    Sanitize JSON content to fix common formatting issues.
    
    Args:
        content (str): The JSON content to sanitize
        
    Returns:
        str: The sanitized JSON content
    """
    import re
    
    # First, let's check if we have an incomplete JSON structure
    # Count opening and closing braces to see if they match
    open_braces = content.count('{')
    close_braces = content.count('}')
    open_brackets = content.count('[')
    close_brackets = content.count(']')
    
    # If we have unbalanced braces or brackets, try to fix the structure
    if open_braces > close_braces:
        # Add missing closing braces
        content += '}' * (open_braces - close_braces)
    
    if open_brackets > close_brackets:
        # Add missing closing brackets
        content += ']' * (open_brackets - close_brackets)
    
    # Replace single quotes with double quotes (common issue)
    content = content.replace("'", '"')
    
    # Fix unquoted property names
    content = re.sub(r'(\s*?)(\w+)(\s*?):', r'\1"\2"\3:', content)
    
    # Fix trailing commas in arrays and objects
    content = re.sub(r',(\s*?[\]}])', r'\1', content)
    
    # Fix missing quotes around string values
    # This is a simplified approach and might not catch all cases
    content = re.sub(r':\s*([^"{}\[\],\d][^{}\[\],]*?)(\s*[,}])', r': "\1"\2', content)
    
    # Fix missing commas between objects in arrays
    # This pattern looks for closing brace followed by opening brace with no comma in between
    content = re.sub(r'}(\s*?){', r'},\1{', content)
    
    # Fix missing commas between properties
    # This pattern looks for a closing quote of a value followed by a property name
    content = re.sub(r'"(\s*?)"', r'",\1"', content)
    
    # Fix missing commas after numeric values
    # This pattern looks for a number followed by a property name
    content = re.sub(r'(\d)(\s*?){', r'\1,\2{', content)
    
    # Fix missing commas after numeric values before a property name
    content = re.sub(r'(\d)(\s*?)"', r'\1,\2"', content)
    
    # Fix specific pattern in the observed error: "keyword": "value" "score": number
    content = re.sub(r'"([^"]+)"(\s*?)"([^"]+)"', r'"\1",\2"\3"', content)
    
    # Fix unterminated strings by adding closing quotes
    # Look for strings that start with a quote but don't end with one before a comma or brace
    content = re.sub(r'"([^"]*?)(\s*?[,}])', r'"\1"\2', content)
    
    # Specifically handle unterminated strings at the end of the content
    # This is a common issue with truncated API responses
    if re.search(r'"[^"]*$', content):
        # Add a closing quote to the unterminated string
        content += '"'
    
    # Fix incomplete JSON objects at the end of the content
    # If the content ends with a property name and value but no closing brace
    if re.search(r'"[^"]+"\s*:\s*("[^"]*"|[\d.]+)\s*$', content):
        content += '}'
    
    # If the content ends with a comma, add a closing brace
    if content.rstrip().endswith(','):
        content = content.rstrip()[:-1] + '}'
    
    # If the content ends with an open brace or bracket, close it
    if content.rstrip().endswith('{'):
        content += '}'
    if content.rstrip().endswith('['):
        content += ']'
    
    # Check for truncated JSON at the end
    # If we have a partial object at the end, try to close it properly
    if '"low_priority": [' in content and not '"low_priority": []' in content:
        # Check if low_priority array is properly closed
        low_priority_pos = content.find('"low_priority": [')
        if low_priority_pos > 0:
            # Count opening and closing brackets after low_priority
            remaining_content = content[low_priority_pos:]
            open_count = remaining_content.count('[')
            close_count = remaining_content.count(']')
            
            if open_count > close_count:
                # The low_priority array is not properly closed
                # Find the last complete object in the array
                last_complete_obj_pos = content.rfind('}', low_priority_pos)
                if last_complete_obj_pos > 0:
                    # Close the array and the main object
                    content = content[:last_complete_obj_pos+1] + ']}'
    
    # Handle the specific case of an unterminated string in a keyword object
    # This pattern looks for a keyword object with an unterminated string
    unterminated_keyword_pattern = re.compile(r'{\s*"keyword":\s*"([^"}]*?)"\s*,\s*"score":\s*([\d.]+)\s*}')
    content = re.sub(unterminated_keyword_pattern, r'{ "keyword": "\1", "score": \2 }', content)
    
    # Handle the specific case of an unterminated string at the end of a keyword array
    # This is the exact issue we're seeing in the logs
    if '"low_priority": [' in content:
        # Find the position of the last complete keyword object in the low_priority array
        low_priority_pos = content.find('"low_priority": [')
        last_obj_start = content.rfind('{ "keyword":', low_priority_pos)
        
        if last_obj_start > 0:
            # Check if this object is properly terminated
            next_closing_brace = content.find('}', last_obj_start)
            if next_closing_brace < 0:
                # The last object is not properly terminated
                # Find the last quote in the object
                last_quote = content.rfind('"', last_obj_start)
                if last_quote > 0:
                    # Check if this is the start of a keyword value
                    keyword_start = content.rfind('"keyword": "', last_obj_start, last_quote)
                    if keyword_start > 0:
                        # This is an unterminated keyword value
                        # Add a closing quote, score, and closing braces
                        content = content[:last_quote+1] + '", "score": 0.50 }]}'
    
    return content

def construct_minimal_json(content):
    """
    Attempt to construct a minimal valid JSON from malformed content.
    
    Args:
        content (str): The malformed JSON content
        
    Returns:
        dict: A minimal valid JSON object with extracted key-value pairs
    """
    import re
    
    # Initialize the result dictionary
    result = {
        "high_priority": [],
        "medium_priority": [],
        "low_priority": []
    }
    
    # Try to extract keyword objects using regex
    # Look for patterns like { "keyword": "value", "score": number }
    keyword_pattern = re.compile(r'{\s*"keyword":\s*"([^"]+)"\s*,\s*"score":\s*([\d.]+)\s*}')
    matches = keyword_pattern.findall(content)
    
    # Also look for patterns with missing commas
    alt_pattern = re.compile(r'{\s*"keyword":\s*"([^"]+)"\s*"score":\s*([\d.]+)\s*}')
    alt_matches = alt_pattern.findall(content)
    
    # Combine all matches
    all_matches = matches + alt_matches
    
    # Determine which priority category each keyword belongs to
    for keyword, score in all_matches:
        score_float = float(score)
        if score_float >= 0.9:
            result["high_priority"].append({"keyword": keyword, "score": score_float})
        elif score_float >= 0.6:
            result["medium_priority"].append({"keyword": keyword, "score": score_float})
        else:
            result["low_priority"].append({"keyword": keyword, "score": score_float})
    
    # If we couldn't extract any keywords, create a minimal structure
    if not any(result.values()):
        # Try to extract any key-value pairs
        key_value_pattern = re.compile(r'"([^"]+)":\s*"([^"]+)"')
        kv_matches = key_value_pattern.findall(content)
        
        # Add these to a fallback section
        if kv_matches:
            result["fallback_extraction"] = {k: v for k, v in kv_matches}
        else:
            # If all else fails, just return an error message
            result["error"] = "Could not extract structured data from response"
            result["raw_content"] = content[:500]  # Include first 500 chars of raw content
    
    return result

def get_text_response(messages, max_tokens=1000, temperature=0.3, use_cache=True):
    """
    Call the OpenAI API and get a text response.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        use_cache (bool): Whether to use the cache for this request
    Returns:
        str: The text response
        
    Raises:
        Exception: If there's an error calling the API
    """
    try:
        return call_openai_api(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            use_cache=use_cache
        )
    except Exception as e:
        print(f"Error getting text response: {str(e)}")
        raise
