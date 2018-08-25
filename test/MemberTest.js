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
  var memberScreener = accounts[2];
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


  it("Should be able to add a new member", function(){
    return InvestmentScreen.deployed().then(function(instance){
      investmentScreenInstance = instance;
      // add the first member
      return investmentScreenInstance.addMember(
        firstName1,
        lastName1,
        memberType1, {from: memberInvestee});
    }).then(function(receipt){
      // Tests to check the first added member
      assert.equal(receipt.logs.length, 1, "Test 1: This function should produce one event");
      assert.equal(receipt.logs[0].event, "MemberAdded", "Test 2: This should be a MemberAdded log");
      assert.equal(receipt.logs[0].args._account, memberInvestee, "Test 3: Member account should be the address of " + memberInvestee);
      assert.equal(receipt.logs[0].args._id, memberId1, "Test 4: Member account id should be the address of " + memberId1);
      assert.equal(receipt.logs[0].args._firstName, firstName1, "Test 5: Member first name should be " + firstName1);
      assert.equal(receipt.logs[0].args._lastName, lastName1, "Test 6: Member last name should be " + lastName1);
      assert.equal(receipt.logs[0].args._memberType, memberType1, "Test 7: Member Type should be " + memberType1);

      // Getthe number of members after the first member
      return investmentScreenInstance.getNumberOfMembers();
    }).then(function(data){
      assert.equal(data, 1, "Test 8: the total number of members should be 1");

      // check the data on the first member
      return investmentScreenInstance.members(1);
    }).then(function(data){
      assert.equal(data[0], memberInvestee, "Test 9: This should be a members account " + memberInvestee);
      assert.equal(data[1], memberId1, "Test 10: This should be a member Id number " + memberId1);
      assert.equal(data[2], firstName1, "Test 11: This should be the member's first name " + firstName1);
      assert.equal(data[3], lastName1, "Test 12: This should be the member's last name " + lastName1);
      assert.equal(data[4], memberType1, "Test 13: This should be a members type " + memberType1);

      // add the second member - screener
      return investmentScreenInstance.addMember(
        firstName2,
        lastName2,
        memberType1, {from: memberScreener}
      ).then(function(){
        // add the third member - investor
        return investmentScreenInstance.addMember(
          firstName3,
          lastName3,
          memberType1, {from: memberInvestor}
        ).then(function(){
          // get the number of members
          return investmentScreenInstance.getNumberOfMembers();
        }).then(function(data){
          // test the number of members enrolled
          assert.equal(data, 3, "Test 14: there should be three members now, an investor, a screener, and an investee");
        });
      });
    });
  });

  it("Should add a new investment opportunity", function(){
    InvestmentScreen.deployed().then(function(instance){
      investmentScreenInstance = instance;
      // Add an investment opportunity
      return investmentScreenInstance.postInvestment(
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
    assert.equal(data.logs[0].args._screener, 0x0, "Test 18: No investment screeners yet");
    assert.equal(data.logs[0].args._investor, 0x0, "Test 19: No investors yet");
    assert.equal(data.logs[0].args._opportunityName, opportunityName1, "Test 20: Opportunity owner should be " + opportunityName1);
    assert.equal(data.logs[0].args._opportunityDescription, opportunityDescription1, "Test 21: Opportunity owner should be " + opportunityDescription1);
    assert.equal(data.logs[0].args._currentFunding, 0, "Test 22: No funding secured yet");
    assert.equal(data.logs[0].args._fundingTarget, web3.toWei(fundingTarget1,"ether"), "Test 23: Opportunity owner should be " + web3.toWei(fundingTarget1,"ether"));
    assert.equal(data.logs[0].args._investmentScore, 0, "Test 24: No investment score yet");
    assert.equal(data.logs[0].args._opportunityStatus, 1, "Test 25: Opportunity status should be active");
    assert.equal(data.logs[0].args._scoreArray, 0, "Test 26: collected scores");
    // add the second investment opportunity
    return investmentScreenInstance.postInvestment(
      opportunityName2,
      opportunityDescription2,
      web3.toWei(fundingTarget2, "ether"),
      {from: memberInvestee}
    );
  }).then(function(){
      return investmentScreenInstance.getNumberOfOpportunities();
  }).then(function(data){
    assert.equal(data,2,"Test 2x: There should be 2 opportunities listed");

    return investmentScreenInstance.assessOpportunity(1,4);
  }).then(function(){
    return investmentScreenInstance.getRanking(1);
  }).then(function(receipt){
    console.log("this is receipt " + receipt);
  });
  });
});