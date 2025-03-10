"""
OpenAI Service Module

This module handles all interactions with the OpenAI API.
"""

import os
import json
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_openai_api(messages, model="gpt-4.5-preview", response_format=None, max_tokens=1000, temperature=0.3):
    """
    Generic function to call the OpenAI API with error handling.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        model (str): The OpenAI model to use
        response_format (dict, optional): Format specification for the response
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        
    Returns:
        str: The content of the response
        
    Raises:
        Exception: If there's an error calling the API
    """
    try:
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
        
        # Return the content
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        raise

def get_json_response(messages, max_tokens=1000, temperature=0.3):
    """
    Call the OpenAI API and get a JSON response.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        
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
            temperature=temperature
        )
        
        # Parse the JSON response
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {str(e)}")
        print(f"Raw content: {content[:100]}...")  # Print first 100 chars for debugging
        raise
    except Exception as e:
        print(f"Error getting JSON response: {str(e)}")
        raise

def get_text_response(messages, max_tokens=1000, temperature=0.3):
    """
    Call the OpenAI API and get a text response.
    
    Args:
        messages (list): List of message dictionaries for the conversation
        max_tokens (int): Maximum number of tokens in the response
        temperature (float): Temperature parameter for response generation
        
    Returns:
        str: The text response
        
    Raises:
        Exception: If there's an error calling the API
    """
    try:
        return call_openai_api(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
    except Exception as e:
        print(f"Error getting text response: {str(e)}")
        raise
