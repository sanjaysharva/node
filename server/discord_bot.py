
import os
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import discord
from discord import app_commands
from discord.ext import commands
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

# Database connection configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'mysql.railway.internal'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'qJZsyZmXvSNUxeYjsrZIKTIyAuvFMCMk'),
    'database': os.getenv('DB_NAME', 'railway'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

# Create connection pool
try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="discord_bot_pool",
        pool_size=5,
        **DB_CONFIG
    )
    print("✅ Connected to MySQL database")
except Exception as e:
    print(f"❌ Failed to connect to database: {e}")
    db_pool = None

# Bot setup
intents = discord.Intents.default()
intents.members = True
intents.message_content = True
intents.guilds = True
intents.invites = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Storage for invite tracking
invite_cache: Dict[int, Dict[str, int]] = {}

# Admin focused tickets
admin_focused_tickets: Dict[int, str] = {}

# Get admin Discord IDs
ADMIN_DISCORD_IDS = os.getenv('ADMIN_DISCORD_IDS', '').split(',')
ADMIN_DISCORD_IDS = [aid.strip() for aid in ADMIN_DISCORD_IDS if aid.strip()]

MAIN_SERVER_ID = 1416385340922658838

# Database helper functions
def get_db_connection():
    """Get database connection from pool"""
    if db_pool:
        return db_pool.get_connection()
    return None

async def get_user_by_discord_id(discord_id: str):
    """Get user from database by Discord ID"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE discordId = %s", (discord_id,))
        user = cursor.fetchone()
        cursor.close()
        return user
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None
    finally:
        conn.close()

async def update_user_coins(user_id: str, new_balance: int):
    """Update user coins in database"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET coins = %s WHERE id = %s", (new_balance, user_id))
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"Error updating coins: {e}")
        return False
    finally:
        conn.close()

