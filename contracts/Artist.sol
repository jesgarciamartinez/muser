pragma solidity ^0.4.17;

contract Artist {
    address public artist;
    uint public goal;
    uint public donations;

    mapping (address => uint) investors;

    // log investments
    event Investment(address _from, uint _amount);
    // log donations
    event Donation(address _from, uint _amount);
    // log the refund
    event Withdraw(address _to, uint _amount);

    function Artist (uint minLimit) public {
        artist = msg.sender;
        goal = minLimit;
        donations = 0;
    }

    // Get investor info
    function getInvestor(address _address) view public returns (uint) {
        return (investors[_address]);
    }

    // Make investment
    function makeInvestment() public payable {
        // if (this.balance >= goal) {
        //     makeDonation(msg.sender, msg.value);
        // }
        investors[msg.sender] += msg.value;
        Investment(msg.sender, msg.value);
    }

    // Gets balance of the contract
    function getContractBalance() public view returns (uint){
        return this.balance;
      }

      // so funds dont stay in contract forever
      function destroy() public {
        if (msg.sender == artist) {
            artist.transfer(this.balance); // send funds to artist
        }
    }

    // When goal is reached, makes donations without saving address
    // function makeDonation(address from, uint donation) public payable {
    //     require(this.balance >= goal);
    //     Donation(from, donation);
    //     donations++;
    // }
}
