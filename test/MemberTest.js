var InvestmentScreen = artifacts.require("./InvestmentScreen.sol");

// test suite
contract('InvestmentScreen', function(accounts){
  // Instance variable
  var investmentScreenInstance;

  // first member - investee
  var memberId1 = 1;
  var memberInvestee = accounts[1];
  var firstName1 = "Chris";
  var lastName1 = "Peoples";
  var memberType1 = 3;

  // first member - Screener
  var memberId2 = 2;
  var memberEndorsement1 = accounts[2];
  var memberEndorsement2 = accounts[3];
  var memberEndorsement3 = accounts[4];
  var firstName2 = "Tiffany";
  var lastName2 = "Chan";
  var memberType2 = 2;

  // first member - investor
  var memberId3 = 3;
  var memberInvestor = accounts[3];
  var firstName3 = "Brad";
  var lastName3 = "Wales";
  var memberType3 = 1;

  // first investment opportunity
  var opportunityName1 = "BlockCapital Ventures";
  var opportunityDescription1 = "Your opportunity to invest into a reimagination of venture capital";
  var fundingTarget1 = 10;

  // first investment opportunity
  var opportunityName2 = "PP&A Tech";
  var opportunityDescription2 = "Blockchain consultancy and professional services firm";
  var fundingTarget2 = 20;


  it("Should add a new investment opportunity", function(){
    InvestmentScreen.deployed().then(function(instance){
      investmentScreenInstance = instance;
      // Add an investment opportunity
      return investmentScreenInstance.createOpportunity(
        opportunityName1,
        opportunityDescription1,
        web3.toWei(fundingTarget1, "ether"),
        {from: memberInvestee}
      );
    }).then(function(data){
    //check to see if the investment opportunity was added correctly
    assert.equal(data.logs.length, 1, "Test 14: Should produce 1 event log");
    assert.equal(data.logs[0].event, "OpportunitySnapshot", "Test 15: Should produce 1 event named OpportunitySnapshot");
    assert.equal(data.logs[0].args._opportunityId, 1, "Test 16: OpportunityId should be " + 1);
    assert.equal(data.logs[0].args._investee, memberInvestee, "Test 17: Opportunity owner should be " + memberInvestee);
    assert.equal(data.logs[0].args._funded, false, "Test 18: The opportunity still needs funding");
    assert.equal(data.logs[0].args._status, "Investment needs additional screening", "Test 19: The opportunity has not been screened yet");
    assert.equal(data.logs[0].args._opportunityName, opportunityName1, "Test 20: Opportunity owner should be " + opportunityName1);
    assert.equal(data.logs[0].args._opportunityDescription, opportunityDescription1, "Test 21: Opportunity owner should be " + opportunityDescription1);
    assert.equal(data.logs[0].args._fundingTarget, web3.toWei(fundingTarget1,"ether"), "Test 23: Opportunity owner should be " + web3.toWei(fundingTarget1,"ether"));
    assert.equal(data.logs[0].args._opportunityStatus, 1, "Test 25: Opportunity status should be active");

    // add the second investment opportunity
    return investmentScreenInstance.createOpportunity(
      opportunityName2,
      opportunityDescription2,
      web3.toWei(fundingTarget2, "ether"),
      {from: memberInvestee}
    );
  }).then(function(){
      return investmentScreenInstance.getNumberOfOpportunities();
  }).then(function(data){
    assert.equal(data,2,"Test 2x: There should be 2 opportunities listed");

    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement1});
  }).then(function(receipt){
    console.log("Round 1: Endorsement1 " + receipt.logs[0].args._endorsement1);
    console.log("Round 1: Endorsement2 " + receipt.logs[0].args._endorsement2);
    console.log("Round 1: Endorsement3 " + receipt.logs[0].args._endorsement3);

    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement2});
  }).then(function(receipt){
    console.log("Round 2: Endorsement1 " + receipt.logs[0].args._endorsement1);
    console.log("Round 2: Endorsement2 " + receipt.logs[0].args._endorsement2);
    console.log("Round 2: Endorsement3 " + receipt.logs[0].args._endorsement3);

    return investmentScreenInstance.assessOpportunity(1,
    {from: memberEndorsement3});
  }).then(function(receipt){
    console.log("Round 3: Endorsement1 " + receipt.logs[0].args._endorsement1);
    console.log("Round 3: Endorsement2 " + receipt.logs[0].args._endorsement2);
    console.log("Round 3: Endorsement3 " + receipt.logs[0].args._endorsement3);

        return investmentScreenInstance.getAvailableOpportunities();
  }).then(function(data){
    console.log("this is data: " + data);
    console.log("this is data: " + data);
  });
  });
});