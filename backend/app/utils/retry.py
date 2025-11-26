"""
Retry utility with exponential backoff for API calls
"""
import asyncio
import time
from typing import Callable, Any, TypeVar
from functools import wraps

T = TypeVar('T')


async def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0,
    *args,
    **kwargs
) -> Any:
    """
    Retry a function with exponential backoff
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds (will be exponentially increased)
        *args: Positional arguments for func
        **kwargs: Keyword arguments for func
    
    Returns:
        Result of func if successful
    
    Raises:
        Last exception if all retries fail
    """
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            if asyncio.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            else:
                return func(*args, **kwargs)
        except Exception as e:
            last_exception = e
            
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                print(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                print(f"All {max_retries} attempts failed.")
    
    raise last_exception
