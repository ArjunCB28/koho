import fs from 'fs'; // file read and write operations
import readline from 'readline'; // read file line by line
import moment from 'moment'; // date and time library

// update momentjs locale to consider Monday as first day of the week
moment.updateLocale('en', {week: {dow: 1,},});

// transactionObj stores the transaction made on the customers. Customer data are stored as key value pairs with customer_id as key and weekly transaction as value
// The weekly object has day number as key and array of transactions on that day as value.
// this object structure will be very easy to traverse.
// Importantly, no explicit find or filter method is used on this object to calculate daily or weekly transaction. The way it is constructed will be really easy traverse.
const transactionObj = {};

const dailyLimit: number = 5000;
const weeklyLimit: number = 20000;
const dailyLoadLimit: number = 3;
let outputString: string = '';

// create line reader for the input.txt file using the fs file system and readline
const lineReader: any = readline.createInterface({
	input: fs.createReadStream('src/input.txt')
});

// get week of the year from 1970
export const getWeekNumber = (time: string): number => {
	return  moment.utc(time).week();
};

// get day of the week
export const getDayNumber = (time): number => {
	return  moment.utc(time).day();
};

// function to add customer details, week and day into transaction object.
const initCustomerDetails = (loadJSON): void => {
	const transactionWeek = getWeekNumber(loadJSON.time);
	const transactionDay = getDayNumber(loadJSON.time);
	if (transactionObj[loadJSON.customer_id] === undefined) transactionObj[loadJSON.customer_id] = {id_set: []};
	if (transactionObj[loadJSON.customer_id][transactionWeek] === undefined) transactionObj[loadJSON.customer_id][transactionWeek] = {};
	if (transactionObj[loadJSON.customer_id][transactionWeek][transactionDay] === undefined) transactionObj[loadJSON.customer_id][transactionWeek][transactionDay] = [];
	transactionObj[loadJSON.customer_id].id_set.push(loadJSON.id);
};

// function to store the output json data
const outputJSON = (loadId: string, customerId: string, accepted: boolean) => {
	outputString += JSON.stringify({id: loadId, customer_id: customerId, accepted}) + "\n";
	return {id: loadId, customer_id: customerId, accepted};
};

// getAmount function returns back the load amount in integer after removing $ symbol
export const getAmount = (amount: string): number => {
	return parseInt(amount.split('$')[1].trim(), 10);
};

// calculate sum of load amount for the day
const calculateSumOfLoadAmount = (loadAmount, transactionHistory): number => {
	let dailyLoadAmount = loadAmount;
	transactionHistory.forEach((load) => {
		dailyLoadAmount += getAmount(load.load_amount);
	});
	return dailyLoadAmount;
};

// function to check the business logic
const checkBusinessLogic = (loadJSON): boolean => {
	// ignore if load ID is observed more than once for a particular user
	if (transactionObj[loadJSON.customer_id] !== undefined && transactionObj[loadJSON.customer_id].id_set.includes(loadJSON.id)) return null;
	initCustomerDetails(loadJSON);
	const transactionWeek = getWeekNumber(loadJSON.time);
	const transactionDay = getDayNumber(loadJSON.time);
	// if amount exceeds one day limit of 5000, return accepted as false
	if (getAmount(loadJSON.load_amount) > dailyLimit) return false;
	if (transactionObj[loadJSON.customer_id][transactionWeek][transactionDay].length >= dailyLoadLimit) return false;
	const dailyLoadAmount = calculateSumOfLoadAmount(getAmount(loadJSON.load_amount), transactionObj[loadJSON.customer_id][transactionWeek][transactionDay]);
	// if daily transaction exceeds 5000, do not accept the load
	if (dailyLoadAmount > dailyLimit) return false;
	let weeklyLoadAmount = getAmount(loadJSON.load_amount);
	for (const key in transactionObj[loadJSON.customer_id][transactionWeek]) {
		if (transactionObj[loadJSON.customer_id][transactionWeek].hasOwnProperty(key)) weeklyLoadAmount = calculateSumOfLoadAmount(weeklyLoadAmount, transactionObj[loadJSON.customer_id][transactionWeek][key]);
	}
	// if weekly transaction exceeds 20000
	if (weeklyLoadAmount > weeklyLimit) return false;
	transactionObj[loadJSON.customer_id][transactionWeek][transactionDay].push({id: loadJSON.id, load_amount: loadJSON.load_amount, time: loadJSON.time});
	return true;
}

// this function checks the velocity limit.
// this function is exported so that it could be used for testing purposes.
// checkVelocityLimit function is isolated from the business logic function
export const checkVelocityLimit = (loadJSON): boolean => {
	const isAcccepted = checkBusinessLogic(loadJSON);
	if (isAcccepted !== null)  outputJSON(loadJSON.id, loadJSON.customer_id, isAcccepted);
	return isAcccepted;
};

// read input.txt file line by line
lineReader.on('line', (line) => {
	if (!!line) checkVelocityLimit(JSON.parse(line));
});

// write output data to output.txt file
lineReader.on('close', ()=> {
	fs.writeFileSync('dist/output.txt', outputString);
	console.log("output.txt file created successfully");
});
