
#!/usr/bin/env python3
import multiprocessing
import os
import sys

def run_discord_bot():
    """Run the main Discord bot"""
    from discord_bot import start_discord_bot
    start_discord_bot()

def run_quest_bot():
    """Run the quest bot"""
    from quest_bot import start_quest_bot
    start_quest_bot()

if __name__ == '__main__':
    # Check if tokens are available
    discord_token = os.getenv('DISCORD_BOT_TOKEN')
    quest_token = os.getenv('BOT2_TOKEN')
    
    if not discord_token:
        print('⚠️  DISCORD_BOT_TOKEN not set - main bot will not start')
    
    if not quest_token:
        print('⚠️  BOT2_TOKEN not set - quest bot will not start')
    
    processes = []
    
    # Start main Discord bot
    if discord_token:
        p1 = multiprocessing.Process(target=run_discord_bot, name='DiscordBot')
        p1.start()
        processes.append(p1)
        print('✅ Started main Discord bot process')
    
    # Start quest bot
    if quest_token:
        p2 = multiprocessing.Process(target=run_quest_bot, name='QuestBot')
        p2.start()
        processes.append(p2)
        print('✅ Started quest bot process')
    
    # Wait for all processes
    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        print('\n⏹️  Stopping bots...')
        for p in processes:
            p.terminate()
        sys.exit(0)
