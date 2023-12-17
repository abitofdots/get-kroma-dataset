const Web3 = require('web3');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Connect to the Kroma Network RPC
const web3 = new Web3('https://api.kroma.network');

// CSV writer setup
const csvWriter = createCsvWriter({
    path: 'transactions.csv',
    header: [
        {id: 'blockNumber', title: 'BLOCK NUMBER'},
        {id: 'hash', title: 'HASH'},
        {id: 'from', title: 'FROM'},
        {id: 'to', title: 'TO'},
        {id: 'value', title: 'VALUE'},
        {id: 'input', title: 'INPUT DATA'} // Add this line for input data
    ],
    append: true
});

// Function to process blocks
async function processBlocks(startBlock) {
    let currentBlockNumber = await web3.eth.getBlockNumber();
    let transactionsToSave = [];

    for (let i = startBlock; i <= currentBlockNumber; i++) {
        let block = await web3.eth.getBlock(i, true);
        block.transactions.forEach(tx => {
            if (tx.from === tx.to) {
                transactionsToSave.push({
                    blockNumber: tx.blockNumber,
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    input: tx.input // Add this line to include input data
                });
            }
        });

        // Write to CSV every 10000 blocks or at the end
        if (i % 10000 === 0 || i === currentBlockNumber) {
            await csvWriter.writeRecords(transactionsToSave);
            console.log(`Processed and saved transactions up to block ${i}`);
            transactionsToSave = [];
        }
    }
}

// Determine the starting block number
function getStartingBlock() {
    if (fs.existsSync('transactions.csv')) {
        const data = fs.readFileSync('transactions.csv', 'utf8');
        const lines = data.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const lastBlock = lastLine.split(',')[0];
        return Number(lastBlock);
    } else {
        return 1; // Start from block 1 if no file exists
    }
}

// Run the function and log the results
const startBlockNumber = getStartingBlock();
processBlocks(startBlockNumber)
    .then(() => {
        console.log('Finished processing transactions.');
    })
    .catch(error => {
        console.error('Error:', error);
    });
