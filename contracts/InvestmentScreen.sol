pragma solidity ^0.4.24;

contract InvestmentScreen {

address owner;

uint memberNumber;
uint opportunityNumber;

struct Member {
  address account;
  uint id;
  string firstName;
  string lastName;
  uint memberType;
}

// Struct with investment characteristics
struct InvestmentOpportunity{
  uint opportunityId;
  address investee;
  address screener;
  address investor;
  string opportunityName;
  string opportunityDescription;
  uint currentFunding;
  uint fundingTarget;
  uint investmentScore;
  uint opportunityStatus;
  uint[] scoreArray;
}

// types of member categories
enum memberType {
  Investor,
  Assessor,
  Investee
}

// status states for investment opportunities
enum opportunityStatus {
  Active,
  Funded
}

enum ranking {
  Strong,
  Good,
  Average,
  Poor,
  Terrible
}

// mapping of site member types
mapping (uint => Member) public members;

// mapping of available opportunities
mapping (uint => InvestmentOpportunity) public opportunities;

// contract constuctor
constructor() public {
  owner = msg.sender;
  memberNumber = 0;
  opportunityNumber = 0;
}

// event for adding a member
event MemberAdded(
  address _account,
  uint indexed _id,
  string _firstName,
  string _lastName,
  uint _memberType
  );

  event OpportunitySnapshot(
    uint _opportunityId,
    address _investee,
    address _screener,
    address _investor,
    string _opportunityName,
    string _opportunityDescription,
    uint _currentFunding,
    uint _fundingTarget,
    uint _investmentScore,
    uint _opportunityStatus,
    /* mapping (address => uint) public screeners */
    uint _scoreArray
    );


// Enroll new member accounts
function addMember(
  string _firstName,
  string _lastName,
  uint _memberType
  ) public {
    /* emit MemberAdded(memberNumber); */
    memberNumber++;
    members[memberNumber] = Member({
      account: msg.sender,
      id: memberNumber,
      firstName: _firstName,
      lastName: _lastName,
      memberType: _memberType});

    emit MemberAdded(msg.sender, memberNumber, _firstName, _lastName, _memberType);
  }

// Get the number of members by member type
function getNumberOfMembers()
public view returns(uint){
  return memberNumber;
}

// View users (not tested)
function viewMember(uint _member) view public returns(uint, string, string, uint) {
  Member storage member = members[_member];
  return(member.id, member.firstName, member.lastName, member.memberType);
}

// add investment opportunities
function postInvestment(
  string _opportunityName,
  string _opportunityDescription,
  uint _fundingTarget
  ) public {
    opportunityNumber++;

    opportunities[opportunityNumber] = InvestmentOpportunity({
      opportunityId: opportunityNumber,
      investee: msg.sender,
      screener: 0x0,
      investor: 0x0,
      opportunityName: _opportunityName,
      opportunityDescription: _opportunityDescription,
      currentFunding: 0,
      fundingTarget: _fundingTarget,
      investmentScore: 0,
      opportunityStatus: 1,
      scoreArray: new uint[](0)
      /* screeners: 0 */
      });

      emit OpportunitySnapshot(
        opportunityNumber,
        msg.sender,
        0x0,
        0x0,
        _opportunityName,
        _opportunityDescription,
        0,
        _fundingTarget,
        0,
        1,
        /* 0 */
        opportunities[opportunityNumber].scoreArray.length
        );
}

// get the number of active opportunities
function getNumberOfOpportunities()
public view returns(uint){
  return opportunityNumber;
}

// request investment assessment
function assessOpportunity(uint _opportunityNumber, uint _ranking) public {
  uint newRanking = _ranking;

  opportunities[_opportunityNumber].scoreArray.push(newRanking);

  newRanking = newRanking - 1;

  opportunities[_opportunityNumber].scoreArray.push(newRanking);

  opportunities[_opportunityNumber].investmentScore = 5;

  /* emit OpportunitySnapshot(_opportunityId, _investee, _screener, _investor, _opportunityName, _opportunityDescription, _currentFunding, _fundingTarget, _investmentScore, _opportunityStatus, _scoreArray) */
}

function getRanking(uint _opportunityNumber) public view returns(uint){
  /* return opportunities[_opportunityNumber].scoreArray[0]; */
  return opportunities[_opportunityNumber].investmentScore;
}

// define milestones




// deploy funding




// track progress



}

