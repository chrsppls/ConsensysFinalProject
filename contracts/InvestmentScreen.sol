pragma solidity ^0.4.24;

/**
* @title InvestmentScreen
* @dev contract serves to deploy, endorse and fund opportunities
* including variables events and modifiers
*/

import "./SafeMath.sol";
import "./Ownable.sol";

contract InvestmentScreen is Ownable{
  using SafeMath for uint256;

// @param opportuntiyNumber counter of the number of opportunities
uint opportunityNumber;

// @dev Struct with investment characteristics
// @param opportunityId Id number of opportunity
// @param investee placer of investment opportunity
// @param funded is the opportunity funded bool
// @param status current status of the opportunity
// @param opportunityName name of the opportunity
// @param opportunityDescription description of the opportunity
// @param fundingTarget how much funding is requested
// @param screeners number of screeners for the opportunity
// @param endorsement1 1st endorser
// @param endorsement2 2nd endorser
// @param endorsement3 3rd endorser
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

// @param mapping of available opportunities
mapping (uint => InvestmentOpportunity) public opportunities;

// @param investmentOpportunities array of investmentOpportunities
InvestmentOpportunity[] public investmentOpportunities;

// @param statusDescriptions new array to hold status descriptions
string[] statusDescriptions = new string[] (3);

// @param contract constuctor
constructor() public {
  owner = msg.sender;
  opportunityNumber = 0;
  statusDescriptions[0] =   "Investment needs additional screening";
  statusDescriptions[1] =   "Investment has been screened and is ready for funding";
  statusDescriptions[2] =   "Investment has been screened and has been funded";
}

// @dev deactivate the contracts
function kill() public onlyOwner {
    selfdestruct(owner);
}

// @dev event for creating an opportunity
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

// @dev event for endorsing an opportunity
event OpportunityEndorsed(
  address _screener,
  string _opportunityName
  );

// @dev second log emitted during endorsemnt for testing purposes only
event CurrentStatus(
  address _endorsement1,
  address _endorsement2,
  address _endorsement3,
  string _status
  );

// @dev event for funding an event
event OpportunityFunded(
  uint _opportunityId,
  address _investee,
  address _investor,
  string _opportunityName,
  uint _fundingTarget);

// @dev function to create a new opportunity
function createOpportunity(
  string _opportunityName,
  string _opportunityDescription,
  uint _fundingTarget
  ) public {
    // @dev update the opportunity count variable
    opportunityNumber++;

    // @dev add an opportunity
    string storage status = statusDescriptions[0];
    opportunities[opportunityNumber] = InvestmentOpportunity(
      /* @param opportunityId: */ opportunityNumber,
      /* @param investee: */ msg.sender,
      /* @param funded: */ false,
      /* @param status: */ status,
      /* @param opportunityName: */ _opportunityName,
      /* @param opportunityDescription: */ _opportunityDescription,
      /* @param fundingTarget: */ _fundingTarget,
      /* @param screeners: */ 0,
      /* @param investor: */ 0x0,
      /* @param endorsement1: */ 0x0,
      /* @param endorsement2: */ 0x0,
      /* @param endorsement3: */ 0x0
      );

  // @dev emit event for created opportunity
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

// @dev get the number of active opportunities
function getNumberOfOpportunities()
public view returns(uint){
  return opportunityNumber;
}

// @dev function to get available opportunities
function getAvailableOpportunities() public view returns (uint[]) {
    //prepare output array
    uint[] memory opportunityIds = new uint[](opportunityNumber);

    // @param numberOfAvailableOpportunities prepare opportunity number variable
    uint numberOfAvailableOpportunities = 0;

    // @dev get available opportunities
    for(uint i = 1; i <= opportunityNumber; i++) {
        opportunityIds[numberOfAvailableOpportunities] = opportunities[i].opportunityId;
        numberOfAvailableOpportunities++;
    }

    // @dev copy the opportunityIds array into a smaller availableOpportunity array
    uint[] memory availableOpportunity = new uint[] (numberOfAvailableOpportunities);
    for(uint j = 0; j < numberOfAvailableOpportunities; j++) {
      availableOpportunity[j] = opportunityIds[j];
    }

    // @dev return available opportunities
    return availableOpportunity;
  }

// @dev provide endorsements for the investment opportunities
function assessOpportunity(uint _opportunityNumber) public{
  // @dev update the number of screeners
  opportunities[_opportunityNumber].screeners++;

  if(opportunities[_opportunityNumber].endorsement1 == 0x0) {
    // @dev add the first endorsement
    opportunities[_opportunityNumber].endorsement1 = msg.sender;
  } else if (opportunities[_opportunityNumber].endorsement2 == 0x0) {
    // @dev add the second endorsement
    opportunities[_opportunityNumber].endorsement2 = msg.sender;
  } else {
    // @dev add the third endorsement and set status to accept funding
    opportunities[_opportunityNumber].endorsement3 = msg.sender;
    string storage status = statusDescriptions[1];
    opportunities[_opportunityNumber].status = status;
  }
    emit OpportunityEndorsed(msg.sender, opportunities[_opportunityNumber].opportunityName);
    emit CurrentStatus(opportunities[_opportunityNumber].endorsement1, opportunities[_opportunityNumber].endorsement2, opportunities[_opportunityNumber].endorsement3, opportunities[_opportunityNumber].status);
}

// @dev fund an Opportunity
  function fundOpportunity(uint _opportunityId) payable public {
    // @dev require that there is an Opportunity for fundOpportunity
    require(opportunityNumber > 0);

    // @dev check that an Opportunity exists
    require(_opportunityId > 0 && _opportunityId <= opportunityNumber);

    // @dev retrieve the Opportunity from the mapping
    InvestmentOpportunity storage opportunity = opportunities[_opportunityId];

    // @dev check that the Opportunity has not been funded yet
    require(opportunity.investor == 0x0);

    // @dev don't allow seller to fund own items
    require(msg.sender != opportunity.investee);

    // @dev check that the value sent is at least that of the fundingTarget
    require(msg.value == opportunity.fundingTarget);

    // @dev keep the investors information
    opportunity.investor = msg.sender;

    // @dev the buyer can pay the _seller
    opportunity.investee.transfer(msg.value);

    string storage status = statusDescriptions[2];
    opportunity.status = status;

    // @dev log the event
    emit OpportunityFunded(_opportunityId, opportunity.investee, opportunity.investor, opportunity.opportunityName, opportunity.fundingTarget);
  }
}

