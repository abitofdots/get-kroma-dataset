const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// CSV writer setup for mintTxs.csv
const mintCsvWriter = createCsvWriter({
    path: 'mintTxs.csv',
    header: [
        {id: 'blockNumber', title: 'BLOCK NUMBER'},
        {id: 'hash', title: 'HASH'},
        {id: 'from', title: 'FROM'},
        {id: 'to', title: 'TO'},
        {id: 'value', title: 'VALUE'},
        {id: 'input', title: 'INPUT DATA'}
    ],
    append: true
});

// Function to get the last block number from mintTxs.csv
function getLastBlockNumber() {
    if (!fs.existsSync('mintTxs.csv')) {
        return null;
    }

    const data = fs.readFileSync('mintTxs.csv', 'utf8');
    const lines = data.trim().split('\n');
    if (lines.length <= 1) return null; // Only headers or empty file

    const lastLine = lines[lines.length - 1];
    return lastLine.split(',')[0]; // Get the block number from the last line
}

// Function to filter and save mint transactions
function saveMintTransactions() {
    if (!fs.existsSync('transactions.csv')) {
        console.log('transactions.csv not found');
        return;
    }

    const lastBlockNumber = getLastBlockNumber();
    const data = fs.readFileSync('transactions.csv', 'utf8');
    const lines = data.trim().split('\n');
    const mintTransactions = [];

    for (const line of lines) {
        const transaction = line.split(',');
        const blockNumber = transaction[0];
        const input = transaction[5];

        if (lastBlockNumber === null || blockNumber >= lastBlockNumber) {
            if (input === '0x646174613a2c7b2270223a226b72632d3230222c226f70223a226d696e74222c227469636b223a226b726f222c22616d74223a2231303030227d') {
                mintTransactions.push({
                    blockNumber: blockNumber,
                    hash: transaction[1],
                    from: transaction[2],
                    to: transaction[3],
                    value: transaction[4],
                    input: input
                });
            }
        }
    }

    if (mintTransactions.length > 0) {
        mintCsvWriter.writeRecords(mintTransactions)
            .then(() => {
                console.log('Mint transactions saved to mintTxs.csv');
            })
            .catch(error => {
                console.error('Error writing mintTxs.csv:', error);
            });
    } else {
        console.log('No new mint transactions found');
    }
}

// Run the function
saveMintTransactions();
