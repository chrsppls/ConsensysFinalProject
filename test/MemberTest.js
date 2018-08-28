var InvestmentScreen = artifacts.require("./InvestmentScreen.sol");

// @dev test suite
contract('InvestmentScreen', function(accounts){
  // @dev Instance variable
  var investmentScreenInstance;

  // @dev member - investee
  var memberId1 = 1;
  var memberInvestee = accounts[1];
  var firstName1 = "Chris";
  var lastName1 = "Peoples";
  var memberType1 = 3;

  // @dev member - Screener
  var memberId2 = 2;
  var memberEndorsement1 = accounts[2];
  var memberEndorsement2 = accounts[3];
  var memberEndorsement3 = accounts[4];
  var firstName2 = "Tiffany";
  var lastName2 = "Chan";
  var memberType2 = 2;

  // @dev member - investor
  var memberId3 = 3;
  var memberInvestor = accounts[3];
  var firstName3 = "Brad";
  var lastName3 = "Wales";
  var memberType3 = 1;

  // @dev first investment opportunity
  var opportunityName1 = "BlockCapital Ventures";
  var opportunityDescription1 = "Your opportunity to invest into a reimagination of venture capital";
  var fundingTarget1 = 10;

  // @dev second investment opportunity
  var opportunityName2 = "PP&A Tech";
  var opportunityDescription2 = "Blockchain consultancy and professional services firm";
  var fundingTarget2 = 20;

  var investeeBalanceBeforeFund, investeeBalanceAfterFund;
  var buyerBalanceBeforeFund, investorBalanceAfterFund;

  it("Should add a new investment opportunity", function(){
    InvestmentScreen.deployed().then(function(instance){
      investmentScreenInstance = instance;
      // @dev Add an investment opportunity
      return investmentScreenInstance.createOpportunity(
        opportunityName1,
        opportunityDescription1,
        web3.toWei(fundingTarget1, "ether"),
        {from: memberInvestee}
      );
    }).then(function(data){

    // @dev check to see if the investment opportunity was added correctly
    assert.equal(data.logs.length, 1, "Test 1: Should produce 1 event log");
    assert.equal(data.logs[0].event, "OpportunitySnapshot", "Test 2: Should produce 1 event named OpportunitySnapshot");
    assert.equal(data.logs[0].args._opportunityId, 1, "Test 3: OpportunityId should be " + 1);
    assert.equal(data.logs[0].args._investee, memberInvestee, "Test 4: Opportunity owner should be " + memberInvestee);
    assert.equal(data.logs[0].args._funded, false, "Test 5: The opportunity still needs funding");
    assert.equal(data.logs[0].args._status, "Investment needs additional screening", "Test 6: The opportunity has not been screened yet");
    assert.equal(data.logs[0].args._opportunityName, opportunityName1, "Test 7: Opportunity owner should be " + opportunityName1);
    assert.equal(data.logs[0].args._opportunityDescription, opportunityDescription1, "Test 8: Opportunity owner should be " + opportunityDescription1);
    assert.equal(data.logs[0].args._fundingTarget, web3.toWei(fundingTarget1,"ether"), "Test 9: Opportunity owner should be " + web3.toWei(fundingTarget1,"ether"));
    assert.equal(data.logs[0].args._endorsement1, 0x0, "Test 10: Opportunity should not yet be endorsed");

    // @dev add the second investment opportunity
    return investmentScreenInstance.createOpportunity(
      opportunityName2,
      opportunityDescription2,
      web3.toWei(fundingTarget2, "ether"),
      {from: memberInvestee}
    );
  }).then(function(){
      return investmentScreenInstance.getNumberOfOpportunities();
  }).then(function(data){
    assert.equal(data,2,"Test 11: There should be 2 opportunities listed");

    // @dev test around the first endorsement
    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement1});
  }).then(function(receipt){
    assert.equal(receipt.logs[1].args._endorsement1, memberEndorsement1, "Test 12: the 1st endorser should be " + memberEndorsement1);
    assert.equal(receipt.logs[1].args._endorsement2, 0x0, "Test 13: No 2nd endorser yet");
    assert.equal(receipt.logs[1].args._endorsement3, 0x0, "Test 14: No 3rd endorser yet");
    assert.equal(receipt.logs[1].args._status, "Investment needs additional screening", "Test 15: The status should be: Investment needs additional screening");

    // @dev test around the 2nd endorsement
    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement2});
  }).then(function(receipt){
    assert.equal(receipt.logs[1].args._endorsement1, memberEndorsement1, "Test 16 the 1st endorser should be " + memberEndorsement1);
    assert.equal(receipt.logs[1].args._endorsement2, memberEndorsement2, "Test 17: the 1st endorser should be " + memberEndorsement2);
    assert.equal(receipt.logs[1].args._endorsement3, 0x0, "Test 18: No 3rd endorser yet");
    assert.equal(receipt.logs[1].args._status, "Investment needs additional screening", "Test 19: The status should be: Investment needs additional screening");

    // @dev test around the 3rd endorsement
    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement3});
  }).then(function(receipt){
    assert.equal(receipt.logs[1].args._endorsement1, memberEndorsement1, "Test 20: the 1st endorser should be " + memberEndorsement1);
    assert.equal(receipt.logs[1].args._endorsement2, memberEndorsement2, "Test 21: the 2nd endorser should be " + memberEndorsement2);
    assert.equal(receipt.logs[1].args._endorsement3, memberEndorsement3, "Test 22: the 3rd endorser should be" + memberEndorsement3);
    assert.equal(receipt.logs[1].args._status, "Investment has been screened and is ready for funding", "Test 23: The status should be: Investment has been screened and is ready for funding");

    investeeBalanceBeforeFund = web3.fromWei(web3.eth.getBalance(memberInvestee),"ether").toNumber();
    investorBalanceBeforeFund = web3.fromWei(web3.eth.getBalance(memberInvestor),"ether").toNumber();

    // @dev test around funding an opportunity
    return investmentScreenInstance.fundOpportunity(1,
    {from: memberInvestor,
    value: web3.toWei(fundingTarget1, "ether")});
  }).then(function(receipt){
      assert.equal(receipt.logs[0].args._investee, memberInvestee, "the investee should be " + memberInvestee);
      assert.equal(receipt.logs[0].args._investor, memberInvestor, "the investor should be " + memberInvestor);
      assert.equal(receipt.logs[0].args._opportunityName, opportunityName1, "event article should be " + opportunityName1);
      assert.equal(receipt.logs[0].args._fundingTarget.toNumber(), web3.toWei(fundingTarget1, "ether"), "event price should be " + web3.toWei(fundingTarget1, "ether"));

      // @dev record balance of investee and investor after the funding
      investeeBalanceAfterFund = web3.fromWei(web3.eth.getBalance(memberInvestee),"ether").toNumber();
      investorBalanceAfterFund = web3.fromWei(web3.eth.getBalance(memberInvestor),"ether").toNumber();

      // @dev Check the balances of investee and investor accounting for getCoinbase
      assert(investeeBalanceAfterFund == investeeBalanceBeforeFund + fundingTarget1, "seller should have earned " + fundingTarget1 + " in ether");
      assert(investorBalanceAfterFund <= investorBalanceBeforeFund - fundingTarget1, "buyer should have earned " + fundingTarget1 + " in ether"); // @dev less to account for gas

  });
  });
});