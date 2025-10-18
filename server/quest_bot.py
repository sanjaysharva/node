
import os
from datetime import datetime
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
        pool_name="quest_bot_pool",
        pool_size=3,
        **DB_CONFIG
    )
    print("✅ Quest Bot connected to MySQL database")
except Exception as e:
    print(f"❌ Failed to connect to database: {e}")
    db_pool = None

# Bot setup
intents = discord.Intents.default()
intents.guilds = True
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Guild settings storage
guild_settings = {}

# Database helper
def get_db_connection():
    if db_pool:
        return db_pool.get_connection()
    return None

@bot.event
async def on_ready():
    print(f'✅ Quest Bot logged in as {bot.user}!')
    
    try:
        synced = await bot.tree.sync()
        print(f'Synced {len(synced)} quest bot command(s)')
    except Exception as e:
        print(f'Failed to sync quest bot commands: {e}')

# Slash commands
@bot.tree.command(name="setquestchannel", description="Set the channel for quest completion notifications")
@app_commands.describe(channel="Channel to send quest notifications")
async def setquestchannel(interaction: discord.Interaction, channel: discord.TextChannel):
    if not interaction.user.guild_permissions.manage_channels:
        await interaction.response.send_message('❌ You need **Manage Channels** permission.', ephemeral=True)
        return
    
    guild_id = interaction.guild.id
    if guild_id not in guild_settings:
        guild_settings[guild_id] = {}
    
    guild_settings[guild_id]['questClaimChannelId'] = channel.id
    
    embed = discord.Embed(
        title='✅ Quest Channel Set',
        description=f'Quest completion notifications will now be sent to {channel.mention}',
        color=0x00ff00,
        timestamp=datetime.now()
    )
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="setboostchannel", description="Set the channel for boost notifications")
@app_commands.describe(channel="Channel to send boost notifications")
async def setboostchannel(interaction: discord.Interaction, channel: discord.TextChannel):
    if not interaction.user.guild_permissions.manage_channels:
        await interaction.response.send_message('❌ You need **Manage Channels** permission.', ephemeral=True)
        return
    
    guild_id = interaction.guild.id
    if guild_id not in guild_settings:
        guild_settings[guild_id] = {}
    
    guild_settings[guild_id]['boostChannelId'] = channel.id
    
    embed = discord.Embed(
        title='✅ Boost Channel Set',
        description=f'Server boost notifications will now be sent to {channel.mention}',
        color=0x00ff00,
        timestamp=datetime.now()
    )
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="removequestchannel", description="Remove quest notification channel")
async def removequestchannel(interaction: discord.Interaction):
    if not interaction.user.guild_permissions.manage_channels:
        await interaction.response.send_message('❌ You need **Manage Channels** permission.', ephemeral=True)
        return
    
    guild_id = interaction.guild.id
    settings = guild_settings.get(guild_id, {})
    
    if 'questClaimChannelId' not in settings:
        await interaction.response.send_message('❌ No quest channel is currently set.', ephemeral=True)
        return
    
    del settings['questClaimChannelId']
    guild_settings[guild_id] = settings
    
    embed = discord.Embed(
        title='✅ Quest Channel Removed',
        description='Quest completion notifications have been disabled.',
        color=0xff6b6b,
        timestamp=datetime.now()
    )
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="removeboostchannel", description="Remove boost notification channel")
async def removeboostchannel(interaction: discord.Interaction):
    if not interaction.user.guild_permissions.manage_channels:
        await interaction.response.send_message('❌ You need **Manage Channels** permission.', ephemeral=True)
        return
    
    guild_id = interaction.guild.id
    settings = guild_settings.get(guild_id, {})
    
    if 'boostChannelId' not in settings:
        await interaction.response.send_message('❌ No boost channel is currently set.', ephemeral=True)
        return
    
    del settings['boostChannelId']
    guild_settings[guild_id] = settings
    
    embed = discord.Embed(
        title='✅ Boost Channel Removed',
        description='Server boost notifications have been disabled.',
        color=0xff6b6b,
        timestamp=datetime.now()
    )
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="questsettings", description="View current quest notification settings")
async def questsettings(interaction: discord.Interaction):
    guild_id = interaction.guild.id
    settings = guild_settings.get(guild_id, {})
    
    quest_channel_id = settings.get('questClaimChannelId')
    boost_channel_id = settings.get('boostChannelId')
    prefix = settings.get('prefix', '!')
    
    embed = discord.Embed(
        title='🎯 Quest Bot Settings',
        color=0x7c3aed,
        timestamp=datetime.now()
    )
    
    embed.add_field(
        name='🎉 Quest Channel',
        value=f'<#{quest_channel_id}>' if quest_channel_id else 'Not set',
        inline=True
    )
    embed.add_field(
        name='🚀 Boost Channel',
        value=f'<#{boost_channel_id}>' if boost_channel_id else 'Not set',
        inline=True
    )
    embed.add_field(
        name='⚙️ Command Prefix',
        value=prefix,
        inline=True
    )
    
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="setprefix", description="Set command prefix for page information commands")
@app_commands.describe(prefix="New command prefix (e.g., '!')")
async def setprefix(interaction: discord.Interaction, prefix: str):
    if not interaction.user.guild_permissions.manage_guild:
        await interaction.response.send_message('❌ You need **Manage Server** permission.', ephemeral=True)
        return
    
    if len(prefix) > 3:
        await interaction.response.send_message('❌ Prefix must be 3 characters or less.', ephemeral=True)
        return
    
    guild_id = interaction.guild.id
    if guild_id not in guild_settings:
        guild_settings[guild_id] = {}
    
    guild_settings[guild_id]['prefix'] = prefix
    
    embed = discord.Embed(
        title='✅ Prefix Updated',
        description=f'Command prefix is now set to: `{prefix}`\n\nTry: `{prefix}page home` or `{prefix}page servers`',
        color=0x00ff00,
        timestamp=datetime.now()
    )
    
    await interaction.response.send_message(embed=embed)

