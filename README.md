# ConsensysFinalProject
Venture Capital Reenvisioned
by: Chris Peoples
email: cpeoples@ppa-mc.com
date: August 27th, 2018

A. == PURPOSE OF THE DAPP ==>
This app is meant to serve as the first iteration of a investment opportunity screening and ranking platform.

B. == OVERVIEW OF FUNCTIONALITY ==>
The dApp is intended to enable users to place investment opportunities in front of a community of users who may elected to endorse and fund opportunities. 

C. == PLACING AN OPPORTUNITY ==>
When placing an opportunity out to the community, a user can provide the name of the opportunity, a description of the opportunitity, and the desired amount of funding for the opportunity. Any user can submit as many opportunities as they would like for screening and review.

D. == SCREENING PROCESS ==>
Once an opportunity has been submitted any user except the user who placed the investment can endorse the opportunity. This endorsement signals that the individual user feels that this wouuld be a good investment opportunity.

E. == OPPORTUNITY FUNDING ==>
In order for an opportunity to be eligible for funding, a respective opportunity must receive three endorsements from different members of the community. Once an opportunity has been endorsed by three members of the community, the opportunity becomes open to funding from any member of the community. 

F. == USING THE DAPP ==>
Current network setting are running on HTTP://127.0.0.1:7545 and can be found in truffle.js

Running the contract with Ganache and Metamask
1. Download the project to your directory and navigate to the folder via your terminal
2. Start ganache and ensure that the network setting match the above
3. Connect to ganache via your terminal and in the project directory, run: truffle migrate --compile-all --reset --network development
4. Enable the metamask browser extension
5. Open a second terminal and navigate back to the project directory
6. Just in case, run: npm install
7. Open project in a web instance by running: npm run dev
8. In your browser interact with the dApp freely while switching between ganache test accounts