async def update_user(user_id: str, data: dict):
    """Update user data in database"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        set_parts = []
        values = []
        for key, value in data.items():
            set_parts.append(f"{key} = %s")
            values.append(value)
        
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(set_parts)} WHERE id = %s"
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()

async def transfer_coins(from_user_id: str, to_user_id: str, amount: int):
    """Transfer coins between users"""
    conn = get_db_connection()
    if not conn:
        return {'success': False}
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get sender balance
        cursor.execute("SELECT coins FROM users WHERE id = %s", (from_user_id,))
        sender = cursor.fetchone()
        if not sender or sender['coins'] < amount:
            return {'success': False}
        
        # Get receiver balance
        cursor.execute("SELECT coins FROM users WHERE id = %s", (to_user_id,))
        receiver = cursor.fetchone()
        if not receiver:
            return {'success': False}
        
        # Transfer coins
        cursor.execute("UPDATE users SET coins = coins - %s WHERE id = %s", (amount, from_user_id))
        cursor.execute("UPDATE users SET coins = coins + %s WHERE id = %s", (amount, to_user_id))
        
        # Get new balances
        cursor.execute("SELECT coins FROM users WHERE id = %s", (from_user_id,))
        new_from_balance = cursor.fetchone()['coins']
        
        cursor.execute("SELECT coins FROM users WHERE id = %s", (to_user_id,))
        new_to_balance = cursor.fetchone()['coins']
        
        conn.commit()
        cursor.close()
        
        return {
            'success': True,
            'fromBalance': new_from_balance,
            'toBalance': new_to_balance
        }
    except Exception as e:
        print(f"Error transferring coins: {e}")
        return {'success': False}
    finally:
        conn.close()

async def create_support_ticket(ticket_data: dict):
    """Create support ticket in database"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        query = """
        INSERT INTO support_tickets (ticketId, userId, subject, category, priority, description, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'pending')
        """
        
        cursor.execute(query, (
            ticket_id,
            ticket_data['userId'],
            ticket_data['subject'],
            ticket_data['category'],
            ticket_data['priority'],
            ticket_data['description']
        ))
        
        conn.commit()
        cursor.close()
        
        return {'ticketId': ticket_id}
    except Exception as e:
        print(f"Error creating ticket: {e}")
        return None
    finally:
        conn.close()

async def get_support_ticket_by_id(ticket_id: str):
    """Get support ticket by ticket ID"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT st.*, u.username, u.discordId as discordUserId
            FROM support_tickets st
            LEFT JOIN users u ON st.userId = u.id
            WHERE st.ticketId = %s
        """, (ticket_id,))
        ticket = cursor.fetchone()
        cursor.close()
        return ticket
    except Exception as e:
        print(f"Error fetching ticket: {e}")
        return None
    finally:
        conn.close()

async def update_ticket_status(ticket_id: str, status: str):
    """Update support ticket status"""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE support_tickets SET status = %s WHERE ticketId = %s", (status, ticket_id))
        conn.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"Error updating ticket: {e}")
        return False
    finally:
        conn.close()

async def get_user_open_ticket(user_id: str):
    """Get user's open ticket"""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM support_tickets
            WHERE userId = %s AND status = 'open'
            ORDER BY createdAt DESC LIMIT 1
        """, (user_id,))
        ticket = cursor.fetchone()
        cursor.close()
        return ticket
    except Exception as e:
        print(f"Error fetching open ticket: {e}")
        return None
    finally:
        conn.close()

# Bot events
@bot.event
async def on_ready():
    print(f'✅ Discord bot logged in as {bot.user}!')
    
    # Cache invites for all guilds
    for guild in bot.guilds:
        try:
            invites = await guild.invites()
            invite_cache[guild.id] = {invite.code: invite.uses or 0 for invite in invites}
        except Exception as e:
            print(f"Failed to fetch invites for guild {guild.name}: {e}")
    
    # Sync commands
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} command(s)")
    except Exception as e:
        print(f"Failed to sync commands: {e}")

# Slash commands
@bot.tree.command(name="ping", description="Replies with Pong!")
async def ping(interaction: discord.Interaction):
    await interaction.response.send_message("Pong! 🏓")

@bot.tree.command(name="balance", description="Check your coin balance")
@app_commands.describe(user="Check another user's balance (optional)")
async def balance(interaction: discord.Interaction, user: Optional[discord.User] = None):
    target_user = user or interaction.user
    is_own_balance = target_user.id == interaction.user.id
    
    db_user = await get_user_by_discord_id(str(target_user.id))
    if not db_user:
        message = '❌ You must login to the website first: https://axiomer.up.railway.app' if is_own_balance else f'❌ <@{target_user.id}> has not logged in to the website yet.'
        await interaction.response.send_message(message, ephemeral=True)
        return
    
    balance_amount = db_user.get('coins', 0)
    
    embed = discord.Embed(
        title=f'💰 {"Your" if is_own_balance else target_user.name + "\'s"} Coin Balance',
        description=f'**{balance_amount} coins**',
        color=0x7C3AED,
        timestamp=datetime.now()
    )
    embed.set_thumbnail(url=target_user.avatar.url if target_user.avatar else None)
    embed.add_field(name='🏦 Account Status', value='Active', inline=True)
    embed.add_field(name='📊 User ID', value=db_user['id'], inline=True)
    embed.set_footer(text='Axiom Coin System • Use coins to boost your servers!', icon_url=bot.user.avatar.url if bot.user.avatar else None)
    
    await interaction.response.send_message(embed=embed, ephemeral=not is_own_balance)

@bot.tree.command(name="giftcoins", description="Gift coins to another user")
@app_commands.describe(
    user="The user to gift coins to",
    amount="Amount of coins to gift",
    message="Optional message with your gift"
)
async def giftcoins(interaction: discord.Interaction, user: discord.User, amount: int, message: Optional[str] = "Here are some coins!"):
    if amount < 1:
        await interaction.response.send_message('❌ Amount must be at least 1 coin.', ephemeral=True)
        return
    
    if user.id == interaction.user.id:
        await interaction.response.send_message('❌ You cannot gift coins to yourself!', ephemeral=True)
        return
    
    sender = await get_user_by_discord_id(str(interaction.user.id))
    if not sender:
        await interaction.response.send_message('❌ You must login to the website first: https://axiomer.up.railway.app', ephemeral=True)
        return
    
    sender_balance = sender.get('coins', 0)
    if sender_balance < amount:
        await interaction.response.send_message(f'❌ You only have **{sender_balance} coins**. You need **{amount} coins** to complete this gift.', ephemeral=True)
        return
    
    receiver = await get_user_by_discord_id(str(user.id))
    if not receiver:
        await interaction.response.send_message(f'❌ <@{user.id}> must login to the website first to receive coins.', ephemeral=True)
        return
    
    result = await transfer_coins(sender['id'], receiver['id'], amount)
    
    if not result['success']:
        await interaction.response.send_message('❌ Failed to transfer coins. Please try again.', ephemeral=True)
        return
    
    embed = discord.Embed(
        title='🎁 Coins Gifted!',
        description=f'<@{interaction.user.id}> gifted **{amount} coins** to <@{user.id}>',
        color=0x7C3AED,
        timestamp=datetime.now()
    )
    embed.add_field(name='💝 Amount', value=f'{amount} coins', inline=True)
    embed.add_field(name='💬 Message', value=message, inline=False)
    embed.add_field(name='💵 Your New Balance', value=f'{result["fromBalance"]} coins', inline=True)
    embed.set_footer(text='Axiom Coin System', icon_url=bot.user.avatar.url if bot.user.avatar else None)
    
    await interaction.response.send_message(embed=embed)
    
    # Notify receiver
    try:
        receiver_embed = discord.Embed(
            title='🎁 You Received a Gift!',
            description=f'<@{interaction.user.id}> sent you **{amount} coins**!',
            color=0x7C3AED,
            timestamp=datetime.now()
        )
        receiver_embed.add_field(name='💝 Amount', value=f'{amount} coins', inline=True)
        receiver_embed.add_field(name='💵 Your New Balance', value=f'{result["toBalance"]} coins', inline=True)
        receiver_embed.add_field(name='💬 Message', value=message, inline=False)
        receiver_embed.set_footer(text='Axiom Coin System', icon_url=bot.user.avatar.url if bot.user.avatar else None)
        
        await user.send(embed=receiver_embed)
    except:
        print(f'Could not send gift notification to {user.name}')

@bot.tree.command(name="support", description="Contact Axiom support team")
@app_commands.describe(message="Your support message")
async def support(interaction: discord.Interaction, message: str):
    discord_user_id = str(interaction.user.id)
    username = interaction.user.name
    guild_name = interaction.guild.name if interaction.guild else 'Direct Message'
    
    user = await get_user_by_discord_id(discord_user_id)
    if not user:
        await interaction.response.send_message('❌ Please login to the website first: https://axiomer.up.railway.app', ephemeral=True)
        return
    
    ticket = await create_support_ticket({
        'userId': user['id'],
        'subject': 'Support Request',
        'category': 'general',
        'priority': 'medium',
        'description': message
    })
    
    if not ticket:
        await interaction.response.send_message('❌ Failed to create support ticket. Please try again later.', ephemeral=True)
        return
    
    await interaction.response.send_message('✅ Your support request has been submitted! Our team will respond via DM within 24 hours.', ephemeral=True)
    
    # Send DM confirmation
    try:
        dm_embed = discord.Embed(
            title='🎫 Support Ticket Created',
            description='Thank you for contacting Axiom Support. Your ticket has been received and our team will respond shortly.',
            color=0x7C3AED,
            timestamp=datetime.now()
        )
        dm_embed.add_field(name='📋 Ticket ID', value=f'`{ticket["ticketId"]}`', inline=True)
        dm_embed.add_field(name='📝 Your Message', value=message[:1024], inline=False)
        dm_embed.add_field(name='⏰ Expected Response Time', value='Within 24 hours', inline=True)
        dm_embed.set_footer(text='Axiom Support • Professional Discord Services', icon_url=bot.user.avatar.url if bot.user.avatar else None)
        
        await interaction.user.send(embed=dm_embed)
    except:
        print(f'Could not send DM confirmation to {username}')
    
    # Notify admins
    for admin_id in ADMIN_DISCORD_IDS:
        try:
            admin_user = await bot.fetch_user(int(admin_id))
            admin_embed = discord.Embed(
                title='🎫 New Support Ticket',
                description='A new support ticket has been submitted.',
                color=0x7C3AED,
                timestamp=datetime.now()
            )
            admin_embed.add_field(name='🎫 Ticket ID', value=f'`{ticket["ticketId"]}`', inline=True)
            admin_embed.add_field(name='👤 User', value=username, inline=True)
            admin_embed.add_field(name='🆔 Discord ID', value=f'`{discord_user_id}`', inline=True)
            admin_embed.add_field(name='🏠 Server', value=guild_name, inline=True)
            admin_embed.add_field(name='📝 Message', value=message[:1024], inline=False)
            admin_embed.set_footer(text=f'Ticket: {ticket["ticketId"]}', icon_url=bot.user.avatar.url if bot.user.avatar else None)
            
            await admin_user.send(embed=admin_embed)
        except:
            print(f'Could not notify admin {admin_id}')

# DM handling
@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    # Only handle DMs
    if not isinstance(message.channel, discord.DMChannel):
        await bot.process_commands(message)
        return
    
    author_id = str(message.author.id)
    message_content = message.content.strip()
    is_admin = author_id in ADMIN_DISCORD_IDS
    
    # Admin commands
    if is_admin:
        # Command: .ticketid open
        if message_content.upper().endswith(' OPEN'):
            parts = message_content.split()
            if len(parts) == 2 and parts[0].startswith('.'):
                ticket_id = parts[0][1:].upper()
                
                ticket = await get_support_ticket_by_id(ticket_id)
                if not ticket:
                    await message.add_reaction('❌')
                    await message.reply(f'❌ Ticket `{ticket_id}` not found.')
                    return
                
                await update_ticket_status(ticket_id, 'open')
                admin_focused_tickets[message.author.id] = ticket_id
                
                embed = discord.Embed(
                    title='🎫 Ticket Opened',
                    description=f'You are now focused on ticket `{ticket_id}`',
                    color=0x7C3AED,
                    timestamp=datetime.now()
                )
                embed.add_field(name='👤 User', value=ticket.get('username', 'Unknown'), inline=True)
                embed.add_field(name='🆔 Discord ID', value=ticket.get('discordUserId', 'N/A'), inline=True)
                embed.add_field(name='📋 Category', value=ticket['category'], inline=True)
                embed.add_field(name='📌 Subject', value=ticket['subject'], inline=False)
                embed.add_field(name='📝 Description', value=ticket['description'][:1024], inline=False)
                embed.add_field(name='💬 Reply', value='Use `.msg <your message>` to reply', inline=False)
                embed.set_footer(text='Axiom Support System', icon_url=bot.user.avatar.url if bot.user.avatar else None)
                
                await message.add_reaction('✅')
                await message.reply(embed=embed)
                
                # Notify user
                if ticket.get('discordUserId'):
                    try:
                        user = await bot.fetch_user(int(ticket['discordUserId']))
                        user_embed = discord.Embed(
                            title='🎫 Support Ticket Opened',
                            description='An admin is now reviewing your ticket.',
                            color=0x7C3AED,
                            timestamp=datetime.now()
                        )
                        user_embed.add_field(name='📋 Ticket ID', value=f'`{ticket_id}`', inline=True)
                        user_embed.set_footer(text='Axiom Support', icon_url=bot.user.avatar.url if bot.user.avatar else None)
                        
                        await user.send(embed=user_embed)
                    except:
                        pass
                return
        
        # Command: .ticketid close
        if message_content.upper().endswith(' CLOSE'):
            parts = message_content.split()
            if len(parts) == 2 and parts[0].startswith('.'):
                ticket_id = parts[0][1:].upper()
                
                ticket = await get_support_ticket_by_id(ticket_id)
                if not ticket:
                    await message.add_reaction('❌')
                    await message.reply(f'❌ Ticket `{ticket_id}` not found.')
                    return
                
                await update_ticket_status(ticket_id, 'closed')
                
                if admin_focused_tickets.get(message.author.id) == ticket_id:
                    del admin_focused_tickets[message.author.id]
                
                embed = discord.Embed(
                    title='🔒 Ticket Closed',
                    description=f'Ticket `{ticket_id}` has been closed.',
                    color=0x7C3AED,
                    timestamp=datetime.now()
                )
                
                await message.add_reaction('✅')
                await message.reply(embed=embed)
                return
        
        # Command: .msg <message>
        if message_content.startswith('.msg '):
            focused_ticket_id = admin_focused_tickets.get(message.author.id)
            
            if not focused_ticket_id:
                await message.add_reaction('❌')
                await message.reply('❌ No focused ticket. Use `.ticketid open` first.')
                return
            
            ticket = await get_support_ticket_by_id(focused_ticket_id)
            if not ticket or not ticket.get('discordUserId'):
                await message.add_reaction('❌')
                await message.reply('❌ Could not find user for this ticket.')
                return
            
            admin_message = message_content[5:].strip()
            if not admin_message:
                await message.add_reaction('❌')
                await message.reply('❌ Please provide a message.')
                return
            
            try:
                user = await bot.fetch_user(int(ticket['discordUserId']))
                
                user_embed = discord.Embed(
                    title='💬 Message from Axiom Support',
                    description=admin_message,
                    color=0x7C3AED,
                    timestamp=datetime.now()
                )
                user_embed.add_field(name='📋 Ticket ID', value=f'`{focused_ticket_id}`', inline=True)
                user_embed.set_footer(text='Axiom Support Team', icon_url=bot.user.avatar.url if bot.user.avatar else None)
                
                await user.send(embed=user_embed)
                await message.add_reaction('✅')
            except:
                await message.add_reaction('❌')
                await message.reply('❌ Failed to send message to user.')
            return
    
    # User messages
    if not is_admin:
        user = await get_user_by_discord_id(author_id)
        
        if not user:
            embed = discord.Embed(
                title='👋 Welcome to Axiom Support',
                description='You need to create an account first.',
                color=0x7C3AED,
                timestamp=datetime.now()
            )
            embed.add_field(name='🌐 Get Started', value='[Visit our website](https://axiomer.up.railway.app)', inline=False)
            embed.set_footer(text='Axiom Support', icon_url=bot.user.avatar.url if bot.user.avatar else None)
            
            await message.reply(embed=embed)
            return
        
        open_ticket = await get_user_open_ticket(user['id'])
        
        if not open_ticket:
            await message.reply('📬 No active ticket. Create one at https://axiomer.up.railway.app/help-center')
            return
        
        # Forward to admins
        for admin_id in ADMIN_DISCORD_IDS:
            try:
                admin = await bot.fetch_user(int(admin_id))
                
                admin_embed = discord.Embed(
                    title='💬 New Message from User',
                    description=message_content[:2048],
                    color=0x7C3AED,
                    timestamp=datetime.now()
                )
                admin_embed.add_field(name='🎫 Ticket ID', value=f'`{open_ticket["ticketId"]}`', inline=True)
                admin_embed.add_field(name='👤 User', value=message.author.name, inline=True)
                admin_embed.add_field(name='🆔 Discord ID', value=f'`{author_id}`', inline=True)
                admin_embed.set_footer(text=f'Ticket: {open_ticket["ticketId"]}', icon_url=bot.user.avatar.url if bot.user.avatar else None)
                
                await admin.send(embed=admin_embed)
            except:
                pass
        
        await message.add_reaction('✅')
        
        confirm_embed = discord.Embed(
            title='✅ Message Sent',
            description='Your message has been delivered to our support team.',
            color=0x7C3AED,
            timestamp=datetime.now()
        )
        confirm_embed.add_field(name='📋 Ticket ID', value=f'`{open_ticket["ticketId"]}`', inline=True)
        
        await message.reply(embed=confirm_embed)
    
    await bot.process_commands(message)

# Member join event
@bot.event
async def on_member_join(member):
    try:
        guild = member.guild
        
        # Track invites
        cached_invites = invite_cache.get(guild.id, {})
        new_invites = await guild.invites()
        
        used_invite = None
        for invite in new_invites:
            cached_uses = cached_invites.get(invite.code, 0)
            if invite.uses > cached_uses:
                used_invite = invite
                break
        
        # Update cache
        invite_cache[guild.id] = {inv.code: inv.uses or 0 for inv in new_invites}
        
        # Award coins to inviter
        if used_invite and used_invite.inviter:
            inviter_user = await get_user_by_discord_id(str(used_invite.inviter.id))
            if inviter_user:
                coins_to_award = 3
                new_balance = inviter_user.get('coins', 0) + coins_to_award
                updated_invite_count = inviter_user.get('inviteCount', 0) + 1
                
                await update_user_coins(inviter_user['id'], new_balance)
                await update_user(inviter_user['id'], {'inviteCount': updated_invite_count})
                
                try:
                    await used_invite.inviter.send(
                        f'🎉 You earned {coins_to_award} coins for inviting {member.name} to {guild.name}! Balance: {new_balance} coins. Total invites: {updated_invite_count}'
                    )
                except:
                    pass
        
        # Award welcome bonus to new member
        new_member_user = await get_user_by_discord_id(str(member.id))
        if new_member_user:
            welcome_bonus = 2
            new_member_balance = new_member_user.get('coins', 0) + welcome_bonus
            
            await update_user_coins(new_member_user['id'], new_member_balance)
            await update_user(new_member_user['id'], {
                'serversJoined': new_member_user.get('serversJoined', 0) + 1
            })
            
            try:
                await member.send(f'Welcome to {guild.name}! 🎉 You received {welcome_bonus} coins as a welcome bonus!')
            except:
                pass
    
    except Exception as e:
        print(f'Error in on_member_join: {e}')

# Start bot
def start_discord_bot():
    bot_token = os.getenv('DISCORD_BOT_TOKEN')
    if not bot_token:
        print('❌ DISCORD_BOT_TOKEN not found')
        return
    
    try:
        bot.run(bot_token)
    except Exception as e:
        print(f'❌ Failed to start bot: {e}')

if __name__ == '__main__':
    start_discord_bot()
