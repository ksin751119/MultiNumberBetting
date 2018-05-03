pragma solidity ^0.4.4;

contract MultiNumberBettingAbstract {

    uint constant MAX_BET = 3 ether;
    uint constant MIN_BET = 1 finney;
    uint8 constant MAX_GUESS_NUM = 10;
    uint8 constant MIN_GUESS_NUM = 1;
    uint8 constant ODDS = 2;
    uint8 constant WITHDRAW_RATE = 3;

    event WinningBet(address indexed addr, string name, uint amount);
    event LosingBet(address indexed addr, string name, uint amount);

    function guess(uint8 _guess, string name) public payable returns(bool);

    function totalGuesses() public view returns(uint);

    function daysSinceLastWinning() public view returns(uint);

    function hoursSinceLastWinning() public returns(uint);

    function minutesSinceLastWinning() public view returns(uint);

    function getLastWinnerInfo() public view returns(address, string, uint, uint, uint);

    function checkWinning(address addr) public view returns(address, string, uint, uint, uint);

    
}
