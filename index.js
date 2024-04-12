import { ethers, formatUnits } from 'ethers';
import { Telegraf } from 'telegraf';
import contractABI from './rebaseABI.json' assert { type: "json" };
import fs from 'fs';
import 'dotenv/config';
import { CON_ADDR } from './constant.js';

const nodeUrl = process.env.BASE_NODE;
console.log(nodeUrl, 'nodeUrl');
const testChatId = process.env.CHAT_ID;
const botToken = process.env.BOT_TOKEN;

const provider = new ethers.JsonRpcProvider(nodeUrl);
const contractAddress = CON_ADDR;
const contract = new ethers.Contract(contractAddress, contractABI, provider);
const bot = new Telegraf(botToken);

const helpMessage = `
🤖 BaseG Rebase Alert Bot 🤖 

🚀 Serial Number: BGRAB2024-001 🚀

ℹ️ About Me:
I am here to keep you updated on the next rebase timestamp, the current rebase count and also alert the community when they receive a juicy rebase!

🍇 Stay tuned for juicy rebases!

🔔 Available Commands:
/rebasecount - Get the current rebase count.
/wenrebase - Get the timestamp of the next rebase.
/help - Get information about available commands and how to use them.

🔧 How to Use:
1. Type one of the available commands listed above.
2. Make sure to mention @BasegRAbot when using a command in the group.
3. Enjoy the updates and stay informed about BaseG rebases!

©️ Built and Designed by Theo
`;

bot.command('help', (ctx) => {

    ctx.replyWithMarkdown(helpMessage);
});

contract.on('LogRebase', async () => {
    try {
        const rebC = await contract.rebaseCount();
        const toSUp = await contract.totalSupply();

        const nextRebaseTime = await contract.nextRebaseTimeStamp();
        const timestampString = nextRebaseTime.toString();

        const currentTime = Math.floor(Date.now() / 1000);
        const countdownSeconds = timestampString - currentTime;

        const days = Math.floor(countdownSeconds / (60 * 60 * 24));
        const hours = Math.floor((countdownSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((countdownSeconds % (60 * 60)) / 60);
        const seconds = countdownSeconds % 60;
        const countdownString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

        const rebasePercent = 10;
        const coS = toSUp;
        const toS = formatUnits(coS, 9);

        const alertMessage = `
        🚀 *That Rebase Stimuli just hit Baby!!!* 💵
        New Rebase Stimuli from the Federal Reserves of $BASEG

        📈 *Rebase Epoch:* ${rebC}
        💰 *New Supply:* ${toS}
        📊 * Today's Rebase %:* ${rebasePercent}%
        
        🕒 *Next Rebase:* ${countdownString}
        `;

        const gif = fs.readFileSync('./Rebase.mp4');

        await bot.telegram.sendAnimation(testChatId, { source: gif }, { caption: alertMessage, parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling LogRebase event:', error);
    }
});

// bot.command('heee', async (ctx) => {
//     try {
//         const rebC = await contract.rebaseCount();
//         const toSUp = await contract.totalSupply();
//         const nextRebaseTime = await contract.nextRebaseTimeStamp();
//         const formattedTime = new Date(parseInt(nextRebaseTime) * 1000).toDateString();

//         const rebasePercent = 10;
//         const coS = toSUp;
//         const toS = formatUnits(coS, 9);

//         const alertMessage = `
//         🚀 *That Rebase Stimuli just hit Baby!!!* 💵
//         New Rebase Stimuli from the Federal Reserves of $BASEG

//         📈 *Rebase Epoch:* ${rebC}
//         💰 *New Supply:* ${toS}
//         📊 * Today's Rebase %:* ${rebasePercent}%

//         🕒 *Next Rebase:* ${formattedTime}
//         `;

//         const gif = fs.readFileSync('./Rebase.mp4');

//         await bot.telegram.sendAnimation(testChatId, { source: gif }, { caption: alertMessage, parse_mode: 'Markdown' });
//     } catch (error) {
//         console.error('Error handling LogRebase event:', error);
//     }
// });

bot.command('rebasecount', async (ctx) => {
    try {
        if (ctx.chat.type !== 'supergroup' && ctx.chat.type !== 'group') {
            await ctx.reply('❗️Please use the BaseG group to access this command.');
            return;
        }

        const rebC = await contract.rebaseCount();
        const alertMessage = `📈 Rebase Epoch: ${rebC}`;

        await bot.telegram.sendMessage(testChatId, alertMessage);
    } catch (error) {
        console.error('Error fetching rebase count:', error.message);
        await ctx.reply('❌ Error fetching rebase count. Please try again later.');
    }
});

bot.command('wenrebase', async (ctx) => {
    try {
        if (ctx.chat.type !== 'supergroup' && ctx.chat.type !== 'group') {
            await ctx.reply('❗️Please use the BaseG group to access this command.');
            return;
        }
        
        const nextRebaseTime = await contract.nextRebaseTimeStamp();
        const timestampString = nextRebaseTime.toString();

        const currentTime = Math.floor(Date.now() / 1000);
        const countdownSeconds = timestampString - currentTime;

        const days = Math.floor(countdownSeconds / (60 * 60 * 24));
        const hours = Math.floor((countdownSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((countdownSeconds % (60 * 60)) / 60);
        const seconds = countdownSeconds % 60;

        // Format the countdown string
        const countdownString = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
        if (countdownString < `${0} days, ${0} hours, ${0} minutes, ${1} seconds`) {
            await ctx.reply(`🕒 Rebase happening any time from now`);
        } else {
            await ctx.reply(`🕒 Next Rebase Timestamp: ${countdownString}`);
        }
    } catch (error) {
        console.error('Error fetching next rebase timestamp:', error.message);
        await ctx.reply('❌ Error fetching next rebase timestamp. Please try again later.');
    }
});

bot.start(async (ctx) => {
    try {
        ctx.reply(helpMessage);
    } catch (error) {
        console.error('Error fetching start command line:', error.message);
        await ctx.reply('❌ Error fetching start command line. Please try again later.')
    }
});

bot.launch();
