var MultiNumberBetting = artifacts.require("./MultiNumberBetting.sol")

contract('multinumberbetting', function(accounts) {

  var albert_address = accounts[0];
  var bob_address = accounts[1];
  var cindy_address = accounts[2];
  var initial_contract_ether = 20;
  var old_bob_balance;
  var old_albert_balance;

  
  // Test Case#1
  it("Total guesses should be 2 after guessing twice times", function() {
    var multinumberbetting;
    return MultiNumberBetting.deployed().then(function(instance){
      multinumberbetting = instance;
      console.log('Contract address:', multinumberbetting.address);
      web3.eth.sendTransaction({from:albert_address,to:multinumberbetting.address, value:web3.toWei(initial_contract_ether,'ether')});
      return web3.eth.getBalance(multinumberbetting.address);
      }).then(function(result){
        console.log('Conctract balance:', web3.fromWei(result.toNumber(), 'ether'));
        assert.equal(web3.fromWei(result.toNumber(), 'ether'), initial_contract_ether, "Contract initial balance should be  "+initial_contract_ether);
        return multinumberbetting.guess(1, 'Cindy', {from: cindy_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        console.log(result);
        return multinumberbetting.guess(3, 'Cindy', {from: cindy_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        console.log(result);
        return multinumberbetting.totalGuesses.call();
      }).then(function(result){
        assert.equal(result.toNumber(), 2, "Contract total guesses should be 2!");
     });
  })

  
  // Test Case#2
  it("should the correct amount of ehter in player's balance after betting", function() {
    var multinumberbetting;
    return MultiNumberBetting.deployed().then(function(instance){
      multinumberbetting = instance;
      return web3.eth.getBalance(albert_address);
      }).then(function(result){
        console.log('Albert balance', web3.fromWei(result.toNumber(), 'ether'));
        old_albert_balance = result.toNumber();
        return multinumberbetting.guess(7, 'Albert', {from: albert_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        assert.equal('LosingBet',result.logs[0].event );
        return web3.eth.getBalance(albert_address);
      }).then(function(result){
        console.log('Albert balance after betting', web3.fromWei(result.toNumber(), 'ether'));
        assert.isTrue(result.toNumber() < old_albert_balance, 'Albert balance should less than before')
        return web3.eth.getBalance(bob_address);
      }).then(function(result){
        console.log('Bob balance', web3.fromWei(result.toNumber(), 'ether'));
        old_bob_balance = result.toNumber();
        return multinumberbetting.guess(1, 'Bob', {from: bob_address, value:web3.toWei(2, 'ether')});
      }).then(function(result){
        assert.equal('WinningBet',result.logs[0].event );
        return web3.eth.getBalance(bob_address);
      }).then(function(result){
        console.log('Bob balance after betting', web3.fromWei(result.toNumber(), 'ether'));
        assert.isTrue(result.toNumber() > old_bob_balance, 'Bob balance should greater than before')
      });
  })
  
  
  // Test Case#3
  it("Last winner/checking winner should be bob/cinder", function() {
    var multinumberbetting;
    return MultiNumberBetting.deployed().then(function(instance){
      multinumberbetting = instance;
      return multinumberbetting.getLastWinnerInfo.call();
      }).then(function(result){
        console.log('Last winner info:', result);
        assert.equal(result[0].toString(), bob_address, "Last winner addr should be Bob addr");
        assert.equal(result[1].toString(), 'Bob', "Last winner should be Bob");
        assert.equal(result[2].toNumber(), 1, "Last winner guess should be 1");
        assert.equal(web3.fromWei(result[4].toNumber(), 'ether'), 2, "Last winner bet should be 2");
        return multinumberbetting.checkWinning(cindy_address);
      }).then(function(result){
        console.log('check winning result:', result);
        assert.equal(result[0].toString(), cindy_address, "Checking winner addr should be Cinder addr");
        assert.equal(result[1].toString(), 'Cindy', "Checking winner should be Cindy");
        assert.equal(result[2].toNumber(), 1, "Checking winner guess should be 1");
        assert.equal(web3.fromWei(result[4].toNumber(), 'ether'), 2, "Checking winner bet should be 2");
    });
  })

  
  // Test Case#4
  it("Check Last winner time", function() {
    var multinumberbetting;
    return MultiNumberBetting.deployed().then(function(instance){
      multinumberbetting = instance;
      return multinumberbetting.daysSinceLastWinning.call();
    }).then(function(result){
      console.log("Days since last winning:", result.toNumber());
      return multinumberbetting.hoursSinceLastWinning.call()
    }).then(function(result){
      console.log("Hours since last winning:", result.toNumber());
      return multinumberbetting.minutesSinceLastWinning.call()
    }).then(function(result){
      console.log("Minutes since last winning:", result.toNumber());
    });
  })

    
  // Test Case#5
  it("Check Owner Withdraw", function() {
    var multinumberbetting;
    var old_balance;
    return MultiNumberBetting.deployed().then(function(instance){
      multinumberbetting = instance;
      
      return web3.eth.getBalance(albert_address)
    }).then(function(result){
      old_balance = result.toNumber();
      var returnFund = web3.toWei(3, 'ether');
      return multinumberbetting.ownerWithdraw(returnFund,{form:albert_address});
    }).then(function(result){
      console.log(result);
      return web3.eth.getBalance(albert_address);
    }).then(function(result){
      console.log("old_balance:", old_balance);
      console.log("new_balance:", result.toNumber());
      assert.isTrue(result.toNumber() > old_balance);
    });
  })


});
