#!/usr/bin/env python3
"""
main.py
Simple HTTP server for Telegram MTProto client using aiohttp
"""

import json
import os
import sys
from pathlib import Path
from aiohttp import web
import asyncio

from tele_client import TelegramMTProtoClient


# Global client instance
tg_client = None
config = {}


def load_config():
    """Load configuration from config.json"""
    config_path = Path(__file__).parent.parent / 'config.json'
    
    if not config_path.exists():
        print("❌ Error: config.json not found")
        print("Please copy config.json.example to config.json and add your credentials")
        print("\nGet your api_id and api_hash from: https://my.telegram.org/apps")
        sys.exit(1)
    
    with open(config_path, 'r') as f:
        cfg = json.load(f)
    
    if cfg.get('api_id') == 0 or cfg.get('api_hash') == 'your_api_hash_here':
        print("❌ Error: api_id and api_hash not configured")
        print("Please edit config.json and add your Telegram API credentials")
        print("\nGet them from: https://my.telegram.org/apps")
        sys.exit(1)
    
    return cfg


# CORS middleware
@web.middleware
async def cors_middleware(request, handler):
    """Add CORS headers to all responses"""
    if request.method == 'OPTIONS':
        response = web.Response()
    else:
        response = await handler(request)
    
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


# Routes
async def health_check(request):
    """Health check endpoint"""
    return web.json_response({'status': 'ok', 'authorized': await tg_client.is_authorized()})


async def send_code(request):
    """Send verification code to phone number"""
    data = await request.json()
    phone = data.get('phone')
    
    if not phone:
        return web.json_response({'error': 'Phone number required'}, status=400)
    
    try:
        result = await tg_client.send_code_request(phone)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def verify_code(request):
    """Verify code and optionally 2FA password"""
    data = await request.json()
    code = data.get('code')
    password = data.get('password')
    
    if not code:
        return web.json_response({'error': 'Code required'}, status=400)
    
    try:
        result = await tg_client.sign_in(code, password)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def get_me(request):
    """Get current user profile"""
    try:
        if not await tg_client.is_authorized():
            return web.json_response({'error': 'Not authorized'}, status=401)
        
        me = await tg_client.get_me()
        return web.json_response({'user': me})
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def get_chats(request):
    """Get all user chats"""
    try:
        if not await tg_client.is_authorized():
            return web.json_response({'error': 'Not authorized'}, status=401)
        
        limit = int(request.query.get('limit', 100))
        chats = await tg_client.get_dialogs(limit=limit)
        return web.json_response({'chats': chats})
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def get_messages(request):
    """Get messages from a specific chat"""
    try:
        if not await tg_client.is_authorized():
            return web.json_response({'error': 'Not authorized'}, status=401)
        
        chat_id = int(request.match_info['chat_id'])
        limit = int(request.query.get('limit', 50))
        
        messages = await tg_client.get_messages(chat_id, limit=limit)
        return web.json_response({'messages': messages})
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def send_message(request):
    """Send a message to a chat"""
    try:
        if not await tg_client.is_authorized():
            return web.json_response({'error': 'Not authorized'}, status=401)
        
        data = await request.json()
        chat_id = int(data.get('chat_id'))
        text = data.get('text')
        
        if not chat_id or not text:
            return web.json_response({'error': 'chat_id and text required'}, status=400)
        
        result = await tg_client.send_message(chat_id, text)
        return web.json_response({'message': result})
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def logout(request):
    """Log out user"""
    try:
        await tg_client.logout()
        return web.json_response({'success': True})
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


async def init_app():
    """Initialize application"""
    global tg_client, config
    
    print("🚀 Telegram MTProto Client - Starting...")
    print("=" * 50)
    
    # Load config
    config = load_config()
    print(f"✓ Configuration loaded (API ID: {config['api_id']})")
    
    # Initialize Telethon client
    tg_client = TelegramMTProtoClient(
        config['api_id'],
        config['api_hash'],
        config.get('session_name', 'tg_session')
    )
    
    is_authorized = await tg_client.initialize()
    
    if is_authorized:
        me = await tg_client.get_me()
        print(f"✓ Already logged in as: {me['first_name']} (@{me['username']})")
    else:
        print("✓ Telethon client initialized (not logged in yet)")
    
    # Create app
    app = web.Application(middlewares=[cors_middleware])
    
    # Add routes
    app.router.add_get('/health', health_check)
    app.router.add_post('/api/auth/send-code', send_code)
    app.router.add_post('/api/auth/verify', verify_code)
    app.router.add_post('/api/auth/logout', logout)
    app.router.add_get('/api/me', get_me)
    app.router.add_get('/api/chats', get_chats)
    app.router.add_get('/api/chats/{chat_id}/messages', get_messages)
    app.router.add_post('/api/send-message', send_message)
    
    return app


async def cleanup(app):
    """Cleanup on shutdown"""
    if tg_client:
        await tg_client.disconnect()


def main():
    """Main entry point"""
    try:
        app = asyncio.run(init_app())
        
        port = config.get('port', 8080)
        print(f"\n🌐 Server running on http://localhost:{port}")
        print("\nAPI Endpoints:")
        print(f"   POST http://localhost:{port}/api/auth/send-code")
        print(f"   POST http://localhost:{port}/api/auth/verify")
        print(f"   GET  http://localhost:{port}/api/me")
        print(f"   GET  http://localhost:{port}/api/chats")
        print(f"   GET  http://localhost:{port}/api/chats/:id/messages")
        print(f"   POST http://localhost:{port}/api/send-message")
        print(f"\n📱 Open frontend/index.html in your browser\n")
        
        web.run_app(app, host='127.0.0.1', port=port, print=None)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
