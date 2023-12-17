const Web3 = require('web3');

// Connect to the Kroma Network RPC
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.kroma.network'));

// Your target timestamp (Unix timestamp for your desired date and time)
const targetTimestamp = 1669830000; // Replace with the actual Unix timestamp

async function findClosestBlock(timestamp) {
    let latestBlock = await web3.eth.getBlock('latest');
    let start = 1;
    let end = latestBlock.number;
    let closestBlock = null;
    let closestTimestampDiff = Number.MAX_VALUE;

    while (start <= end) {
        let mid = Math.floor((start + end) / 2);
        let block = await web3.eth.getBlock(mid);

        let timeDiff = Math.abs(block.timestamp - timestamp);
        if (timeDiff < closestTimestampDiff) {
            closestTimestampDiff = timeDiff;
            closestBlock = block.number;
        }

        if (block.timestamp < timestamp) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }

    return closestBlock;
}

// Execute the function and log the result
findClosestBlock(targetTimestamp)
    .then(blockNumber => {
        console.log('Closest block number:', blockNumber);
    })
    .catch(error => {
        console.error('Error:', error);
    });
