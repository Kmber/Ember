const colors = require('../UI/colors/colors');

const client = require('../main');


function printBox({ title, lines, color = colors.cyan }) {
    console.log('\n' + '─'.repeat(60));
    console.log(`${color}${colors.bright}${title}${colors.reset}`);
    console.log('─'.repeat(60));
    lines.forEach(line => {
        console.log(`${color}${line}${colors.reset}`);
    });
    console.log('─'.repeat(60) + '\n');
}

async function initializeBot() {
    const BOT_ID = client.user?.id || 'EMBER @1.4.1.0';

    // Removed API key verification - bot can now start without verification
    printBox({
        title: '[ ✅ Bot Initialized ]',
        lines: [
            `Bot ID: ${BOT_ID}`,
            'Your bot is ready to go!',
            'API verification has been removed.'
        ],
        color: colors.green
    });
    return true;
}

module.exports = initializeBot;
