pragma solidity ^0.4.4;

import "./MultiNumberBettingAbstract.sol";

contract MultiNumberBetting is MultiNumberBettingAbstract{

    struct Winner {
        address winnerAddress;
        string winnerName;
        uint8 guess;
        uint guessedAt;
        uint betEther;
    }
    Winner lastWinnerInfo;

    mapping(address => Winner) winnerMapping;

    uint8[3] numbers;
    uint loserCount;
    uint winnerCount;
    uint public lastWinnerAt = 0;
    address lastWinner;
    address public owner;

    modifier ownerOnly{
        require(msg.sender == owner);
        _;
    }

    function MultiNumberBetting(uint8 num1, uint8 num2, uint8 num3) public{
        // constructor
        //resetBetting();
        numbers[0] = num1;
        numbers[1] = num2;
        numbers[2] = num3;
        owner = msg.sender;
    }

    function random() private view returns (uint8) {
        // return random [1,10] range value
        return uint8(uint256(keccak256(block.timestamp, block.difficulty))%10)+1;
    }

    function resetBetting() internal{
        numbers[0] = random();
        numbers[1] = random();
        numbers[2] = random();
    }

    function guess(uint8 guessNum, string playerName)  public payable returns(bool) {
        // guess
        
        uint betEther = msg.value;
        //require(this.balance >= 3*MAX_BET);
        require((guessNum <= MAX_GUESS_NUM) && (guessNum >= MIN_GUESS_NUM));
        require((betEther >= MIN_BET) && (betEther <= MAX_BET));
        
        for (uint i = 0; i < numbers.length; i++) {
            if(numbers[i] == guessNum){
                winnerCount++;
                lastWinner = msg.sender;
                lastWinnerAt = now;
                lastWinnerInfo = Winner(lastWinner, playerName, guessNum, lastWinnerAt, betEther);
                winnerMapping[lastWinner] = lastWinnerInfo;
                
                // Send back the reward
                msg.sender.transfer(betEther*ODDS);
                WinningBet(lastWinner, playerName, betEther);
                return true;
            } 
        }

        // value will received to contract balance
        LosingBet(msg.sender, playerName, betEther);
        loserCount++;
        return false;
    }

    function totalGuesses() public view returns (uint){
        return winnerCount + loserCount;
    }

    function daysSinceLastWinning() public view returns(uint){
        if(lastWinner == address(0x0)){
            return 0;
        }
        return ((now - lastWinnerAt) / 1 days);
        
    }   

    function hoursSinceLastWinning() public returns(uint){
        if(lastWinner == address(0x0)){
            return 0;
        }
        return ((now - lastWinnerAt) / 1 hours);
    }

    function minutesSinceLastWinning() public view returns(uint){
        if(lastWinner == address(0x0)){
            return 0;
        }
        return ((now - lastWinnerAt) / 1 minutes);
    }

    function getLastWinnerInfo() public view returns(address, string, uint, uint, uint){
        Winner memory winner_info = winnerMapping[lastWinner];
        return (winner_info.winnerAddress, winner_info.winnerName, winner_info.guess, winner_info.guessedAt, lastWinnerInfo.betEther);
    }

    function checkWinning(address addr) public view returns(address, string, uint, uint, uint){
        Winner memory winner_info = winnerMapping[addr];
        return (winner_info.winnerAddress, winner_info.winnerName, winner_info.guess, winner_info.guessedAt, lastWinnerInfo.betEther);
    }

    function ownerWithdraw(uint amt) public ownerOnly returns(uint){
        require((this.balance-amt) >= WITHDRAW_RATE*MAX_BET);
        msg.sender.transfer(amt);
    }

    function() public payable {
    }

    function killContract() public ownerOnly {
        // suicide(owner);
        selfdestruct(owner);
    }

    
}
