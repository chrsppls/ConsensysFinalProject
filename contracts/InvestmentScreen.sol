pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Ownable.sol";

contract InvestmentScreen is Ownable{
  using SafeMath for uint256;

address owner;

uint memberNumber;
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

// status states for investment opportunities
enum opportunityStatus {
  Active,
  Funded,
  Closed
}

enum ranking {
  Strong,
  Good,
  Average,
  Poor
}

// mapping of available opportunities

mapping (uint => InvestmentOpportunity) public opportunities;


mapping (uint => address) public opportunityToOwner;
mapping (address => uint) public opportunitiesOwned;

mapping (address => uint) public opportunitiesAssessed;

InvestmentOpportunity[] public investmentOpportunities;

string[] statusDescriptions = new string[] (3);

// contract constuctor
constructor() public {
  owner = msg.sender;
  memberNumber = 0;
  opportunityNumber = 0;
  statusDescriptions[0] =   "Investment needs additional screening";
  statusDescriptions[1] =   "Investment has been screened and is ready for funding";
  statusDescriptions[2] =   "Investment has been screened and has been funded";
}

// event for adding a member
event CurrentStatus(
  address _endorsement1,
  address _endorsement2,
  address _endorsement3
  );

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

event OpportunityEndorsed(
  address _screener,
  string _opportunityName
  );

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
    opportunityNumber++;
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

     /* opportunityToOwner[id] = msg.sender; */
     /* opportunitiesOwned[msg.sender]++; */

  // Emit an event
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

    uint numberOfAvailableOpportunities = 0;

    for(uint i = 1; i <= opportunityNumber; i++) {
      // keep the ID if the article is still for sale
      /* if(opportunities[i].openForFunding == false){ */
        opportunityIds[numberOfAvailableOpportunities] = opportunities[i].opportunityId;
        numberOfAvailableOpportunities++;
      /* } */
    }

    // copy the artileIds array into a smaller forSale array
    uint[] memory forSale = new uint[] (numberOfAvailableOpportunities);
    for(uint j = 0; j < numberOfAvailableOpportunities; j++) {
      forSale[j] = opportunityIds[j];
    }

    return forSale;
  }

// request investment assessment
function assessOpportunity(uint _opportunityNumber) public{
  opportunities[_opportunityNumber].screeners++;

  if(opportunities[_opportunityNumber].endorsement1 == 0x0) {
    opportunities[_opportunityNumber].endorsement1 = msg.sender;
  } else if (opportunities[_opportunityNumber].endorsement2 == 0x0) {
    opportunities[_opportunityNumber].endorsement2 = msg.sender;
  } else {
    opportunities[_opportunityNumber].endorsement3 = msg.sender;
    string storage status = statusDescriptions[1];
    opportunities[_opportunityNumber].status = status;


  }

/*
  uint newRanking = _ranking;
  uint totalRankPoints = 0;
  uint addedRank;

  opportunities[_opportunityNumber].scoreArray.push(newRanking);
  uint scores = opportunities[_opportunityNumber].scoreArray.length;

  for(uint i = 0; i < scores; i++) {
    /* newRanking = newRanking + 1; */

    /* addedRank = opportunities[_opportunityNumber].scoreArray[i];
    totalRankPoints = totalRankPoints.add(addedRank);
  }

  opportunities[_opportunityNumber].investmentScore = totalRankPoints; */
  /* if (scores < 3) { */
    emit OpportunityEndorsed(msg.sender, opportunities[_opportunityNumber].opportunityName);
    emit CurrentStatus(opportunities[_opportunityNumber].endorsement1, opportunities[_opportunityNumber].endorsement2, opportunities[_opportunityNumber].endorsement3);
  /* } else {
    if(scores == 3 && totalRankPoints >= 9) {
    opportunities[_opportunityNumber].openForFunding = true;
    emit CurrentStatus(statusDescriptions[1]);
  } else {
    emit CurrentStatus(statusDescriptions[2]);
  }
} */
  /* emit OpportunitySnapshot(_opportunityId, _investee, _screener, _investor, _opportunityName, _opportunityDescription, _currentFunding, _fundingTarget, _investmentScore, _opportunityStatus, _scoreArray) */
}

// buy an article
  function fundOpportunity(uint _opportunityId) payable public {
    // Require that there is an article for sellArticle
    require(opportunityNumber > 0);

    // check that an article exists
    require(_opportunityId > 0 && _opportunityId <= opportunityNumber);

    // retrieve the article from the mapping
    InvestmentOpportunity storage opportunity = opportunities[_opportunityId];

    // Check that the article has not been sold yet
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

