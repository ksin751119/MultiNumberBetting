// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MultiNumberBetting.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MultiNumberBetting = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;



function addEventTableItem(tableId, childData, len) {
  var table = document.getElementById(tableId);
  var num = table.rows.length
  
  //console.log(num);
  if (table.rows.length >= len) {
    var i = table.rows.length - 1; // last child
    table.deleteRow(i);
  }

  var Tr = table.insertRow(0);
  var Td = Tr.insertCell(Tr.cells.length);
  var p = document.createElement('A');
  p.text = childData.name;
  Td.appendChild(p);

  Td = Tr.insertCell(Tr.cells.length);
  var p = document.createElement('A');
  p.text = childData.amount;
  Td.appendChild(p);

  Td = Tr.insertCell(Tr.cells.length);
  var aLink = document.createElement('A')
  aLink.text = childData.addr;
    Td.appendChild(aLink);
}

function clearTable(tableId) {
  var table = document.getElementById(tableId);
  for (var i = table.childNodes.length - 1; i >= 0; i--) {
    //console.log(table.childNodes[i]);
    table.removeChild(table.childNodes[i]);
  }
}


window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MultiNumberBetting.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
      self.watchWinEvent();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    /* Load Event */

    var multinumberbetting;
    MultiNumberBetting.deployed().then(function(instance) {
      multinumberbetting = instance;
      var contract_address_element = document.getElementById("contract_address");
      contract_address_element.innerHTML = multinumberbetting.address;
      return web3.eth.getBalance(multinumberbetting.address);
    }).then(function(result){
      var contract_balance_element = document.getElementById("contract_balance");
      contract_balance_element.innerHTML = web3.fromWei(result.toNumber());

    });
  },

  sendBet: function() {
    var self = this;
    var player = document.getElementById("player").value;
    var guess_number = parseInt(document.getElementById("guess_number").value);
    var bet = parseInt(document.getElementById("bet").value);
    console.log('player:', player);
    console.log('guess_number:', guess_number);
    console.log('bet:', bet);

    this.setStatus("Initiating transaction... (please wait)");

    var multinumberbetting;
    MultiNumberBetting.deployed().then(function(instance) {
      multinumberbetting = instance;
      return multinumberbetting.guess(guess_number, player, {from: account, value:web3.toWei(bet, 'ether'), gas:6721970});
      //return multinumberbetting.guess(1, 'Guo', {from: account, value:web3.toWei(bet, 'ether')});
    }).then(function(result) {
      console.log(result);
      if (result.logs[0].event == 'LosingBet'){
        self.setStatus("Losing The Bet!!"); 
      } else {
        self.setStatus("Winning The Bet!!");
      }
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  watchWinEvent: function(){
    var self = this;

    /* Load Event */

    var multinumberbetting;
    clearTable('winEventTable');
    MultiNumberBetting.deployed().then(function(instance) {
      multinumberbetting = instance;
      var additionalFilterOptions = {
        "fromBlock": "0",
        "toBlock": "latest"
      };
      //event NumberSetEvent(address indexed caller, bytes32 indexed oldNum, bytes32 indexed newNum);
      var indexedEventValues = {};
      var event = multinumberbetting.WinningBet(indexedEventValues, additionalFilterOptions);
      return event.watch(function(error, result){
        if(error){
          console.log(error)
        } else {

          console.log(result.args);
          var watchEvent = {
            //'name': web3.toAscii(result['args']['name']),
            'name': result['args']['name'],
            'addr': result['args']['addr'],
            'amount': web3.fromWei(result['args']['amount'].toNumber(), 'ether'),
          }
          console.log(watchEvent);
          addEventTableItem('winEventTable', watchEvent);
        }
      })
    });
  },

  returnFund: function() {
    var self = this;
    var return_fund = document.getElementById("return_fund").value;
    
    this.setStatus("Initiating transaction... (please wait)");
    var multinumberbetting;
    MultiNumberBetting.deployed().then(function(instance) {
      multinumberbetting = instance;
      return multinumberbetting.ownerWithdraw(web3.toWei(return_fund, 'ether'), {from:account});
    }).then(function(result) {
      console.log(result);
      self.setStatus("Return fund is completed!"); 
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  //if (typeof web3 !== 'undefined') {
  if (false) {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
