pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Ownable.sol";

contract InvestmentScreen is Ownable{
  using SafeMath for uint256;

address owner;

uint opportunityNumber;

// Struct with investment characteristics
struct InvestmentOpportunity{
  uint opportunityId;
  address investee;
  bool funded;
  string status;
  string opportunityName;
  string opportunityDescription;
  uint fundingTarget;
  uint screeners;
  address investor;
  address endorsement1;
  address endorsement2;
  address endorsement3;
}

// mapping of available opportunities
mapping (uint => InvestmentOpportunity) public opportunities;

InvestmentOpportunity[] public investmentOpportunities;

string[] statusDescriptions = new string[] (3);

// contract constuctor
constructor() public {
  owner = msg.sender;
  opportunityNumber = 0;
  statusDescriptions[0] =   "Investment needs additional screening";
  statusDescriptions[1] =   "Investment has been screened and is ready for funding";
  statusDescriptions[2] =   "Investment has been screened and has been funded";
}

// event for creating an opporunity
event OpportunitySnapshot(
    uint _opportunityId,
    address _investee,
    bool _funded,
    string _status,
    string _opportunityName,
    string _opportunityDescription,
    uint _fundingTarget,
    uint _screeners,
    uint _investor,
    address _endorsement1,
    address _endorsement2,
    address _endorsement3
    );

// event for endorsing an opportunity
event OpportunityEndorsed(
  address _screener,
  string _opportunityName
  );

// event for funding an event
event OpportunityFunded(
  uint _opportunityId,
  address _investee,
  address _investor,
  string _opportunityName,
  uint _fundingTarget);

function createOpportunity(
  string _opportunityName,
  string _opportunityDescription,
  uint _fundingTarget
  ) public {
    // update the opporuntiy count variable
    opportunityNumber++;

    // add an opportunity
    string storage status = statusDescriptions[0];
    opportunities[opportunityNumber] = InvestmentOpportunity(
      /* opportunityId: */ opportunityNumber,
      /* investee: */ msg.sender,
      /* funded: */ false,
      /* status: */ status,
      /* opportunityName: */ _opportunityName,
      /* opportunityDescription: */ _opportunityDescription,
      /* fundingTarget: */ _fundingTarget,
      /* screeners: */ 0,
      /* investor: */ 0x0,
      /* endorsement1: */ 0x0,
      /* endorsement2: */ 0x0,
      /* endorsement3: */ 0x0
      );

  // Emit event for created opportunity
  emit OpportunitySnapshot(
    opportunities[opportunityNumber].opportunityId,
    msg.sender,
    false,
    opportunities[opportunityNumber].status,
    _opportunityName,
    _opportunityDescription,
    _fundingTarget,
    0,
    0x0,
    0x0,
    0x0,
    0x0
    );
}

// get the number of active opportunities
function getNumberOfOpportunities()
public view returns(uint){
  return opportunityNumber;
}

function getAvailableOpportunities() public view returns (uint[]) {
    //prepare output array
    uint[] memory opportunityIds = new uint[](opportunityNumber);

    // prepare opporunity number variable
    uint numberOfAvailableOpportunities = 0;

    // get available opportunities
    for(uint i = 1; i <= opportunityNumber; i++) {
        opportunityIds[numberOfAvailableOpportunities] = opportunities[i].opportunityId;
        numberOfAvailableOpportunities++;
    }

    // copy the opportunityIds array into a smaller availableOpportunity array
    uint[] memory availableOpportunity = new uint[] (numberOfAvailableOpportunities);
    for(uint j = 0; j < numberOfAvailableOpportunities; j++) {
      availableOpportunity[j] = opportunityIds[j];
    }

    return availableOpportunity;
  }

// provide endorsements for the investment opportunities
function assessOpportunity(uint _opportunityNumber) public{
  //update the number of screeners
  opportunities[_opportunityNumber].screeners++;

  if(opportunities[_opportunityNumber].endorsement1 == 0x0) {
    //add the first endorsement
    opportunities[_opportunityNumber].endorsement1 = msg.sender;
  } else if (opportunities[_opportunityNumber].endorsement2 == 0x0) {
    // add the second endorsement
    opportunities[_opportunityNumber].endorsement2 = msg.sender;
  } else {
    // add the third endorsement and set status to accept funding
    opportunities[_opportunityNumber].endorsement3 = msg.sender;
    string storage status = statusDescriptions[1];
    opportunities[_opportunityNumber].status = status;
  }
    emit OpportunityEndorsed(msg.sender, opportunities[_opportunityNumber].opportunityName);
}

// fund an Opportunity
  function fundOpportunity(uint _opportunityId) payable public {
    // Require that there is an Opportunity for sellArticle
    require(opportunityNumber > 0);

    // check that an Opportunity exists
    require(_opportunityId > 0 && _opportunityId <= opportunityNumber);

    // retrieve the Opportunity from the mapping
    InvestmentOpportunity storage opportunity = opportunities[_opportunityId];

    // Check that the Opportunity has not been sold yet
    require(opportunity.investor == 0x0);

    // don't allow seller to buy own items
    require(msg.sender != opportunity.investee);

    // Check that the value sent is at least that of the Price
    require(msg.value == opportunity.fundingTarget);

    // keep the buyers information
    opportunity.investor = msg.sender;

    // the buyer can pay the _seller
    opportunity.investee.transfer(msg.value);

    string storage status = statusDescriptions[2];
    opportunity.status = status;

    // log the event
    emit OpportunityFunded(_opportunityId, opportunity.investee, opportunity.investor, opportunity.opportunityName, opportunity.fundingTarget);
  }
}

