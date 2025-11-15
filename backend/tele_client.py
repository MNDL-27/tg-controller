"""
tele_client.py
Telethon MTProto client wrapper for accessing user's Telegram account
"""

from telethon import TelegramClient, events
from telethon.tl.types import User, Chat, Channel
from telethon.errors import SessionPasswordNeededError
import os


class TelegramMTProtoClient:
    """Wrapper for Telethon client with user authentication"""
    
    def __init__(self, api_id, api_hash, session_name='tg_session'):
        self.api_id = api_id
        self.api_hash = api_hash
        self.session_name = session_name
        self.client = None
        self.phone = None
        self.phone_code_hash = None
        
    async def initialize(self):
        """Initialize Telethon client"""
        self.client = TelegramClient(self.session_name, self.api_id, self.api_hash)
        await self.client.connect()
        return await self.client.is_user_authorized()
    
    async def send_code_request(self, phone):
        """Send verification code to phone number"""
        self.phone = phone
        sent_code = await self.client.send_code_request(phone)
        self.phone_code_hash = sent_code.phone_code_hash
        return {
            'success': True,
            'phone': phone,
            'phone_code_hash': sent_code.phone_code_hash
        }
    
    async def sign_in(self, code, password=None):
        """Sign in with verification code and optional 2FA password"""
        try:
            await self.client.sign_in(self.phone, code, phone_code_hash=self.phone_code_hash)
            return {'success': True, 'requires_2fa': False}
        except SessionPasswordNeededError:
            if password:
                await self.client.sign_in(password=password)
                return {'success': True, 'requires_2fa': False}
            else:
                return {'success': False, 'requires_2fa': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def is_authorized(self):
        """Check if user is logged in"""
        return await self.client.is_user_authorized()
    
    async def get_me(self):
        """Get current user's profile information"""
        me = await self.client.get_me()
        return {
            'id': me.id,
            'first_name': me.first_name,
            'last_name': me.last_name,
            'username': me.username,
            'phone': me.phone,
            'is_bot': me.bot,
            'verified': me.verified,
            'restricted': me.restricted,
            'premium': getattr(me, 'premium', False)
        }
    
    async def get_dialogs(self, limit=100):
        """Get all user's chats, groups, and channels"""
        dialogs = await self.client.get_dialogs(limit=limit)
        
        result = []
        for dialog in dialogs:
            entity = dialog.entity
            
            chat_info = {
                'id': dialog.id,
                'name': dialog.name,
                'unread_count': dialog.unread_count,
                'is_pinned': dialog.pinned,
                'date': dialog.date.isoformat() if dialog.date else None
            }
            
            # Determine chat type and add specific info
            if isinstance(entity, User):
                chat_info['type'] = 'user'
                chat_info['username'] = entity.username
                chat_info['is_bot'] = entity.bot
            elif isinstance(entity, Chat):
                chat_info['type'] = 'group'
                chat_info['participants_count'] = getattr(entity, 'participants_count', None)
            elif isinstance(entity, Channel):
                chat_info['type'] = 'channel' if entity.broadcast else 'supergroup'
                chat_info['username'] = entity.username
                chat_info['participants_count'] = getattr(entity, 'participants_count', None)
                chat_info['verified'] = entity.verified
            
            result.append(chat_info)
        
        return result
    
    async def get_messages(self, chat_id, limit=50):
        """Get messages from a specific chat"""
        messages = await self.client.get_messages(chat_id, limit=limit)
        
        result = []
        for msg in messages:
            if msg.text:  # Only include text messages for simplicity
                message_info = {
                    'id': msg.id,
                    'text': msg.text,
                    'date': msg.date.isoformat(),
                    'out': msg.out,  # True if sent by current user
                    'sender_id': msg.sender_id
                }
                
                # Add sender info if available
                if msg.sender:
                    sender = msg.sender
                    message_info['sender'] = {
                        'id': sender.id,
                        'first_name': getattr(sender, 'first_name', None),
                        'username': getattr(sender, 'username', None)
                    }
                
                result.append(message_info)
        
        return result
    
    async def send_message(self, chat_id, text):
        """Send a message to a chat"""
        sent = await self.client.send_message(chat_id, text)
        return {
            'id': sent.id,
            'text': sent.text,
            'date': sent.date.isoformat(),
            'chat_id': chat_id
        }
    
    async def logout(self):
        """Log out and clear session"""
        if self.client:
            await self.client.log_out()
    
    async def disconnect(self):
        """Disconnect client"""
        if self.client:
            await self.client.disconnect()