# Message commands for page info
@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    if not message.guild:
        return
    
    guild_id = message.guild.id
    settings = guild_settings.get(guild_id, {})
    prefix = settings.get('prefix', '!')
    
    if not message.content.startswith(prefix):
        await bot.process_commands(message)
        return
    
    args = message.content[len(prefix):].strip().split()
    if not args:
        await bot.process_commands(message)
        return
    
    command = args[0].lower()
    
    if command == 'page':
        await handle_page_command(message, args[1:] if len(args) > 1 else [])
    
    await bot.process_commands(message)

async def handle_page_command(message, args):
    if not args:
        await message.reply('Usage: `!page <page_name>` (e.g., `!page home`, `!page servers`)')
        return
    
    page_name = args[0].lower()
    base_url = os.getenv('APP_URL', 'https://axiomer.up.railway.app')
    
    # Simple page info (in production, this would fetch from API)
    pages = {
        'home': {
            'title': 'Axiom - Discord Server Discovery',
            'description': 'Discover and promote your Discord servers',
            'url': '/'
        },
        'servers': {
            'title': 'Explore Servers',
            'description': 'Browse amazing Discord servers',
            'url': '/explore'
        },
        'bots': {
            'title': 'Discord Bots',
            'description': 'Find powerful Discord bots',
            'url': '/explore'
        },
        'quests': {
            'title': 'Daily Quests',
            'description': 'Complete quests to earn coins',
            'url': '/quest'
        },
        'store': {
            'title': 'Coin Store',
            'description': 'Spend your coins on boosts',
            'url': '/store'
        }
    }
    
    page_info = pages.get(page_name)
    if not page_info:
        await message.reply(f'❌ Page "{page_name}" not found. Available pages: home, servers, bots, store, quests')
        return
    
    embed = discord.Embed(
        title=f'📄 {page_info["title"]}',
        description=page_info['description'],
        color=0x7c3aed,
        timestamp=datetime.now(),
        url=f'{base_url}{page_info["url"]}'
    )
    
    await message.reply(embed=embed)

# Quest notification function
async def send_quest_notification(guild_id: int, user_id: str, quest_data: dict):
    try:
        settings = guild_settings.get(guild_id, {})
        channel_id = settings.get('questClaimChannelId')
        
        if not channel_id:
            return
        
        channel = bot.get_channel(channel_id)
        if not channel:
            return
        
        embed = discord.Embed(
            title='🎉 Quest Completed!',
            description=f'**{quest_data["userTag"]}** completed the **{quest_data["questName"]}** quest!',
            color=0x00ff00,
            timestamp=datetime.now()
        )
        embed.add_field(name='💰 Reward', value=f'{quest_data["reward"]} coins', inline=True)
        embed.add_field(name='💳 New Balance', value=f'{quest_data["newBalance"]} coins', inline=True)
        
        await channel.send(embed=embed)
    except Exception as e:
        print(f'Error sending quest notification: {e}')

# Boost notification function
async def send_boost_notification(guild_id: int, user_tag: str, started: bool):
    try:
        settings = guild_settings.get(guild_id, {})
        channel_id = settings.get('boostChannelId')
        
        if not channel_id:
            return
        
        channel = bot.get_channel(channel_id)
        if not channel:
            return
        
        embed = discord.Embed(
            title='🚀 Server Boosted!' if started else '😢 Boost Ended',
            description=f'**{user_tag}** {"started boosting" if started else "stopped boosting"} the server!',
            color=0xff69b4 if started else 0x8b949e,
            timestamp=datetime.now()
        )
        
        await channel.send(embed=embed)
    except Exception as e:
        print(f'Error sending boost notification: {e}')

# Start bot
def start_quest_bot():
    bot_token = os.getenv('BOT2_TOKEN')
    if not bot_token:
        print('❌ BOT2_TOKEN not found')
        return
    
    try:
        bot.run(bot_token)
    except Exception as e:
        print(f'❌ Failed to start quest bot: {e}')

if __name__ == '__main__':
    start_quest_bot()
